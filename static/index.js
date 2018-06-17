let CURRENT_MODE;
let SEND_COMMANDS_URL;

const COMMAND_MAP = { //🢀🢂🢁🢃🢄🢅🢆🢇■
    arc_left:       {icon: "🢄", text: "Arc Left", color: "", details: {speed_left: 50, speed_right: 200, duration: 1.5}},
    forward:        {icon: "🢁", text: "Forward", color: "", details: {speed_left: 150, speed_right: 150, duration: 1}},
    arc_right:      {icon: "🢅", text: "Arc Right", color: "", details: {speed_left: 50, speed_right: 200, duration: 1.5}},
    left:           {icon: "🢀", text: "Left", color: "", details: {speed_left: -150, speed_right: 150, duration: 1}},
    stop:           {icon: "■", text: "Stop", color: "", details: {speed_left: 0, speed_right: 0, duration: 2}},
    right:          {icon: "🢂", text: "Right", color: "", details: {speed_left: 150, speed_right: -150, duration: 1}},
    back_arc_left:  {icon: "🢆", text: "Back Arc Left", color: "", details: {speed_left: -50, speed_right: -200, duration: 1.5}},
    backwards:      {icon: "🢃", text: "Backwards", color: "", details: {speed_left: 150, speed_right: 150, duration: 1}},
    back_arc_right: {icon: "🢇", text: "Back Arc Right", color: "", details: {speed_left: -150, speed_right: -50, duration: 1.5}}
};

function main(){
    selectMode("edit");
    initializeSliders();
    $("#modeSwitchContainer button").click(event => {
            const $button = $(event.target).closest(".btn");
            selectMode($button.data("mode"));
    });
    $(".command-button").click(event => {
        clickCommand($(event.target).data("commandKey"));
    });
}

function clickCommand(commandKey) {
    if (CURRENT_MODE === "edit") {
        openCommandEdit(commandKey);
    } else if (CURRENT_MODE === "auto") {
        sendCommand(commandKey);
    } else if (CURRENT_MODE === "plan") {
        addCommandToTimeline(commandKey);
    } else {
        throw new Error(`Current mode in illegal state: ${CURRENT_MODE}`);
    }
}

function openCommandEdit(commandKey) {
    const command = COMMAND_MAP[commandKey];
    const $editCard = $("#editCard");
    $editCard.find(".card-header h2").text(`${command.text}  ${command.icon}`);
    $editCard.data("command", commandKey);
    setCommandDetailSliders(command.details);
}

function sendCommand(command) {
    if (typeof command === "string") {
        sendCommands([COMMAND_MAP[command]]);
    } else if (typeof command === "object") {
        sendCommands([command]);
    }
}

function addCommandToTimeline(commandKey) {
    alert("Not yet implemented");
}

function sendCommands(commandList) {
    console.table(commandList);
    $.ajax({
        method: "POST",
        url: SEND_COMMANDS_URL,
        contentType: 'application/json',
        data: JSON.stringify({moves: commandList})
    }).done(() => {
        console.log("Sent commands successfully");
    }).fail(error => {
        console.error(`Failed to send commands with error: ${error}`);
    })
}

function setCommandDetailSliders(command) {
    $("#speedLeft").slider("value", command.speed_left);
    $("#speedRight").slider("value", command.speed_right);
    $("#duration").slider("value", command.duration);
}

async function selectMode(mode) {
    if (CURRENT_MODE !== mode) {
        console.log(`Selecting mode: ${mode}`);
        highlightModeButton(mode);
        if (mode === "edit") {
            await enterEditMode();
        } else if (mode === "auto") {
            await enterAutoMode();
        } else if (mode === "plan") {
            await enterPlanMode();
        } else {
            throw new Error(`Unrecognized mode: ${mode}`);
        }
        CURRENT_MODE = mode;
    }
}

function highlightModeButton(mode) {
    const $modeButtons = $("#modeSwitchContainer").children();
    $modeButtons.removeClass("btn-primary").addClass("btn-dark");

    const selectedButton = $modeButtons.toArray()
        .find(modeButton => $(modeButton).data("mode") === mode);
    $(selectedButton).addClass("btn-primary").removeClass("btn-dark");
}


function initializeSliders() {
    $(".command-field-speed").slider({
        value: 0,
        min: -255,
        max: 255,
        step: 5,
        animate: "fast",
        slide: (event, ui) => $(ui.handle).text(ui.value),
        change: (event, ui) => sliderValueChanged($(event.target), $(ui.handle), ui.value)

    });
    $(".command-field-duration").slider({
        value: 1,
        min: 0.1,
        max: 5.0,
        step: 0.1,
        animate: "fast",
        slide: (event, ui) => $(ui.handle).text(ui.value),
        change: (event, ui) => sliderValueChanged($(event.target), $(ui.handle), ui.value)
    });
    openCommandEdit("stop");
}

function sliderValueChanged($slider, $handle, value) {
    $handle.text(value);
    const commandKey = $slider.parents(".card").data("command");
    const command = COMMAND_MAP[commandKey];
    command.details[$slider.data("detailKey")] = value;

}

function toggleEditPanel(showEditPanel) {
    return new Promise(resolve => {
        if (showEditPanel) {
            $("#commandButtonContainer").switchClass("col-md-12", "col-xl-6 col-lg-7",
                {complete: () => $("#editCardContainer").slideDown(resolve)}
            );
        } else {
            $("#editCardContainer").slideUp(() => {
                $("#commandButtonContainer").switchClass("col-xl-6 col-lg-7", "col-md-12", {complete: resolve});
            });
        }
    });
}

function toggleTimeline(showTimeline) {
    return new Promise(resolve => {
        if (showTimeline) {
            $("#timelineContainer").slideDown(resolve);
        } else {
            $("#timelineContainer").slideUp(resolve);
        }
    });
}

function enterEditMode() {
    return Promise.all([toggleTimeline(false), toggleEditPanel(true)]);
}

function enterAutoMode() {
    return Promise.all([toggleTimeline(false), toggleEditPanel(false)]);
}

function enterPlanMode() {
    return Promise.all([toggleEditPanel(false), toggleTimeline(true)]);
}