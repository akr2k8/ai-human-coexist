import { MODEL_URLS } from '../assets';
import { CHAPTERS } from '../lib/chapters';
import { GlbModel } from './GlbModel';
import { GlowingPlanet } from './SolarSystem';

/** Chapter 2 — Theory I: Intuition Meets Computation. Plays the GLB's own animation beside a golden planet. */
export function AncientWomanChapter() {
  const ch = CHAPTERS[0]!;
  return (
    <group position={ch.pos}>
      <GlbModel id="ancient_woman" url={MODEL_URLS.ancient_woman} size={4.4} anim="first" />
      <GlowingPlanet position={[3.2, 2.2, -5]} radius={2.3} color="#ffb340" glow="#ffcf6a" ring="#ffe0a0" />
    </group>
  );
}
