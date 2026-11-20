/* HUD: discovered counter and pips, toast messages. */
import { $ } from './util';
import { ARTIFACTS } from './artifacts/data';
import { game } from './state';

export function updateCounter() {
  $('count').textContent = game.found + ' / ' + ARTIFACTS.length;
  Array.prototype.forEach.call($('pips').children, function (el, i) {
    el.className = ARTIFACTS[i].found ? 'on' : '';
  });
  $('pauseCount').textContent = game.found + ' of ' + ARTIFACTS.length + ' artifacts discovered';
}
var toastT;
export function toast(msg, ms) {
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(function () {
    t.classList.remove('on');
  }, ms || 3200);
}

export function initHud() {
  var pips = $('pips');
  ARTIFACTS.forEach(function () {
    pips.appendChild(document.createElement('i'));
  });
  updateCounter();
}
