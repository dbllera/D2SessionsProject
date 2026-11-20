/* Pointer lock, with drag-to-look when the browser refuses it. */
import { $ } from './util';
import { canvas } from './renderer';
import { game } from './state';
import { toast } from './hud';

export function useDragMode() {
  game.lockMode = false;
  $('lookHint').textContent = 'Click and drag to look around';
  canvas.style.cursor = 'grab';
}
export function requestLock() {
  if (!game.lockMode) return;
  var fail = function () {
    if (game.everLocked) {
      if (game.state === 'playing') toast('Click the room to look around again', 2200);
    } else useDragMode();
  };
  try {
    if (!canvas.requestPointerLock) {
      useDragMode();
      return;
    }
    var p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(fail);
  } catch (e) {
    fail();
  }
}
export function releaseMouse() {
  if (document.pointerLockElement === canvas) {
    game.pendingExit = true;
    document.exitPointerLock();
  }
}
