/* Artifact side panel: opens on E, renders the artifact's media block, plays recordings. */
import { $, esc } from './util';
import { canvas } from './renderer';
import { ARTIFACTS } from './artifacts/data';
import { FOOD } from './artifacts/foodTextures';
import { GSOY_PHOTO } from './artifacts/photos';
import { Sound, Speech } from './audio';
import { game, clearKeys } from './state';
import { requestLock } from './pointer';
import { updateCounter, toast } from './hud';
import { openRideMenu } from './ride';
import type { Artifact } from './artifacts/types';

function renderMedia(a: Artifact) {
  var m = a.media,
    h = '';
  if (m.type === 'speech') {
    if (a.id === 'bull')
      h +=
        '<div class="card"><h3>Ride the bull</h3><p class="fine" style="margin:0">Climb on and try to beat two point three seconds. Eight seconds makes you a legend.</p><div class="row"><button class="btn small" data-act="ride">Ride the bull</button><span class="fine">or press <kbd>R</kbd> beside it</span></div></div>';
    if (m.motifs)
      h +=
        '<div class="chips">' +
        m.motifs
          .map(function (x) {
            return '<span>' + esc(x) + '</span>';
          })
          .join('') +
        '</div>';
    h +=
      '<div class="card"><h3>Recording</h3><div class="row"><button class="btn small" data-act="speak">' +
      esc(m.label) +
      '</button><button class="btn ghost small" data-act="stop">Stop</button></div><div class="status" id="mStatus">' +
      (Speech.ok
        ? 'Read aloud by your browser’s voice.'
        : 'This browser cannot read aloud, so the transcript is below.') +
      '</div></div>';
    h +=
      '<div><div class="eyebrow">Transcript</div><p>' +
      esc(
        m.parts
          .map(function (p) {
            return p.text;
          })
          .join(' '),
      ) +
      '</p></div>';
  } else if (m.type === 'photo') {
    h +=
      '<figure class="photo"><img alt="Soup dumplings and bao in bamboo steamers" src="' +
      GSOY_PHOTO +
      '"><figcaption class="fine">' +
      esc(m.caption) +
      '</figcaption></figure>';
    h +=
      '<div class="card"><h3>Recording</h3><div class="row"><button class="btn small" data-act="speak">Listen to the story</button><button class="btn ghost small" data-act="stop">Stop</button></div><div class="status" id="mStatus"></div></div>';
    h +=
      '<div class="story">' +
      m.paragraphs
        .map(function (p) {
          return '<p>' + esc(p) + '</p>';
        })
        .join('') +
      '</div>';
  } else if (m.type === 'menu') {
    h +=
      '<figure class="photo"><img alt="I95 Burger menu: burgers and add-ons with prices in yuan" src="' +
      (a.menuTex.image as HTMLCanvasElement).toDataURL('image/jpeg', 0.9) +
      '"><figcaption class="fine">The I95 Burger menu, redrawn from the truck\u2019s board.</figcaption></figure>';
    h +=
      '<div class="card"><h3>Recording</h3><div class="row"><button class="btn small" data-act="speak">Listen to the story</button><button class="btn ghost small" data-act="stop">Stop</button></div><div class="status" id="mStatus"></div></div>';
    h +=
      '<div class="story">' +
      m.paragraphs
        .map(function (p) {
          return '<p>' + esc(p) + '</p>';
        })
        .join('') +
      '</div>';
  } else if (m.type === 'letter') {
    h += '<div class="letter">' + esc(m.text) + '</div>';
  } else if (m.type === 'capsule') {
    h +=
      '<div><div class="eyebrow">Shared motifs</div><div class="chips" style="margin-top:.5rem">' +
      m.motifs
        .map(function (x) {
          return '<span>' + esc(x) + '</span>';
        })
        .join('') +
      '</div></div>';
    m.sides.forEach(function (s, i) {
      h +=
        '<div class="card"><h3 class="' +
        s.cls +
        '">' +
        esc(s.place) +
        '</h3><div class="fine">' +
        esc(s.who) +
        ', fictional</div><p>' +
        esc(s.text) +
        '</p><div class="row"><button class="btn ghost small" data-act="side" data-i="' +
        i +
        '">Listen</button></div></div>';
    });
    h +=
      '<div class="row"><button class="btn ghost small" data-act="stop">Stop audio</button><span class="status" id="mStatus"></span></div>';
  } else if (m.type === 'gallery') {
    h +=
      '<div class="gallery">' +
      m.items
        .map(function (it, i) {
          return (
            '<figure><img alt="Illustrated placeholder for ' +
            esc(it.title) +
            '" src="' +
            (FOOD[i].image as HTMLCanvasElement).toDataURL('image/jpeg', 0.85) +
            '"><figcaption><b>' +
            esc(it.title) +
            '</b><span class="fine ' +
            it.cls +
            '">' +
            esc(it.from) +
            '</span><p>' +
            esc(it.text) +
            '</p></figcaption></figure>'
          );
        })
        .join('') +
      '</div>';
  } else if (m.type === 'qa') {
    h +=
      '<div class="qa">' +
      m.items
        .map(function (it) {
          return (
            '<div><small class="' +
            it.qc +
            '">' +
            esc(it.qf) +
            '</small><div class="q">' +
            esc(it.q) +
            '</div><div class="a"><small class="' +
            it.ac +
            '">' +
            esc(it.af) +
            '</small><div>' +
            esc(it.a) +
            '</div></div></div>'
          );
        })
        .join('') +
      '</div>';
  } else if (m.type === 'tracks') {
    h += m.items
      .map(function (it, i) {
        return (
          '<div class="card"><div class="track"><button class="btn small" data-act="track" data-i="' +
          i +
          '">Play</button><div class="t"><b>' +
          esc(it.title) +
          '</b><span class="' +
          it.cls +
          '">' +
          esc(it.from) +
          '</span></div></div><p class="fine">' +
          esc(it.text) +
          '</p></div>'
        );
      })
      .join('');
    h += '<div class="status" id="mStatus">' + (Sound.muted ? 'Sound is muted. Press M to turn it on.' : '') + '</div>';
  }
  return h;
}
export function stopMedia() {
  Speech.stop();
  Sound.stopTrack();
  Array.prototype.forEach.call(document.querySelectorAll('#pBody [data-act="track"]'), function (b) {
    b.textContent = 'Play';
  });
}
export function markFound(a) {
  if (a.found) return;
  a.found = true;
  game.found++;
  updateCounter();
  if (game.found === ARTIFACTS.length)
    setTimeout(function () {
      toast('All ' + ARTIFACTS.length + ' artifacts discovered', 5000);
    }, 600);
}
export function hidePanel() {
  game.open = null;
  $('panel').classList.remove('open');
  $('panel').setAttribute('aria-hidden', 'true');
  $('cross').style.opacity = '1';
}
export function openPanel(a) {
  game.state = 'panel';
  game.open = a;
  clearKeys();
  markFound(a);
  $('pEyebrow').textContent = 'Artifact ' + a.no + '  ·  ' + a.theme;
  $('pTitle').textContent = a.title;
  $('pMeta').innerHTML =
    '<dt>Origin</dt><dd>' +
    esc(a.origin) +
    '</dd><dt>Theme</dt><dd>' +
    esc(a.theme) +
    '</dd><dt>Display</dt><dd>' +
    esc(a.format) +
    '</dd>';
  $('pBody').innerHTML = '<p>' + esc(a.description) + '</p>' + renderMedia(a);
  $('pNote').textContent = a.real
    ? 'Real story from a D2 team member'
    : 'Prototype placeholder, fictional sample content';
  $('pBody').scrollTop = 0;
  $('pFoot').textContent = a.no + ' of ' + (ARTIFACTS.length < 10 ? '0' : '') + ARTIFACTS.length;
  $('panel').classList.add('open');
  $('panel').setAttribute('aria-hidden', 'false');
  $('prompt').classList.remove('on');
  $('cross').style.opacity = '0';
  if (document.pointerLockElement === canvas) {
    game.pendingExit = true;
    document.exitPointerLock();
  }
}
export function closePanel() {
  if (game.state !== 'panel') return;
  stopMedia();
  game.open = null;
  game.state = 'playing';
  $('panel').classList.remove('open');
  $('panel').setAttribute('aria-hidden', 'true');
  $('cross').style.opacity = '1';
  canvas.focus();
  requestLock();
}

