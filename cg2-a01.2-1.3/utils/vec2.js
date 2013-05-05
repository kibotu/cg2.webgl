/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: vec2
 *
 * Some simple 2D vector operations based on [x,y] arrays
 *
 */


/* requireJS module definition */
define([],
    (function () {

        "use strict";

        var vec2 = {};

        // add two vectors, return new vector
        vec2.add = function (v0, v1) {
            return [v0[0] + v1[0], v0[1] + v1[1] ];
        };

        // subtract two vectors, return new vector
        vec2.sub = function (v0, v1) {
            return [v0[0] - v1[0], v0[1] - v1[1] ];
        };

        // scalar product of two vectors, return scalar
        vec2.dot = function (v0, v1) {
            return v0[0] * v1[0] + v0[1] * v1[1];
        };

        // multiply vector by scalar, return new vector
        vec2.mult = function (v, s) {
            return [ v[0] * s, v[1] * s ];
        };

        // squared length of a vector
        vec2.length2 = function (v) {
            return vec2.dot(v, v);
        };

        // length of a vector
        vec2.length = function (v) {
            return Math.sqrt(vec2.length2(v));
        };

        // project a point onto a line defined by two points.
        // return scalar parameter of where point p is projected on line
        vec2.projectPointOnLine = function (p, p0, p1) {

            var dp = vec2.sub(p, p0);
            var dv = vec2.sub(p1, p0);
            return vec2.dot(dp, dv) / vec2.dot(dv, dv);
        };

        vec2.normalize = function (v) {
            var len = vec2.length(v);
            if (len != 0) {
                v[0] /= len;
                v[1] /= len;
            }
            return v;
        };

        vec2.rotate = function(v, angle) {
            var rad = angle * (Math.PI / 180);
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);

            var newX = v[0] * cos - v[1] * sin;
            var newY = v[0] * sin + v[1] * cos;

            v[0] = newX;
            v[1] = newY;

            return v;
        };

        // this module exports an object defining a number of functions
        return vec2;

    })); // define

    
