uniform vec2 u_screen_resolution;
uniform vec2 u_resolution;
uniform vec2 u_aspect_ratio;
uniform float u_scale;

varying vec2 v_uv;
varying vec2 v_uv_r;
varying float v_color_effect_intensity;

vec2 resizedUv(vec2 inital_uv, vec2 resolution, vec2 aspect_ratio)
{
	vec2 ratio = vec2(
		min((resolution.x / resolution.y) / (aspect_ratio.x / aspect_ratio.y), 1.0),
		min((resolution.y / resolution.x) / (aspect_ratio.y / aspect_ratio.x), 1.0)
	);

	vec2 resized_uv = vec2(
		inital_uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
		inital_uv.y * ratio.y + (1.0 - ratio.y) * 0.5
	);

	return resized_uv;
}

float cubicPulse( float c, float w, float x ){
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

void main() {
    v_uv = uv;

	vec4 glPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Resize
    v_uv_r = resizedUv(v_uv, u_resolution, u_aspect_ratio);

	// Inside parallax
	float progress_x = glPos.x / u_screen_resolution.x;
	v_uv_r = (v_uv_r - 0.5) * (1.0 / u_scale) + 0.5; // scale from center
	v_uv_r.x += progress_x * (u_scale - 1.0); // displace uv.x

	// Fade
	float fade_progress_x = (glPos.x + u_screen_resolution.x * 0.5) / u_screen_resolution.x;
	v_color_effect_intensity = fade_progress_x;
	v_color_effect_intensity = cubicPulse(0.5, 0.45,fade_progress_x);
	// v_uv_r.x = v_color_effect_intensity;

    gl_Position = glPos;
}