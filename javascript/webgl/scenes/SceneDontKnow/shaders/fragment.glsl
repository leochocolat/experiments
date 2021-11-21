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

#pragma glslify: snoise = require(glsl-noise/simplex/3d);

void main() {
    vec2 st = vUv;

    float simplexNoise1 = snoise(vec3(vUv.x * simplexScale, vUv.y * simplexScale, time));
    float simplexNoise2 = snoise(vec3(vUv.x * simplexScale * 0.5, vUv.y * simplexScale  * 0.5, time + 10000.0));
    float simplexNoise3 = snoise(vec3(vUv.x * simplexScale * 0.1, vUv.y * simplexScale  * 0.1, time + 39970.0));

    st.x = fract(st.x * patternScale);
    st.y = fract(st.y * patternScale);

    st.x = smoothstep(simplexNoise1, 1.0, st.x);
    // st.y = smoothstep(simplexNoise1, 1.0, st.y);

    vec3 color = color1;
    color *= st.x;
    // color *= st.y;
    color += simplexNoise2 * color2;
    color += simplexNoise3 * color3;

	gl_FragColor = vec4(color, 1.0);
}