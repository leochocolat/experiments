uniform vec2 u_resolution;
uniform vec2 u_aspect_ratio;

varying vec2 v_uv;

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

void main() {
    // Mirror
    v_uv = vec2(uv.x, uv.y);

    // Resize
    v_uv = resizedUv(v_uv, u_resolution, u_aspect_ratio);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}