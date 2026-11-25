import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { MODEL_URLS } from '../assets';
import { clamp01, easeOutCubic, lerp, scroll, smoothstep } from '../lib/scrollState';
import { GlbModel } from './GlbModel';

/** Creation-of-Adam hero: both hands glide in and their fingertips meet at 22% scroll. */
export function HeroHands() {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const p = scroll.progress;
    const t = easeOutCubic(clamp01(p / 0.22));
    const gone = smoothstep(0.25, 0.33, p);
    const time = clock.elapsedTime;
    const sway = (1 - t) * 0.35;
    const s = Math.max(1 - gone, 0.0001);

    const L = left.current;
    if (L) {
      L.visible = gone < 0.999;
      L.position.set(
        lerp(-6.8, -0.6, t),
        lerp(-4.4, -0.2, t) + Math.sin(time * 1.1) * 0.05,
        lerp(1.2, 0, t),
      );
      L.rotation.set(0, 0, sway * Math.sin(time * 0.8) - (1 - t) * 0.4);
      L.scale.setScalar(s);
    }

    const R = right.current;
    if (R) {
      R.visible = gone < 0.999;
      R.position.set(
        lerp(6.8, 0.6, t),
        lerp(4.4, 0.2, t) + Math.sin(time * 1.2 + 1) * 0.05,
        lerp(1.2, 0, t),
      );
      R.rotation.set(0, 0, sway * Math.sin(time * 0.9 + 2) + (1 - t) * 0.4);
      R.scale.setScalar(s);
    }
  });

  return (
    <>
      <group ref={left}>
        <GlbModel id="female_hand" url={MODEL_URLS.female_hand} size={3.4} />
      </group>
      <group ref={right}>
        <GlbModel id="robotic_hand" url={MODEL_URLS.robotic_hand} size={3.4} />
      </group>
    </>
  );
}
