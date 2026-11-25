import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scroll, smoothstep } from '../lib/scrollState';
import { rigState } from './CameraRig';

/**
 * A fixed pool of lights (never added/removed, so no shader recompiles) that follows the camera
 * target: golden rim light from lower-left, cyan rim light from upper-right. Colors shift per chapter.
 */
export function DynamicLights() {
  const gold = useRef<THREE.PointLight>(null);
  const cyan = useRef<THREE.PointLight>(null);

  const c = useMemo(
    () => ({
      goldBase: new THREE.Color('#ffb25a'),
      cyanBase: new THREE.Color('#38e1ff'),
      goldHolo: new THREE.Color('#2ad4ff'),
      goldTitan: new THREE.Color('#ff6a2a'),
      cyanTitan: new THREE.Color('#5b6bff'),
    }),
    [],
  );

  useFrame(() => {
    const g = gold.current;
    const cy = cyan.current;
    if (!g || !cy) return;
    const L = rigState.look;
    g.position.set(L.x - 4, L.y - 2, L.z - 1.5);
    cy.position.set(L.x + 4, L.y + 3, L.z - 1.5);

    const p = scroll.progress;
    const holo = smoothstep(0.52, 0.56, p) * (1 - smoothstep(0.66, 0.7, p));
    const titan = smoothstep(0.7, 0.74, p) * (1 - smoothstep(0.84, 0.88, p));
    g.color.copy(c.goldBase).lerp(c.goldHolo, holo * 0.8).lerp(c.goldTitan, titan);
    cy.color.copy(c.cyanBase).lerp(c.cyanTitan, titan);
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#bcd7ff', '#1a1020', 0.5]} />
      <directionalLight position={[3, 5, 6]} intensity={0.6} color="#dfe9ff" />
      <pointLight ref={gold} intensity={60} color="#ffb25a" distance={0} decay={2} />
      <pointLight ref={cyan} intensity={60} color="#38e1ff" distance={0} decay={2} />
    </>
  );
}
