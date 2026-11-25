import { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CHAPTERS, type Vec3 } from '../lib/chapters';
import { clamp01, fx, scroll, smootherstep } from '../lib/scrollState';

/** Where the camera is currently looking (lights follow it). */
export const rigState = { look: new THREE.Vector3() };

interface KeyFrame {
  t: number;
  p: Vec3;
  l: Vec3;
}

function buildRig(portrait: boolean) {
  const frames: KeyFrame[] = [
    { t: 0, p: [0, 0, portrait ? 12 : 9], l: [0, 0, 0] },
    { t: 0.18, p: [0, 0, portrait ? 11 : 8], l: [0, 0, 0] },
    { t: 0.26, p: [0, 0.3, 5], l: [3, 1, -24] },
  ];

  for (const ch of CHAPTERS) {
    const dist = portrait ? ch.dist * 1.25 : ch.dist;
    const sx = portrait || ch.side === 'center' ? 0 : ch.side === 'left' ? -2.6 : 2.6;
    const sy = portrait ? -2.4 : 0;
    const lift = ch.side === 'center' ? 3 : 0.6;
    const look: Vec3 = [ch.pos[0] + sx, ch.pos[1] + sy, ch.pos[2]];
    frames.push({ t: ch.arrive, p: [ch.pos[0] - 0.8, ch.pos[1] + lift, ch.pos[2] + dist], l: look });
    frames.push({ t: ch.leave, p: [ch.pos[0] + 0.8, ch.pos[1] + lift + 0.3, ch.pos[2] + dist - 1.2], l: look });
  }

  return {
    times: frames.map((f) => f.t),
    pos: new THREE.CatmullRomCurve3(frames.map((f) => new THREE.Vector3(...f.p)), false, 'catmullrom', 0.5),
    look: new THREE.CatmullRomCurve3(frames.map((f) => new THREE.Vector3(...f.l)), false, 'catmullrom', 0.5),
  };
}

/** Scroll-driven camera flight: eased stop at every chapter, subtle pointer parallax + burst shake. */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const portrait = useThree((s) => s.size.width / s.size.height < 0.9);
  const rig = useMemo(() => buildRig(portrait), [portrait]);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3(), px: 0, py: 0 }), []);

  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = portrait ? 62 : 45;
    c.updateProjectionMatrix();
  }, [camera, portrait]);

  useFrame(({ clock, pointer }, delta) => {
    const { times, pos, look } = rig;
    const p = clamp01(scroll.progress);
    let i = 0;
    while (i < times.length - 2 && p > (times[i + 1] as number)) i++;
    const t0 = times[i] as number;
    const t1 = times[i + 1] as number;
    const u = clamp01((p - t0) / (t1 - t0));
    const k = (i + smootherstep(u)) / (times.length - 1);
    pos.getPoint(k, tmp.p);
    look.getPoint(k, tmp.l);

    const t = clock.elapsedTime;
    tmp.px = THREE.MathUtils.damp(tmp.px, pointer.x, 3, delta);
    tmp.py = THREE.MathUtils.damp(tmp.py, pointer.y, 3, delta);
    tmp.p.x += tmp.px * 0.35 + Math.sin(t * 0.35) * 0.06;
    tmp.p.y += tmp.py * 0.2 + Math.cos(t * 0.3) * 0.05;
    if (fx.shake > 0.001) {
      tmp.p.x += (Math.random() - 0.5) * fx.shake;
      tmp.p.y += (Math.random() - 0.5) * fx.shake;
    }

    camera.position.copy(tmp.p);
    camera.lookAt(tmp.l);
    rigState.look.copy(tmp.l);
  });

  return null;
}
