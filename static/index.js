let CURRENT_MODE;
let URLS = {};
//🢀🢂🢁🢃🢄🢅🢆🢇■
const COMMAND_MAP = {
    arc_left:       {icon: "🢄", text: "Arc Left", color: "pal-yellow", details: {speed_left: 50, speed_right: 200, duration: 1.5}},
    forward:        {icon: "🢁", text: "Forward", color: "pal-green", details: {speed_left: 150, speed_right: 150, duration: 1}},
    arc_right:      {icon: "🢅", text: "Arc Right", color: "pal-yellow", details: {speed_left: 50, speed_right: 200, duration: 1.5}},
    left:           {icon: "🢀", text: "Left", color: "pal-green", details: {speed_left: -150, speed_right: 150, duration: 1}},
    stop:           {icon: "■", text: "Stop", color: "pal-red", details: {speed_left: 0, speed_right: 0, duration: 2}},
    right:          {icon: "🢂", text: "Right", color: "pal-green", details: {speed_left: 150, speed_right: -150, duration: 1}},
    back_arc_left:  {icon: "🢆", text: "Back Arc Left", color: "pal-yellow", details: {speed_left: -50, speed_right: -200, duration: 1.5}},
    backwards:      {icon: "🢃", text: "Backwards", color: "pal-green", details: {speed_left: 150, speed_right: 150, duration: 1}},
    back_arc_right: {icon: "🢇", text: "Back Arc Right", color: "pal-yellow", details: {speed_left: -150, speed_right: -50, duration: 1.5}}
};

function main(){
    selectMode("edit");
    initializeEditSliders();
    initializeTimeline();
    initializeStreamToggle();
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
        sendCommands([commandKey]);
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

function addCommandToTimeline(commandKey) {
    const command = COMMAND_MAP[commandKey];
    const $timelineCommand = $("<div></div>")
        .addClass("timeline-command rounded d-inline-block")
        .addClass(command.color)
        .text(command.text + " " + command.icon)
        .data("command", commandKey);
    $timelineCommand.appendTo("#timeline");
}

function sendCommands(commandKeyList) {
    console.log(commandKeyList);
    const commandList = commandKeyList.map(commandKey => COMMAND_MAP[commandKey]);
    $.ajax({
        method: "POST",
        url: URLS.commands,
        contentType: 'application/json',
        data: JSON.stringify({moves: commandList})
    }).done(() => {
        console.log("Sent commands successfully");
    }).fail(error => {
        console.error(`Failed to send commands with error: ${error}`);
    })
}

function playTimeline() {
    const commandKeyList = $("#timeline").children().toArray().map(child => $(child).data("command"));
    sendCommands(commandKeyList);
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


function initializeEditSliders() {
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

function initializeTimeline() {
    const $timeline = $("#timeline");
    $timeline.click(event => {
        if (event.target.classList.contains("timeline-command")) {
            $(event.target).remove();
        }
    });
    $timeline.sortable({axis: "x"});
        $("#timelineContainer .fa-trash").click(() => {
        $timeline.empty();
    });
    $("#timelineContainer .fa-play").click(playTimeline);
}

function initializeStreamToggle() {
    $(".stream-toggle-button").click(event => {
        const $button = $(event.target).closest(".btn");
        const enabled = $button.data("enabled");
        $.ajax({
            method: "POST",
            contentType: 'application/json',
            url: URLS.stream.enabled,
            data: JSON.stringify({enabled: enabled})
        }).done(data => streamToggled(data.enabled));
    });
    $.ajax({
        method: "GET",
        url: URLS.stream.enabled
    }).done(data => streamToggled(data.enabled));
}

function streamToggled(enabled) {
    console.log(`Stream toggled, set to: ${enabled}`);
    const $videoStream = $("#videoStream");
    const $toggleButtons = $(".stream-toggle-button");
    if (enabled) {
        $videoStream.slideDown();
    } else {
        $videoStream.slideUp();
    }
    $toggleButtons.filter(`[data-enabled=${!enabled}]`).show();
    $toggleButtons.filter(`[data-enabled=${enabled}]`).hide();
    $videoStream.attr("src", $videoStream.attr("src") + "?enabled=" + enabled);
}

function setUrls(urls) {
    URLS = urls;
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