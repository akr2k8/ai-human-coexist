import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERT = /* glsl */ `
uniform float uTime; uniform float uPx; uniform float uTwinkle; uniform float uOpacity;
uniform float uMax; uniform float uScale;
attribute float aSize; attribute float aSeed; attribute vec3 aColor;
varying vec3 vColor; varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0));
  vA = tw * uOpacity;
  vColor = aColor;
  gl_PointSize = min(aSize * uPx * (uScale / max(-mv.z, 0.1)), uMax * uPx);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform float uSoft;
varying vec3 vColor; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), mix(1.0, 2.2, uSoft));
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * vA);
}`;

interface Props {
  kind: 'stars' | 'nebula';
  count: number;
  max?: number;
  seed?: number;
}

/** GPU-twinkled star field or soft nebula dust, a single draw call each. */
export function ParticleField({ kind, count, max, seed = 7 }: Props) {
  const { geometry, material } = useMemo(() => {
    const r = rng(seed);
    const gauss = () => r() + r() + r() + r() - 2;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seeds = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = (
      kind === 'stars'
        ? ['#ffffff', '#bfe6ff', '#ffe2b0', '#d9d2ff']
        : ['#3b1d8f', '#0e6fa8', '#a8326b', '#b3741f']
    ).map((h) => new THREE.Color(h));

    const centers = Array.from({ length: 8 }, (_, i) => new THREE.Vector3((r() - 0.5) * 44, (r() - 0.5) * 20, -i * 26));

    for (let i = 0; i < count; i++) {
      if (kind === 'stars') {
        pos.set([(r() - 0.5) * 140, (r() - 0.5) * 90, 14 - r() * 250], i * 3);
        size[i] = 1.2 + r() * 2;
      } else {
        const c = centers[Math.floor(r() * centers.length)] as THREE.Vector3;
        pos.set([c.x + gauss() * 14, c.y + gauss() * 7, c.z + gauss() * 16], i * 3);
        size[i] = 14 + r() * 18;
      }
      seeds[i] = r();
      const c = palette[Math.floor(r() * palette.length)] as THREE.Color;
      col.set([c.r, c.g, c.b], i * 3);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));

    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPx: { value: 1 },
        uTwinkle: { value: kind === 'stars' ? 0.6 : 0.15 },
        uOpacity: { value: kind === 'stars' ? 1 : 0.16 },
        uMax: { value: max ?? (kind === 'stars' ? 6 : 120) },
        uScale: { value: kind === 'stars' ? 60 : 60 },
        uSoft: { value: kind === 'stars' ? 0 : 1 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [kind, count, max, seed]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock, gl }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPx.value = gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
