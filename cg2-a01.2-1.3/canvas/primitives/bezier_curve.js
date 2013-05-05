/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * Module: BezierCurve
 *
 */


/* requireJS module definition */
define(["../../utils/util", "../../utils/vec2", "scene", "../dragger/point_dragger", "../dragger/curve_point_dragger", "scene"],
    function (Util, vec2, Scene, PointDragger, CurvePointDragger) {

        "use strict";

        var getFunction = function (fx) {
            return eval("(function(t) { return " + fx + ";});");
        };

        /**
         * Bezier Curve
         *
         * @param f function x(t)
         * @param g function y(t)
         * @param lineStyle
         */
        var BezierCurve = function (parameter, lineStyle, controlPoints) {

            // draw style for drawing the curve
            this.lineStyle = lineStyle || { width:"2", color:"#0000AA" };

            this.showDeCastelJau = true;

            // min t, max t, segments, show draggers
            this.parameter = parameter;

            // control points
            var cP = [
                [50, 200],
                [150, 50],
                [250, 400],
                [350, 200]
            ];
            this.controlPoints = controlPoints || cP;

//            /**
//             * Computes deCasteljau p(t) for 4 control points.
//             *
//             * @param t - portion on the graph, value between 0.0 and 1.0
//             * @return point[x,y] - p(t)
//             */
//            this.deCasteljau = function (t) {
//                return (1 - t) * (1 - t) * (1 - t) * cP[0][1]
//                    + 3 * (1 - t) * (1 - t) * t * cP[1][1]
//                    + 3 * (1 - t) * t * t * cP[2][1]
//                    + t * t * t * cP[3][1];
//            };

            /**
             * Computes deCasteljau p(t) for n-control points
             *
             * @param cp - list of points [][,]
             * @param r - init value : points.length-1
             * @param i - init value : 0
             * @param t - portion on the graph, value between 0.0 and 1.0
             *
             * @see http://stackoverflow.com/a/6271870 for n-control points
             *
             * @return [] point - p(t)
             */
            this.deCasteljau = function (cp, r, i, t) {
                if (r == 0) return cp[i];
                var p1 = this.deCasteljau(cp, r - 1, i, t);
                var p2 = this.deCasteljau(cp, r - 1, i + 1, t);
                return [(1 - t) * p1[0] + t * p2[0], (1 - t) * p1[1] + t * p2[1]];
            };

            // keep track of min and max
            this.minX = Infinity;
            this.maxX = -Infinity;
            this.minY = Infinity;
            this.maxY = -Infinity;

            // current t
            this.t = 0.5;

            // current movable point on graph
            this.curPoint = this.deCasteljau(this.controlPoints, this.controlPoints.length - 1, 0, this.t);
        };

        BezierCurve.prototype.animateCurrentPoint = function(newT) {
            this.t = newT;
            this.curPoint = this.deCasteljau(this.controlPoints, this.controlPoints.length - 1, 0, this.t);
        };

        BezierCurve.prototype.interpolateLinear = function (context) {
            // points
            // compute segments + 1 points
            var t;
            var points = [this.parameter.segments];
            for (var i = 0; i <= this.parameter.segments; ++i) {
                // compute t for t_min and t_max
                t = this.parameter.min_t + i / this.parameter.segments * (this.parameter.min_t + this.parameter.max_t);
                points[i] = this.deCasteljau(this.controlPoints, this.controlPoints.length - 1, 0, t);

                // determine max and min
                if (points[i][0] < this.minX) this.minX = points[i][0];
                if (points[i][0] > this.maxX) this.maxX = points[i][0];
                if (points[i][1] < this.minY) this.minY = points[i][1];
                if (points[i][1] > this.maxY) this.maxY = points[i][1];
            }
            this.points = points;

            // compute current point location
            this.curPoint = this.deCasteljau(this.controlPoints, this.controlPoints.length - 1, 0, this.t);
        };

        // adds a new control point
        BezierCurve.prototype.addPoint = function (p) {
            this.controlPoints.push(p);
        };

        // removes the last control point
        BezierCurve.prototype.removePoint = function () {
            if (this.controlPoints.length < 3) return;
            this.controlPoints.splice(this.controlPoints.length - 1, 1);
        };

        // draw this circle into the provided 2D rendering context
        BezierCurve.prototype.draw = function (context) {
            /** DRAW LINE SEGMENTS **/

            context.beginPath();

            // check all segment lines
            for (var i = 1; i <= this.parameter.segments; ++i) {
                // draw curve [x,y]
                context.moveTo(this.points[i - 1][0], this.points[i - 1][1]);
                context.lineTo(this.points[i][0], this.points[i][1]);
            }

            context.closePath();

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

            /** draw boundaries **/
            if (this.parameter.showDragger) {
                context.beginPath();

                // first lvl
                for (i = 1; i < this.controlPoints.length; ++i) {
                    context.moveTo(this.points[i - 1][0], this.points[i - 1][1]);
                    context.lineTo(this.points[i][0], this.points[i][1]);
                }

                context.closePath();

                // set drawing style
                context.lineWidth = 1;
                context.strokeStyle = "#ababab";

                // actually start drawing
                context.stroke();
            }

            /** DRAW MARKS **/

            // don't draw if invisible
            if (!this.showTickMarks) return;

            context.beginPath();

            var p0 = [];
            var p1 = [];
            var l = 0.1;

            // check all segment lines
            for (i = 1; i < this.parameter.segments; ++i) {

                p0[0] = this.points[i - 1][0];
                p0[1] = this.points[i - 1][1];
                p1[0] = this.points[i][0];
                p1[1] = this.points[i][1];

                // normal on p0
                var p0N = [p1[1] - p0[1], p0[0] - p1[0]];
                // normal on p1
//                var p1N = [p0[1] - p1[1], p1[0] - p0[0]]; // not needed

                context.moveTo(l * p0N[0] + p0[0], l * p0N[1] + p0[1]);
                context.lineTo(-l * p0N[0] + p0[0], -l * p0N[1] + p0[1]);
            }

            context.closePath();

            // set drawing style
            context.lineWidth = 1;
            context.strokeStyle = "#ff0000";

            // actually start drawing
            context.stroke();
        };

        var pointOnLine = function (pos, p0, p1, width) {

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
        BezierCurve.prototype.isHit = function (context, pos) {

            var p0 = [];
            var p1 = [];

            // check all segment lines
            for (var i = 1; i <= this.parameter.segments; ++i) {

                p0[0] = this.points[i - 1][0];
                p0[1] = this.points[i - 1][1];
                p1[0] = this.points[i][0];
                p1[1] = this.points[i][1];

                // check point on line
                if (pointOnLine(pos, p0, p1, this.lineStyle.width)) return true;
            }
            return false;
        };

        var getNewPointDragger = function (curve, p, draggerStyle) {
            var getP = function () {
                return p;
            };
            var setP = function (dragEvent) {
                p[0] = dragEvent.position[0];
                p[1] = dragEvent.position[1];
                curve.interpolateLinear();
                return p;
            };
            draggerStyle.visible = function () {
                return curve.parameter.showDragger;
            };
            return new PointDragger(getP, setP, draggerStyle);
        };

        var computeCurrentPoint = function (curve, t) {
            // check boundaries of t
            if (t < curve.minX) t = curve.minX;
            if (t > curve.maxX) t = curve.maxX;
            var dt = curve.maxX - curve.minX;
            t = (t - curve.minX) / (dt == 0 ? 1 : dt);
            // set new current t
            curve.t = t;
            // set new current point
            return curve.curPoint = curve.deCasteljau(curve.controlPoints, curve.controlPoints.length - 1, 0, t);
        };

        var getCurPointOnGraph = function (curve, draggerStyle) {
            var getP = function () {
                return curve.curPoint;
            };
            var setP = function (dragEvent) {
                return computeCurrentPoint(curve, dragEvent.position[0]);
            };
            var getT = function () {
                return curve.t;
            };
            var getControlPoints = function () {
                return  curve.controlPoints;
            };
            draggerStyle.visible = function () {
                return curve.showDeCastelJau;
            };
            return new CurvePointDragger(getP, setP, getControlPoints, getT, draggerStyle);
        };

        // return list of draggers to manipulate this circle
        BezierCurve.prototype.createDraggers = function () {

            var draggers = [];

            // decasteljau point on graph
            var draggerStyle = { radius:4, color:this.lineStyle.color, width:0, fill:true };
            // add current point dragger
            draggers.push(getCurPointOnGraph(this, draggerStyle));

            // control points
            draggerStyle = { radius:4, color:this.lineStyle.color, width:0, fill:true };

            for (var i = 0; i < this.controlPoints.length; ++i) {
                draggers.push(getNewPointDragger(this, this.controlPoints[i], draggerStyle));
            }

            return draggers;
        };

        // this module only exports the constructor for bezier curve objects
        return BezierCurve;
    });