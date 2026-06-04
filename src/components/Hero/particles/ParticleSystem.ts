import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import { sampleShape, type ShapeSpec, type SampleBounds } from './shapeSampler';
import { IntroSequencer, type IntroShapes, type IntroTimings } from './IntroSequencer';
import { FrameSequencer, type FrameAdapter } from './FrameSequencer';

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
  intro?: IntroShapes;
  introTimings?: Partial<IntroTimings>;
}

interface StateTimings {
  drift: number;     // seconds the field sits in ambient drift
  morphIn: number;   // seconds for drift → shape
  hold: number;      // seconds holding the shape
  morphOut: number;  // seconds for shape → drift
}

// 'drift', 'morphIn', 'morphOut' are used only on initial entry (and post-intro);
// the steady-state loop alternates 'hold'/'play' with 'shapeMorph' — no dissolve.
type State = 'drift' | 'morphIn' | 'hold' | 'play' | 'morphOut' | 'shapeMorph' | 'showcase';

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

  private intro: IntroSequencer | null = null;
  private introOpts: { shapes: IntroShapes; timings?: Partial<IntroTimings> } | null = null;

  private frame: FrameSequencer | null = null;
  // Retained during 'shapeMorph' when the previous shape was a frame animation,
  // so resize mid-morph can re-sample its final frame back into aTarget.
  private prevFrame: FrameSequencer | null = null;
  private frameAdapter: FrameAdapter | null = null;

  private cursorTarget = { x: -9999, y: -9999 };
  private cursorForceTarget = 0;

  private initialized = false;

  // --- Tech showcase (externally locked logo) ---
  private showcaseSpec: ShapeSpec | null = null;     // the locked logo spec, for resize re-sampling
  private showcaseColors: Float32Array | null = null; // sampled brand colors for the locked logo
  private savedColors: Float32Array | null = null;    // original aColor buffer, restored on release
  private showcaseT = 0;                               // 0..1 morph/brand-mix progress
  private readonly SHOWCASE_MORPH_S = 0.9;

  constructor(opts: ParticleSystemOptions) {
    this.particleCount = opts.particleCount;
    this.shapes = opts.shapes;
    this.accentColors = opts.accentColors;
    this.timings = { ...DEFAULT_TIMINGS, ...opts.timings };

    if (opts.intro) {
      this.introOpts = { shapes: opts.intro, timings: opts.introTimings };
    }

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
        uTargetScale: { value: 1 },
        uMorphSmear: { value: 0 },
        uCursor: { value: new THREE.Vector2(-9999, -9999) },
        uCursorForce: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uDriftColor: { value: opts.driftColor.clone() },
        uShapeColor: { value: opts.shapeColor.clone() },
        uDriftAlpha: { value: opts.driftAlpha ?? 0.18 },
        uShapeAlpha: { value: opts.shapeAlpha ?? 0.72 },
        uBrandColorMix: { value: 0 },
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
    // In-place mutation so any captured `bounds` references (e.g. IntroSequencer's adapter)
    // observe the update — replacing the object would leave them with stale dimensions.
    this.bounds.width = width;
    this.bounds.height = height;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.material.uniforms.uResolution.value.set(width, height);
    this.material.uniforms.uDpr.value = dpr;

    if (!this.initialized) {
      this.initAttributes();
      this.initialized = true;

      this.frameAdapter = {
        applyBufferTo: (slot, buf) => this.applyBufferTo(slot, buf),
        copyNextIntoPrimary: () => this.copyNextIntoPrimary(),
        bounds: this.bounds,
        uniforms: {
          uTargetBlend: this.material.uniforms.uTargetBlend as { value: number },
        },
      };

      // First resize → construct the intro sequencer if one was requested.
      if (this.introOpts) {
        this.intro = new IntroSequencer(
          {
            applyTargetTo: (slot, shape) => this.applyTargetTo(slot, shape),
            copyNextIntoPrimary: () => this.copyNextIntoPrimary(),
            uniforms: {
              uMorph: this.material.uniforms.uMorph as { value: number },
              uTargetBlend: this.material.uniforms.uTargetBlend as { value: number },
              uTargetOffset: this.material.uniforms.uTargetOffset as { value: THREE.Vector2 },
              uTargetScale: this.material.uniforms.uTargetScale as { value: number },
              uMorphSmear: this.material.uniforms.uMorphSmear as { value: number },
            },
            bounds: this.bounds,
          },
          this.introOpts.shapes,
          performance.now(),
          this.introOpts.timings,
        );
        this.introOpts = null;  // consumed; guard against re-entry / double-construction.
        // Sequencer's constructor already populated aTarget with the rocket;
        // skip the loop's first-frame target refresh so it isn't clobbered.
        return;
      }
    } else {
      this.resampleHomes();
      // Resampling targets must reflect intro state, not the loop shape.
      if (this.intro && !this.intro.done) {
        this.intro.applyResize();
        return;
      }
      // Locked showcase logo: re-sample it (and re-upload colors) at new bounds.
      if (this.state === 'showcase' && this.showcaseSpec) {
        this.applyTargetTo('aTarget', this.showcaseSpec);
        if (this.showcaseColors) {
          const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
          (colorAttr.array as Float32Array).set(this.showcaseColors);
          colorAttr.needsUpdate = true;
        }
        return;
      }
      // Mid-morph: aTarget holds the previous shape, aTargetNext holds the next.
      // Refresh both so the in-flight cross-fade stays consistent at the new bounds.
      if (this.state === 'shapeMorph') {
        if (this.prevFrame) {
          this.prevFrame.applyResize();
        } else {
          const prevIdx = (this.shapeIdx - 1 + this.shapes.length) % this.shapes.length;
          this.applyTargetTo('aTarget', this.shapes[prevIdx]);
        }
        if (this.frame) {
          this.frame.applyResize();
        } else {
          this.applyTargetTo('aTargetNext', this.shapes[this.shapeIdx]);
        }
        return;
      }
      // If a frame sequencer is active, it owns target resampling.
      if (this.frame) {
        this.frame.applyResize();
        return;
      }
    }
    // Loop path: refresh the active shape's target for the new bounds.
    this.applyTargetTo('aTarget', this.shapes[this.shapeIdx]);
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

  private applyTargetTo(slot: 'aTarget' | 'aTargetNext', shape: ShapeSpec) {
    const attr = this.geometry.getAttribute(slot) as THREE.BufferAttribute;
    const next = sampleShape(shape, this.particleCount, this.bounds);
    (attr.array as Float32Array).set(next);
    attr.needsUpdate = true;
  }

  private applyBufferTo(slot: 'aTarget' | 'aTargetNext', buf: Float32Array) {
    const attr = this.geometry.getAttribute(slot) as THREE.BufferAttribute;
    (attr.array as Float32Array).set(buf);
    attr.needsUpdate = true;
  }

  private copyNextIntoPrimary() {
    const primary = this.geometry.getAttribute('aTarget') as THREE.BufferAttribute;
    const next = this.geometry.getAttribute('aTargetNext') as THREE.BufferAttribute;
    (primary.array as Float32Array).set(next.array as Float32Array);
    primary.needsUpdate = true;
  }

  setCursor(x: number, y: number, inside: boolean) {
    this.cursorTarget.x = x;
    this.cursorTarget.y = y;
    this.cursorForceTarget = inside ? 1 : 0;
  }

  /**
   * Lock the field into a specific logo shape with per-particle brand colors,
   * pausing the autonomous loop. Safe to call repeatedly to switch logos.
   */
  showShape(spec: ShapeSpec, colors: Float32Array): void {
    if (!this.initialized) return; // ParticleField queues until first resize
    this.showcaseSpec = spec;
    this.showcaseColors = colors;

    // Save original palette colors once (first entry only).
    const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
    if (!this.savedColors) {
      this.savedColors = (colorAttr.array as Float32Array).slice();
    }

    // Sample the logo into aTarget and upload brand colors.
    this.applyTargetTo('aTarget', spec);
    (colorAttr.array as Float32Array).set(colors);
    colorAttr.needsUpdate = true;

    // Reset blend bookkeeping and enter the locked state from the current morph.
    this.material.uniforms.uTargetBlend.value = 0;
    this.frame = null;
    this.prevFrame = null;
    this.state = 'showcase';
    this.stateStart = performance.now();
    this.showcaseT = 0;
  }

  // --- Public accessors for ParticleField showcase wiring --------------------
  get particleCountPublic(): number { return this.particleCount; }
  get boundsPublic(): SampleBounds { return this.bounds; }

  /** Release the locked logo: morph out, restore palette colors, resume the loop. */
  releaseShape(): void {
    if (this.state !== 'showcase') return;
    if (this.savedColors) {
      const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
      (colorAttr.array as Float32Array).set(this.savedColors);
      colorAttr.needsUpdate = true;
      this.savedColors = null;
    }
    this.showcaseSpec = null;
    this.showcaseColors = null;
    // Hand back to the ambient loop starting from a morph-out of the held shape.
    this.state = 'morphOut';
    this.stateStart = performance.now();
  }

  private stepStateMachine(now: number): number {
    const elapsed = (now - this.stateStart) / 1000;
    let m = 0;

    switch (this.state) {
      case 'drift':
        m = 0;
        if (elapsed >= this.timings.drift) {
          this.shapeIdx = (this.shapeIdx + 1) % this.shapes.length;
          const nextShape = this.shapes[this.shapeIdx];
          if (nextShape.kind === 'frames') {
            this.frame = new FrameSequencer({
              adapter: this.frameAdapter!,
              shape: nextShape,
              particleCount: this.particleCount,
            });
          } else {
            this.applyTargetTo('aTarget', nextShape);
          }
          this.state = 'morphIn';
          this.stateStart = now;
        }
        break;
      case 'morphIn': {
        const t = Math.min(elapsed / this.timings.morphIn, 1);
        m = easeInOutCubic(t);
        if (t >= 1) {
          if (this.frame) {
            this.frame.start(now);
            this.state = 'play';
          } else {
            this.state = 'hold';
          }
          this.stateStart = now;
        }
        break;
      }
      case 'play': {
        this.frame!.tick(now);
        m = 1;
        if (this.frame!.done) {
          this.beginShapeMorph(now);
        }
        break;
      }
      case 'hold':
        m = 1;
        if (elapsed >= this.timings.hold) {
          this.beginShapeMorph(now);
        }
        break;
      case 'shapeMorph': {
        const t = Math.min(elapsed / this.timings.morphIn, 1);
        this.material.uniforms.uTargetBlend.value = easeInOutCubic(t);
        m = 1;
        if (t >= 1) {
          if (this.frame) {
            // Next shape is a frame animation: hand off cleanly into play.
            this.frame.armForPlay(now);
            this.state = 'play';
          } else {
            // Promote aTargetNext into aTarget and reset blend for steady hold.
            this.copyNextIntoPrimary();
            this.material.uniforms.uTargetBlend.value = 0;
            this.state = 'hold';
          }
          // Previous frame sequencer (if any) is no longer needed; release its buffers.
          this.prevFrame = null;
          this.stateStart = now;
        }
        break;
      }
      case 'morphOut': {
        const t = Math.min(elapsed / this.timings.morphOut, 1);
        m = 1 - easeInOutCubic(t);
        this.material.uniforms.uBrandColorMix.value =
          Math.min(this.material.uniforms.uBrandColorMix.value as number, 1 - easeInOutCubic(t));
        if (t >= 1) {
          this.state = 'drift';
          this.stateStart = now;
          this.frame = null;  // release pre-sampled frame buffers
          this.showcaseT = 0;
        }
        break;
      }
      case 'showcase': {
        const elapsedS = (now - this.stateStart) / 1000;
        this.showcaseT = Math.min(elapsedS / this.SHOWCASE_MORPH_S, 1);
        const e = easeInOutCubic(this.showcaseT);
        this.material.uniforms.uBrandColorMix.value = e;
        m = e; // morph drift → shape
        break;
      }
    }
    return m;
  }

  /**
   * Enter the direct shape-to-shape morph: previous shape stays in aTarget,
   * next shape is pre-loaded into aTargetNext, and uTargetBlend will animate 0→1.
   * uMorph stays at 1 throughout — no dissolve back to drift.
   */
  private beginShapeMorph(now: number): void {
    // Retain the prev frame sequencer (if any) so a resize mid-morph can
    // re-sample its final frame back into aTarget.
    this.prevFrame = this.frame;
    this.frame = null;

    this.shapeIdx = (this.shapeIdx + 1) % this.shapes.length;
    const nextShape = this.shapes[this.shapeIdx];

    if (nextShape.kind === 'frames') {
      this.frame = new FrameSequencer({
        adapter: this.frameAdapter!,
        shape: nextShape,
        particleCount: this.particleCount,
        entryMode: 'directMorph',
      });
    } else {
      this.applyTargetTo('aTargetNext', nextShape);
    }

    this.material.uniforms.uTargetBlend.value = 0;
    this.state = 'shapeMorph';
    this.stateStart = now;
  }

  private tick = () => {
    const now = performance.now();
    const time = (now - this.startTime) / 1000;
    this.lastTickAt = now;

    let morph: number;
    if (this.intro) {
      if (!this.intro.done) {
        this.intro.tick(now);
        morph = this.material.uniforms.uMorph.value as number;
      } else {
        // First frame after intro.
        this.intro = null;
        if (this.state === 'showcase') {
          // A tech was selected during the intro: keep the locked logo and let
          // it form now (reset the clock so the morph-in animates from 0),
          // instead of dissolving into the ambient loop.
          this.stateStart = now;
          morph = this.stepStateMachine(now);
        } else {
          // Prime the loop into morphOut so the held text dissolves into drift,
          // then advance through shapes[0] first.
          this.state = 'morphOut';
          this.stateStart = now;
          this.shapeIdx = this.shapes.length - 1;
          morph = this.stepStateMachine(now);
        }
      }
    } else {
      morph = this.stepStateMachine(now);
    }

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
      const now = performance.now();
      const delta = now - this.lastTickAt;
      this.stateStart += delta;
      if (this.intro && !this.intro.done) {
        this.intro.shiftClock(delta);
      }
      if (this.frame && this.state === 'play') {
        this.frame.shiftClock(delta);
      }
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
