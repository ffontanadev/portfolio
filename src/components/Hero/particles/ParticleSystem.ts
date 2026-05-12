import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import { sampleShape, type ShapeSpec, type SampleBounds } from './shapeSampler';

export interface ParticleSystemOptions {
  canvas: HTMLCanvasElement;
  particleCount: number;
  shapes: ShapeSpec[];
  driftColor: THREE.Color;
  shapeColor: THREE.Color;
  accentColors: THREE.Color[];
  driftAlpha?: number;
  shapeAlpha?: number;
  timings?: Partial<StateTimings>;
}

interface StateTimings {
  drift: number;     // seconds the field sits in ambient drift
  morphIn: number;   // seconds for drift → shape
  hold: number;      // seconds holding the shape
  morphOut: number;  // seconds for shape → drift
}

type State = 'drift' | 'morphIn' | 'hold' | 'morphOut';

const DEFAULT_TIMINGS: StateTimings = {
  drift: .5,
  morphIn: 1,
  hold: 3.5,
  morphOut: 0.7,
};

// Cubic in/out — matches the easing used elsewhere in the redesign.
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class ParticleSystem {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  private rafId: number | null = null;
  private startTime = 0;
  private lastTickAt = 0;
  private bounds: SampleBounds = { width: 0, height: 0 };

  private particleCount: number;
  private shapes: ShapeSpec[];
  private accentColors: THREE.Color[];
  private timings: StateTimings;

  private shapeIdx = 0;
  private state: State = 'drift';
  private stateStart = 0;

  private cursorTarget = { x: -9999, y: -9999 };
  private cursorForceTarget = 0;

  private initialized = false;

  constructor(opts: ParticleSystemOptions) {
    this.particleCount = opts.particleCount;
    this.shapes = opts.shapes;
    this.accentColors = opts.accentColors;
    this.timings = { ...DEFAULT_TIMINGS, ...opts.timings };

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uTargetBlend: { value: 0 },
        uTargetOffset: { value: new THREE.Vector2(0, 0) },
        uMorphSmear: { value: 0 },
        uCursor: { value: new THREE.Vector2(-9999, -9999) },
        uCursorForce: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uDriftColor: { value: opts.driftColor.clone() },
        uShapeColor: { value: opts.shapeColor.clone() },
        uDriftAlpha: { value: opts.driftAlpha ?? 0.18 },
        uShapeAlpha: { value: opts.shapeAlpha ?? 0.72 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    // Custom shader does its own clip-space math — three's frustum culling would
    // use the (zero-only) `position` attribute bounding box and cull everything.
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  resize(width: number, height: number, dpr: number) {
    this.bounds = { width, height };
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.material.uniforms.uResolution.value.set(width, height);
    this.material.uniforms.uDpr.value = dpr;

    if (!this.initialized) {
      this.initAttributes();
      this.initialized = true;
    } else {
      this.resampleHomes();
    }
    // Always refresh the active shape's target for the new bounds.
    this.applyShapeTarget(this.shapes[this.shapeIdx]);
  }

  private initAttributes() {
    const N = this.particleCount;
    // Dummy `position` attribute exists purely so three.js can derive a vertex
    // count (it iterates `attributes.position.count` to pick the drawArrays N).
    // The shader doesn't read it — clip-space math is computed from `aHome`.
    const position = new Float32Array(N * 3);
    const homes = new Float32Array(N * 2);
    const targets = new Float32Array(N * 2);
    const targetsNext = new Float32Array(N * 2);
    const seeds = new Float32Array(N);
    const sizes = new Float32Array(N);
    const colors = new Float32Array(N * 3);

    const accentCount = this.accentColors.length;

    for (let i = 0; i < N; i++) {
      homes[i * 2] = Math.random() * this.bounds.width;
      homes[i * 2 + 1] = Math.random() * this.bounds.height;
      targets[i * 2] = homes[i * 2];
      targets[i * 2 + 1] = homes[i * 2 + 1];
      targetsNext[i * 2] = homes[i * 2];
      targetsNext[i * 2 + 1] = homes[i * 2 + 1];

      seeds[i] = Math.random();
      sizes[i] = 0.55 + Math.random() * 1.45;

      // ~15% of particles pick up an accent palette tint.
      let c: THREE.Color;
      if (accentCount > 0 && Math.random() < 0.15) {
        c = this.accentColors[(Math.random() * accentCount) | 0];
      } else {
        c = this.material.uniforms.uShapeColor.value as THREE.Color;
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute('aHome', new THREE.BufferAttribute(homes, 2));
    this.geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 2));
    this.geometry.setAttribute('aTargetNext', new THREE.BufferAttribute(targetsNext, 2));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  }

  private resampleHomes() {
    const attr = this.geometry.getAttribute('aHome') as THREE.BufferAttribute;
    const homes = attr.array as Float32Array;
    for (let i = 0; i < this.particleCount; i++) {
      homes[i * 2] = Math.random() * this.bounds.width;
      homes[i * 2 + 1] = Math.random() * this.bounds.height;
    }
    attr.needsUpdate = true;
  }

  private applyShapeTarget(shape: ShapeSpec) {
    const attr = this.geometry.getAttribute('aTarget') as THREE.BufferAttribute;
    const next = sampleShape(shape, this.particleCount, this.bounds);
    (attr.array as Float32Array).set(next);
    attr.needsUpdate = true;
  }

  setCursor(x: number, y: number, inside: boolean) {
    this.cursorTarget.x = x;
    this.cursorTarget.y = y;
    this.cursorForceTarget = inside ? 1 : 0;
  }

  private stepStateMachine(now: number): number {
    const elapsed = (now - this.stateStart) / 1000;
    let m = 0;

    switch (this.state) {
      case 'drift':
        m = 0;
        if (elapsed >= this.timings.drift) {
          this.shapeIdx = (this.shapeIdx + 1) % this.shapes.length;
          this.applyShapeTarget(this.shapes[this.shapeIdx]);
          this.state = 'morphIn';
          this.stateStart = now;
        }
        break;
      case 'morphIn': {
        const t = Math.min(elapsed / this.timings.morphIn, 1);
        m = easeInOutCubic(t);
        if (t >= 1) {
          this.state = 'hold';
          this.stateStart = now;
        }
        break;
      }
      case 'hold':
        m = 1;
        if (elapsed >= this.timings.hold) {
          this.state = 'morphOut';
          this.stateStart = now;
        }
        break;
      case 'morphOut': {
        const t = Math.min(elapsed / this.timings.morphOut, 1);
        m = 1 - easeInOutCubic(t);
        if (t >= 1) {
          this.state = 'drift';
          this.stateStart = now;
        }
        break;
      }
    }
    return m;
  }

  private tick = () => {
    const now = performance.now();
    const time = (now - this.startTime) / 1000;
    this.lastTickAt = now;

    const morph = this.stepStateMachine(now);

    // Smooth cursor force (low-pass) so it doesn't snap on enter/leave.
    const u = this.material.uniforms;
    const curForce = u.uCursorForce.value as number;
    u.uCursorForce.value = curForce + (this.cursorForceTarget - curForce) * 0.09;

    (u.uCursor.value as THREE.Vector2).set(this.cursorTarget.x, this.cursorTarget.y);
    u.uTime.value = time;
    u.uMorph.value = morph;

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  };

  start() {
    if (this.rafId !== null) return;
    this.startTime = performance.now();
    this.stateStart = this.startTime;
    this.tick();
  }

  pause() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (this.rafId === null && this.initialized) {
      // Shift the state-clock so we don't time-warp through frames missed while
      // paused (e.g., after tab switch).
      const now = performance.now();
      this.stateStart += now - this.lastTickAt;
      this.tick();
    }
  }

  dispose() {
    this.pause();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
