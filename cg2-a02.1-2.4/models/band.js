/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Band
 *
 * The Band is made of two circles using the specified radius.
 * One circle is at y = height/2 and the other is at y = -height/2.
 *
 */


/* requireJS module definition */
define(["util", "vbo"],
    (function (Util, vbo) {

        "use strict";

        /*
         */
        var Band = function (gl, config) {

            // read the configuration parameters
            config = config || {};
            var radius = config.radius || 1.0;
            var height = config.height || 0.1;
            var segments = config.segments || 20;
            this.asWireframe = config.asWireframe;

            window.console.log("Creating a " + (this.asWireframe ? "Wireframe " : "") +
                "Band with radius=" + radius + ", height=" + height + ", segments=" + segments);

            // generate vertex coordinates and store in an array
            var coords = [];
            for (var i = 0; i <= segments; i++) {

                // X and Z coordinates are on a circle around the origin
                var t = (i / segments) * Math.PI * 2;
                var x = Math.sin(t) * radius;
                var z = Math.cos(t) * radius;
                // Y coordinates are simply -height/2 and +height/2
                var y0 = height / 2;
                var y1 = -height / 2;

                // add two points for each position on the circle
                // IMPORTANT: push each float value separately!
                coords.push(x, y0, z);
                coords.push(x, y1, z);
            }

            var vertexIndices = [];
            var vtx = 0;
            var idx = 0;

            // each face consists of an anti-clockwise
            for(var i = segments; --i > 0; vtx += 2) {
                // triangle 1
                vertexIndices[idx++] = vtx;
                vertexIndices[idx++] = vtx + 1;
                vertexIndices[idx++] = vtx + 3;

                // triangle 2
                vertexIndices[idx++] = vtx + 3;
                vertexIndices[idx++] = vtx + 2;
                vertexIndices[idx++] = vtx;
            }

            // triangle 1
            vertexIndices[idx++] = vtx;
            vertexIndices[idx++] = vtx + 1;
            vertexIndices[idx++] = 1;

            // triangle 2
            vertexIndices[idx++] = 1;
            vertexIndices[idx++] = 0;
            vertexIndices[idx++] = vtx;

            vtx += 2;

            // therer are 3 floats per vertex, so...
            this.numVertices = coords.length / 3;

            // create vertex buffer object (VBO) for the coordinates
            this.coordsBuffer = new vbo.Attribute(gl, { "numComponents":3,
                "dataType":gl.FLOAT,
                "data":coords
            });

            // create vertex buffer object (VBO) for the coordinates
            this.indexBuffer = new vbo.Indices(gl, {"indices":vertexIndices});
        };

        // draw method clears color buffer and optionall depth buffer
        Band.prototype.draw = function (gl, program) {

            // bind the attribute buffers
            if (this.coordsBuffer) this.coordsBuffer.bind(gl, program, "vertexPosition");

            // bind index buffer
            if (this.indexBuffer) this.indexBuffer.bind(gl);

            if (this.asWireframe) {
                // draw wireframe lines
                this.indexBuffer.bind(gl);
                gl.drawElements(gl.LINE_STRIP, this.indexBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            } else {
                // draw as solid / surface
                this.indexBuffer.bind(gl);
                gl.polygonOffset(2.0, 2.0);
                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.drawElements(gl.TRIANGLES, this.indexBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
                gl.disable(gl.POLYGON_OFFSET_FILL);
            }
        };

        // this module only returns the Band constructor function
        return Band;

    })); // define

    
