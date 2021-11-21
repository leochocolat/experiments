// Varyings
varying vec2 vUv;

// Uniforms
uniform vec2 resolution;
uniform float time;
uniform float speed;
uniform float luminosity;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform float simplexNoiseScale;
uniform float patternScale;
uniform float whiteNoiseOverlayLuminosity;
uniform float whiteNoiseOverlayOpaciy;

#pragma glslify: snoise = require(glsl-noise/simplex/3d);

float random(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 4
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    vec2 st = vUv;

    float amplitude = 1.0;
    float frequency = 1.0;

    float simplexNoise = snoise(vec3(st.x * simplexNoiseScale, st.y * simplexNoiseScale, time));
    // simplexNoise = smoothstep(0.0, 0.5, simplexNoise);
    // vec3 noiseColor = vec3(simplexNoise);
    // vec3 color = mix(noiseColor, color1, 0.2);
    // color += fbm(vUv * simplexNoiseScale);
    // st.x = time;
    // color += random(vec2(st.y * simplexNoiseScale, st.y * simplexNoiseScale));
    // color += simplexNoise;
    // color = vec3(vUv.x, vUv.y, 0.0);
    // color = mix(color, color2, 0.5);
    // color = mix(color, color3, 0.5);

    st.x = fract(st.x * patternScale * simplexNoise);
    st.y = fract(st.y * patternScale * simplexNoise);

    vec4 texel = vec4(st.x * color1.r, st.y * color1.g, color1.b, 1.0);
    texel *= luminosity;

    vec4 whiteNoiseTexel = vec4(random(vec2(vUv.x * time, vUv.y * time)));

	gl_FragColor = mix(texel, whiteNoiseTexel * whiteNoiseOverlayLuminosity, whiteNoiseOverlayOpaciy);
}