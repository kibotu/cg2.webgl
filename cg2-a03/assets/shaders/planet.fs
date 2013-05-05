/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Fragment Shader: planet
 *
 * expects position and normal vectors in eye coordinates per vertex;
 * expects uniforms for ambient light, directional light, and phong material.
 * 
 *
 */

precision mediump float;

// position and normal in eye coordinates
varying vec4  ecPosition;
varying vec3  ecNormal;
varying vec3 ecBinormal;
varying vec3 ecTangent;
varying vec2 v_TexCoords;

// transformation matrices
uniform mat4  modelViewMatrix;
uniform mat4  projectionMatrix;

uniform sampler2D u_DayTexture; // day
uniform int u_ShowNight;
uniform sampler2D u_NightTexture; // night
uniform int u_ShowClouds;
uniform vec2 u_CloudShift; // cloud translation
uniform float u_CloudIntensity;
uniform sampler2D u_CloudTexture; // clouds
uniform sampler2D u_BathymetryTexture; // bathymetry
uniform sampler2D u_TopographyTexture; // topography
uniform sampler2D u_BumpMapTexture; // bump map

// Ambient Light
uniform vec3 ambientLight;

// Material
struct PhongMaterial {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float shininess;
};
uniform PhongMaterial material;

// Light Source Data for a directional light
struct LightSource {
    int  type;
    vec3 direction;
    vec3 color;
    bool on;
    
} ;
uniform LightSource light;

vec3 getDayNightColor(sampler2D day, sampler2D night, vec2 uv, float cosineAngleSunToNormal) {
    vec3 dayColor = texture2D( day, uv ).rgb;
    vec3 nightColor = texture2D( night, uv ).rgb;

    // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
    // float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);

    // sharpen the edge beween the transition
    cosineAngleSunToNormal = clamp( cosineAngleSunToNormal * 5.0, -1.0, 1.0);

    // convert to 0 to 1 for mixing
    float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5;

    // Select day or night texture based on mixAmount.
    return mix( nightColor, dayColor, mixAmount );
}

// clouds
vec4 clouds(vec3 baseColor, sampler2D cloudTexture, vec2 uv, float intensity, float cosineAngleSunToNormal) {
  // cloud map
  float c = texture2D(cloudTexture, uv).r;

   // sharpen the edge beween the transition
  cosineAngleSunToNormal = clamp( cosineAngleSunToNormal * 5.0, -1.0, 1.0);

  // convert to 0 to 1 for mixing
  float mixAmount = cosineAngleSunToNormal * 0.5 + 0.2;

  // mix intensity
  c = pow(c,intensity);

  // mixed cloud color
  vec4 mixedColor = vec4((1.0-c) * baseColor + c * vec3(1,1,1),1.0);

  return mix(vec4(baseColor,1.0),mixedColor, mixAmount);
}

vec3 bumpMap2(vec3 normal,sampler2D bumpMap, vec2 uv){
  float scale = 1.0; //bump_scale;
  vec4 tex = texture2D(bumpMap,uv);
  float deltaS = uv.s + 0.003; // +delta_s;
  float deltaT = uv.t + 0.003; // +delta_t;


  vec4 ds = texture2D(bumpMap,vec2(deltaS,uv.t)) - tex;
  vec4 dt = texture2D(bumpMap,vec2(uv.s,deltaT)) - tex;
  float magX = ds.b;
  float magY = dt.b;

  normal += scale*magX*vec3(1.0,0.0,0.0);
  normal += scale*magY*vec3(0.0,1.0,0.0);
  return normalize(normal);
}

vec3 bumpMap(vec3 normal, vec3 nBinormal, vec3 nTangent, sampler2D bumpMap, vec2 uv){
    vec3 normalTexture = texture2D(bumpMap, uv).xyz;
    vec3 nN = normalize(normal + nBinormal + nTangent);
    return normalize(normalTexture * nN);
}

