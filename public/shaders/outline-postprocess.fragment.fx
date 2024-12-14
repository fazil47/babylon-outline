precision highp float;

// Required
varying vec2 vUV;
uniform sampler2D textureSampler;

// Custom
uniform sampler2D pickedMeshDepthSampler;

void makeKernel(inout float n[9], sampler2D tex, vec2 coord)
{
    float w = 0.001;
    float h = 0.001;

    n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
    n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
    n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
    n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
    n[4] = texture2D(tex, coord).r;
    n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
    n[6] = texture2D(tex, coord + vec2( -w, h)).r;
    n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
    n[8] = texture2D(tex, coord + vec2(  w, h)).r;
}

float getSobelValue(vec2 vUV) {
    float n[9];
    makeKernel(n, pickedMeshDepthSampler, vUV);
    float sobelEdgeH = n[2] + (2.0 * n[5]) + n[8] - (n[0] + (2.0 * n[3]) + n[6]);
    float sobelEdgeV = n[0] + (2.0 * n[1]) + n[2] - (n[6] + (2.0 * n[7]) + n[8]);

    return clamp(sqrt((sobelEdgeH * sobelEdgeH) + (sobelEdgeV * sobelEdgeV)), 0.0, 1.0);
}

void main(void) {
    vec4 baseColor = texture2D(textureSampler, vUV);

    float sobel = getSobelValue(vUV);
    vec4 outline = vec4(vec3(pow(sobel, 1.0)), 1.0);

    gl_FragColor = clamp(outline + baseColor, vec4(0.0), vec4(1.0));
}