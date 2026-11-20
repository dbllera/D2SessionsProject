/* The south door is the way back to the DKU library (see ../../shared/portal.ts).
   When the player is close to it and facing it, it takes the crosshair prompt; E travels. */
import { $ } from './util';
import { HL } from './dims';
import { game, player } from './state';
import { travel } from '../../shared/portal';

/** Centre of the door leaf on the south wall (room.ts "South door and clock"). */
const DOOR_X = 0,
  DOOR_Z = HL;
const REACH = 2.1;
const PROMPT_ID = '__door';

export function updatePortalDoor() {
  var dx = DOOR_X - player.x,
    dz = DOOR_Z - player.z,
    d = Math.hypot(dx, dz),
    fx = -Math.sin(player.yaw),
    fz = -Math.cos(player.yaw);
  var facing = d < 0.01 ? 1 : (dx * fx + dz * fz) / d;
  // The door wins over artifacts: it is what is straight ahead when you stand at it.
  game.door = game.state === 'playing' && d <= REACH && Math.abs(player.x - DOOR_X) < 1.3 && facing > 0.72;
  if (!game.door) {
    if (game.lastPrompt === PROMPT_ID) game.lastPrompt = null; // let focus.ts redraw its own prompt
    return;
  }
  game.focus = null;
  $('prompt').classList.add('on');
  $('cross').classList.add('hot');
  if (game.lastPrompt !== PROMPT_ID) {
    game.lastPrompt = PROMPT_ID;
    $('promptMain').innerHTML = '<kbd>E</kbd> Return to the DKU Library';
    $('promptTheme').textContent = 'Back down the stairs to Duke Kunshan';
  }
}

export function useDoor() {
  game.pendingExit = true; // leaving pointer lock is ours, not a pause
  game.state = 'paused';
  game.door = false;
  travel('dku', 'stairs-top');
}
