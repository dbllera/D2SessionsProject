/* Builder registry: an artifact's `build` key picks the function that places it in the room.
   Each builder returns the glowMat() materials that light up when the player looks at it. */
import type * as THREE from 'three';
import type { Room } from '../../room';
import type { Artifact } from '../types';
import { audioStation } from './audioStation';
import { letter } from './letter';
import { displayCase } from './displayCase';
import { frames } from './frames';
import { lectern } from './lectern';
import { basketball } from './basketball';
import { takeout } from './takeout';
import { bull } from './bull';
import { menuBoard } from './menuBoard';
import { screen } from './screen';

export type Builder = (a: Artifact, root: THREE.Object3D, room: Room) => THREE.MeshStandardMaterial[];

export const BUILDERS: Record<string, Builder> = {
  audioStation,
  letter,
  displayCase,
  frames,
  lectern,
  basketball,
  takeout,
  bull,
  menuBoard,
  screen,
};
