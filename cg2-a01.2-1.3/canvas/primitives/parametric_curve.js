/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: ParametricCurve
 *
 */


/* requireJS module definition */
define(["../../utils/util", "../../utils/vec2", "scene", "../dragger/point_dragger"],
    function (Util, vec2, Scene, PointDragger) {

        "use strict";

        var getFunction = function(fx) {
            return eval("(function(t) { return " + fx + ";});");
        };

        /**
         * Parametric Curve
         *
         * @param f function x(t)
         * @param g function y(t)
         * @param lineStyle
         * @constructor
         */
        var ParametricCurve = function (f, g, parameter, lineStyle) {

            console.log("creating parametric curve [x(t) = " + f + ", y(t)= " + g + "]");

            // draw style for drawing the curve
            this.lineStyle = lineStyle || { width:"2", color:"#0000AA" };

            // min t, max t, segments, show draggers
            this.parameter = parameter;

            // convert to linear function in case undefined inputs
            this.f = getFunction(f) || function (x) {
                return x;
            };
            this.g = getFunction(g) || function (y) {
                return y;
            };
        };

        ParametricCurve.prototype.interpolateLinear = function (context) {
            // points
            // compute segments + 1 points
            var t;
            var points = [this.parameter.segments];
            for (var i = 0; i <= this.parameter.segments; ++i) {
                // compute t for t_min and t_max
                t = this.parameter.min_t + i / this.parameter.segments * (this.parameter.min_t + this.parameter.max_t);
                points[i] = [this.f(t), this.g(t)];
            }
            this.points = points;
        };

        ParametricCurve.prototype.setF = function (f) {
            this.f = getFunction(f);
        };

        ParametricCurve.prototype.setG = function (g) {
            this.g = getFunction(g);
        };

        // draw this circle into the provided 2D rendering context
        ParametricCurve.prototype.draw = function (context) {

            /** DRAW LINE SEGMENTS **/

            context.beginPath();

            var p0 = [];
            var p1 = [];

            // check all segment lines
            for (var i = 1; i <= this.parameter.segments; ++i) {

                p0[0] = this.points[i - 1][0];
                p0[1] = this.points[i - 1][1];
                p1[0] = this.points[i][0];
                p1[1] = this.points[i][1];

                // draw curve [x,y]
                context.moveTo(p0[0], p0[1]);
                context.lineTo(p1[0], p1[1]);
            }

            context.closePath();

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

            // don't draw if not visible
            if (!this.showTickMarks) return;

            /** DRAW MARKS **/

            context.beginPath();

            p0 = [];
            p1 = [];
            var l = 0.1;

            // check all segment lines
            for (i = 2; i <= this.parameter.segments; ++i) {

                p0[0] = this.points[i - 1][0];
                p0[1] = this.points[i - 1][1];
                p1[0] = this.points[i][0];
                p1[1] = this.points[i][1];

                var p0N = [p1[1] - p0[1], p0[0] - p1[0]];
                var p1N = [p0[1] - p1[1], p1[0] - p0[0]];

                context.moveTo(l*p0N[0]+p0[0], l* p0N[1]+p0[1]);
                context.lineTo(-l*p0N[0]+p0[0], -l*p0N[1]+p0[1]);
            }

            context.closePath();

            // set drawing style
            context.lineWidth = 1;
            context.strokeStyle = "#ff0000";

            // actually start drawing
            context.stroke();

        };

        var pointInLine = function (pos, p0, p1, width) {

            // project point on line, get parameter of that projection point
            var t = vec2.projectPointOnLine(pos, p0, p1);

            // outside the line segment?
            if (t < 0.0 || t > 1.0) return false;

            // coordinates of the projected point
            var p = vec2.add(p0, vec2.mult(vec2.sub(p1, p0), t));

            // distance of the point from the line
            var d = vec2.length(vec2.sub(p, pos));

            // allow 2 pixels extra "sensitivity"
            return d <= (width / 2) + 2;
        };

        // test whether the mouse position is on this circle segment
        ParametricCurve.prototype.isHit = function (context, pos) {

            var p0 = [];
            var p1 = [];

            // check all segment lines
            for (var i = 1; i <= this.parameter.segments; ++i) {

                p0[0] = this.points[i - 1][0];
                p0[1] = this.points[i - 1][1];
                p1[0] = this.points[i][0];
                p1[1] = this.points[i][1];

                // check point in line
                if(pointInLine(pos, p0, p1, this.lineStyle.width)) return true;
            }
            return false;
        };

        // return list of draggers to manipulate this circle
        ParametricCurve.prototype.createDraggers = function () {
            return [];
        };

        // this module only exports the constructor for parametric curve objects
        return ParametricCurve;

    }); // define

    
