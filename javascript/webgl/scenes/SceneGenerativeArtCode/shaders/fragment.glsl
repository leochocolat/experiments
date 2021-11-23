// Varyings
varying vec2 vUv;

// Uniforms
uniform vec2 resolution;
uniform float id;
uniform float whiteNoiseScale;

float random(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec2 st = vUv;

    // White Noise
    float xs = floor(vUv.x * whiteNoiseScale);
    float ys = floor(vUv.y * whiteNoiseScale);
    float whiteNoise = random(vec2(xs, xs) * id);
    whiteNoise = step(whiteNoise, 0.5);
	gl_FragColor = vec4(whiteNoise);
}