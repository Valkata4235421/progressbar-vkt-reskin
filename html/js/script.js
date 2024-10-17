$(document).ready(function () {
    var cancelledTimer = null;

    // Initialize the progress bar to a default hidden state
    initializeProgressBar();

    const Progressbar = {};

    Progressbar.Progress = function (data) {
        clearTimeout(cancelledTimer);
        $("#progress-label").text(data.label);
        const totalDuration = data.duration / 1000; // duration in seconds
        $("#progress-percentage").text("0%").show(); // Reset percentage display

        // Show or hide additional info based on cancel capability
        if (!data.canCancel) {
            $(".progress-bar-adit-info").show();
        } else {
            $(".progress-bar-adit-info").hide();
        }

        $(".progress-icon").show();

        $(".progress-container").fadeIn("fast", function () {
            $("#progress-bar")
                .stop()
                .css({ width: "0%" }) // Start from 0%
                .animate(
                    {
                        width: "100%", // Animate to 100%
                    },
                    {
                        duration: totalDuration * 1000, // Total duration in milliseconds
                        step: function (now) {
                            var percentage = Math.round(now); // Correctly calculate percentage
                            $("#progress-percentage").text(percentage + "%"); // Update percentage
                        },
                        complete: function () {
                            $("#progress-percentage").text("100%"); // Set to 100%
                            $("#progress-bar").css("width", "100%"); // Ensure the width is set to 100%
                            // Stop any animations
                            $("#progress-bar").stop(); 
                            setTimeout(function () {
                                $(".progress-container").fadeOut("fast", function () {
                                    $("#progress-bar").css("width", "0%"); // Reset for next usage
                                    $(".progress-icon").hide();
                                    $.post("https://progressbar/FinishAction", JSON.stringify({}));
                                });
                            }, 500); // Wait for 500ms after reaching 100%
                        },
                    }
                );
        });
    };

    Progressbar.ProgressCancel = function () {
        $("#progress-label").text("CANCELLED");
        $("#progress-bar")
            .stop()
            .css({ width: "100%", background: "rgba(255, 0, 0, 0.8)" }); // Change to red color on cancel
        $("#progress-bar").removeClass("cancellable");

        cancelledTimer = setTimeout(function () {
            $(".progress-container").fadeOut("fast", function () {
                $("#progress-bar").css("width", "0%"); // Reset for next usage
                $(".progress-icon").hide();
                $.post("https://progressbar/CancelAction", JSON.stringify({}));
            });
        }, 1000);
    };

    Progressbar.CloseUI = function () {
        $(".main-container").fadeOut("fast");
    };

    function initializeProgressBar() {
        $("#progress-label").text(""); // Start with no label text
        $("#progress-percentage").text("0%").hide(); // Hide percentage initially
        $("#progress-bar").css({ width: "0%" }); // Reset width
        $(".progress-bar-adit-info").hide(); // Hide additional info by default
        $(".progress-icon").hide(); // Ensure icon is hidden initially
        $(".progress-container").hide(); // Keep the progress container hidden on initialization
    }

    window.addEventListener("message", function (event) {
        switch (event.data.action) {
            case "progress":
                Progressbar.Progress(event.data);
                break;
            case "cancel":
                Progressbar.ProgressCancel();
                break;
            default:
                console.log("Unknown action: ", event.data.action);
                break;
        }
    });
});
