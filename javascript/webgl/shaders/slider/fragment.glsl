varying vec2 v_uv;
varying vec2 v_uv_r;
varying vec2 v_uv_screen;
varying vec4 v_position;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_screen_resolution;
uniform sampler2D u_texture;

uniform float u_level_min;
uniform float u_level_max;

uniform float u_alpha_factor;
uniform float u_level_factor;
uniform float u_saturation_factor;
uniform float u_brightness_factor;
uniform float u_contrast_factor;

uniform vec2 u_mouse_position;
uniform float u_mouse_scale;

uniform vec2 u_center;

float mouse_size = 0.1;

// Source: https://thebookofshaders.com/05/
float cubicPulse( float c, float w, float x ){
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

float circleSDF(vec2 st) {
    return length(st - 0.5) * 2.0;
}

// Source: https://gist.github.com/aferriss/9be46b6350a08148da02559278daa244
vec3 gammaCorrect(vec3 color, float gamma){
    return pow(color, vec3(1.0/gamma));
}

vec3 levelRange(vec3 color, float minInput, float maxInput){
    return min(max(color - vec3(minInput), vec3(0.0)) / (vec3(maxInput) - vec3(minInput)), vec3(1.0));
}

vec3 finalLevels(vec3 color, float minInput, float gamma, float maxInput){
    return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
}

/*
** Contrast, saturation, brightness
** Code of this function is from TGM's shader pack
** http://irrlicht.sourceforge.net/phpBB2/viewtopic.php?t=21057
*/

// For all settings: 1.0 = 100% 0.5=50% 1.5 = 150%
vec3 ContrastSaturationBrightness(vec3 color, float brt, float sat, float con)
{
	// Increase or decrease theese values to adjust r, g and b color channels seperately
	const float AvgLumR = 0.5;
	const float AvgLumG = 0.5;
	const float AvgLumB = 0.5;
	
	const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
	
	vec3 AvgLumin = vec3(AvgLumR, AvgLumG, AvgLumB);
	vec3 brtColor = color * brt;
	vec3 intensity = vec3(dot(brtColor, LumCoeff));
	vec3 satColor = mix(intensity, brtColor, sat);
	vec3 conColor = mix(AvgLumin, satColor, con);
	return conColor;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{   
	vec2 r_uv = v_uv_r;

    // Original texel
    vec4 initial_texel = texture2D(u_texture, r_uv);

    // Effect texel
    vec4 transformed_texel = texture2D(u_texture, r_uv);

    vec2 mouse_position = u_mouse_position;
    mouse_position.y *= u_screen_resolution.y / u_screen_resolution.x;

    vec2 uv = vec2(gl_FragCoord.xy / u_screen_resolution.xy);
    uv.y *= u_screen_resolution.y / u_screen_resolution.x;
    float circle = smoothstep(0.0, u_mouse_scale, length(uv - mouse_position));

    float brightness_mask = 1.0 - smoothstep(0.0, 1.0, circle);

    float progress = gl_FragCoord.x / u_screen_resolution.x;

    // Color effects values
    float level = cubicPulse(0.5, 0.7, progress) * u_level_factor;
    // float brightness = 1.0 + 1.0 - cubicPulse(0.5, 0.6, progress) * u_brightness_factor;
    float brightness = 1.0 + u_brightness_factor * brightness_mask;
    float saturation = cubicPulse(0.5, 0.6, progress) * u_saturation_factor;
    float contrast = 1.0;
    float alpha = cubicPulse(0.5, 0.6, progress) * u_alpha_factor;

    // Levels
    transformed_texel = vec4(finalLevels(transformed_texel.rgb, u_level_min, level, u_level_max), 1.0);

    // Contrast & Saturation & Brightness
    transformed_texel = vec4(ContrastSaturationBrightness(transformed_texel.rgb, brightness, saturation, contrast), 1.0);
    transformed_texel *= alpha;

    // Output
	fragColor = transformed_texel;

    // Debug
	// fragColor = vec4(brightness_mask, 0.0, 0.5, 1.0);
	// fragColor = vec4(gl_FragCoord.xy / u_screen_resolution.xy, 0.0, 1.0);
	// fragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0);
	// fragColor = vec4(v_uv_screen.x, v_uv_screen.y, 0.0, 1.0);
}

void main() {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}