/*
 *
 * Module main: CG2 Aufgabe 2 Teil 2, Winter 2012/2013
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* 
 *  RequireJS alias/path configuration (http://requirejs.org/)
 */

requirejs.config({
    paths:{

        // jquery library
        "jquery":[
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            //If the load via CDN fails, load locally
            '../lib/jquery-1.7.2.min'],

        // gl-matrix library
        "gl-matrix":"../lib/gl-matrix-1.3.7"

    }
});


/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "util", "webgl-debug",
    "program", "shaders", "animation", "html_controller", "scene_node",
    "models/triangle", "models/cube", "models/band"],
    (function ($, glmatrix, util, WebGLDebugUtils, Program, shaders, Animation, HtmlController, SceneNode, Triangle, Cube, Band) {

        "use strict";

        /*
         *  This function asks the HTML Canvas element to create
         *  a context object for WebGL rendering.
         *
         *  It also creates awrapper around it for debugging
         *  purposes, using webgl-debug.js
         *
         */

        var makeWebGLContext = function (canvas_name) {

            // get the canvas element to be used for drawing
            var canvas = $("#" + canvas_name).get(0);
            if (!canvas) {
                throw "HTML element with id '" + canvas_name + "' not found";
                return null;
            }

            // get WebGL rendering context for canvas element
            var options = {alpha:true, depth:true, antialias:true};
            var gl = canvas.getContext("webgl", options) ||
                canvas.getContext("experimental-webgl", options);
            if (!gl) {
                throw "could not create WebGL rendering context";
            }

            // create a debugging wrapper of the context object
            var throwOnGLError = function (err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
            };
            var gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);

            return gl;
        };

        /*
         * main program, to be called once the document has loaded
         * and the DOM has been constructed
         *
         */

        $(document).ready((function () {

            // catch errors for debugging purposes
            try {

                console.log("document ready - starting!");

                // create WebGL context object for the named canvas object
                var gl = makeWebGLContext("drawing_area");

                // a simple scene is an object with a few objects and a draw() method
                var MyRobotScene = function (gl, transformation) {

                    // store the WebGL rendering context
                    this.gl = gl;

                    // create WebGL program using constant red color
                    var prog_red = new Program(gl, shaders.vs_NoColor(),
                        shaders.fs_ConstantColor([0.7, 0.3, 0.2, 1]));
                    var prog_blue = new Program(gl, shaders.vs_NoColor(),
                        shaders.fs_ConstantColor([0.5, 0.3, 0.5, 1]));
                    var prog_black = new Program(gl, shaders.vs_NoColor(),
                        shaders.fs_ConstantColor([0, 0, 0, 1]));
                    var prog_purple = new Program(gl, shaders.vs_NoColor(),
                        shaders.fs_ConstantColor([0.5, 0.25, 0.5, 1]));

                    // create WebGL program using per-vertex-color
                    var prog_vertexColor = new Program(gl, shaders.vs_PerVertexColor(),
                        shaders.fs_PerVertexColor());

                    // please register all programs in this list
                    this.programs = [prog_red, prog_blue, prog_black, prog_purple, prog_vertexColor];

                    // create some objects to be drawn
                    var asWireframes = false;
                    var cube = new Cube(gl, {"asWireframe":asWireframes});
                    var band = new Band(gl, { radius:0.5, height:1.0, segments:50, "asWireframe":asWireframes});
                    var bandWireframe = new Band(gl, { radius:0.5, height:1.0, segments:20, "asWireframe":true});
                    var triangle = new Triangle(gl, {"asWireframe":asWireframes});

                    /**
                     * DIMENSIONS
                     */

                    var jointSize = [0.2, 0.1, 0.2];
                    var torsoSize = [0.6, 1.0, 0.4];
                    var headSize = [0.3, 0.4, 0.3];
                    var hatSize = [0.2, 0.2, 0.1];
                    var upperArmSize = [0.15, 0.45, 0.15];
                    var lowerArmSize = [0.15, 0.45, 0.15];
                    var handSize = [0.2, 0.2, 0.1];

                    /**
                     * POSITIONS
                     */

                    /** torso / root **/
                    var torsoPosition = [0.0, 0, 0.0];

                    /** head **/

                    // y = torso.dim.y 1/2 + 0.1/2 = 0.55
                    var neckPosition = [0.0, 0.55, 0.0];

                    // y = joint.dim.y 0.1/2 + head.dim.y +0.4/2
                    var headPosition = [0.0, 0.25, 0.0];

                    // y = head.dim.y 0.4/2 + hat.dim.y 0.3/2 = 0.35
                    var hatPosition = [0.0, 0.30, 0.0];

                    /** right arm **/

                    // x = torso.dim.x 0.6/2 + 0.1/2 = 0.35
                    // y = torso.dim.y 1/2 - 0.2/2 = 0.4
                    var rightShoulderPosition = [0.35, 0.4, 0.0];

                    // x = joint.dim.x 0.2/2 = 0.1
                    var rightUpperArmPosition = [0.2, 0.025, 0.0];

                    // x = upperUpperArm.dim.x 0.1/2 + joint.dim.x 0.2/2 = 0.15
                    var rightElbowPosition = [0.25, -0.025, 0.0];

                    // x = joint.dim.x 0.2/2 + lower arm dim.x 0.15 / 2
                    var rightLowerArmPosition = [0.2, 0.025, 0.0];

                    // right lower arm dim.x 0.45/2 = 0.225
                    var rightWristPosition = [0.225, 0.0, 0.0];

                    // joint.dim.y 0.2/2 = 0.1
                    var rightHandPosition = [0.0, 0.1, 0.0];

                    /** left arm **/

                    // x = right -x
                    var leftShoulderPosition = [-0.35, 0.4, 0.0];
                    var leftUpperArmPosition = [-0.2, 0.025, 0.0];
                    var leftElbowPosition = [-0.25, -0.025, 0.0];
                    var leftLowerArmPosition = [-0.2, 0.025, 0.0];
                    var leftWristPosition = [-0.225, 0.0, 0.0];
                    var leftHandPosition = [0.0, -0.1, 0.0];

                    /**
                     * "BONES"
                     */

                    // torso
                    var torso = new SceneNode("torso");

                    // head
                    var head = new SceneNode("head");
                    var hat = new SceneNode("hat");

                    // right arm
                    var rightUpperArm = new SceneNode("rightUpperArm");
                    var rightLowerArm = new SceneNode("rightLowerArm");
                    var rightHand = new SceneNode("rightHand");

                    // left arm
                    var leftUpperArm = new SceneNode("leftUpperArm");
                    var leftLowerArm = new SceneNode("leftLowerArm");
                    var leftHand = new SceneNode("leftHand");

                    /**
                     * "JOINTS"
                     */

                    // connection torso and head
                    var neck = new SceneNode("neck");

                    /** right arm **/

                    // connection torso and right upper arm
                    var rightShoulder = new SceneNode("rightShoulder");

                    // connection right upper arm and right lower arm
                    var rightElbow = new SceneNode("rightElbow");

                    // connection right lower arm and right hand
                    var rightWrist = new SceneNode("rightWrist");

                    /** left arm **/

                    // connection torso and left upper arm
                    var leftShoulder = new SceneNode("leftShoulder");

                    // connection left upper arm and left lower arm
                    var leftElbow = new SceneNode("leftElbow");

                    // connection left lower arm and left hand
                    var leftWrist = new SceneNode("leftWrist");

                    /**
                     * "SKELETON"
                     *
                     *                              |   hat
                     *                              |   head
                     *                              o   neck
                     *  left shoulder       o       |       o   right shoulder
                     *  left upper arm      |       |       |   right upper arm
                     *  left elbow          o       |       o   right elbow
                     *  left lower arm      |       |       |   left lower arm
                     *  left wrist          o       |       o   left wrist
                     *  left hand           |       |       |   left hand
                     *                            torso
                     */

                        // root
                    torso.addObjects([neck, rightShoulder, leftShoulder]);

                    // head
                    neck.addObjects([head]);
                    head.addObjects([hat]);

                    // right arm
                    rightShoulder.addObjects([rightUpperArm]);
                    rightUpperArm.addObjects([rightElbow]);
                    rightElbow.addObjects([rightLowerArm]);
                    rightLowerArm.addObjects([rightWrist]);
                    rightWrist.addObjects([rightHand]);

                    // left arm
                    leftShoulder.addObjects([leftUpperArm]);
                    leftUpperArm.addObjects([leftElbow]);
                    leftElbow.addObjects([leftLowerArm]);
                    leftLowerArm.addObjects([leftWrist]);
                    leftWrist.addObjects([leftHand]);


                    /**
                     * TRANSOFRMATION "BONES"
                     */

                        // torso/root
                    mat4.translate(torso.transformation, torsoPosition);

                    /** head **/

                        // neck
                    mat4.translate(neck.transformation, neckPosition);

                    // head
                    mat4.translate(head.transformation, headPosition);

                    // hat
                    mat4.translate(hat.transformation, hatPosition);

                    /** right arm **/

                        // right shoulder
                    mat4.translate(rightShoulder.transformation, rightShoulderPosition);
                    mat4.rotate(rightShoulder.transformation, Math.PI / 2, [0, 0, -1]);

                    // right upper arm
                    mat4.translate(rightUpperArm.transformation, rightUpperArmPosition);

                    // right elbow
                    mat4.translate(rightElbow.transformation, rightElbowPosition);

                    // right lower arm
                    mat4.translate(rightLowerArm.transformation, rightLowerArmPosition);

                    // right wrist
                    mat4.translate(rightWrist.transformation, rightWristPosition);
                    mat4.rotate(rightWrist.transformation, Math.PI / 2, [0, 0, -1]);

                    // right hand
                    mat4.translate(rightHand.transformation, rightHandPosition);
                    mat4.rotate(rightHand.transformation, Math.PI / 2, [0, 0, -1]);

                    /** left arm **/

                        // left shoulder
                    mat4.translate(leftShoulder.transformation, leftShoulderPosition);
                    mat4.rotate(leftShoulder.transformation, Math.PI / 2, [0, 0, 1]);

                    // left upper arm
                    mat4.translate(leftUpperArm.transformation, leftUpperArmPosition);

                    // left elbow
                    mat4.translate(leftElbow.transformation, leftElbowPosition);

                    // left lower arm
                    mat4.translate(leftLowerArm.transformation, leftLowerArmPosition);

                    // left wrist
                    mat4.translate(leftWrist.transformation, leftWristPosition);
                    mat4.rotate(leftWrist.transformation, Math.PI / 2, [0, 0, -1]);

                    // left hand
                    mat4.translate(leftHand.transformation, leftHandPosition);
                    mat4.rotate(leftHand.transformation, Math.PI / 2, [0, 0, 1]);

                    /**
                     * TRANSFORMATIONS "SKINS"
                     */

                    // joint skin
                    var jointWireframe = new SceneNode("joint wireframe", [bandWireframe], prog_black);
                    var joinSkin = new SceneNode("joint skin", [band, jointWireframe], prog_red);
                    mat4.scale(joinSkin.transformation, jointSize);

                    // torso skin
                    var torsoSkin = new SceneNode("torso skin", [cube], prog_vertexColor);
                    mat4.scale(torsoSkin.transformation, torsoSize);
                    mat4.rotate(torsoSkin.transformation, Math.PI / 2, [0, 0, 1]); // blue front, red top, green sides

                    // head skin
                    var headSkin = new SceneNode("head skin", [cube], prog_vertexColor);
                    mat4.scale(headSkin.transformation, headSize);

                    // hat skin
                    var hatSkin = new SceneNode("hat skin", [triangle], prog_vertexColor);
                    mat4.scale(hatSkin.transformation, hatSize);

                    // upper arm
                    var upperArmSkin = new SceneNode("upper arm skin", [cube], prog_purple);
                    mat4.rotate(upperArmSkin.transformation, Math.PI / 2, [0, 0, 1]);
                    mat4.scale(upperArmSkin.transformation, upperArmSize);

                    // lower arm
                    var lowerArmSkin = new SceneNode("lower arm skin", [cube], prog_purple);
                    mat4.rotate(lowerArmSkin.transformation, Math.PI / 2, [0, 0, 1]);
                    mat4.scale(lowerArmSkin.transformation, lowerArmSize);

                    // hand skin
                    var handSkin = new SceneNode("hand skin", [triangle], prog_red);
                    mat4.rotate(handSkin.transformation, Math.PI / 2, [0, 0, 1]);
                    mat4.scale(handSkin.transformation, handSize);

                    /**
                     * "SKINNING"
                     */
                    torso.addObjects([torsoSkin]);

                    // head
                    neck.addObjects([joinSkin]);
                    head.addObjects([headSkin]);
                    hat.addObjects([hatSkin]);

                    // right arm
                    rightShoulder.addObjects([joinSkin]);
                    rightUpperArm.addObjects([upperArmSkin]);
                    rightElbow.addObjects([joinSkin]);
                    rightLowerArm.addObjects([lowerArmSkin]);
                    rightWrist.addObjects([joinSkin]);
                    rightHand.addObjects([handSkin]);

                    // left arm
                    leftShoulder.addObjects([joinSkin]);
                    leftUpperArm.addObjects([upperArmSkin]);
                    leftElbow.addObjects([joinSkin]);
                    leftLowerArm.addObjects([lowerArmSkin]);
                    leftWrist.addObjects([joinSkin]);
                    leftHand.addObjects([handSkin]);

                    /**
                     * ADD TO SCENE
                     */

                    // an entire robot
                    var robot1 = new SceneNode("robot1", [torso], prog_red);
                    mat4.translate(robot1.transformation, [0, -0.3, 0]);

                    // the world - this node is needed in the draw() method below!
                    this.world = new SceneNode("world", [robot1], prog_red);

                    // for the UI - this will be accessed directly by HtmlController
                    this.drawOptions = {"Perspective":true};

                    /*
                     *
                     * Method to rotate within a specified joint - called from HtmlController
                     *
                     */
                    this.rotateJoint = function (joint, angle) {

                        window.console.log("rotating " + joint + " by " + angle + " degrees.");

                        // degrees to radians
                        angle = angle * Math.PI / 180;

                        // manipulate the right matrix, depending on the name of the joint
                        switch (joint) {
                            case "worldY":
                                mat4.rotate(this.world.transformation, angle, [0, 1, 0]);
                                break;
                            case "worldX":
                                mat4.rotate(this.world.transformation, angle, [1, 0, 0]);
                                break;
                            case "neckY":
                                mat4.rotate(neck.transformation, angle, [0, 1, 0]);
                                break;
                            case "rightShoulderY":
                                mat4.rotate(rightShoulder.transformation, angle, [0, 1, 0]);
                                break;
                            case "rightElbowY":
                                mat4.rotate(rightElbow.transformation, angle, [0, -1, 0]);
                                break;
                            case "rightWristY":
                                mat4.rotate(rightWrist.transformation, angle, [0, 1, 0]);
                                break;
                            case "leftShoulderY":
                                mat4.rotate(leftShoulder.transformation, angle, [0 , -1, 0]);
                                break;
                            case "leftElbowY":
                                mat4.rotate(leftElbow.transformation, angle, [0, 1, 0]);
                                break;
                            case "leftWristY":
                                mat4.rotate(leftWrist.transformation, angle, [0, 1, 0]);
                                break;
                            default:
                                window.console.log("joint " + joint + " not implemented:");
                                break;
                        }
                        this.draw();
                    }; // rotateJoint()

                }; // MyRobotScene constructor

                // the scene's draw method draws whatever the scene wants to draw
                MyRobotScene.prototype.draw = function () {

                    // get aspect ratio of canvas
                    var c = $("#drawing_area").get(0);
                    var aspectRatio = c.width / c.height;

                    // set camera's projection matrix in all programs
                    var projection = this.drawOptions["Perspective"] ?
                        mat4.perspective(45, aspectRatio, 0.01, 100) :
                        mat4.ortho(-aspectRatio, aspectRatio, -1, 1, 0.01, 100);

                    for (var i = 0; i < this.programs.length; i++) {
                        var p = this.programs[i];
                        p.use();
                        p.setUniform("projectionMatrix", "mat4", projection);
                    }

                    // initial camera / initial model-view matrix
                    var modelView = mat4.lookAt([0, 0.5, 3], [0, 0, 0], [0, 1, 0]);

                    // shortcut
                    var gl = this.gl;

                    // clear color and depth buffers
//                    gl.clearColor(0.7, 0.7, 0.7, 1.0);
					gl.clearColor(0.984, 0.956, 0.929, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    // enable depth testing, keep fragments with smaller depth values
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(gl.LESS);

                    // start drawing at the world's root node
                    this.world.draw(gl, this.prog_vertexColor, modelView);

                }; // MyRobotScene draw()

                // create scene and start drawing
                var scene = new MyRobotScene(gl);
                scene.draw();

                // create an animation: rotate some joints
                var animation = new Animation((function (t, deltaT) {

                    this.customSpeed = this.customSpeed || 1;
                    this.dt = this.dt || 1;

                    // speed  times deltaT
                    var speed = deltaT / 1000 * this.customSpeed;

                    // oscillation
                    this.dt += deltaT * speed % 0.035;
                    var rotAngle = -Math.sin(this.dt) - Math.cos(this.dt);

                    // rotate around Y with relative speed 3
                    scene.rotateJoint("worldY", 3 * speed);

                    // rotate head
                    scene.rotateJoint("neckY", rotAngle);

                    // rotate shoulders
                    scene.rotateJoint("rightShoulderY", rotAngle);
                    scene.rotateJoint("leftShoulderY", -rotAngle);


                    // rot elbows
                    scene.rotateJoint("rightElbowY", -rotAngle);
                    scene.rotateJoint("leftElbowY", rotAngle);

                    // rot right writs
                    scene.rotateJoint("rightWristY", rotAngle);
                    scene.rotateJoint("leftWristY", rotAngle);

                    // redraw
                    scene.draw();

                }));

                // create HTML controller that handles all the interaction of
                // HTML elements with the scene and the animation
                var controller = new HtmlController(scene, animation);

                // end of try block
            } catch (err) {
                if ($("#error")) {
                    $('#error').text(err.message || err);
                    $('#error').css('display', 'block');
                }
                window.console.log("exception: " + (err.message || err));
                throw err;
            }
        })); // $(document).ready()
    })); // define module
        

