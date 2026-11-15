/**
 * The WebGL half of the home page hero: one cloud of particles that gathers
 * into the "i2" mark. The cloud parts around the pointer; a click bursts it
 * apart and it gathers again.
 *
 * This module is the only place three.js is imported, and it is only ever
 * reached through `import()` from hero-scene.tsx — so the library is a lazy
 * chunk and never part of the page's initial JavaScript. See docs/adr/0005
 * and docs/adr/0006.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { I2_MARK } from "@/lib/i2-mark";

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uScale;
uniform float uAspect;
uniform float uPull;
uniform vec2 uPointer;
// xyz is the position, w marks a highlighted particle (0 or 1).
attribute vec4 aFrom;
attribute vec4 aTo;
attribute float aSeed;
varying float vAccent;

void main() {
  // Each particle leaves on its own schedule, so the mark dissolves and
  // reassembles as a wave instead of sliding across as one rigid piece.
  float t = clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aFrom.xyz, aTo.xyz, t);
  vAccent = mix(aFrom.w, aTo.w, t);

  // Mid-flight the particle swings wide of the straight line.
  vec3 swirl = vec3(
    sin(aSeed * 91.7 + uTime),
    cos(aSeed * 57.3 + uTime * 1.3),
    sin(aSeed * 33.1 - uTime * 0.7)
  );
  p += swirl * sin(t * 3.14159) * 0.55;
  // At rest it still drifts a hair, so the finished mark is never frozen.
  p += 0.012 * vec3(
    sin(uTime * 1.3 + aSeed * 40.0),
    cos(uTime * 1.1 + aSeed * 60.0),
    sin(uTime * 0.9 + aSeed * 80.0)
  );

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Push away from the pointer, measured on screen.
  vec4 clip = projectionMatrix * mv;
  vec2 away = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
  float near = smoothstep(0.38, 0.0, length(away));
  mv.xy += normalize(away + 1e-5) * near * uPull * 0.3;

  float pulse = 1.0 + vAccent * (0.4 + 0.3 * sin(uTime * 3.0 + aSeed * 20.0));
  gl_PointSize = (1.3 + 1.7 * fract(aSeed * 7.3)) * pulse * uScale / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uTheme; // 0 = light page, 1 = dark page
varying float vAccent;

void main() {
  float disc = smoothstep(0.5, 0.2, length(gl_PointCoord - 0.5));

  // The page's own ink, with the site's one accent on the dot of the "i"
  // (--foreground and --brand in globals.css, per theme).
  vec3 ink = mix(vec3(0.09, 0.09, 0.1), vec3(0.95, 0.96, 0.98), uTheme);
  vec3 brand = mix(vec3(0.15, 0.39, 0.92), vec3(0.45, 0.68, 1.0), uTheme);

  gl_FragColor = vec4(mix(ink, brand, vAccent), disc * mix(0.9, 0.6, uTheme));
}
`;

const rand = Math.random;
const TAU = Math.PI * 2;
const RADIUS = 1.25;
/** Share of the cloud that never joins the mark and stays as drifting dust. */
const DUST_SHARE = 0.08;

/**
 * A shape fills `out` (x, y, z, accent per particle) for the first `count`.
 * `out` arrives holding the positions the cloud is leaving, so a shape may
 * build on them.
 */
type Shape = (out: Float32Array, count: number) => void;

const put = (
  out: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  accent = 0,
) => {
  out[i * 4] = x;
  out[i * 4 + 1] = y;
  out[i * 4 + 2] = z;
  out[i * 4 + 3] = accent;
};

/** Scattered through a ball: where the cloud starts, and the fallback. */
const scatter: Shape = (out, count) => {
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * TAU;
    const r = RADIUS * 1.6 * Math.cbrt(rand());
    const s = Math.sqrt(1 - u * u);
    put(out, i, r * s * Math.cos(phi), r * u, r * s * Math.sin(phi));
  }
};

/** Every particle thrown outward from where it is now: the click. */
const burst: Shape = (out, count) => {
  for (let i = 0; i < count; i++) {
    const k = 1.8 + rand() * 1.2;
    put(
      out,
      i,
      out[i * 4] * k + (rand() - 0.5) * 0.6,
      out[i * 4 + 1] * k + (rand() - 0.5) * 0.6,
      out[i * 4 + 2] + (rand() - 0.5) * 2.5,
      out[i * 4 + 3],
    );
  }
};

