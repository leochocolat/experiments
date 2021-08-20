varying vec2 v_uv;
varying vec3 v_normal;

uniform float u_time;

void main() {
    gl_FragColor = vec4(v_normal, 0.0);
}