// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec2 vScreenPosition;
varying vec3 vDisplacedNormal;

// Uniforms
uniform vec2 resolution;
uniform vec2 size;
uniform sampler2D displacementMap;

// http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
    vUv = uv;
    vNormal = normal;

    vec4 displacementTexel = texture2D(displacementMap, uv);
    float displacement = displacementTexel.r * 0.1;

    vec3 displacedPosition = position + vNormal * displacement;

    // float texel = 1.0 / resolution.x;
    // float texelSize = size.x / resolution.x;

    // vec3 center = texture2D(displacementMap, vUv).rgb;
    // vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(displacementMap, vUv + vec2(texel, 0.0)).rgb - center;
    // vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(displacementMap, vUv + vec2(-texel, 0.0)).rgb - center;
    // vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(displacementMap, vUv + vec2(0.0, -texel)).rgb - center;
    // vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(displacementMap, vUv + vec2(0.0, texel)).rgb - center;

    // vec3 topRight = cross(right, top);
    // vec3 topLeft = cross(top, left);
    // vec3 bottomLeft = cross(left, bottom);
    // vec3 bottomRight = cross(bottom, right);

    // vDisplacedNormal = normalize(topRight + topLeft + bottomLeft + bottomRight);

    float offset = size.x / resolution.x;
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    vec3 displacedNeighbour1 = neighbour1 + normal * displacement;
    vec3 displacedNeighbour2 = neighbour2 + normal * displacement;

    // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

    // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
    vDisplacedNormal = normalize(cross(displacedTangent, displacedBitangent));

    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);;
    pos.xyz /= pos.w;
    vScreenPosition = vec2((pos.x + 1.0) * 0.5, (pos.y + 1.0) * 0.5);

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}