/**
 * Turns a 2D drawing into a shape: draw it on a small offscreen canvas, then
 * drop particles on the painted pixels and give the result some thickness.
 * Pixels painted with red in them become highlighted particles.
 */
const drawn =
  (draw: (ctx: CanvasRenderingContext2D, size: number) => void): Shape =>
  (out, count) => {
    const size = 240;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return scatter(out, count);

    draw(ctx, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const painted: number[] = [];
    for (let p = 0; p < size * size; p++) {
      if (data[p * 4 + 3] > 128) painted.push(p);
    }
    if (!painted.length) return scatter(out, count);

    for (let i = 0; i < count; i++) {
      const p = painted[Math.floor(rand() * painted.length)];
      const x = (((p % size) + rand()) / size) * 2 - 1;
      const y = 1 - ((Math.floor(p / size) + rand()) / size) * 2;
      put(
        out,
        i,
        x * RADIUS * 1.1,
        y * RADIUS * 1.1,
        (rand() - 0.5) * 0.22,
        data[p * 4] > 128 ? 1 : 0,
      );
    }
  };

/** The mark, with the dot of the "i" in the accent. */
const mark = drawn((ctx, size) => {
  const { x, y, size: span, dot, stem, two, twoWidth } = I2_MARK;
  const s = size / span;
  ctx.setTransform(s, 0, 0, s, -x * s, -y * s);

  ctx.fillStyle = ctx.strokeStyle = "#00f";
  ctx.fill(new Path2D(stem));
  ctx.lineWidth = twoWidth;
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(two));

  ctx.fillStyle = "#f00";
  ctx.beginPath();
  ctx.arc(dot.cx, dot.cy, dot.r, 0, TAU);
  ctx.fill();
});

/** Seconds for the cloud to gather into the mark. */
const GATHER_SECONDS = 1.6;
/** Seconds for a burst to fly apart, and how long it hangs there. */
const BURST_SECONDS = 0.9;
const BURST_HOLD_SECONDS = 0.25;
/** Camera distance that frames the mark in a square canvas. */
const CAMERA_DISTANCE = 5.8;

const isDark = () => document.documentElement.classList.contains("dark");

export type HeroSceneHandle = {
  /** Bursts the mark apart; it gathers again by itself. */
  burst(): void;
  /** Stops the scene and frees its GPU resources. */
  dispose(): void;
};

/**
 * Starts the scene on `canvas`. Throws if a WebGL context cannot be created;
 * the caller keeps its static fallback in that case.
 */
