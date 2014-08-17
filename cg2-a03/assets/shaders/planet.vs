/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Vertex Shader: planet
 *
 * This shader expects a position and normal vector per vertex,
 * and model-view, projection and normal matrices.
 *
 * it transforms the position and normal to eye coordinates and
 * passes them to the fragment shader as varying variables; 
 * it also transforms the position to clip coordinates for the
 * needs of the pipeline.
 *
 */
precision mediump float;
// in
attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec3 vertexBinormal;
attribute vec3 vertexTangent;
attribute vec2 vertexTexCoords;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform sampler2D u_TopographyTexture; // topography

// out
varying vec4 ecPosition;
varying vec3 ecNormal;
varying vec3 ecBinormal;
varying vec3 ecTangent;
varying vec2 v_TexCoords;

void main() {

    // transform vertex position and normal into eye coordinates
    // for lighting calculations
    ecPosition   = modelViewMatrix * vec4(vertexPosition,1.0);
    ecNormal     = normalize(normalMatrix*vertexNormal);
    ecBinormal = normalize(normalMatrix*ecBinormal);
    ecTangent = normalize(normalMatrix*ecTangent);

    // pass uv
    v_TexCoords = vertexTexCoords;

    // geometry
    float height = texture2D(u_TopographyTexture, vertexTexCoords).r * 0.5;

    // set the fragment position in clip coordinates
    gl_Position  = projectionMatrix * ecPosition + vec4(height * ecNormal,1.0);
}

