/* Shared mutable game state: what screen we are on, the player, held keys, and the active room. */
import type { Artifact } from './artifacts/types';
import type { Room } from './room';

export type GameStateName = 'start' | 'playing' | 'panel' | 'paused' | 'rideMenu' | 'riding' | 'rideResult';

export interface GameState {
  state: GameStateName;
  /** false once the browser refuses pointer lock; we fall back to click-and-drag look. */
  lockMode: boolean;
  everLocked: boolean;
  /** Set before we exit pointer lock ourselves, so the lock-change handler does not pause. */
  pendingExit?: boolean;
  found: number;
  /** Artifact under the crosshair (only while playing). */
  focus: Artifact | null;
  /** Artifact whose panel is open. */
  open: Artifact | null;
  lastPrompt?: string | null;
}

export const game: GameState = { state: 'start', lockMode: true, everLocked: false, found: 0, focus: null, open: null };

export const player = { x: 0, z: 0, yaw: 0, pitch: 0, vx: 0, vz: 0, bob: 0, stride: 0, eye: 1.66, r: 0.32 };

/** Currently held keys, by KeyboardEvent.code. */
export const keys: Record<string, boolean> = {};
export function clearKeys() {
  for (const k in keys) delete keys[k];
}

/** The room the player is in. Set once by main.ts. */
export let room: Room;
export function setRoom(r: Room) {
  room = r;
}