export function mountHeroScene(canvas: HTMLCanvasElement): HeroSceneHandle {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 20);
  let cameraRest = CAMERA_DISTANCE;

  // Phones get half the particles; the mark reads the same at their size.
  const count = finePointer ? 11000 : 5500;
  const shaped = Math.floor(count * (1 - DUST_SHARE));

  const from = new Float32Array(count * 4);
  const to = new Float32Array(count * 4);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = rand();

  scatter(from, shaped);
  // The dust: a wide, shallow shell that never travels.
  for (let i = shaped; i < count; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * TAU;
    const r = 1.9 + rand() * 1.5;
    const s = Math.sqrt(1 - u * u);
    put(
      from,
      i,
      r * s * Math.cos(phi) * 1.7,
      r * u * 0.75,
      r * s * Math.sin(phi) * 0.8,
    );
  }
  to.set(from);

  const geometry = new BufferGeometry();
  const fromAttribute = new BufferAttribute(from, 4);
  const toAttribute = new BufferAttribute(to, 4);
  geometry.setAttribute("aFrom", fromAttribute);
  geometry.setAttribute("aTo", toAttribute);
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  // three.js wants a `position` to size the draw call; the shader ignores it.
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(count * 3), 3),
  );

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 1 },
    uScale: { value: 1 },
    uAspect: { value: 1 },
    uPull: { value: 0 },
    uTheme: { value: isDark() ? 1 : 0 },
    uPointer: { value: new Vector2(0, 0) },
  };
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const cloud = new Points(geometry, material);
  // The real positions live in the shader, so the bounding sphere three.js
  // would compute from `position` is meaningless.
  cloud.frustumCulled = false;
  scene.add(cloud);

  // Light adds up on a dark page and would wash out to nothing on a white
  // one, so the blend mode follows the theme.
  let dark: boolean | undefined;
  const syncBlending = () => {
    if (dark === isDark()) return;
    dark = isDark();
    material.blending = dark ? AdditiveBlending : NormalBlending;
  };
  syncBlending();

  // A flight in progress owns the origin buffer until it lands, so after a
  // burst the return to the mark waits in `queued` for that.
  let duration = GATHER_SECONDS;
  let queued = false;
  let landedFor = 0;

  const morph = (shape: Shape, seconds: number) => {
    // What was the destination becomes the origin.
    from.set(to);
    shape(to, shaped);
    fromAttribute.needsUpdate = true;
    toAttribute.needsUpdate = true;
    uniforms.uProgress.value = reducedMotion ? 1 : 0;
    duration = seconds;
    landedFor = 0;
  };

  const pointer = { x: 0, y: 0, tiltX: 0, tiltY: 0, present: false };

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
    pointer.present = true;
  };

  const draw = () => renderer.render(scene, camera);

  let frame = 0;
  let last = 0;
  let visible = true;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    // Clamped so a background tab does not come back with one huge step.
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const ease = 1 - Math.exp(-dt * 4);

    uniforms.uTime.value += dt;
    syncBlending();
    uniforms.uTheme.value += ((dark ? 1 : 0) - uniforms.uTheme.value) * ease;

    if (uniforms.uProgress.value < 1) {
      uniforms.uProgress.value = Math.min(
        1,
        uniforms.uProgress.value + dt / duration,
      );
    } else if (queued && (landedFor += dt) > BURST_HOLD_SECONDS) {
      queued = false;
      morph(mark, GATHER_SECONDS);
    }
    // The camera pulls back while the cloud is in pieces and closes in
    // again as the mark forms.
    camera.position.z =
      cameraRest + Math.sin(uniforms.uProgress.value * Math.PI) * 0.9;

    uniforms.uPull.value +=
      ((pointer.present ? 1 : 0) - uniforms.uPull.value) * ease;
    (uniforms.uPointer.value as Vector2).set(pointer.x, pointer.y);

    // A slow sway shows the depth of the mark without ever turning it
    // edge-on; the pointer leans it a little further.
    pointer.tiltX += (pointer.x - pointer.tiltX) * ease * 0.5;
    pointer.tiltY += (pointer.y - pointer.tiltY) * ease * 0.5;
    const time = uniforms.uTime.value;
    cloud.rotation.y = Math.sin(time * 0.35) * 0.38 + pointer.tiltX * 0.2;
    cloud.rotation.x = Math.sin(time * 0.27) * 0.08 - pointer.tiltY * 0.12;

    draw();
  };

  const setRunning = (running: boolean) => {
    if (reducedMotion) return;
    if (running && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const sync = () => setRunning(visible && !document.hidden);

  const resizeObserver = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // In a portrait canvas the width is what runs out, so stand further
    // back until the mark fits across it.
    cameraRest = Math.max(CAMERA_DISTANCE, 5.4 / camera.aspect);
    camera.position.z = cameraRest;
    uniforms.uAspect.value = camera.aspect;
    uniforms.uScale.value = height * pixelRatio * 0.011;
    // Resizing clears the drawing buffer; without this a stopped scene
    // (reduced motion, off-screen) would go blank.
    draw();
  });
  resizeObserver.observe(canvas);

  // Nothing is drawn while the hero is scrolled away or the tab is hidden.
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  intersectionObserver.observe(canvas);
  document.addEventListener("visibilitychange", sync);

  // With reduced motion there is no loop, so a theme switch has to ask for
  // its own frame.
  const themeObserver = new MutationObserver(() => {
    if (!reducedMotion) return;
    syncBlending();
    uniforms.uTheme.value = dark ? 1 : 0;
    draw();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  if (finePointer && !reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  morph(mark, GATHER_SECONDS);

  return {
    burst() {
      // Only from a finished mark: mid-flight there is nothing to burst,
      // and with reduced motion there is no flight to show.
      if (reducedMotion || queued || uniforms.uProgress.value < 1) return;
      morph(burst, BURST_SECONDS);
      queued = true;
    },
    dispose() {
      setRunning(false);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
