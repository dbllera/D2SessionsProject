/* Shared materials. glowMat() materials are the ones the focus highlight pulses. */
import * as THREE from 'three';
import { T } from './textures';

/** MeshStandardMaterial with a low default envMapIntensity. */
export function std(o: THREE.MeshStandardMaterialParameters) {
  var m = new THREE.MeshStandardMaterial(o);
  if (o.envMapIntensity === undefined) m.envMapIntensity = 0.3;
  return m;
}
/** A std() material whose emissive pulses when its artifact is in focus (see focus.ts). */
export function glowMat(o: THREE.MeshStandardMaterialParameters) {
  var m = std(o);
  m.emissive = new THREE.Color(0xffc56e);
  m.emissiveIntensity = 0;
  return m;
}

export var M = {
  woodDark: std({ map: T.woodDark, roughness: 0.55 }),
  woodMid: std({ map: T.woodMid, roughness: 0.42, envMapIntensity: 0.45 }),
  beam: std({ map: T.woodBeam, roughness: 0.62 }),
  beamPlain: std({ color: 0x56311d, roughness: 0.62 }),
  plaster: std({ map: T.plaster, roughness: 0.95, envMapIntensity: 0.15 }),
  stone: std({ map: T.stone, roughness: 0.9, envMapIntensity: 0.15 }),
  floor: std({ map: T.parquet, roughness: 0.5, envMapIntensity: 0.32 }),
  ceiling: std({ map: T.ceiling, roughness: 0.95, side: THREE.DoubleSide, envMapIntensity: 0.15 }),
  gold: std({ color: 0xb9933f, roughness: 0.36, metalness: 0.85, envMapIntensity: 1.1 }),
  brass: std({ color: 0xb08a45, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.2 }),
  black: std({ color: 0x15151a, roughness: 0.5, metalness: 0.4 }),
  tan: std({ color: 0x8a6844, roughness: 0.85 }),
  red: std({ color: 0x7d2416, roughness: 0.85 }),
  glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.0, 1.25), side: THREE.DoubleSide }),
};
M.floor.map.repeat.set(1, 1);
