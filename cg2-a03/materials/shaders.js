/*
 * WebGL core teaching framework 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Shaders
 *
 * This module loads required shaders using the require.js text plugin, 
 * see https://github.com/requirejs/text 
 *
 */


/* requireJS module definition */
define(["text!./../assets/shaders/minimal.vs", "text!./../assets/shaders/frag_color.fs",
    "text!./../assets/shaders/vertex_color.vs", "text!./../assets/shaders/vertex_color.fs",
    "text!./../assets/shaders/texture.vs", "text!./../assets/shaders/texture.fs",
    "text!./../assets/shaders/phong.vs", "text!./../assets/shaders/phong.fs",
    "text!./../assets/shaders/planet.vs", "text!./../assets/shaders/planet.fs"
],
    (function (minimal_vs, frag_color_fs, vertex_color_vs, vertex_color_fs, texture_vs, texture_fs, phong_vs, phong_fs, planet_vs, planet_fs) {

        "use strict";

        // return source code of a vertex shader
        var shaders = function (name) {
            var shader = eval(name);
            if (!shader) {
                throw "module shaders: shader " + name + " undefined.";
            }
            return shader;
        };

        // module returns the function shaders
        return shaders;

    })); // define module
        

