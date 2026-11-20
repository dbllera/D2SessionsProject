/* Renderer, scene, camera and the root `world` group everything is added to.
   `renderer` is null when WebGL is unavailable; main.ts shows the fallback message. */
import * as THREE from 'three';

export const canvas = document.getElementById('c') as HTMLCanvasElement;

function createRenderer(): THREE.WebGLRenderer | null {
  try {
    return new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
}

export const renderer = createRenderer();
if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/** Max anisotropic filtering applied to every canvas texture. */
export const MAXAN = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);

export const camera = new THREE.PerspectiveCamera(68, 1, 0.08, 120);
camera.rotation.order = 'YXZ';

export const world = new THREE.Group();
scene.add(world);

export const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
