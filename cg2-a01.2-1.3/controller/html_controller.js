/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: html_controller
 *
 * Defines callback functions for communicating with various 
 * HTML elements on the page, e.g. buttons and parameter fields.
 *
 */

/* requireJS module definition */
define(["jquery", "canvas/primitives/parametric_curve", "canvas/primitives/bezier_curve", "animation"],
    function ($, ParametricCurve, BezierCurve) {

        "use strict";

        /*
         * define callback functions to react to changes in the HTML page
         * and provide them with a closure defining context and scene
         */
        var HtmlController = function (context, scene, sceneController, animation) {


            // generate random X coordinate within the canvas
            var randomX = function () {
                return Math.floor(Math.random() * (context.canvas.width - 10)) + 5;
            };

            // generate random Y coordinate within the canvas
            var randomY = function () {
                return Math.floor(Math.random() * (context.canvas.height - 10)) + 5;
            };

            // generate random color in hex notation
            var randomColor = function () {

                // convert a byte (0...255) to a 2-digit hex string
                var toHex2 = function (byte) {
                    var s = byte.toString(16); // convert to hex string
                    if (s.length == 1) s = "0" + s; // pad with leading 0
                    return s;
                };

                var r = Math.floor(Math.random() * 25.9) * 10;
                var g = Math.floor(Math.random() * 25.9) * 10;
                var b = Math.floor(Math.random() * 25.9) * 10;

                // convert to hex notation
                return "#" + toHex2(r) + toHex2(g) + toHex2(b);
            };

            // generates random radius
            var randomRadius = function () {
                return Math.floor(Math.random() * (context.canvas.height / 3 - 10)) + 5;
            };

            /**
             * event handler for "line width"
             */
            $("#input_width").change((function () {
                var obj = sceneController.getSelectedObject();
                obj.lineStyle.width = parseInt(this.value);
                sceneController.redraw();
            }));

            /**
             * event handler for "line width"
             */
            $("#input_color").change((function () {
                var obj = sceneController.getSelectedObject();
                obj.lineStyle.color = this.value;
                sceneController.redraw();
            }));

            $("#input_min_t").change((function () {
                var obj = sceneController.getSelectedObject();
                obj.parameter.min_t = parseInt(this.value);
                obj.interpolateLinear(context);
                sceneController.redraw();
            }));

            $("#input_max_t").change((function () {
                var obj = sceneController.getSelectedObject();
                obj.parameter.max_t = parseInt(this.value);
                obj.interpolateLinear(context);
                sceneController.redraw();
            }));

            $("#input_segments").change((function () {
                var obj = sceneController.getSelectedObject();
                obj.parameter.segments = parseInt(this.value);
                obj.interpolateLinear(context);
                sceneController.redraw();
            }));

            $("#input_f").change((function () {
                var obj = sceneController.getSelectedObject();
                if (obj instanceof ParametricCurve) {
                    obj.setF(this.value);
                    obj.interpolateLinear(context);
                    sceneController.redraw();
                }
            }));

            $("#input_g").change((function () {
                var obj = sceneController.getSelectedObject();
                if (obj instanceof ParametricCurve) {
                    obj.setG(this.value);
                    obj.interpolateLinear(context);
                    sceneController.redraw();
                }
            }));

            // handle tick marks check box click event
            $("#input_tick_marks").change(function () {
                var obj = sceneController.getSelectedObject();
                obj.showTickMarks = $("#input_tick_marks").attr("checked") == "checked" ? true : false;
                sceneController.redraw();
            });

            // handle draggers check box click event
            $("#input_draggers").change(function () {
                var obj = sceneController.getSelectedObject();
                obj.parameter.showDragger = $("#input_draggers").attr("checked") == "checked" ? true : false;
                sceneController.redraw();
            });

            // handle de casteljau check box click event
            $("#input_deCastelJau").change(function () {
                var obj = sceneController.getSelectedObject();
                if (obj instanceof BezierCurve) {
                    obj.showDeCastelJau = $("#input_deCastelJau").attr("checked") == "checked" ? true : false;
                    sceneController.redraw();
                }
            });

            var addNewBezierCurve = function (controlPoints) {
                // create the actual line and add it to the scene
                var style = {
                    width: parseInt($("#input_width").val()),
                    color: randomColor()
                };

                // parameter
                var parameter = {
                    min_t:parseFloat($("#input_min_t").val()),
                    max_t:parseFloat($("#input_max_t").val()),
                    segments:parseInt($("#input_segments").val()),
                    showDragger:$("#input_draggers").attr("checked") == "checked" ? true : false };

                var cP = [];
                for(var i = 0; i < Math.random()* 6+3; ++i) {
                    cP.push([Math.random()*600,Math.random()*450]);
                }

                // create curve
                var obj = new BezierCurve(parameter, style, controlPoints || cP);

                // display marks by default
                obj.showTickMarks = $("#input_tick_marks").attr("checked") == "checked" ? true : false;

                // display decasteljau
                obj.showDeCastelJau = $("#input_deCastelJau").attr("checked") == "checked" ? true : false;

                // interpolate
                obj.interpolateLinear(context);

                // add to scene
                scene.addObjects([obj]);
                sceneController.deselect();
                sceneController.select(obj);
            };

            var addNewParametricCurve = function () {
                // create the actual line and add it to the scene
                var style = {
                    width:parseInt($("#input_width").val()),
                    color: randomColor()
                };

                // parameter
                var parameter = {
                    min_t:0,
                    max_t:5,
                    segments:20,
                    showDragger:true };

                // x(t)
                var f = $("#input_f").val();

                // y(t)
                var g = $("#input_g").val();

                // create curve
                var obj = new ParametricCurve(f, g, parameter, style);

                // display marks by default
                obj.showTickMarks = $("#input_tick_marks").attr("checked") == "checked" ? true : false;

                // interpolate
                obj.interpolateLinear(context);

                // add to scene
                scene.addObjects([obj]);
                sceneController.deselect();
                sceneController.select(obj);
            };

            /*
             * event handler for "new parametric curve button".
             */
            $("#btnNewParametric").click((function () {
                addNewParametricCurve();
            }));

            /*
             * event handler for "new bezier curve button".
             */
            $("#btnNewBezier").click((function () {
                addNewBezierCurve();
            }));

            /*
             * event handler for "new spiral button".
             */
            $("#btnSpiral").click((function () {

                var controlPoints = [
                    [392,237],
                    [402, 320],
                    [60, 316],
                    [135, 29],
                    [359, 35],
                    [604, 53],
                    [578, 439],
                    [283, 435],
                    [131, 397],
                    [160, 204]
                ];
                addNewBezierCurve(controlPoints);
            }));

            /*
             * event handler for "clear button".
             */
            $("#btnClear").click((function () {
                sceneController.deselect();
                scene.removeAll();
                // redraw
                sceneController.redraw();
            }));

            /*
             * event handler for "clear button".
             */
            $("#btnRemove").click((function () {
                var obj = sceneController.getSelectedObject();
                scene.removeObjects([obj]);
                sceneController.deselect();
                sceneController.select(scene.getObjects()[0]);
            }));

            /*
             * event handler for "add control point button".
             */
            $("#btnAddPoint").click((function () {
                var obj = sceneController.getSelectedObject();
                if(obj instanceof BezierCurve) {
                    obj.addPoint([200,200]);
                    obj.interpolateLinear();
                    sceneController.deselect();
                    sceneController.select(obj);
                }
            }));

            /*
             * event handler for "remove control point button".
             */
            $("#btnRemovePoint").click((function () {
                var obj = sceneController.getSelectedObject();
                if(obj instanceof BezierCurve) {
                    sceneController.deselect();
                    obj.removePoint();
                    obj.interpolateLinear();
                    sceneController.select(obj);
                    sceneController.redraw();
                }
            }));

            /*
             * event handler for object change
             */
            sceneController.onObjChange((function () {
                var obj = this.getSelectedObject();
            }));

            /*
             * event handler for on selection
             */
            sceneController.onSelection((function () {
                var obj = this.getSelectedObject();
                $("#input_width").val(obj.lineStyle.width);
                $("#input_color").val(obj.lineStyle.color);

                // toggle visible parametric curve inputs
                if(obj instanceof ParametricCurve) {
                    $(".parametric_curve_param").show();
                } else {
                    $(".parametric_curve_param").hide();
                }

                // toggle visible bezier curve inputs
                if(obj instanceof BezierCurve) {
                    $(".bezier_curve_param").show();
                } else {
                    $(".bezier_curve_param").hide();
                }
            }));

            /**
             * on init event handler
             */
            var onInit = function () {

                // default values
                $("#input_width").val(2);
                $("#input_color").val(randomColor());
                $("#input_f").val("250+100*Math.sin(t)");
                $("#input_g").val("150+100*Math.cos(t)");
                $("#input_min_t").val(0.0);
                $("#input_max_t").val(1.0);
                $("#input_segments").val(100);
                $("#input_tick_marks").attr("checked", "checked");
                $("#input_draggers").attr("checked", "checked");
                $("#input_deCastelJau").attr("checked", "checked");

                // enable animation per default
                $("#anim_Toggle").attr("checked", "checked");
                animation.resume();

                // default anim speed
                $("#anim_Speed").attr("value", 80);
                // set animation speed
                animation.customSpeed = parseFloat($("#anim_Speed").attr("value"));

                var controlPoints = [
                    [392,237],
                    [402, 320],
                    [60, 316],
                    [135, 29],
                    [359, 35],
                    [604, 53],
                    [578, 439],
                    [283, 435],
                    [131, 397],
                    [160, 204]
                ];
                addNewBezierCurve(controlPoints);
            };
            onInit();

            $("#anim_Speed").change(function() {
                console.log("change speed");
                animation.customSpeed = parseFloat($("#anim_Speed").val());
            });

            $("#anim_Toggle").change(function() {
                // toggle animation on/off
                if ($("#anim_Toggle").attr("checked") == undefined) {
                    animation.stop();
                } else {
                    animation.resume();
                }
            });
        };

        // return the constructor function
        return HtmlController;


    }); // require