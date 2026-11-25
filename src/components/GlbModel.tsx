import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getCalib, type ModelId } from '../lib/calibration';

const DEG = Math.PI / 180;

interface GlbModelProps {
  id: ModelId;
  url: string;
  /** Target size of the model's largest dimension, in world units (auto-normalizes any GLB). */
  size: number;
  anim?: 'none' | 'first' | 'all';
  animSpeed?: number;
}

/**
 * Loads a GLB, clones it (safe to reuse), centers + normalizes its size, optionally plays its
 * built-in animation, and applies the live "Calibrate 3D" offsets on top (innermost transform).
 */
export function GlbModel({ id, url, size, anim = 'none', animSpeed = 1 }: GlbModelProps) {
  const gltf = useGLTF(url);
  const calibRef = useRef<THREE.Group>(null);
  const mixerRoot = useRef<THREE.Group>(null);

  const fitted = useMemo(() => {
    const object = cloneSkinned(gltf.scene);
    object.traverse((o) => {
      if (o instanceof THREE.Mesh) o.frustumCulled = false;
    });
    const box = new THREE.Box3().setFromObject(object);
    const dims = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = size / (Math.max(dims.x, dims.y, dims.z) || 1);
    return { object, k, offset: center.multiplyScalar(-k) };
  }, [gltf.scene, size]);

  const { actions, names } = useAnimations(gltf.animations, mixerRoot);

  useEffect(() => {
    if (anim === 'none' || names.length === 0) return undefined;
    const wanted = anim === 'first' ? [names[0]] : names;
    const played = wanted
      .map((n) => actions[n as string])
      .filter((a): a is THREE.AnimationAction => !!a);
    played.forEach((a) => {
      a.reset().setEffectiveTimeScale(animSpeed).fadeIn(0.4).play();
    });
    return () => {
      played.forEach((a) => {
        a.fadeOut(0.2);
      });
    };
  }, [actions, names, anim, animSpeed]);

  useFrame(() => {
    const g = calibRef.current;
    if (!g) return;
    const c = getCalib(id);
    g.position.set(c.px, c.py, c.pz);
    g.rotation.set(c.rx * DEG, c.ry * DEG, c.rz * DEG);
    g.scale.setScalar(c.s);
  });

  return (
    <group ref={calibRef}>
      <group ref={mixerRoot} scale={fitted.k} position={fitted.offset}>
        <primitive object={fitted.object} />
      </group>
    </group>
  );
}
