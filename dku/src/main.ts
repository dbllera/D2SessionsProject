import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CollisionWorld } from './collision';
import { CEIL, CORRIDOR_Z, Z1 } from './dims';
import { LatticeScreens } from './lattice';
import { buildFurniture } from './layout';
import { createMaterials } from './materials';
import { Pendants } from './pendants';
import { Player } from './player';
import { buildRoom, type Ctx } from './room';
import { ShelfWall } from './shelf';
import { AtriumStair } from './stairs';
import { fadeIn, isTraveling, readArrival, travel } from '../../shared/portal';
import './style.css';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const params = new URLSearchParams(location.search);
const debug = params.has('debug');
const num = (k: string, d: number) => (params.has(k) ? Number(params.get(k)) : d);
/** Set when we came down from the Duke world (see shared/portal.ts). */
const arrival = readArrival();
if (arrival) fadeIn();

// ---------------------------------------------------------------- renderer
const app = $('app');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: debug });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, num('pr', 1.5)));

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = num('shadow', 1) > 0;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.info.autoReset = false;
// The room is static: render the shadow map once, then only while the lattice panel swings.
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
app.appendChild(renderer.domElement);
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05070c');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.22;

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 120);

// ---------------------------------------------------------------- world
const world = new CollisionWorld();
const mats = createMaterials();
const ctx: Ctx = { scene, mats, world };
buildRoom(ctx);
const spine = new THREE.TextureLoader().load('./textures/book-spine.jpg');
spine.colorSpace = THREE.SRGBColorSpace;
spine.anisotropy = 8;
const shelf = new ShelfWall(ctx, spine);
const lattice = new LatticeScreens(ctx);
const pendants = new Pendants(ctx);
const stair = new AtriumStair(ctx);
buildFurniture(ctx);

// ---------------------------------------------------------------- lighting
// Soft fill: warm bounce from the wood ceiling / dark floor.
scene.add(new THREE.HemisphereLight('#ffeedd', '#3a322b', 0.85));
// Key light standing in for the ceiling downlights; the only shadow caster.
const key = new THREE.DirectionalLight('#ffe8cc', 0.8);
key.position.set(2.5, 16, 3.5);
key.target.position.set(0, 0, 0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
const sc = key.shadow.camera;
sc.left = -11;
sc.right = 11;
sc.top = 12;
sc.bottom = -12;
sc.near = 4;
sc.far = 26;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.025;
key.shadow.radius = 3;
scene.add(key, key.target);
// Cool daylight-like spill from the bright atrium behind the lattice.
{
  const l = new THREE.PointLight('#e8f0ff', 14, 0, 2);
  l.position.set(0, 3.2, (Z1 + CORRIDOR_Z) / 2 + 0.3);
  scene.add(l);
}
const atriumFill = new THREE.DirectionalLight('#eaf1ff', 0.6);
atriumFill.position.set(0, 6, 20);
atriumFill.target.position.set(0, 2, 6);
scene.add(atriumFill, atriumFill.target);

// ---------------------------------------------------------------- post
const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType, samples: num('msaa', 2) });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(renderer.getPixelRatio());
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.55, 0.92);
if (num('bloom', 1) > 0) composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- player
const player = new Player(camera, renderer.domElement, world, {
  ground: (x, z) => stair.heightAt(x, z),
  zMax: stair.zMax,
});
if (arrival === 'stairs-top') {
  const a = stair.topArrival;
  player.setPose(a.x, a.z, a.yaw, a.pitch);
  // Coming back through the lattice needs it open.
  lattice.toggle(99, 99);
  lattice.update(10); // jump straight to fully open
  renderer.shadowMap.needsUpdate = true;
}

// ---------------------------------------------------------------- UI
const overlay = $('overlay');
const startBtn = $('start');
const prompt = $('prompt');
const toastEl = $('toast');
const inspect = $('inspect');
const fpsEl = $('fps');
if (debug) fpsEl.hidden = false;
if (arrival === 'stairs-top') {
  $('overlay-eyebrow').textContent = 'Back from Duke';
  $('overlay-title').textContent = 'DKU Library';
  $('overlay-lede').textContent = 'You came down the atrium stair from the Gothic Reading Room. The library is ahead, through the open lattice panel.';
  $('start-label').textContent = 'Click to continue';
}

let toastTimer = 0;
function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 1800);
}

