/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: circle
 *
 */


/* requireJS module definition */
define(["../../utils/util", "../../utils/vec2", "scene", "../dragger/point_dragger", "../dragger/circle_dragger"],
    (function (Util, vec2, Scene, PointDragger, CircleDragger) {

        "use strict";

        /**
         * Circle
         *
         * @param point0 center x,y
         * @param radius
         * @param lineStyle
         * @constructor
         */
        var Circle = function (point0, radius, lineStyle) {

            console.log("creating circle at [" +
                point0[0] + "," + point0[1] + "] with [" +
                radius + "] radius.");

            // draw style for drawing the circle
            this.lineStyle = lineStyle || { width:"2", color:"#0000AA" };

            // convert to Vec2 just in case the points were given as arrays
            this.p0 = point0 || [0, 0];
            this.radius = radius;

        };

        // draw this circle into the provided 2D rendering context
        Circle.prototype.draw = function (context) {

            context.beginPath();

            // draw circle
            context.arc(this.p0[0], this.p0[1], this.radius, 2 * Math.PI, false);

            context.closePath();

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

        };

        // test whether the mouse position is on this circle segment
        Circle.prototype.isHit = function (context, pos) {
            return (pos[0] - this.p0[0]) * (pos[0] - this.p0[0]) + (pos[1] - this.p0[1]) * (pos[1] - this.p0[1]) - this.radius * this.radius <= 0;
        };

        // return list of draggers to manipulate this circle
        Circle.prototype.createDraggers = function () {
            var draggerStyle = { radius:4, color:this.lineStyle.color, width:0, fill:true }
            var draggers = [];

            // create closure and callbacks for dragger
            var _circle = this;
            var getP0 = function () {
                return _circle.p0;
            };
            var setP0 = function (dragEvent) {
                _circle.p0 = dragEvent.position;
            };
            var getRadius = function () {
                return _circle.radius;
            };
            var setRadius = function (dragEvent) {
                _circle.radius = dragEvent;
            };

            draggers.push(new PointDragger(getP0, setP0, draggerStyle));
            draggers.push(new CircleDragger(getP0, getRadius, setRadius, draggerStyle));

            return draggers;
        };

        // this module only exports the constructor for Circle objects
        return Circle;

    })); // define

    
