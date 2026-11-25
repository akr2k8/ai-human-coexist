import type { ModelId } from './calibration';

export type Vec3 = [number, number, number];

export interface Chapter {
  key: 'woman' | 'humanoid' | 'titan' | 'leviathan';
  model: ModelId;
  kicker: string;
  title: string;
  body: string;
  signals: string[];
  /** Which side of the screen the glass card sits on (desktop). The model is framed on the opposite side. */
  side: 'left' | 'right' | 'center';
  /** World position of the chapter centerpiece. */
  pos: Vec3;
  /** Scroll progress where the camera arrives / leaves the dwell point. */
  arrive: number;
  leave: number;
  /** Scroll window in which the card is visible. */
  show: [number, number];
  /** Camera distance from the model (desktop). */
  dist: number;
}

export const TAGLINE = 'AI & Humanity Coexisting: Together We Build the Impossible.';

export const CHAPTERS: Chapter[] = [
  {
    key: 'woman',
    model: 'ancient_woman',
    kicker: 'Theory I',
    title: 'Intuition Meets Computation',
    body: 'Humans carry millennia of embodied wisdom: story, instinct, taste. Machines carry boundless recall and speed. Where they meet, insight stops being a guess and becomes a method.',
    signals: ['Embodied intuition', 'Machine-scale recall', 'Insight as a method'],
    side: 'left',
    pos: [0, -0.8, -42],
    arrive: 0.34,
    leave: 0.48,
    show: [0.335, 0.485],
    dist: 10.5,
  },
  {
    key: 'humanoid',
    model: 'humanoid_robot_ai',
    kicker: 'Theory II',
    title: 'Co-Evolution & Shared Agency',
    body: 'Neither side stays fixed. Every tool we shape reshapes us back. The goal is not control or surrender, but shared agency: decisions made in the open, each side owning what it does best.',
    signals: ['Open decision loops', 'Mutual adaptation', 'Shared accountability'],
    side: 'right',
    pos: [0, -0.6, -84],
    arrive: 0.54,
    leave: 0.66,
    show: [0.535, 0.665],
    dist: 10.5,
  },
  {
    key: 'titan',
    model: 'ancient_titan',
    kicker: 'Theory III',
    title: 'Guardianship & Ethical Alignment',
    body: 'Power without guardianship is just momentum. Alignment is the slow, deliberate work of keeping systems faithful to human values: auditable, correctable, and humble about what they do not know.',
    signals: ['Auditable by design', 'Correctable at any time', 'Values before velocity'],
    side: 'left',
    pos: [0, 0, -126],
    arrive: 0.72,
    leave: 0.84,
    show: [0.715, 0.845],
    dist: 12,
  },
  {
    key: 'leviathan',
    model: 'space_leviathan',
    kicker: 'Theory IV',
    title: 'Navigating the Impossible',
    body: 'The unknown is vast and moves like something alive. Crossing it takes two kinds of mind: one to dream the route, one to compute it.',
    signals: ['Dream the route', 'Compute the path', 'Cross together'],
    side: 'center',
    pos: [0, 0, -170],
    arrive: 0.88,
    leave: 1.0,
    show: [0.875, 1.06],
    dist: 17,
  },
];