const lock = () => {
  if (!player.controls.isLocked) player.controls.lock();
};
startBtn.addEventListener('click', lock);
overlay.addEventListener('click', lock);
player.controls.addEventListener('lock', () => {
  overlay.classList.add('hidden');
});
player.controls.addEventListener('unlock', () => {
  if (inspecting !== null) closeInspect();
  overlay.classList.remove('hidden');
  $('start-label').textContent = 'Click to resume';
});

// ---------------------------------------------------------------- interactions
type Target =
  | { kind: 'book'; group: number }
  | { kind: 'shelf-switch' }
  | { kind: 'pendant'; index: number }
  | { kind: 'lattice' };

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const hitProxy = new THREE.MeshBasicMaterial({ visible: false });

// Generous invisible hit areas for thin or perforated objects.
const switchProxy = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.34), hitProxy);
switchProxy.position.copy(new THREE.Box3().setFromObject(shelf.switchPanel).getCenter(new THREE.Vector3()));
scene.add(switchProxy);
const latticeProxy = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.3, 0.1), hitProxy);
latticeProxy.position.set(0.4, 1.7, 0);
lattice.doorMesh.add(latticeProxy);

const pendantMeshes = pendants.meshes();
let current: Target | null = null;
let inspecting: number | null = null;

function aim(): Target | null {
  raycaster.setFromCamera(center, camera);
  raycaster.far = 12;
  const targets: THREE.Object3D[] = [shelf.groupProxies, switchProxy, latticeProxy, ...pendantMeshes];
  if (lattice.open || lattice.openAmount > 0) targets.push(lattice.doorway);
  const hits = raycaster.intersectObjects(targets, false);
  for (const h of hits) {
    if (h.object === lattice.doorway) return h.distance <= 2.8 ? { kind: 'lattice' } : null;
    if (h.object === shelf.groupProxies && h.instanceId !== undefined) {
      return h.distance <= 2.6 ? { kind: 'book', group: h.instanceId } : null;
    }
    if (h.object === switchProxy) return h.distance <= 2.6 ? { kind: 'shelf-switch' } : null;
    if (h.object === latticeProxy) return h.distance <= 2.8 ? { kind: 'lattice' } : null;
    if (h.object.userData.pendant !== undefined) return { kind: 'pendant', index: h.object.userData.pendant as number };
  }
  return null;
}

function promptText(t: Target): string {
  switch (t.kind) {
    case 'book':
      return 'Inspect the teal reference volumes';
    case 'shelf-switch':
      return shelf.lightsOn ? 'Turn shelf lighting off' : 'Turn shelf lighting on';
    case 'pendant':
      return pendants.list[t.index].on ? 'Switch this pendant off' : 'Switch this pendant on';
    case 'lattice':
      return lattice.open ? 'Close the lattice panel' : 'Open the lattice panel';
  }
}

function openInspect(group: number) {
  inspecting = group;
  shelf.toggleGroup(group);
  const g = shelf.groups[group];
  $('inspect-meta').textContent = `Shelf row ${g.row + 1} of 5 · ${g.count} volumes · pulled forward for viewing`;
  inspect.classList.add('show');
  player.frozen = true;
  player.controls.enabled = false;
}

function closeInspect() {
  if (inspecting === null) return;
  const g = shelf.groups[inspecting];
  if (g.target > 0.5) shelf.toggleGroup(inspecting);
  inspecting = null;
  inspect.classList.remove('show');
  player.frozen = false;
  player.controls.enabled = true;
}

function interact() {
  if (!player.controls.isLocked) return;
  if (inspecting !== null) {
    closeInspect();
    toast('Books returned to the shelf');
    return;
  }
  const t = current;
  if (!t) return;
  switch (t.kind) {
    case 'book':
      openInspect(t.group);
      break;
    case 'shelf-switch':
      toast(shelf.toggleLights() ? 'Shelf lighting on' : 'Shelf lighting off');
      break;
    case 'pendant':
      toast(pendants.toggle(t.index) ? 'Pendant on' : 'Pendant off');
      break;
    case 'lattice':
      if (lattice.toggle(player.pos.x, player.pos.y)) toast(lattice.open ? 'Lattice panel opening' : 'Lattice panel closing');
      else toast(lattice.blockedReason);
      break;
  }
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'KeyE') interact();
  // Browsers exit pointer lock on Esc natively; this covers environments that pass the key through.
  if (e.code === 'Escape' && player.controls.isLocked) player.controls.unlock();
  if (e.code === 'KeyR' && player.controls.isLocked) {
    closeInspect();
    player.reset();
    toast('Position reset');
  }
});
$('inspect-close').addEventListener('click', () => closeInspect());

