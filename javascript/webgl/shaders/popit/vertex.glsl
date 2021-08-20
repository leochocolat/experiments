varying vec2 v_uv;
varying vec3 v_normal;

uniform float u_time;
uniform float u_angle;

#pragma glslify: rotateX = require(glsl-rotate/rotateX)

void main() {
    v_uv = uv;
    v_normal = normal;

    // float distortion = normal.x;
    // vec3 pos = position + (normal * distortion);

    // float angle = sin(uv.x * 5.0 + u_time) * 0.1;
    vec3 pos = rotateX(position, uv.x * 0.1 * u_angle);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}