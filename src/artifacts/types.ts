/* Artifact data shape. Content lives in ./data.ts; placement code in ./builders. */
import type * as THREE from 'three';

/**
 * What the side panel shows. `type` selects the renderer in renderMedia (../panel.ts):
 * - speech:  read-aloud recording (`parts`), optional `motifs` chips
 * - photo:   a photo + story `paragraphs`, read aloud from `parts`
 * - menu:    the I95 menu board (`items`, `extras`) + story `paragraphs`
 * - letter:  handwritten `text`
 * - capsule: two `sides` (Durham / Kunshan) with shared `motifs`
 * - gallery: framed pictures (`items`)
 * - qa:      question / answer pairs (`items`)
 * - tracks:  generated music tracks (`items`), see Sound.TRACKS
 */
export interface ArtifactMedia {
  type: 'speech' | 'photo' | 'menu' | 'letter' | 'capsule' | 'gallery' | 'qa' | 'tracks';
  label?: string;
  caption?: string;
  text?: string;
  motifs?: string[];
  paragraphs?: string[];
  /** Speech segments; pitch tweaks the browser voice. */
  parts?: { pitch?: number; text: string }[];
  sides?: { cls: string; place: string; who: string; pitch?: number; text: string }[];
  items?: any[];
  extras?: string[][];
}

export interface Artifact {
  id: string;
  /** Display number, e.g. '07'. */
  no: string;
  theme: string;
  title: string;
  origin: string;
  /** How it is displayed, shown in the panel ("Display"). */
  format: string;
  /** true = real story from a D2 team member (changes the panel footer). */
  real?: boolean;
  /** World position [x, y, z]; y is where the focus light aims. */
  pos: [number, number, number];
  /** Distance (m) within which the player can focus it. */
  radius: number;
  /** Key into BUILDERS (./builders/index.ts). */
  build: string;
  ry?: number;
  description: string;
  media: ArtifactMedia;

  // ---- runtime fields, filled in by builders / main.ts
  glow?: THREE.MeshStandardMaterial[];
  found?: boolean;
  heat?: number;
  dist?: number;
  update?: (t: number, dt: number, dist: number) => void;
  /** bull only */
  bull?: THREE.Group;
  seat?: THREE.Object3D;
  /** menuBoard only */
  menuTex?: THREE.CanvasTexture;
}
