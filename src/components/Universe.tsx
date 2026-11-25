import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { IS_MOBILE, scroll, smootherstep } from '../lib/scrollState';
import { ParticleField } from './ParticleField';
import { GlowingPlanet, SolarSystem, type PlanetSpec } from './SolarSystem';

const GENESIS: PlanetSpec[] = [
  { orbit: 3.2, speed: 0.5, size: 0.38, color: '#ff9f4a', phase: 0.4 },
  { orbit: 5.0, speed: 0.33, size: 0.6, color: '#46d9ff', phase: 2.1, ring: { inner: 0.9, outer: 1.5, color: '#bdf3ff', tilt: 0.5 } },
  { orbit: 7.2, speed: 0.22, size: 0.85, color: '#c18bff', phase: 4.0, ring: { inner: 1.3, outer: 2.1, color: '#e6d0ff', tilt: -0.4 } },
  { orbit: 9.6, speed: 0.15, size: 0.5, color: '#ffd36b', phase: 5.2 },
];

/**
 * Everything that ignites after the burst. The whole group expands from the fingertip contact
 * point between 22% and 32% scroll (and contracts again if you scroll back).
 */
export function Universe({ children }: { children?: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const r = smootherstep((scroll.progress - 0.22) / 0.1);
    g.visible = r > 0.002;
    g.scale.setScalar(Math.max(r, 0.0001));
  });

  return (
    <group ref={group} visible={false}>
      <ParticleField kind="stars" count={IS_MOBILE ? 1100 : 2400} seed={7} />
      <ParticleField kind="nebula" count={IS_MOBILE ? 160 : 320} max={IS_MOBILE ? 90 : 130} seed={21} />

      <SolarSystem position={[8, 3, -24]} scale={IS_MOBILE ? 1 : 1.3} planets={GENESIS} />

      <GlowingPlanet position={[-12, 4, -66]} radius={2.2} color="#7c5cff" glow="#a78bff" ring="#d9ccff" />
      <GlowingPlanet position={[14, -4, -106]} radius={3} color="#18c5b8" glow="#5ff2e4" />
      <GlowingPlanet position={[-10, -5, -146]} radius={1.8} color="#ff6f61" glow="#ff9d8f" ring="#ffd0c8" />

      {children}
    </group>
  );
}
