import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor, useGLTF } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import type { BloomEffect } from 'postprocessing';
import { MODEL_URLS } from '../assets';
import { IS_MOBILE, fx } from '../lib/scrollState';
import { AncientWomanChapter } from './AncientWomanChapter';
import { CameraRig } from './CameraRig';
import { DynamicLights } from './DynamicLights';
import { GuideRobot } from './GuideRobot';
import { HeroHands } from './HeroHands';
import { HumanoidChapter } from './HumanoidChapter';
import { LeviathanChapter } from './LeviathanChapter';
import { ShockwaveBurst } from './ShockwaveBurst';
import { TitanChapter } from './TitanChapter';
import { Universe } from './Universe';

// start downloading all 7 models immediately
Object.values(MODEL_URLS).forEach((url) => useGLTF.preload(url));

function PostFX() {
  const bloom = useRef<BloomEffect>(null);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.85 + fx.flash * 5;
  });
  return (
    <EffectComposer multisampling={IS_MOBILE ? 0 : 4}>
      <Bloom
        ref={bloom}
        intensity={0.85}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.75}
      />
      <ToneMapping />
      <Vignette eskil={false} offset={0.15} darkness={0.75} />
    </EffectComposer>
  );
}

export function Experience({ onOpenGuide }: { onOpenGuide: () => void }) {
  const maxDpr = IS_MOBILE ? 1.5 : 2;
  const [dpr, setDpr] = useState(IS_MOBILE ? 1.25 : 1.5);

  return (
    <Canvas
      dpr={dpr}
      style={{ position: 'fixed', inset: 0 }}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 400, position: [0, 0, 9] }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 70, 320]} />

      <Suspense fallback={null}>
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2} color="#ffd9a0" position={[-5, 2, -2]} scale={[8, 4, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={2} color="#7ee8ff" position={[5, 3, -3]} scale={[8, 4, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 6, 4]} scale={[10, 3, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        </Environment>

        <CameraRig />
        <DynamicLights />
        <HeroHands />
        <ShockwaveBurst />
        <Universe>
          <AncientWomanChapter />
          <HumanoidChapter />
          <TitanChapter />
          <LeviathanChapter />
        </Universe>
        <GuideRobot onOpen={onOpenGuide} />
      </Suspense>

      <PostFX />
    </Canvas>
  );
}
