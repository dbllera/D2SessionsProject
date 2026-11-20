/* Keyboard and mouse input. The keydown handler routes keys by game.state. */
import { canvas } from './renderer';
import { Sound } from './audio';
import { game, keys, clearKeys } from './state';
import { look } from './player';
import { useDragMode, requestLock } from './pointer';
import { toast } from './hud';
import { openPanel, closePanel } from './panel';
import { pause } from './screens';
import { useDoor } from './portalDoor';
import { Ride, openRideMenu, closeRideMenu, startRide, throwRider, endRide } from './ride';

var MOVE = {
  KeyW: 1,
  KeyA: 1,
  KeyS: 1,
  KeyD: 1,
  ArrowUp: 1,
  ArrowDown: 1,
  ArrowLeft: 1,
  ArrowRight: 1,
  ShiftLeft: 1,
  ShiftRight: 1,
  Space: 1,
};

export function initInput() {
  document.addEventListener('pointerlockerror', function () {
    if (game.everLocked) {
      if (game.state === 'playing') toast('Click the room to look around again', 2200);
    } else useDragMode();
  });
  document.addEventListener('pointerlockchange', function () {
    if (document.pointerLockElement === canvas) {
      game.everLocked = true;
    } else if (game.pendingExit) {
      game.pendingExit = false;
    } else if (game.lockMode && game.state === 'playing') pause();
  });
  var dragging = false;
  canvas.addEventListener('mousedown', function () {
    if (game.state !== 'playing') return;
    if (game.lockMode && document.pointerLockElement !== canvas) requestLock();
    dragging = true;
    if (!game.lockMode) canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', function () {
    dragging = false;
    if (!game.lockMode) canvas.style.cursor = 'grab';
  });
  document.addEventListener('mousemove', function (e) {
    if (game.state !== 'playing') return;
    if (document.pointerLockElement === canvas) look(e.movementX || 0, e.movementY || 0);
    else if (dragging) look(-(e.movementX || 0) * 1.4, -(e.movementY || 0) * 1.4);
  });
  window.addEventListener('keydown', function (e) {
    if (game.state === 'start') {
      return;
    }
    if (game.state === 'riding') {
      if (MOVE[e.code]) e.preventDefault();
      keys[e.code] = true;
      if (e.code === 'Escape' && !e.repeat) throwRider(true);
      return;
    }
    if (game.state === 'rideMenu') {
      if (e.code === 'Escape') closeRideMenu();
      return;
    }
    if (game.state === 'rideResult') {
      if (e.code === 'Escape') endRide();
      else if (e.code === 'KeyR' && !e.repeat) startRide(Ride.level);
      return;
    }
    if (MOVE[e.code] && game.state === 'playing') e.preventDefault();
    keys[e.code] = true;
    if (e.repeat) return;
    if (e.code === 'KeyE') {
      if (game.state === 'playing' && game.door) useDoor();
      else if (game.state === 'playing' && game.focus) openPanel(game.focus);
      else if (game.state === 'panel') closePanel();
    } else if (e.code === 'Escape') {
      if (game.state === 'panel') closePanel();
      else if (game.state === 'playing' && document.pointerLockElement !== canvas) pause();
    } else if (e.code === 'KeyR') {
      if (game.state === 'playing' && game.focus && game.focus.id === 'bull') openRideMenu();
    } else if (e.code === 'KeyM') {
      Sound.setMuted(!Sound.muted);
      toast(Sound.muted ? 'Sound off' : 'Sound on', 1400);
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.code] = false;
  });
  window.addEventListener('blur', function () {
    clearKeys();
  });
}
