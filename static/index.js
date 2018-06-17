let CURRENT_MODE;

function main(){
    selectMode("edit");
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
        openEditForCommand(commandKey);
    } else if (CURRENT_MODE === "auto") {
        sendCommand(commandKey);
    } else if (CURRENT_MODE === "plan") {
        addCommandToTimeline(commandKey);
    } else {
        throw new Error(`Current mode in illegal state: ${CURRENT_MODE}`);
    }
}

function openEditForCommand(commandKey) {
    alert("Not yet implemented");
}

function sendCommand(command) {
    if (typeof command === "string") {
        alert("Not yet implemented");
    } else if (typeof command === "object") {
        sendCommands([command]);
    }
}

function addCommandToTimeline(commandKey) {
    alert("Not yet implemented");
}

function sendCommands(commandList) {
    alert("Not yet implemented");
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