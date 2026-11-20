/* Audio: room ambience, footsteps, generated music, bull motor, and browser speech for recordings. */
import { game, room } from './state';

export const Sound = {
  ctx: null as AudioContext,
  master: null as GainNode,
  muted: false,
  noise: null as AudioBuffer,
  track: null,
  timer: null,
  init: function () {
    if (this.ctx) return;
    try {
      var C = window.AudioContext || (window as any).webkitAudioContext;
      if (!C) return;
      var ctx = (this.ctx = new C());
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(ctx.destination);
      var len = ctx.sampleRate * 2,
        buf = ctx.createBuffer(1, len, ctx.sampleRate),
        d = buf.getChannelData(0),
        last = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
      var wb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate),
        wd = wb.getChannelData(0);
      for (i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
      this.noise = wb;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      var g = ctx.createGain();
      g.gain.value = 0.07;
      src.connect(lp);
      lp.connect(g);
      g.connect(this.master);
      src.start();
      this.schedule();
    } catch (e) {
      this.ctx = null;
    }
  },
  resume: function () {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
  },
  setMuted: function (m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
    if (m) Speech.stop();
  },
  burst: function (freq, q, gain, dur, type, pos) {
    var ctx = this.ctx;
    if (!ctx || !this.noise) return;
    var s = ctx.createBufferSource();
    s.buffer = this.noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    var f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    var g = ctx.createGain(),
      t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    if (pos) {
      var p = ctx.createPanner();
      p.panningModel = 'equalpower';
      p.distanceModel = 'inverse';
      p.refDistance = 2.5;
      p.rolloffFactor = 1.2;
      if (p.positionX) {
        p.positionX.value = pos[0];
        p.positionY.value = pos[1];
        p.positionZ.value = pos[2];
      } else p.setPosition(pos[0], pos[1], pos[2]);
      g.connect(p);
      p.connect(this.master);
    } else g.connect(this.master);
    s.start(t, Math.random() * 0.5, dur + 0.05);
  },
  schedule: function () {
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(
      function () {
        if (game.state === 'playing' || game.state === 'panel') {
          var tb = room.tables[Math.floor(Math.random() * room.tables.length)],
            p = [tb.x + (Math.random() - 0.5), 0.8, tb.z];
          if (Math.random() < 0.7) self.burst(3200, 0.8, 0.5, 0.32, 'bandpass', p);
          else self.burst(160, 1.2, 0.6, 0.2, 'lowpass', p);
        }
        self.schedule();
      },
      5000 + Math.random() * 9000,
    );
  },
  step: function () {
    this.burst(380, 0.7, 0.16, 0.11, 'lowpass', null);
  },
  motor: null,
  motorStart: function () {
    var ctx = this.ctx;
    if (!ctx || this.motor) return;
    try {
      var o = ctx.createOscillator(),
        f = ctx.createBiquadFilter(),
        g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 42;
      f.type = 'lowpass';
      f.frequency.value = 240;
      g.gain.value = 0;
      g.gain.setTargetAtTime(0.08, ctx.currentTime, 0.2);
      o.connect(f);
      f.connect(g);
      g.connect(this.master);
      o.start();
      this.motor = { o: o, g: g };
    } catch (e) {}
  },
  motorSet: function (v) {
    if (this.motor)
      try {
        this.motor.o.frequency.setTargetAtTime(42 + v * 16, this.ctx.currentTime, 0.1);
      } catch (e) {}
  },
  motorStop: function () {
    var m = this.motor;
    if (!m) return;
    this.motor = null;
    try {
      m.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    } catch (e) {}
    setTimeout(function () {
      try {
        m.o.stop();
      } catch (e) {}
    }, 900);
  },
  thud: function () {
    this.burst(110, 1, 0.9, 0.4, 'lowpass', null);
    this.burst(420, 0.7, 0.3, 0.25, 'lowpass', null);
  },
  cheer: function () {
    var s = this;
    [0, 160, 380, 640, 900].forEach(function (d) {
      setTimeout(function () {
        s.burst(1200 + Math.random() * 1000, 0.5, 0.32, 1.3, 'bandpass', null);
      }, d);
    });
  },
  listener: function (pos, fx, fz) {
    var ctx = this.ctx;
    if (!ctx) return;
    var l = ctx.listener;
    if (l.positionX) {
      l.positionX.value = pos.x;
      l.positionY.value = pos.y;
      l.positionZ.value = pos.z;
      l.forwardX.value = fx;
      l.forwardY.value = 0;
      l.forwardZ.value = fz;
      l.upX.value = 0;
      l.upY.value = 1;
      l.upZ.value = 0;
    } else if (l.setPosition) {
      l.setPosition(pos.x, pos.y, pos.z);
      l.setOrientation(fx, 0, fz, 0, 1, 0);
    }
  },
  TRACKS: [
    {
      bpm: 76,
      wave: 'sine',
      over: 2.76,
      decay: 2.4,
      notes: [
        [62, 2],
        [66, 2],
        [69, 2],
        [74, 4],
        [73, 2],
        [69, 2],
        [66, 2],
        [62, 4],
      ],
    },
    {
      bpm: 96,
      wave: 'triangle',
      over: 2,
      decay: 0.9,
      notes: [
        [69, 1],
        [72, 1],
        [74, 1],
        [76, 2],
        [74, 1],
        [72, 1],
        [69, 2],
        [67, 1],
        [69, 1],
        [72, 2],
        [69, 3],
      ],
    },
    {
      bpm: 88,
      wave: 'triangle',
      over: 2,
      decay: 1.2,
      echo: true,
      notes: [
        [64, 1],
        [67, 1],
        [71, 2],
        [69, 1],
        [67, 1],
        [64, 2],
        [62, 1],
        [64, 1],
        [67, 2],
        [64, 4],
      ],
    },
  ],
  playTrack: function (i, onend) {
    this.stopTrack();
    var ctx = this.ctx;
    if (!ctx) return false;
    var tr = this.TRACKS[i],
      out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(this.master);
    var beat = 60 / tr.bpm,
      t = ctx.currentTime + 0.08,
      nodes = [];
    function note(midi, at, dur, wave, gain) {
      var f = 440 * Math.pow(2, (midi - 69) / 12);
      [
        [f, gain],
        [f * tr.over, gain * 0.22],
      ].forEach(function (o) {
        var osc = ctx.createOscillator(),
          g = ctx.createGain();
        osc.type = wave;
        osc.frequency.value = o[0];
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(o[1], at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur * tr.decay + 0.3);
        osc.connect(g);
        g.connect(out);
        osc.start(at);
        osc.stop(at + dur * tr.decay + 0.35);
        nodes.push(osc);
      });
    }
    for (var rpt = 0; rpt < 2; rpt++)
      tr.notes.forEach(function (n) {
        note(n[0], t, n[1] * beat, tr.wave, 0.22);
        if (tr.echo) note(n[0] - 12, t + beat * 0.5, n[1] * beat, 'sine', 0.16);
        t += n[1] * beat;
      });
    var self = this,
      total = t - ctx.currentTime + 1.2;
    this.track = {
      out: out,
      nodes: nodes,
      to: setTimeout(function () {
        self.track = null;
        if (onend) onend();
      }, total * 1000),
    };
    return true;
  },
  stopTrack: function () {
    if (!this.track) return;
    var tk = this.track;
    this.track = null;
    clearTimeout(tk.to);
    try {
      tk.out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    } catch (e) {}
    setTimeout(function () {
      tk.nodes.forEach(function (n) {
        try {
          n.stop();
        } catch (e) {}
      });
      try {
        tk.out.disconnect();
      } catch (e) {}
    }, 300);
  },
};
export const Speech = {
  ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function',
  speak: function (parts, onend) {
    if (!this.ok || Sound.muted) return false;
    try {
      window.speechSynthesis.cancel();
      parts.forEach(function (p, i) {
        var u = new SpeechSynthesisUtterance(p.text);
        u.rate = 0.94;
        u.pitch = p.pitch || 1;
        u.lang = 'en-US';
        if (i === parts.length - 1) {
          u.onend = function () {
            if (onend) onend();
          };
          u.onerror = function () {
            if (onend) onend(true);
          };
        }
        window.speechSynthesis.speak(u);
      });
      return true;
    } catch (e) {
      return false;
    }
  },
  pause: function () {
    try {
      window.speechSynthesis.pause();
    } catch (e) {}
  },
  resume: function () {
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
  },
  stop: function () {
    if (!this.ok) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  },
};
