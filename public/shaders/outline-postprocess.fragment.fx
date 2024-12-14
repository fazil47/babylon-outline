precision highp float;

// Required
varying vec2 vUV;
uniform sampler2D textureSampler;

// Custom
uniform sampler2D pickedMeshDepthSampler;
uniform vec2 screenSize;
uniform float blurRadius;
uniform float outlineThreshold;
uniform vec3 outlineColor;

// Store the 9 texel values centered at `coord` in `n`
void fillNeighMatrix(inout float n[9], sampler2D tex, vec2 coord, vec2 texelSize)
{
    n[0] = texture2D(tex, coord + vec2(-texelSize.x, -texelSize.y)).r;
    n[1] = texture2D(tex, coord + vec2(0.0, -texelSize.y)).r;
    n[2] = texture2D(tex, coord + vec2(texelSize.x, -texelSize.y)).r;
    n[3] = texture2D(tex, coord + vec2(-texelSize.x, 0.0)).r;
    n[4] = texture2D(tex, coord).r;
    n[5] = texture2D(tex, coord + vec2(texelSize.x, 0.0)).r;
    n[6] = texture2D(tex, coord + vec2(-texelSize.x, texelSize.y)).r;
    n[7] = texture2D(tex, coord + vec2(0.0, texelSize.y)).r;
    n[8] = texture2D(tex, coord + vec2(texelSize.x, texelSize.y)).r;
}

// Get outlines after applying Sobel filter
float getSobelValue(vec2 vUV, vec2 texelSize) {
    // Store neighbouring texel values in a flat array
    // [0, 1, 2]
    // [3, 4, 5]
    // [6, 7, 8]
    float n[9];
    fillNeighMatrix(n, pickedMeshDepthSampler, vUV, texelSize);

    // right edge - left edge
    float sobelEdgeH = n[2] + (2.0 * n[5]) + n[8] - (n[0] + (2.0 * n[3]) + n[6]);

    // top edge - bottom edge
    float sobelEdgeV = n[0] + (2.0 * n[1]) + n[2] - (n[6] + (2.0 * n[7]) + n[8]);

    return clamp(sqrt((sobelEdgeH * sobelEdgeH) + (sobelEdgeV * sobelEdgeV)), 0.0, 1.0);
}

// Get blurred outlines after applying Gaussian blur to Sobel outlines
float getGaussianSobelValue(vec2 uv, vec2 texelSize, float blurRadius) {
    float totalWeight = 0.0;
    float gaussianSobel = 0.0;
    
    for (float x = -blurRadius; x <= blurRadius; x++) {
        for (float y = -blurRadius; y <= blurRadius; y++) {
            vec2 offset = vec2(x, y) * texelSize;
            
            float weight = exp(-(x * x + y * y) / (2.0 * blurRadius * blurRadius));
            float sobelValue = getSobelValue(uv + offset, texelSize);
            
            gaussianSobel += sobelValue * weight;
            totalWeight += weight;
        }
    }
    
    return gaussianSobel / totalWeight;
}

void main(void) {
    // Get texture element size - this is required because vUV is the normalized coordinates
    vec2 texelSize = 1.0 / screenSize;

    float sobel = getGaussianSobelValue(vUV, texelSize, blurRadius);

    // Adjust thickness using step function
    float edgeDetection = step(outlineThreshold, sobel);

    vec4 baseColor = texture2D(textureSampler, vUV);

    // Lerp between outline and base color
    gl_FragColor = mix(baseColor, vec4(outlineColor, 1.0), edgeDetection);
}