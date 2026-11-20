/* Start screen and pause menu. */
import { $ } from './util';
import { canvas } from './renderer';
import { ARTIFACTS } from './artifacts/data';
import { Sound } from './audio';
import { game, clearKeys } from './state';
import { resetPlayer } from './player';
import { requestLock } from './pointer';
import { updateCounter, toast } from './hud';
import { Ride, bullArt } from './ride';

export function pause() {
  if (game.state !== 'playing') return;
  game.state = 'paused';
  clearKeys();
  $('pause').hidden = false;
  updateCounter();
  $('resume').focus();
}
export function resume() {
  $('pause').hidden = true;
  game.state = 'playing';
  canvas.focus();
  Sound.resume();
  requestLock();
}

export function initScreens() {
  $('resume').addEventListener('click', resume);
  $('restart').addEventListener('click', function () {
    if (Ride.active) {
      Ride.active = false;
      Ride.phase = 'idle';
      bullArt().bull.rotation.set(0, 0, 0);
    }
    ARTIFACTS.forEach(function (a) {
      a.found = false;
    });
    game.found = 0;
    updateCounter();
    resetPlayer();
    resume();
    toast('The room has been reset', 2200);
  });
  $('enter').addEventListener('click', function () {
    $('start').hidden = true;
    $('hud').hidden = false;
    game.state = 'playing';
    resetPlayer();
    Sound.init();
    Sound.resume();
    canvas.focus();
    requestLock();
    setTimeout(function () {
      $('tutorial').classList.add('off');
    }, 14000);
  });
}
