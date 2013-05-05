/* to be inserted into HtmlController constructor */


// change robot's rotation angles on key press
$(document).keypress((function (event) {
    window.console.log("key " + event.which + " pressed");
    // which key corresponds to which joint
    // there are two keys for each joint: with Shift and without Shift pressed
    var keyJointMap = {
        88:"worldX", 120:"worldX",
        89:"worldY", 121:"worldY"
    };
    // Move by +5 deg or -5 deg depending on Shift key
    // Assumption: keycodes below 97 are with Shift.
    scene.rotateJoint(keyJointMap[event.which], event.which < 97 ? -5 : 5);
}));



            
