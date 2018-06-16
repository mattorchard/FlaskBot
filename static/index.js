function selectMode(mode) {
    console.log("Selecting mode: " + mode);
    highlightModeButton(mode);
    if (mode === "edit") {
        enterEditMode();
    } else if (mode === "auto") {
        enterAutoMode();
    } else if (mode === "plan") {
        enterPlanMode();
    } else {
        console.error("Unrecognized Mode: " + mode);
    }
}

function highlightModeButton(mode) {
    const $modeButtons = $("#modeSwitchContainer").children();
    $modeButtons.removeClass("btn-primary").addClass("btn-dark");

    const selectedButton = $modeButtons.toArray()
        .find(modeButton => $(modeButton).data("mode") === mode);
    $(selectedButton).addClass("btn-primary").removeClass("btn-dark");
}

function enterEditMode() {
    toggleTimeline(false);
    toggleEditPanel(true)
}

function enterAutoMode() {
    toggleTimeline(false);
    toggleEditPanel(false);
}

function enterPlanMode() {
    toggleEditPanel(false);
    toggleTimeline(true);
}


function toggleEditPanel(showEditPanel) {
    if (showEditPanel) {
        $("#commandButtonContainer").switchClass("col-md-12", "col-xl-6 col-lg-7", {
            complete: () => {$("#editCardContainer").slideDown()}
        });
    } else {
        $("#editCardContainer").slideUp(() => {
            $("#commandButtonContainer").switchClass("col-xl-6 col-lg-7", "col-md-12");
        });
    }
}

function toggleTimeline(showTimeline) {
    if (showTimeline) {
        $("#timelineContainer").slideDown();
    } else {
        $("#timelineContainer").slideUp();
    }
}

function main(){
    selectMode("edit");
    $("#modeSwitchContainer button").click(event => {
            const $button = $(event.target).closest(".btn");
            selectMode($button.data("mode"));
    });
}