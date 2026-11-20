/* Canvas drawing of the I95 Burger menu board (artifact 10). */
import { speckle } from '../textures';
import type { ArtifactMedia } from './types';

export function drawMenu(c: CanvasRenderingContext2D, w: number, h: number, m: ArtifactMedia) {
  c.fillStyle = '#f3efe6';
  c.fillRect(0, 0, w, h);
  speckle(c, w, h, 2500, 171, '120,100,80', 0.05, 2);
  c.fillStyle = '#7a1620';
  c.font = 'bold 64px Georgia,serif';
  c.fillText('I95 BURGER', 40, 86);
  c.fillStyle = '#e0b43a';
  c.fillRect(42, 100, 250, 34);
  c.fillStyle = '#4a0f14';
  c.font = 'bold 20px Arial,sans-serif';
  c.fillText('AMERICAN HANDMADE BEEF BURGER', 50, 124);
  c.fillStyle = '#7a1620';
  c.beginPath();
  c.moveTo(30, 160);
  c.lineTo(w * 0.6, 160);
  c.lineTo(w * 0.6 - 16, 182);
  c.lineTo(w * 0.6, 204);
  c.lineTo(30, 204);
  c.fill();
  c.fillStyle = '#f6e9d0';
  c.font = 'italic bold 26px Georgia,serif';
  c.fillText('Burgers  \u4e3b\u7ebf\u4ea7\u54c1', 46, 191);
  var y = 252;
  m.items.forEach(function (it) {
    c.fillStyle = '#2a1a14';
    c.font = 'bold 26px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
    c.fillText(it[0], 46, y);
    c.fillStyle = '#6b5a4a';
    c.font = '19px Arial,sans-serif';
    c.fillText(it[1], 46, y + 26);
    c.fillStyle = '#7a1620';
    c.font = 'bold 28px Arial,sans-serif';
    c.textAlign = 'right';
    c.fillText('\u00a5' + it[2], w * 0.6, y + 8);
    c.textAlign = 'left';
    c.strokeStyle = 'rgba(120,90,70,0.35)';
    c.setLineDash([4, 6]);
    c.beginPath();
    c.moveTo(46, y + 40);
    c.lineTo(w * 0.6, y + 40);
    c.stroke();
    c.setLineDash([]);
    y += 72;
  });
  var bx = w * 0.66,
    by = 170,
    bw = w - bx - 30,
    bh = 330;
  c.strokeStyle = '#7a1620';
  c.lineWidth = 3;
  c.setLineDash([8, 6]);
  c.strokeRect(bx, by, bw, bh);
  c.setLineDash([]);
  c.fillStyle = '#7a1620';
  c.font = 'bold 24px Arial,sans-serif';
  c.fillText('ADD-ONS  \u52a0\u6599', bx + 18, by + 40);
  var ey = by + 86;
  m.extras.forEach(function (e) {
    c.fillStyle = '#2a1a14';
    c.font = '22px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
    c.fillText(e[0] + '  ' + e[1], bx + 18, ey);
    c.textAlign = 'right';
    c.fillStyle = '#7a1620';
    c.font = 'bold 22px Arial,sans-serif';
    c.fillText('\u00a5' + e[2], bx + bw - 16, ey);
    c.textAlign = 'left';
    ey += 48;
  });
  var cx = w * 0.79,
    cy = 86;
  c.fillStyle = '#c98a3a';
  c.beginPath();
  c.ellipse(cx, cy - 18, 70, 30, 0, Math.PI, 0);
  c.fill();
  c.fillStyle = '#5a2a14';
  c.fillRect(cx - 74, cy - 12, 148, 18);
  c.fillStyle = '#f2c230';
  c.beginPath();
  c.moveTo(cx - 70, cy + 6);
  c.lineTo(cx + 70, cy + 6);
  c.lineTo(cx + 40, cy + 20);
  c.lineTo(cx - 30, cy + 18);
  c.fill();
  c.fillStyle = '#6aa83a';
  c.fillRect(cx - 72, cy + 6, 144, 6);
  c.fillStyle = '#d9a052';
  c.fillRect(cx - 70, cy + 16, 140, 18);
  c.fillStyle = '#6b5a4a';
  c.font = 'italic 16px Georgia,serif';
  c.fillText('Menu as shown on the truck. Prices in yuan.', 46, h - 22);
}
