import * as THREE from 'three';

/** Deterministic PRNG so the generated textures and layout are stable between reloads. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

function finish(c: HTMLCanvasElement, color: boolean, repeat = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Charcoal porcelain floor tile, 4 x 4 tiles per texture repeat.
 * Returns a color map and a roughness map (grout is rougher than the semi-polished tile).
 */
export function floorTextures(): { map: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
  const S = 1024;
  const n = 4;
  const cell = S / n;
  const grout = 2;
  const [c, ctx] = canvas(S, S);
  const [rc, rctx] = canvas(S, S);
  const r = rng(11);
  ctx.fillStyle = '#c4c0b8';
  ctx.fillRect(0, 0, S, S);
  rctx.fillStyle = '#f0f0f0';
  rctx.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = 52 + Math.floor((r() - 0.5) * 10);
      ctx.fillStyle = `rgb(${v + 1},${v},${v - 2})`;
      ctx.fillRect(i * cell + grout / 2, j * cell + grout / 2, cell - grout, cell - grout);
      // faint cloudy mottling typical of through-body porcelain
      for (let k = 0; k < 14; k++) {
        const x = i * cell + r() * cell;
        const y = j * cell + r() * cell;
        const rad = 20 + r() * 60;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const a = 0.05 + r() * 0.05;
        g.addColorStop(0, r() > 0.5 ? `rgba(80,78,74,${a})` : `rgba(30,30,30,${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.save();
        ctx.beginPath();
        ctx.rect(i * cell + grout / 2, j * cell + grout / 2, cell - grout, cell - grout);
        ctx.clip();
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        ctx.restore();
      }
      const rv = 95 + Math.floor(r() * 30);
      rctx.fillStyle = `rgb(${rv},${rv},${rv})`;
      rctx.fillRect(i * cell + grout / 2, j * cell + grout / 2, cell - grout, cell - grout);
    }
  }
  noise(ctx, S, S, 10, 3);
  noise(rctx, S, S, 30, 4);
  return { map: finish(c, true), roughness: finish(rc, false) };
}

/** Wood grain. `vertical` puts the grain along the texture's v axis. */
export function woodTexture(base: string, dark: string, seed: number, opts: { size?: number; streaks?: number; vertical?: boolean } = {}): THREE.CanvasTexture {
  const S = opts.size ?? 512;
  const [c, ctx] = canvas(S, S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const r = rng(seed);
  const streaks = opts.streaks ?? 160;
  ctx.strokeStyle = dark;
  for (let i = 0; i < streaks; i++) {
    ctx.globalAlpha = 0.04 + r() * 0.14;
    ctx.lineWidth = 0.6 + r() * 2.4;
    const y0 = r() * S;
    const amp = 2 + r() * 8;
    const freq = 1 + r() * 3;
    const ph = r() * Math.PI * 2;
    ctx.beginPath();
    for (let x = -4; x <= S + 4; x += 8) {
      const y = y0 + Math.sin((x / S) * Math.PI * 2 * freq + ph) * amp;
      if (x === -4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  noise(ctx, S, S, 12, seed + 1);
  if (opts.vertical) {
    const [c2, ctx2] = canvas(S, S);
    ctx2.translate(S / 2, S / 2);
    ctx2.rotate(Math.PI / 2);
    ctx2.drawImage(c, -S / 2, -S / 2);
    return finish(c2, true);
  }
  return finish(c, true);
}

/**
 * Five-segment, book-matched walnut top with an inset ring, as on the lobed round tables (IMG_9798).
 * UVs: planar, u = x/(2R)+0.5, v = z/(2R)+0.5.
 */
export function tableTopTexture(): THREE.CanvasTexture {
  const S = 1024;
  const [c, ctx] = canvas(S, S);
  const wood = woodTexture('#6a3f28', '#2c160c', 21, { size: 512, streaks: 220 }).image as HTMLCanvasElement;
  ctx.fillStyle = '#5e3824';
  ctx.fillRect(0, 0, S, S);
  const cx = S / 2;
  for (let k = 0; k < 5; k++) {
    const a0 = (k / 5) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((k + 1) / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.arc(cx, cx, S, a0, a1);
    ctx.closePath();
    ctx.clip();
    ctx.translate(cx, cx);
    ctx.rotate((a0 + a1) / 2 + Math.PI / 2);
    ctx.globalAlpha = 1;
    ctx.drawImage(wood, -S, -S, S * 2, S * 2);
    ctx.fillStyle = k % 2 ? 'rgba(255,220,180,0.06)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(-S, -S, S * 2, S * 2);
    ctx.restore();
  }
  // seams between segments
  ctx.strokeStyle = 'rgba(30,15,8,0.55)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.lineTo(cx + Math.cos(a) * S * 0.41, cx + Math.sin(a) * S * 0.41);
    ctx.stroke();
  }
  // inset groove ring and a darker outer lobed band
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(25,12,6,0.75)';
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.41, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(40,20,10,0.25)';
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.5, 0, Math.PI * 2);
  ctx.arc(cx, cx, S * 0.413, 0, Math.PI * 2, true);
  ctx.fill();
  return finish(c, true, false);
}

export function fabricTexture(base: string, seed: number): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const r = rng(seed);
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(r() * S, r() * S, 1 + r() * 3, 1);
  }
  noise(ctx, S, S, 18, seed + 7);
  return finish(c, true);
}

/** Pale plaster with a soft warm wash near the top, used as an emissive gradient for the LED cove. */
export function wallWashTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(8, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgb(255,226,180)');
  g.addColorStop(0.12, 'rgb(120,100,76)');
  g.addColorStop(0.4, 'rgb(28,24,20)');
  g.addColorStop(1, 'rgb(0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  const t = finish(c, true, false);
  return t;
}

export function plasterTexture(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = canvas(S, S);
  ctx.fillStyle = '#cfc6b9';
  ctx.fillRect(0, 0, S, S);
  noise(ctx, S, S, 7, 99);
  return finish(c, true);
}

/** Warm cubby back-panel glow: bright under each shelf's LED strip, fading downward. */
export function cubbyGlowTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgb(255,214,150)');
  g.addColorStop(0.1, 'rgb(255,190,120)');
  g.addColorStop(0.55, 'rgb(170,108,52)');
  g.addColorStop(1, 'rgb(96,58,26)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  return finish(c, true);
}

/** Silk lantern: horizontal ribs and fine vertical frame wires (IMG_9806 / IMG_9810). */
export function lanternTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#fff6e4';
  ctx.fillRect(0, 0, W, H);
  // subtle silk threads
  const r = rng(5);
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(200,180,140,${0.04 + r() * 0.05})`;
    ctx.fillRect(0, r() * H, W, 1);
  }
  ctx.fillStyle = 'rgba(150,128,96,0.55)';
  const bands = 7;
  for (let b = 1; b < bands; b++) ctx.fillRect(0, (b / bands) * H - 3, W, 6);
  ctx.fillStyle = 'rgba(160,140,110,0.35)';
  const ribs = 12;
  for (let k = 0; k < ribs; k++) ctx.fillRect((k / ribs) * W, 0, 3, H);
  return finish(c, true);
}

/** Night exterior seen through the glazed wall: dark sky, campus building silhouettes, a few lights. */
export function nightTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const [c, ctx] = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#060a14');
  g.addColorStop(0.6, '#111a2c');
  g.addColorStop(1, '#1a2233');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = rng(77);
  let x = 0;
  while (x < W) {
    const bw = 120 + r() * 380;
    const bh = 180 + r() * 380;
    const top = H - bh - 120;
    ctx.fillStyle = `rgb(${18 + r() * 10},${22 + r() * 10},${32 + r() * 10})`;
    ctx.fillRect(x, top, bw, bh + 120);
    for (let wy = top + 20; wy < H - 150; wy += 34) {
      for (let wx = x + 12; wx < x + bw - 16; wx += 26) {
        if (r() < 0.07) {
          ctx.fillStyle = r() > 0.4 ? 'rgba(255,226,170,0.85)' : 'rgba(190,220,255,0.7)';
          ctx.fillRect(wx, wy, 12, 16);
        }
      }
    }
    x += bw + 20 + r() * 120;
  }
  // landscaping band and path lights
  ctx.fillStyle = '#0b130d';
  ctx.fillRect(0, H - 130, W, 130);
  for (let i = 0; i < 14; i++) {
    const lx = r() * W;
    const gl = ctx.createRadialGradient(lx, H - 120, 0, lx, H - 120, 40);
    gl.addColorStop(0, 'rgba(255,230,180,0.9)');
    gl.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(lx - 40, H - 160, 80, 80);
  }
  return finish(c, true, false);
}

/** Bright, slightly cool atrium surface (behind the lattice screens, IMG_9808 / IMG_9809). */
export function atriumTexture(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = canvas(S, S);
  ctx.fillStyle = '#eef0f1';
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(150,156,162,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i / 8) * S);
    ctx.lineTo(S, (i / 8) * S);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((i / 8) * S, 0);
    ctx.lineTo((i / 8) * S, S);
    ctx.stroke();
  }
  return finish(c, true);
}