// ---------------------------------------------------------------- loop
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Decrease-only resolution scaler: if the frame rate stays low, render fewer pixels.
const MAX_PR = Math.min(window.devicePixelRatio, num('pr', 1.5));
const MIN_PR = 0.75;
let slowSamples = 0;
let warmup = 4; // ignore the first ~2 s (shader compilation, texture upload)
function adaptResolution(fps: number) {
  if (warmup-- > 0 || params.has('pr') || document.hidden) return;
  slowSamples = fps < 48 ? slowSamples + 1 : 0;
  const pr = renderer.getPixelRatio();
  if (slowSamples >= 3 && pr > MIN_PR + 1e-3 && pr <= MAX_PR) {
    const next = Math.max(MIN_PR, pr - 0.25);
    renderer.setPixelRatio(next);
    composer.setPixelRatio(next);
    composer.setSize(window.innerWidth, window.innerHeight);
    slowSamples = 0;
  }
}

/** The doorway only fires after the player has stood outside it (so arriving never re-triggers). */
let doorwayArmed = false;
let wasInApproach = false;
const clock = new THREE.Clock();
let fpsAcc = 0;
let fpsFrames = 0;
let lastFps = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  player.update(dt);
  if (lattice.update(dt)) renderer.shadowMap.needsUpdate = true;
  shelf.update(dt);
  pendants.update(dt);

  // ---- portal: the doorway at the top of the atrium stair leads to Duke
  const px = player.pos.x;
  const pz = player.pos.y;
  if (stair.isAtDoorway(px, pz)) {
    if (doorwayArmed && player.controls.isLocked && !isTraveling()) {
      player.frozen = true;
      travel('duke', 'south-door');
    }
  } else doorwayArmed = true;
  const inApproach = stair.inApproach(px, pz);
  if (inApproach && !wasInApproach && player.controls.isLocked) toast('Stairs up to Duke · Gothic Reading Room');
  wasInApproach = inApproach;

  current = player.controls.isLocked && inspecting === null ? aim() : null;
  if (current) {
    prompt.innerHTML = `<kbd>E</kbd> ${promptText(current)}`;
    prompt.classList.add('show');
  } else if (inspecting !== null) {
    prompt.innerHTML = `<kbd>E</kbd> Put the books back`;
    prompt.classList.add('show');
  } else prompt.classList.remove('show');

  renderer.info.reset();
  composer.render();

  fpsAcc += dt;
  fpsFrames++;
  if (fpsAcc > 0.5) {
    lastFps = fpsFrames / fpsAcc;
    adaptResolution(lastFps);
    if (debug) fpsEl.textContent = `${lastFps.toFixed(0)} fps · ${renderer.info.render.calls} draws · pr ${renderer.getPixelRatio().toFixed(2)}`;
    fpsAcc = 0;
    fpsFrames = 0;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- test hook (used by the smoke test)
declare global {
  interface Window {
    __lib: unknown;
  }
}
window.__lib = {
  get state() {
    return {
      locked: player.controls.isLocked,
      x: player.pos.x,
      z: player.pos.y,
      eye: camera.position.y,
      yaw: player.yaw,
      target: current,
      inspecting,
      shelfLights: shelf.lightsOn,
      pendantsOn: pendants.list.map((p) => p.on),
      latticeOpen: lattice.open,
      latticeAmount: lattice.openAmount,
      floor: player.floor,
      arrival,
      traveling: isTraveling(),
      fps: lastFps,
      draws: renderer.info.render.calls,
      pixelRatio: renderer.getPixelRatio(),
    };
  },
  setPose: (x: number, z: number, yaw: number, pitch = 0) => player.setPose(x, z, yaw, pitch),
  latticePivot: () => lattice.pivotPoint,
  pendantPos: (i: number) => pendants.list[i].group.position.clone(),
  groups: () => shelf.groups.map((g) => ({ row: g.row, z: g.z, t: g.t })),
  /** Walk forward from spawn for `seconds` using a fixed timestep; returns metres travelled. */
  simulateWalk: (dt: number, seconds: number) => {
    player.setPose(-0.9, -7.0, Math.PI); // open aisle between table columns
    player.forced = { ix: 0, iz: 1 };
    const z0 = player.pos.y;
    for (let t = 0; t < seconds - 1e-9; t += dt) player.update(dt);
    player.forced = null;
    const d = player.pos.y - z0;
    player.reset();
    return d;
  },
  ceil: CEIL,
  stairTop: stair.topArrival,
};
