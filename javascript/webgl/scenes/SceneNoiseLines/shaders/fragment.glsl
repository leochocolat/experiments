// Varyings
varying vec2 vUv;

// Uniforms
uniform vec2 resolution;
uniform float time;
uniform float speed;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
// Pattern
uniform float patternScale;
// Noise
uniform float simplexScale;
uniform float whiteNoiseScale;
// Displacement
uniform float displacementAmplitude;

#pragma glslify: snoise = require(glsl-noise/simplex/3d);

float random(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec2 st = vUv;


    // White Noise
    float xs = floor(vUv.x * whiteNoiseScale);
    float ys = floor(vUv.y * whiteNoiseScale);
    float whiteNoise = random(vec2(ys, ys));

    float size = 0.1;
    float progress = 0.5;
    st.x = smoothstep(progress, 1.0, st.x);

    vec3 color = vec3(st.x);

	gl_FragColor = vec4(color, 1.0);
}