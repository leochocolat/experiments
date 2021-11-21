// Varyings
varying vec2 vUv;

// Uniforms
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
uniform float intensiy;

float random(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
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

void main() {
    vec2 st = vUv;

    vec4 texel = texture2D(tDiffuse, vUv);
    vec4 noiseTexel = vec4(random(st * (time + 10.0)));
	gl_FragColor = mix(texel, noiseTexel, intensiy);
}