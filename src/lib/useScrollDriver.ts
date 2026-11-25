import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scroll } from './scrollState';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/** Drives `scroll.progress` (0..1, smoothed with scrub) from the tall spacer element. */
export function useScrollDriver(spacer: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const el = spacer.current;
    if (!el) return undefined;
    scroll.progress = 0;
    const tween = gsap.fromTo(
      scroll,
      { progress: 0 },
      {
        progress: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 1 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [spacer]);
}
