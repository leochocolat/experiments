varying vec2 v_uv;
varying vec2 v_uv_r;
varying float v_color_effect_intensity;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;

uniform float u_alpha;

uniform float u_level;
uniform float u_level_min;
uniform float u_level_max;

uniform float u_brightness;
uniform float u_saturation;
uniform float u_contrast;

uniform float u_uv_offset_x;

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

    // Mask
    float uv_x = v_uv.x * 0.5;
    float uv_mask = (uv_x - 1.0) + (u_uv_offset_x * 2.0);
    uv_mask = smoothstep(0.0, 1.0, uv_mask);

    // Original texel
    vec4 initial_texel = texture2D(u_texture, r_uv);

    // Effect texel
    vec4 transformed_texel = texture2D(u_texture, r_uv);

    // Levels
    // transformed_texel = vec4(finalLevels(transformed_texel.rgb, u_level_min, u_level, u_level_max), 1.0);
    transformed_texel = vec4(finalLevels(transformed_texel.rgb, u_level_min, v_color_effect_intensity, u_level_max), 1.0);

    // Contrast & Saturation & Brightness
    transformed_texel = vec4(ContrastSaturationBrightness(transformed_texel.rgb, 1.0 + 0.2 * v_color_effect_intensity, v_color_effect_intensity, u_contrast), 1.0);
    transformed_texel *= v_color_effect_intensity;

    // Mask
    // initial_texel *= 1.0 - uv_mask;
    // transformed_texel *= uv_mask;
	// fragColor = initial_texel + transformed_texel;

    // Output
	fragColor = transformed_texel;
	// fragColor = vec4(r_uv.x);
}

void main() {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}