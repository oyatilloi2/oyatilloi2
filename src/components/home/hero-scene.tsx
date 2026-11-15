"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { I2Shapes } from "@/components/icons/i2-logo";
import { I2_MARK, I2_VIEWBOX } from "@/lib/i2-mark";
import type { HeroSceneHandle } from "./hero-scene.webgl";

const box = {
  x: I2_MARK.x,
  y: I2_MARK.y,
  width: I2_MARK.size,
  height: I2_MARK.size,
};

/**
 * The home page hero's particle "i2". This file is the cheap shell: a still
 * of the mark drawn as dots, a canvas, and an effect that fetches the WebGL
 * module once the browser is idle. Readers without WebGL, and everyone until
 * the chunk arrives, see the still — the page never waits on the scene.
 *
 * Decorative and hidden from assistive tech; a click bursts the cloud.
 */
export function HeroScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroSceneHandle>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const start = async () => {
      try {
        const { mountHeroScene } = await import("./hero-scene.webgl");
        if (cancelled) return;
        sceneRef.current = mountHeroScene(canvas);
        setReady(true);
      } catch {
        // No WebGL, or the chunk failed to load: the still stays.
      }
    };

    // Safari has no requestIdleCallback.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-ready={ready}
      className={cn("hero-scene relative aspect-square", className)}
    >
      <svg viewBox={I2_VIEWBOX} className="hero-still absolute inset-[6%]">
        <defs>
          <pattern
            id="hero-dots"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="2.2" fill="white" />
          </pattern>
          <mask id="hero-mark">
            <I2Shapes fill="url(#hero-dots)" />
          </mask>
          <mask id="hero-dot">
            <circle
              cx={I2_MARK.dot.cx}
              cy={I2_MARK.dot.cy}
              r={I2_MARK.dot.r}
              fill="url(#hero-dots)"
            />
          </mask>
        </defs>
        {/* Ink for the mark, the accent on the dot of the "i" — the same
            colours the particles take. */}
        <rect {...box} className="fill-foreground" mask="url(#hero-mark)" />
        <rect {...box} className="fill-brand" mask="url(#hero-dot)" />
      </svg>
      {/* Larger than the box, so a burst flies past its edges and fades out
          there instead of being cut off. */}
      <canvas
        ref={canvasRef}
        className="absolute -top-[15%] -left-[15%] size-[130%]"
      />
      <div
        onClick={() => sceneRef.current?.burst()}
        className="absolute inset-[10%] cursor-pointer rounded-full"
      />
    </div>
  );
}
