// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec2 vScreenPosition;
varying vec3 vDisplacedNormal;

// Uniforms
uniform vec2 resolution;
uniform vec2 size;
uniform sampler2D displacementMap;
uniform sampler2D fboMap;

#pragma glslify: snoise = require(glsl-noise/simplex/3d);

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    float noise = snoise(vec3(vUv * 10.0, 0.5));

    // White Noise
    float xs = floor(vUv.x * 20.0);
    float ys = floor(vUv.y * 20.0);
    float whiteNoise = rand(vec2(xs, ys));

    vec4 displacementTexel = texture2D(displacementMap, vUv);

    vec2 fpoSt = vScreenPosition;
    // fpoSt += displacementTexel.r * 0.05;
    fpoSt += whiteNoise * 0.05;
    // fpoSt += noise * 0.05;
    vec4 fboTexel = texture2D(fboMap, fpoSt);
	
    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

	// gl_FragColor = mix(color, fboTexel, 0.5);
    fboTexel.a = 1.0;
	gl_FragColor = fboTexel;
	// gl_FragColor = displacementTexel;
	// gl_FragColor = vec4(vDisplacedNormal, 1.0);
	// gl_FragColor = vec4(vScreenPosition.x, 0.0, 0.0, 1.0);
}