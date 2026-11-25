/** Smoothed 0..1 scroll progress, written by GSAP ScrollTrigger, read every frame by the 3D scene + HUD. */
export const scroll = { progress: 0 };

/** Cross-component FX channel (burst writes, post-processing + camera read). */
export const fx = { flash: 0, shake: 0 };

export const IS_MOBILE: boolean =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const smootherstep = (x: number): number => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);

export function scrollToProgress(p: number): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: clamp01(p) * max, behavior: 'smooth' });
}
