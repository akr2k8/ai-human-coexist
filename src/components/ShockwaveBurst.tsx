import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IS_MOBILE, clamp01, easeOutCubic, fx, lerp, scroll, smoothstep } from '../lib/scrollState';

const BURST_AT = 0.22;
const DURATION = 2.4;
const SPARKS = IS_MOBILE ? 140 : 260;

const hdr = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

const SPARK_VERT = /* glsl */ `
uniform float uT; uniform float uPx;
attribute vec3 aDir; attribute float aSpeed; attribute float aMix; attribute float aSize;
varying vec3 vCol;
void main() {
  float d = aSpeed * (1.0 - exp(-uT * 1.4));
  vec4 mv = modelViewMatrix * vec4(aDir * d, 1.0);
  vCol = mix(vec3(3.0, 2.2, 0.9), vec3(0.4, 2.4, 3.0), aMix);
  gl_PointSize = min(aSize * uPx * (40.0 / max(-mv.z, 0.1)), 36.0 * uPx);
  gl_Position = projectionMatrix * mv;
}`;

const SPARK_FRAG = /* glsl */ `
uniform float uFade;
varying vec3 vCol;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  if (a < 0.01) discard;
  gl_FragColor = vec4(vCol, a * uFade);
}`;

function makeSparks() {
  const geo = new THREE.BufferGeometry();
  const dir = new Float32Array(SPARKS * 3);
  const speed = new Float32Array(SPARKS);
  const mix = new Float32Array(SPARKS);
  const size = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    dir.set([r * Math.cos(a), r * Math.sin(a), u], i * 3);
    speed[i] = 8 + Math.random() * 34;
    mix[i] = Math.random();
    size[i] = 0.6 + Math.random() * 1.6;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
  geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  geo.setAttribute('aMix', new THREE.BufferAttribute(mix, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPx: { value: 1 }, uFade: { value: 0 } },
    vertexShader: SPARK_VERT,
    fragmentShader: SPARK_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return { geo, mat };
}

/** The 22% moment: fingertip charge-up, then cyan + gold shockwave, shell flash and spark burst. */
export function ShockwaveBurst() {
  const orb = useRef<THREE.Mesh>(null);
  const orbMat = useRef<THREE.MeshBasicMaterial>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringAMat = useRef<THREE.MeshBasicMaterial>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringBMat = useRef<THREE.MeshBasicMaterial>(null);
  const shell = useRef<THREE.Mesh>(null);
  const shellMat = useRef<THREE.MeshBasicMaterial>(null);
  const sparks = useRef<THREE.Points>(null);

  const bt = useRef(-1); // -1 armed, >=0 running/finished
  const prev = useRef(scroll.progress);

  const colors = useMemo(
    () => ({ cyan: hdr('#18e0ff', 3), gold: hdr('#ffc04d', 3), white: hdr('#ffffff', 2.5) }),
    [],
  );
  const { geo, mat } = useMemo(makeSparks, []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame(({ clock, gl }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scroll.progress;

    if (bt.current === -1 && prev.current < BURST_AT && p >= BURST_AT && p < BURST_AT + 0.06) {
      bt.current = 0;
    }
    if (p < BURST_AT - 0.04) bt.current = -1;
    prev.current = p;

    // charge-up orb between the fingertips
    const charge = smoothstep(0.1, BURST_AT, p) * (1 - smoothstep(BURST_AT, BURST_AT + 0.04, p));
    if (orb.current && orbMat.current) {
      orb.current.visible = charge > 0.01;
      const pulse = 1 + Math.sin(clock.elapsedTime * 18) * 0.12 * charge;
      orb.current.scale.setScalar((0.05 + charge * 0.5) * pulse);
      orbMat.current.opacity = charge;
    }

    let flash = charge * 0.25;
    let shake = 0;
    let running = false;

    if (bt.current >= 0) {
      bt.current += dt;
      const t = bt.current;
      const b = clamp01(t / DURATION);
      const f = 1 - b;
      running = b < 1;
      if (running) {
        flash = Math.max(flash, f * f);
        shake = f * f * f * 0.14;

        if (ringA.current && ringAMat.current) {
          ringA.current.scale.setScalar(lerp(0.4, 42, easeOutCubic(b)));
          ringAMat.current.opacity = Math.pow(f, 1.5);
        }
        const bb = clamp01((t - 0.15) / DURATION);
        if (ringB.current && ringBMat.current) {
          ringB.current.scale.setScalar(lerp(0.3, 30, easeOutCubic(bb)));
          ringBMat.current.opacity = Math.pow(1 - bb, 1.5) * 0.9;
        }
        if (shell.current && shellMat.current) {
          shell.current.scale.setScalar(lerp(0.5, 36, easeOutCubic(b)));
          shellMat.current.opacity = f * f * 0.25;
        }
        mat.uniforms.uT.value = t;
        mat.uniforms.uPx.value = gl.getPixelRatio();
        mat.uniforms.uFade.value = Math.pow(f, 1.2);
      }
    }

    if (ringA.current) ringA.current.visible = running;
    if (ringB.current) ringB.current.visible = running;
    if (shell.current) shell.current.visible = running;
    if (sparks.current) sparks.current.visible = running;

    fx.flash = flash;
    fx.shake = shake;
  });

  return (
    <group>
      <mesh ref={orb} visible={false}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial
          ref={orbMat}
          color={colors.white}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringA} visible={false}>
        <ringGeometry args={[0.94, 1, 128]} />
        <meshBasicMaterial
          ref={ringAMat}
          color={colors.cyan}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringB} visible={false}>
        <ringGeometry args={[0.94, 1, 128]} />
        <meshBasicMaterial
          ref={ringBMat}
          color={colors.gold}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell} visible={false}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          ref={shellMat}
          color={colors.cyan}
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <points ref={sparks} geometry={geo} material={mat} frustumCulled={false} visible={false} />
    </group>
  );
}
