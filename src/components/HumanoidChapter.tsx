import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MODEL_URLS } from '../assets';
import { CHAPTERS } from '../lib/chapters';
import { GlbModel } from './GlbModel';

const CYAN = new THREE.Color('#25e6ff').multiplyScalar(2.2);

function HoloBase() {
  const rings = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    const g = rings.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      c.rotation.z += d * (0.4 + i * 0.25) * (i % 2 ? -1 : 1);
    });
  });
  return (
    <group position={[0, -2.3, 0]}>
      <group ref={rings} rotation={[Math.PI / 2, 0, 0]}>
        {[2.2, 2.7, 3.2].map((r, i) => (
          <mesh key={r} position={[0, 0, i * 0.08]}>
            <torusGeometry args={[r, 0.018, 8, 96]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.85 - i * 0.2} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[2.1, 2.3, 4.8, 48, 1, true]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Chapter 3 — Theory II: Co-Evolution & Shared Agency, in a holographic cyan projection. */
export function HumanoidChapter() {
  const ch = CHAPTERS[1]!;
  const float = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = float.current;
    if (!g) return;
    g.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.12;
    g.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.25;
  });
  return (
    <group position={ch.pos}>
      <group ref={float}>
        <GlbModel id="humanoid_robot_ai" url={MODEL_URLS.humanoid_robot_ai} size={4.4} />
      </group>
      <HoloBase />
    </group>
  );
}
