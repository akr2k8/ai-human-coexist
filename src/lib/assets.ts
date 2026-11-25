import type { ModelId } from './lib/calibration';

/**
 * Vite bundles every .glb it finds in the project root (next to package.json)
 * or in /src, so the build never 404s no matter which of the two you used.
 * Requires `assetsInclude: ['**\/*.glb']` in vite.config.ts (you already have it).
 */
const found = import.meta.glob(['/*.glb', '/src/*.glb'], {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function resolve(key: ModelId): string {
  const hit = Object.keys(found).find((p) => p.endsWith(`/${key}.glb`));
  if (!hit) {
    throw new Error(
      `[assets] ${key}.glb was not found. Put it in the project root (next to package.json) or in /src.`,
    );
  }
  return found[hit] as string;
}

export const MODEL_URLS: Record<ModelId, string> = {
  orange_robot: resolve('orange_robot'),
  female_hand: resolve('female_hand'),
  robotic_hand: resolve('robotic_hand'),
  ancient_woman: resolve('ancient_woman'),
  humanoid_robot_ai: resolve('humanoid_robot_ai'),
  ancient_titan: resolve('ancient_titan'),
  space_leviathan: resolve('space_leviathan'),
};