vec3 bumpMap3(vec3 normal, vec3 nBinormal, vec3 nTangent, sampler2D bumpSampler, vec2 uv) {
    float BumpConstant = 0.5;
    // Calculate the normal, including the information in the bump map
    vec3 bump = BumpConstant * (texture2D(bumpSampler, uv).rgb - (0.5, 0.5, 0.5));
    vec3 bumpNormal = normal + (bump.x * nTangent + bump.y * nBinormal);
    return normalize(bumpNormal);
}

/*
 Calculate surface color based on Phong illumination model.
 - pos:  position of point on surface, in eye coordinates
 - n:    surface normal at pos
 - v:    direction pointing towards the viewer, in eye coordinates
 + assuming directional light
 
 */
vec3 phong(vec3 pos, vec3 n, vec3 v, LightSource light, PhongMaterial material) {

    // ambient part
    vec3 ambient = material.ambient * ambientLight;
    
    // back face towards viewer?
    float ndotv = dot(n,v);
    if(ndotv<-0.5)
        return vec3(0,0,0);

    // light enabled?
    if(!light.on)
        return ambient + texture2D(u_DayTexture, v_TexCoords).rgb;

    // vector from light to current point
    vec3 l = normalize(light.direction);
    
    // cos of angle between light and surface. 0 = light behind surface
    float ndotl = dot(n,-l);

    // diffuse contribution
    vec3 diffuse;

    // day night
    if(u_ShowNight == 1)
        // compute day and night contribution
        diffuse = ambient + getDayNightColor(u_DayTexture, u_NightTexture, v_TexCoords, ndotl);
    else {
        // no light only ambient color
        if(ndotl<=0.0)
            return ambient;

        // compute day contribution only
        diffuse = texture2D(u_DayTexture,v_TexCoords).rgb * light.color * ndotl;
    }

    // clouds & night
    if(u_ShowClouds == 1)
        diffuse = clouds(diffuse, u_CloudTexture, v_TexCoords+u_CloudShift, u_CloudIntensity, ndotl).rgb;

    // reflected light direction = perfect reflection direction
    vec3 r = reflect(l,n);
    
    // angle between reflection dir and viewing dir
    float rdotv = max( dot(r,v), 0.0);

    // shininess
    float shininess = material.shininess * texture2D(u_TopographyTexture,v_TexCoords).r;
    
    // specular contribution
    vec3 ps = material.specular * light.color * pow(rdotv,shininess);

    // mix specular map with specular
    vec3 specular =  ps * texture2D(u_BathymetryTexture, v_TexCoords).rgb;

    // return sum of all contributions
    return ambient + diffuse + specular;
}

// Function to unpack a unit vector from a texture
vec3 unpack_vector (vec4 v) {
	return v.xyz * 2.0 - 1.0;
}

void main() {
    
    // normalize normal after projection
    vec3 normalEC = normalize(ecNormal);
    // sad bump mapping tries
    //vec3 normalEC = bumpMap(ecNormal,ecBinormal,ecTangent,u_BumpMapTexture,v_TexCoords);
    //vec3 normalEC = bumpMap2(ecNormal,u_BumpMapTexture,v_TexCoords);
    // vec3 normalEC = bumpMap3(ecNormal, ecBinormal, ecTangent, u_BumpMapTexture, v_TexCoords);
    //vec3 normalEC = normalize(ecNormal + 0.5 * unpack_vector(texture2D(u_BumpMapTexture, v_TexCoords)));

    // do we use a perspective or an orthogonal projection matrix?
    bool usePerspective = projectionMatrix[2][3] != 0.0;
    
    // for perspective mode, the viewing direction (in eye coords) points
    // from the vertex to the origin (0,0,0) --> use -ecPosition as direction.
    // for orthogonal mode, the viewing direction is simply (0,0,1)
    vec3 viewdirEC = usePerspective? normalize(-ecPosition.xyz) : vec3(0,0,1);

    // do something fancy with light type
    //int lightType = light.type;

    // calculate color using phong illumination
    vec3 phongColor = phong( ecPosition.xyz, normalEC, viewdirEC, light, material);

    // set fragment color
    gl_FragColor = vec4(phongColor,1.0);
}
