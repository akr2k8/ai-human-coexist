import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../lib/chapters';
import { IS_MOBILE } from '../lib/scrollState';

const SEG = IS_MOBILE ? 16 : 32;

let glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture(): THREE.CanvasTexture {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function Glow({ color, scale, opacity = 0.9 }: { color: string; scale: number; opacity?: number }) {
  const map = useMemo(() => getGlowTexture(), []);
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(1.6), [color]);
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={map}
        color={c}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </sprite>
  );
}

function Star({ radius, color }: { radius: number; color: string }) {
  const bright = useMemo(() => new THREE.Color(color).multiplyScalar(2.6), [color]);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, SEG, SEG]} />
        <meshBasicMaterial color={bright} toneMapped={false} fog={false} />
      </mesh>
      <Glow color={color} scale={radius * 9} />
    </group>
  );
}

export interface PlanetSpec {
  orbit: number;
  speed: number;
  size: number;
  color: string;
  phase: number;
  ring?: { inner: number; outer: number; color: string; tilt: number };
}

function Planet({ orbit, speed, size, color, phase, ring }: PlanetSpec) {
  const orbitGroup = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * orbit, 0, Math.sin(a) * orbit));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(
      geo,
      new THREE.LineBasicMaterial({ color: '#8fdcff', transparent: true, opacity: 0.18, depthWrite: false }),
    );
  }, [orbit]);

  useFrame((_, d) => {
    if (orbitGroup.current) orbitGroup.current.rotation.y += d * speed;
    if (mesh.current) mesh.current.rotation.y += d * 0.4;
  });

  return (
    <group>
      <primitive object={line} />
      <group ref={orbitGroup} rotation={[0, phase, 0]}>
        <group position={[orbit, 0, 0]}>
          <mesh ref={mesh}>
            <sphereGeometry args={[size, SEG, SEG]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.7} metalness={0.1} />
          </mesh>
          {ring && (
            <mesh rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
              <ringGeometry args={[ring.inner, ring.outer, 64]} />
              <meshBasicMaterial
                color={ring.color}
                transparent
                opacity={0.55}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )}
          <Glow color={color} scale={size * 4} opacity={0.35} />
        </group>
      </group>
    </group>
  );
}

interface SolarSystemProps {
  position: Vec3;
  scale?: number;
  planets: PlanetSpec[];
  /** Binary star: one gold (human) + one cyan (AI) sun orbiting each other. */
  binary?: boolean;
}

export function SolarSystem({ position, scale = 1, planets, binary = true }: SolarSystemProps) {
  const pair = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (pair.current) pair.current.rotation.y += d * 0.5;
  });
  return (
    <group position={position} scale={scale} rotation={[0.35, 0, 0.1]}>
      {binary ? (
        <group ref={pair}>
          <group position={[-1.1, 0, 0]}>
            <Star radius={1.1} color="#ffb84a" />
          </group>
          <group position={[1.1, 0, 0]}>
            <Star radius={0.8} color="#3be3ff" />
          </group>
        </group>
      ) : (
        <Star radius={1.4} color="#ffb84a" />
      )}
      {planets.map((p, i) => (
        <Planet key={i} {...p} />
      ))}
    </group>
  );
}

interface GlowingPlanetProps {
  position: Vec3;
  radius: number;
  color: string;
  glow: string;
  ring?: string;
}

export function GlowingPlanet({ position, radius, color, glow, ring }: GlowingPlanetProps) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (mesh.current) mesh.current.rotation.y += d * 0.08;
  });
  return (
    <group position={position}>
      <mesh ref={mesh}>
        <sphereGeometry args={[radius, SEG + 8, SEG + 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.55} />
      </mesh>
      <Glow color={glow} scale={radius * 6.5} opacity={0.8} />
      {ring && (
        <mesh rotation={[1.2, 0.2, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 2.3, 96]} />
          <meshBasicMaterial
            color={ring}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
