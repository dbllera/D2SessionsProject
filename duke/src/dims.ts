/* Room dimensions (metres). L = length (z), W = width (x), H = wall height, R = roof ridge height. */
import * as THREE from 'three';

export const L = 34,
  W = 11,
  H = 7.6,
  R = 12.5,
  HL = L / 2,
  HW = W / 2;
export const TRUSS_Z = [-15.6, -10.4, -5.2, 0, 5.2, 10.4, 15.6];
export const BAY_C = [-13, -7.8, -2.6, 2.6, 7.8, 13];
export const SUN_POS = new THREE.Vector3(30, 27, 5);
