import { useSyncExternalStore } from 'react';

export type ModelId =
  | 'orange_robot'
  | 'female_hand'
  | 'robotic_hand'
  | 'ancient_woman'
  | 'humanoid_robot_ai'
  | 'ancient_titan'
  | 'space_leviathan';

/** px/py/pz = position offset, rx/ry/rz = rotation offset in DEGREES, s = scale multiplier. */
export interface Calib {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

export type CalibMap = Record<ModelId, Calib>;

export const MODEL_ORDER: ModelId[] = [
  'female_hand',
  'robotic_hand',
  'ancient_woman',
  'humanoid_robot_ai',
  'ancient_titan',
  'space_leviathan',
  'orange_robot',
];

/** focus = scroll progress at which the model is on screen (used by the "Jump to model" button). */
export const MODEL_META: Record<ModelId, { label: string; focus: number }> = {
  orange_robot: { label: 'AI Guide', focus: 0 },
  female_hand: { label: 'Female Hand', focus: 0.2 },
  robotic_hand: { label: 'Robotic Hand', focus: 0.2 },
  ancient_woman: { label: 'Ancient Woman', focus: 0.41 },
  humanoid_robot_ai: { label: 'Humanoid AI', focus: 0.6 },
  ancient_titan: { label: 'Ancient Titan', focus: 0.78 },
  space_leviathan: { label: 'Space Leviathan', focus: 0.94 },
};

const BASE: Calib = { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0, s: 1 };
const OVERRIDES: Partial<Record<ModelId, Partial<Calib>>> = {
  robotic_hand: { ry: 180 },
};
const defaults = (id: ModelId): Calib => ({ ...BASE, ...OVERRIDES[id] });

const KEY = 'coexist-calibration-v1';

function load(): CalibMap {
  const out = {} as CalibMap;
  for (const id of MODEL_ORDER) out[id] = defaults(id);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<ModelId, Partial<Calib>>>;
      for (const id of MODEL_ORDER) {
        const saved = parsed[id];
        if (!saved) continue;
        for (const k of Object.keys(BASE) as (keyof Calib)[]) {
          const v = saved[k];
          if (typeof v === 'number' && Number.isFinite(v)) out[id][k] = v;
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return out;
}

let state: CalibMap = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode) */
  }
}

/** Non-reactive read, safe to call every frame. */
export const getCalib = (id: ModelId): Calib => state[id];
export const getAllCalib = (): CalibMap => state;

export function setCalibKey(id: ModelId, key: keyof Calib, value: number): void {
  state = { ...state, [id]: { ...state[id], [key]: value } };
  persist();
  emit();
}

export function resetCalib(id?: ModelId): void {
  if (id) {
    state = { ...state, [id]: defaults(id) };
  } else {
    const next = {} as CalibMap;
    for (const m of MODEL_ORDER) next[m] = defaults(m);
    state = next;
  }
  persist();
  emit();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useCalibStore(): CalibMap {
  return useSyncExternalStore(subscribe, () => state);
}
