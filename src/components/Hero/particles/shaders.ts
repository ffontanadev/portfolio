// GLSL shaders for the Hero particle field.
// All movement happens on the GPU: per-frame curl-noise drift around a per-particle
// "home" anchor, lerped toward a shape target via uMorph (0..1), with a soft cursor
// repulsion force.

export const vertexShader = /* glsl */ `
  precision highp float;

  attribute vec2  aHome;
  attribute vec2  aTarget;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3  aColor;
  attribute vec2  aTargetNext;

  uniform float uTime;
  uniform float uMorph;        // 0 = drift, 1 = shape
  uniform float uTargetBlend;   // 0 = aTarget, 1 = aTargetNext
  uniform vec2  uTargetOffset;  // CSS px shift applied to the active target
  uniform float uMorphSmear;    // 0..1 per-particle morph stagger
  uniform vec2  uCursor;       // canvas px, top-left origin
  uniform float uCursorForce;  // 0..1, smoothed
  uniform vec2  uResolution;   // canvas size in CSS px
  uniform float uDpr;
  uniform vec3  uDriftColor;
  uniform vec3  uShapeColor;
  uniform float uDriftAlpha;
  uniform float uShapeAlpha;

  varying float vAlpha;
  varying vec3  vColor;

  // --- Simplex 2D noise (Ashima / McEwan) -------------------------------------
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),
                            dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Curl of a 2D noise field — divergence-free flow, ideal for natural drift.
  vec2 curlNoise(vec2 p, float t) {
    float eps = 0.06;
    float n_yp = snoise(p + vec2(0.0,  eps) + vec2(t * 0.5));
    float n_yn = snoise(p + vec2(0.0, -eps) + vec2(t * 0.5));
    float n_xp = snoise(p + vec2( eps, 0.0) + vec2(t * 0.5));
    float n_xn = snoise(p + vec2(-eps, 0.0) + vec2(t * 0.5));
    float dy = (n_yp - n_yn) / (2.0 * eps);
    float dx = (n_xp - n_xn) / (2.0 * eps);
    return vec2(dy, -dx);
  }

  void main() {
    // Drift around home anchor via curl noise.
    vec2 noiseInput = aHome * 0.0028 + vec2(aSeed * 53.0, aSeed * 37.0);
    vec2 flow = curlNoise(noiseInput, uTime * 0.06);
    float driftAmp = 38.0 + aSeed * 22.0;
    vec2 driftPos = aHome + flow * driftAmp;

    // Blend between primary and next target, then translate.
    vec2 target = mix(aTarget, aTargetNext, uTargetBlend) + uTargetOffset;
    // Per-particle morph stagger — particles with high aSeed lag, producing
    // a natural trail/exhaust effect during the intro.
    float pMorph = clamp(uMorph - (1.0 - aSeed) * uMorphSmear, 0.0, 1.0);
    vec2 pos = mix(driftPos, target, pMorph);

    // Cursor repulsion — soft falloff, kicks in only when force > 0.
    vec2 toCursor = pos - uCursor;
    float dist = length(toCursor) + 0.0001;
    float kick = smoothstep(180.0, 0.0, dist) * uCursorForce;
    pos += (toCursor / dist) * kick * 42.0;

    // Convert canvas px -> clip space. Canvas origin is top-left; flip Y for clip.
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    clip.y = -clip.y;

    gl_Position = vec4(clip, 0.0, 1.0);

    // Point size: bigger during shape state. uDpr keeps consistent across screens.
    float baseSize = mix(1.15, 2.4, pMorph);
    gl_PointSize = baseSize * aSize * uDpr;

    // Color: drift -> shape blend, with small per-particle palette tint.
    vec3 base = mix(uDriftColor, uShapeColor, pMorph);
    vColor = mix(base, aColor, 0.22);

    // Alpha: low in drift, higher in shape. Per-particle seed gives a subtle haze.
    float alpha = mix(uDriftAlpha, uShapeAlpha, pMorph);
    vAlpha = alpha * (0.7 + aSeed * 0.3);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    // Soft circular sprite.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float falloff = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, falloff * vAlpha);
  }
`;
