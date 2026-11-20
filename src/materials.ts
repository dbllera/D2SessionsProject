import * as THREE from 'three';
import {
  atriumTexture,
  cubbyGlowTexture,
  fabricTexture,
  floorTextures,
  lanternTexture,
  nightTexture,
  plasterTexture,
  tableTopTexture,
  wallWashTexture,
  woodTexture,
} from './textures';

export type Materials = ReturnType<typeof createMaterials>;

export function createMaterials() {
  const floorTex = floorTextures();
  const TILE = 0.8; // metres per tile (assumed, see README)
  const repeatPerMetre = 1 / (TILE * 4);
  floorTex.map.repeat.set(repeatPerMetre, repeatPerMetre);
  floorTex.roughness.repeat.copy(floorTex.map.repeat);

  const walnutTex = woodTexture('#6b3f27', '#2a140a', 1, { vertical: true });
  const walnutDarkTex = woodTexture('#4a2a1a', '#1a0c05', 2, { vertical: true });
  const oakTex = woodTexture('#c9a26a', '#8a6236', 3, { vertical: true, streaks: 220 });
  const honeyTex = woodTexture('#a57d55', '#5e3f24', 4, { vertical: true });
  const slatTex = woodTexture('#6d4d33', '#3a2414', 5);
  const plaster = plasterTexture();
  plaster.repeat.set(3, 3);

  const shelfGlowOn = new THREE.Color('#ffb25e');

  const m = {
    floor: new THREE.MeshStandardMaterial({
      map: floorTex.map,
      roughnessMap: floorTex.roughness,
      roughness: 1.5,
      metalness: 0.0,
      envMapIntensity: 1.4,
    }),
    plaster: new THREE.MeshStandardMaterial({
      map: plaster,
      color: '#d9d4cb',
      roughness: 0.92,
      emissive: new THREE.Color('#ffe2bd'),
      emissiveMap: wallWashTexture(),
      emissiveIntensity: 0.3,
    }),
    plasterPlain: new THREE.MeshStandardMaterial({ map: plaster, color: '#d9d4cb', roughness: 0.92 }),
    whitePanel: new THREE.MeshStandardMaterial({ color: '#e7e5e0', roughness: 0.6 }),
    cream: new THREE.MeshStandardMaterial({ color: '#d9cfbd', roughness: 0.85 }),
    walnut: new THREE.MeshStandardMaterial({ map: walnutTex, roughness: 0.5, metalness: 0.0 }),
    walnutDark: new THREE.MeshStandardMaterial({ map: walnutDarkTex, roughness: 0.55 }),
    tableTop: new THREE.MeshStandardMaterial({ map: tableTopTexture(), roughness: 0.48, envMapIntensity: 1.2 }),
    oak: new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.62 }),
    honey: new THREE.MeshStandardMaterial({ map: honeyTex, color: '#d2c6bb', roughness: 0.62 }),
    slat: new THREE.MeshStandardMaterial({ map: slatTex, color: '#cdbcae', roughness: 0.8 }),
    slatBacking: new THREE.MeshStandardMaterial({ color: '#1a1511', roughness: 1 }),
    cushion: new THREE.MeshStandardMaterial({ map: fabricTexture('#b4b4b0', 8), roughness: 0.95 }),
    loungeFabric: new THREE.MeshStandardMaterial({ map: fabricTexture('#6f8384', 9), roughness: 0.95 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c9a259', metalness: 1, roughness: 0.32 }),
    steel: new THREE.MeshStandardMaterial({ color: '#c8ccd0', metalness: 1, roughness: 0.25 }),
    mullion: new THREE.MeshStandardMaterial({ color: '#8f9398', metalness: 0.6, roughness: 0.45 }),
    glass: new THREE.MeshStandardMaterial({
      color: '#9fb4c2',
      roughness: 0.04,
      metalness: 0.1,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
    }),
    display: new THREE.MeshStandardMaterial({ color: '#0b0c0d', roughness: 0.18, metalness: 0.2, envMapIntensity: 1.2 }),
    black: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 }),
    stone: new THREE.MeshStandardMaterial({ color: '#3a3c3e', roughness: 0.7 }),
    pages: new THREE.MeshStandardMaterial({ color: '#efe9da', roughness: 0.9 }),
    bookCloth: new THREE.MeshStandardMaterial({ color: '#4d7d79', roughness: 0.8 }),
    bookSpine: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75 }),
    copybook: new THREE.MeshStandardMaterial({ color: '#e6d49a', roughness: 0.85 }),
    exitSign: new THREE.MeshStandardMaterial({ color: '#0d3d24', emissive: new THREE.Color('#1fe08a'), emissiveIntensity: 1.6 }),
    ledStrip: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#fff0d6'), emissiveIntensity: 3.2 }),
    shelfLed: new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: new THREE.Color('#ffe7c2'), emissiveIntensity: 3.0 }),
    cubbyBack: new THREE.MeshStandardMaterial({
      map: oakTex,
      roughness: 0.7,
      emissive: shelfGlowOn.clone(),
      emissiveMap: cubbyGlowTexture(),
      emissiveIntensity: 1.5,
    }),
    lantern: new THREE.MeshStandardMaterial({
      map: lanternTexture(),
      emissiveMap: lanternTexture(),
      color: '#f2ede2',
      emissive: new THREE.Color('#ffe9c8'),
      emissiveIntensity: 1.7,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    lanternDiffuser: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: new THREE.Color('#fff1da'),
      emissiveIntensity: 2.6,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    night: new THREE.MeshBasicMaterial({ map: nightTexture(), toneMapped: true }),
    nightGround: new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.9 }),
    hedge: new THREE.MeshStandardMaterial({ color: '#122016', roughness: 1 }),
    atrium: new THREE.MeshStandardMaterial({
      map: atriumTexture(),
      color: '#f2f4f5',
      roughness: 0.8,
      emissive: new THREE.Color('#dfe6ec'),
      emissiveIntensity: 0.55,
    }),
    atriumPlain: new THREE.MeshStandardMaterial({ color: '#e9ecee', roughness: 0.8, emissive: new THREE.Color('#d7dde2'), emissiveIntensity: 0.5 }),
    atriumWood: new THREE.MeshStandardMaterial({ map: oakTex, color: '#e0b98a', roughness: 0.6, emissive: new THREE.Color('#6b4a28'), emissiveIntensity: 0.35 }),
    recycle: new THREE.MeshStandardMaterial({ color: '#f3f3f1', roughness: 0.5 }),
  };
  return m;
}
