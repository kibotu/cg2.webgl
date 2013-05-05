/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Cube
 *
 * The Cube is centered in the origin, all sides are axis-aligned, 
 * and each edge has length 1. 
 *
 *                   H              G
 *                   .--------------.
 *                  /              /|
 *                 / |            / |
 *                /              /  |
 *              D/   |         C/   |
 *    y         .--------------.    |
 *    |         |    |         |    |
 *    |         |    .- - - - -|----.
 *    |         |    E         |   /F
 *    0-----x   |  /           |  /
 *   /          |              | /
 *  /           |/             |/
 * z            .--------------.  
 *              A              B
 *
 *
 * We use a right-handed coordinate system with Z pointing towards the 
 * viewer. For example, vertex A (front bottom left) has the coordinates  
 * ( x = -0.5, y = -0.5, z = 0.5 ) . 
 *
 * The cube only consists of eight different vertex positions; however 
 * for various reasons (e.g. different normal directions) these vertices
 * are "cloned" for each face of the cube. There will be 3 instances
 * of each vertex, since each vertex belongs to three different faces.
 *
 */


/* requireJS module definition */
define(["util", "vbo"],
    (function (Util, vbo) {

        "use strict";

        /*
         */
        var Cube = function (gl,config) {

            // read the configuration parameters
            config = config || {};
            this.asWireframe = config.asWireframe;

            window.console.log("Creating a " + (this.asWireframe ? "Wireframe " : "") + " unit Cube.");

            var c = 0.5;

            // generate points and store in an array
            var coords = [
                // front
                -c, -c, c, // A: index 0
                c, -c, c, // B: index 1
                c, c, c, // C: index 2
                -c, c, c, // D: index 3

                // back
                -c, -c, -c, // E: index 4
                c, -c, -c, // F: index 5
                c, c, -c, // G: index 6
                -c, c, -c, // H: index 7

                // left
                -c, -c, c, // A': index 8
                -c, c, c, // D': index 9
                -c, c, -c, // H': index 10
                -c, -c, -c, // E': index 11

                // right
                c, -c, c, // B': index 12
                c, -c, -c, // F': index 13
                c, c, -c, // G': index 14
                c, c, c, // C': index 15

                // top
                -c, c, c, // D'': index 16
                c, c, c, // C'': index 17
                c, c, -c, // G'': index 18
                -c, c, -c, // H'': index 19

                // bottom
                -c, -c, c, // A'': index 20
                -c, -c, -c, // E'': index 21
                c, -c, -c, // F'': index 22
                c, -c, c   // B'': index 23
            ];

            var vertexIndices = [
                0, 1, 2, 0, 2, 3,       // front
                7, 6, 4, 6, 5, 4,       // back
                8, 9, 10, 8, 10, 11,    // top
                12, 13, 14, 12, 14, 15, // bottom
                16, 17, 18, 16, 18, 19, // right
                20, 21, 22, 20, 22, 23  // left
            ];

            c = 1.0;

            var colors = [
                [0.0, 0.0, c, c],    // Front face: blue
                [0.0, 0.0, c, c],    // Back face: blue
                [c, 0.0, 0.0, c],    // Top face: red
                [c, 0.0, 0.0, c],    // Bottom face: red
                [0.0, c, 0.0, c],    // Right face: green
                [0.0, c, 0.0, c]     // Left face: green
            ];

            var generatedColors = [];

            for (var j = 0; j < 6; j++) {
                c = colors[j];

                for (var i = 0; i < 4; i++) {
                    generatedColors = generatedColors.concat(c);
                }
            }

            // therer are 3 floats per vertex, so...
            this.numVertices = coords.length / 3;

            // create vertex buffer object (VBO) for the coordinates
            this.coordsBuffer = new vbo.Attribute(gl, { "numComponents":3,
                "dataType":gl.FLOAT,
                "data":coords
            });

            // create vertex indices buffer object
            this.indexBuffer = new vbo.Indices(gl, {"indices":vertexIndices});

            // create vertex color buffer object (VBO) for the coordinates
            this.colorBuffer = new vbo.Attribute(gl, { "numComponents":4,
                "dataType":gl.FLOAT,
                "data":generatedColors
            });
        };

        // draw method clears color buffer and optionall depth buffer
        Cube.prototype.draw = function (gl, program) {

            // bind the attribute buffers
            if (this.coordsBuffer) this.coordsBuffer.bind(gl, program, "vertexPosition");

            // bind the attribute buffers
            if (this.colorBuffer) this.colorBuffer.bind(gl, program, "vertexColor");

            // bind index buffer
            if (this.indexBuffer) this.indexBuffer.bind(gl);

            if (this.asWireframe) {
                // draw wireframe lines
                gl.drawElements(gl.LINE_STRIP, this.indexBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            } else {
                // draw as solid / surface
                gl.polygonOffset(0.1, 0.1);
                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.drawElements(gl.TRIANGLES, this.indexBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
                gl.disable(gl.POLYGON_OFFSET_FILL);
            }
        };

        // this module only returns the constructor function
        return Cube;

    })); // define

    
