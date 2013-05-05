/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Scene
 *
 * This module defines the scene to be drawn.
 *
 * A Scene object has a draw() method to draw itself, plus some
 * public attributes that may be used by animation functions etc:
 *
 * Scene.world:       the root node of the scene, of type SceneNode
 *
 * Scene.camera:      the camera to be used, consisting of two attributes:
 *                    camera.viewMatrix and camera.projectionMatrix.
 * 
 * Scene.drawOptions: array of strings defining on/off drawing options. 
 *                    this is potentially used by HtmlController to create
 *                    the corresponding check boxes in the HTML document.
 *
 */


/* requireJS module definition */
define(["jquery", "gl-matrix",
    "../materials/program", "materials/shaders", "../scene_node", "materials/texture", "scene/light", "materials/material",
    "models/parametric"],
    (function ($, glmatrix, Program, shaders, SceneNode, texture, light, material, parametric) {

        "use strict";

        // a simple scene is an object with a few objects and a draw() method
        var Scene = function (gl) {

            // store the WebGL rendering context
            this.gl = gl;

            // create WebGL program using constant blue color
            var prog_blue = new Program(gl, shaders("minimal_vs"), shaders("frag_color_fs"), "prog_blue");
            prog_blue.use();
            prog_blue.setUniform("fragColor", "vec4", [0.0, 0.0, 1.0, 1.0]);

            // WebGL program for using phong illumination
            var prog_phong = new Program(gl, shaders("phong_vs"), shaders("phong_fs"), "prog_phong");
            prog_phong.use();
            prog_phong.setUniform("ambientLight", "vec3", [0.4, 0.4, 0.4]);

            // planet shader
            var prog_planet = new Program(gl, shaders("planet_vs"), shaders("planet_fs"), "prog_planet");
            prog_planet.use();
            prog_planet.setUniform("ambientLight", "vec3", [0.4, 0.4, 0.4]);

            // register all programs in this list for setting the projection matrix later
            this.programs = [prog_blue, prog_phong, prog_planet];

            // light source
            this.sun = new light.DirectionalLight("light", {"direction":[-1, 0, 0], "color":[1, 1, 1] });
            this.sunNode = new SceneNode("SunNode", [this.sun], prog_phong);
            this.sunNodePlanet = new SceneNode("SunNode", [this.sun], prog_planet);

            // equator ring for orientation
            this.ringMaterial = new material.PhongMaterial("material",
                {"ambient":[0.5, 0.3, 0.3],
                    "diffuse":[0.8, 0.2, 0.2],
                    "specular":[0.4, 0.4, 0.4],
                    "shininess":80
                });

            // phong material planet
            this.planetMaterial = new material.PhongMaterial("material",
                {"ambient":[0.05, 0.05, 0.05],
                    "diffuse":[0.2, 0.2, 0.2],
                    "specular":[0.4, 0.4, 0.4],
                    "shininess":800
                });

            // load texture
            var quality = 2;
            this.month = 8;
            this.cloudsIntensity = 0.5;
            this.cloudShift = [0.0,0.0];
            this.dt = 0;
            switch (quality) {
                case 0:
                    this.months = [
                        new texture.Texture2D(gl, "./assets/textures/months/january/earth_january_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/february/earth_february_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/march/earth_march_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/april/earth_april_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/may/earth_may_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/june/earth_june_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/july/earth_july_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/august/earth_august_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/september/earth_september_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/october/earth_october_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/november/earth_november_bathemetry_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/december/earth_december_bathemetry_4096.jpg", true)
                    ];
                    this.nightTexture = new texture.Texture2D(gl, "./assets/textures/night/earth_at_night_2048.png", true)
                    this.cloudTexture = new texture.Texture2D(gl, "./assets/textures/clouds/earth_clouds_4096.png", true);
                    this.bathymetryTexture = new texture.Texture2D(gl, "./assets/textures/bathemetry/earth_bathymetry_4096.jpg", true);
                    this.topographyTexture = new texture.Texture2D(gl, "./assets/textures/topography/earth_topography_4096.jpg", true);
                    break;
                case 1:
                    this.months = [
                        new texture.Texture2D(gl, "./assets/textures/months/january/earth_january_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/february/earth_february_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/march/earth_march_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/april/earth_april_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/may/earth_may_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/june/earth_june_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/july/earth_july_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/august/earth_august_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/september/earth_september_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/october/earth_october_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/november/earth_november_4096.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/december/earth_december_4096.jpg", true)
                    ];
                    this.nightTexture = new texture.Texture2D(gl, "./assets/textures/night/earth_at_night_2048.png", true)
                    this.cloudTexture = new texture.Texture2D(gl, "./assets/textures/clouds/earth_clouds_4096.png", true);
                    this.bathymetryTexture = new texture.Texture2D(gl, "./assets/textures/bathemetry/earth_bathymetry_4096.jpg", true);
                    this.topographyTexture = new texture.Texture2D(gl, "./assets/textures/topography/earth_topography_4096.jpg", true);
                    break;
                case 2:
                    this.months = [
                        new texture.Texture2D(gl, "./assets/textures/months/january/earth_january_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/february/earth_february_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/march/earth_march_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/april/earth_april_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/may/earth_may_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/june/earth_june_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/july/earth_july_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/august/earth_august_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/september/earth_september_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/october/earth_october_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/november/earth_november_bathemetry_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/december/earth_december_bathemetry_1024.jpg", true)
                    ];
                    this.nightTexture = new texture.Texture2D(gl, "./assets/textures/night/earth_at_night_1024.jpg", true)
                    this.cloudTexture = new texture.Texture2D(gl, "./assets/textures/clouds/earth_clouds_1024.jpg", true);
                    this.bathymetryTexture = new texture.Texture2D(gl, "./assets/textures/bathemetry/earth_bathymetry_1024.jpg", true);
                    this.topographyTexture = new texture.Texture2D(gl, "./assets/textures/topography/earth_topography_1024.jpg", true);
                    break;
                case 3:
                    this.months = [
                        new texture.Texture2D(gl, "./assets/textures/months/january/earth_january_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/february/earth_february_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/march/earth_march_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/april/earth_april_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/may/earth_may_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/june/earth_june_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/july/earth_july_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/august/earth_august_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/september/earth_september_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/october/earth_october_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/november/earth_november_1024.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/december/earth_december_1024.jpg", true)
                    ];
                    this.nightTexture = new texture.Texture2D(gl, "./assets/textures/night/earth_at_night_1024.jpg", true)
                    this.cloudTexture = new texture.Texture2D(gl, "./assets/textures/clouds/earth_clouds_1024.jpg", true);
                    this.bathymetryTexture = new texture.Texture2D(gl, "./assets/textures/bathemetry/earth_bathymetry_1024.jpg", true);
                    this.topographyTexture = new texture.Texture2D(gl, "./assets/textures/topography/earth_topography_1024.jpg", true);
                    break;
                default:
                case 4:
                    this.months = [
                        new texture.Texture2D(gl, "./assets/textures/months/january/earth_month01_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/february/earth_month02_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/march/earth_month03_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/april/earth_month04_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/may/earth_month05_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/june/earth_month06_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/july/earth_month07_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/august/earth_month08_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/september/earth_month09_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/october/earth_month10_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/november/earth_month11_512.jpg", true),
                        new texture.Texture2D(gl, "./assets/textures/months/december/earth_month12_512.jpg", true)
                    ];
                    this.nightTexture = new texture.Texture2D(gl, "./assets/textures/night/earth_at_night_512.jpg", true)
                    this.cloudTexture = new texture.Texture2D(gl, "./assets/textures/clouds/earth_clouds_512.jpg", true);
                    this.bathymetryTexture = new texture.Texture2D(gl, "./assets/textures/bathemetry/earth_bathymetry_512.jpg", true);
                    this.topographyTexture = new texture.Texture2D(gl, "./assets/textures/topography/earth_topography_512.jpg", true);
                    break;
            }

            this.bumpMapTexture = new texture.Texture2D(gl, "./assets/textures/EarthNormal.png", true);
//            this.earthTexture = new texture.Texture2D(gl, "./assets/textures/test_world_texture_512.png", true);
            //this.specularTexture = new texture.Texture2D(gl, "./assets/textures/earth_specular_512.jpg", true);

            this.ringGeometry = new parametric.Torus(gl, 1.2, 0.04, {"uSegments":80, "vSegments":40});
            this.ringNode = new SceneNode("EquatorNode", [this.ringMaterial, this.ringGeometry], prog_phong);

            // add planet
            var uSegments = 360;
            var vSegments = 180;
            var radius = 1;
            this.planetGeometry = new parametric.Sphere(gl, radius, {"uSegments":uSegments, "vSegments":vSegments});
            this.planetGridGeometry = new parametric.Sphere(gl, radius, {"uSegments":uSegments, "vSegments":vSegments, "wireframe":true});
            this.planetGridNode = new SceneNode("Grid", [this.planetMaterial, this.planetGridGeometry], prog_blue);
            this.planetNode = new SceneNode("Earth", [this.planetMaterial, this.planetGeometry, this.planetGridNode], prog_planet);

            // the poles are modeled on the Z axis, so swap z and y axes
            mat4.rotate(this.ringNode.transformation, Math.PI / 2.0, [1, 0, 0]);
            mat4.rotate(this.planetNode.transformation, Math.PI / 2.0, [1, 0, 0]);

            // the world node - this is potentially going to be accessed from outside
            this.world = new SceneNode("world", [this.sunNode, this.sunNodePlanet, this.ringNode, this.planetNode], prog_blue);

            // initial camera parameters
            var c = gl.canvas;
            var aspectRatio = c.width / c.height;
            this.camera = {};
            this.camera.viewMatrix = mat4.lookAt([0, 0.5, 3], [0, 0, 0], [0, 1, 0]);
            this.camera.projectionMatrix = mat4.perspective(45, aspectRatio, 0.01, 100);

            // for the UI - this will be accessed directly by HtmlController
            this.drawOptions = { "Planet":true, "Wireframe":false, "Ring":false, "Night": true, "Clouds":true};
        }; // Scene constructor

        // draw the scene, starting at the root node
        Scene.prototype.draw = function () {

            // shortcut
            var gl = this.gl;

            // switch grid on/off
            this.ringNode.visible = this.drawOptions["Ring"];

            // toggle planet visibility
            this.planetNode.visible = this.drawOptions["Planet"];

            // toggle planet grid visibility
            this.planetGridNode.visible = this.drawOptions["Wireframe"];

            // set camera's projection matrix in all programs
            for (var i = 0; i < this.programs.length; ++i) {
                var p = this.programs[i];
                p.use();
                p.setUniform("projectionMatrix", "mat4", this.camera.projectionMatrix);

                if(p.prog_name != undefined && p.prog_name == "prog_planet") {
                    console.log("month:" +this.month);
                    this.earthTexture = this.months[this.month];
                    if(this.earthTexture.isLoaded()) p.setTexture("u_DayTexture", 0, this.earthTexture);
                    // toggle day and night visibility
                    p.setUniform("u_ShowNight", "int", this.drawOptions["Night"]);
                    if(this.drawOptions["Night"] && this.nightTexture.isLoaded()) p.setTexture("u_NightTexture", 1, this.nightTexture);
                    // toggle cloud visibility
                    p.setUniform("u_ShowClouds", "int", this.drawOptions["Clouds"]);
                    if(this.drawOptions["Clouds"] && this.cloudTexture.isLoaded()) {
                        p.setUniform("u_CloudIntensity","float", this.cloudsIntensity);
                        p.setUniform("u_CloudShift", "vec2", this.cloudShift);
                        p.setTexture("u_CloudTexture", 2, this.cloudTexture);
                    }
                    if(this.bathymetryTexture.isLoaded()) p.setTexture("u_BathymetryTexture", 3, this.bathymetryTexture);
                    if(this.topographyTexture.isLoaded()) p.setTexture("u_TopographyTexture", 4, this.topographyTexture);
//                    if(this.bumpMapTexture.isLoaded()) p.setTexture("u_BumpMapTexture", 5, this.bumpMapTexture);
//                    if(this.specularTexture.isLoaded()) p.setTexture("u_SpecularTexture", 6, this.specularTexture);
                }
            }

            // initially set model-view matrix to the camera's view matrix
            var modelView = this.camera.viewMatrix;

            // enable depth testing, keep fragments with smaller depth values
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);

            // clear color and depth buffers
            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // start drawing with the root node
            this.world.draw(gl, null, modelView);

        }; // Scene draw()

        return Scene;

    })); // define module
        

