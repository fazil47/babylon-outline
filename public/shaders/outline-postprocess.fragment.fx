precision highp float;

// Required
varying vec2 vUV;
uniform sampler2D textureSampler;

// Custom
uniform sampler2D pickedMeshDepthSampler;

void main(void) {
    vec4 baseColor = texture2D(textureSampler, vUV);
    vec4 pickedMeshDepthColor = texture2D(pickedMeshDepthSampler, vUV);

    gl_FragColor = clamp(pickedMeshDepthColor, vec4(0.0), vec4(1.0));
}