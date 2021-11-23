// Varyings
varying vec2 vUv;

// Uniforms
uniform vec2 resolution;

// http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
    vUv = uv;

    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    pos.xyz /= pos.w;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}