export function initPanel() {
  $('pBody').addEventListener('click', function (e) {
    var b = (e.target as Element).closest('[data-act]');
    if (!b || !game.open) return;
    var m = game.open.media,
      st = $('mStatus'),
      act = b.getAttribute('data-act'),
      i = +b.getAttribute('data-i');
    Sound.resume();
    function say(parts) {
      stopMedia();
      if (Sound.muted) {
        if (st) st.textContent = 'Sound is muted. Press M to turn it on.';
        return;
      }
      var ok = Speech.speak(parts, function () {
        if (st) st.textContent = 'Finished.';
      });
      if (st) st.textContent = ok ? 'Playing…' : 'This browser cannot read aloud. The text is on this panel.';
    }
    if (act === 'ride') {
      stopMedia();
      hidePanel();
      openRideMenu();
      return;
    }
    if (act === 'speak') say(m.parts);
    else if (act === 'side') say([m.sides[i]]);
    else if (act === 'stop') {
      stopMedia();
      if (st) st.textContent = 'Stopped.';
    } else if (act === 'track') {
      var playing = b.textContent === 'Stop';
      stopMedia();
      if (playing) return;
      if (Sound.muted) {
        if (st) st.textContent = 'Sound is muted. Press M to turn it on.';
        return;
      }
      if (
        Sound.playTrack(i, function () {
          b.textContent = 'Play';
        })
      ) {
        b.textContent = 'Stop';
        if (st) st.textContent = '';
      } else if (st) st.textContent = 'This browser could not start audio.';
    }
  });
  $('pClose').addEventListener('click', closePanel);
}
