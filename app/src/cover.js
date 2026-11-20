// Draws a three-panel sunset-city poster cover: a hero panel, two smaller
// panels, a colour grade over the whole thing, and a bold caption with a
// tagline along the foot. Photos are drawn cover-fit into their panels,
// each with its own zoom and pan offset.

export const SIZES = {
  square: { width: 1080, height: 1080, label: 'Square 1080 x 1080' },
  portrait: { width: 1080, height: 1350, label: 'Portrait 1080 x 1350' },
  wide: { width: 1920, height: 1080, label: 'Wide 1920 x 1080' },
};

export const GRADES = ['sunset', 'neon', 'noir'];

const GUTTER = 6;
const CAPTION_FONT = 'Anton, "Arial Black", sans-serif';

/** The three panel rectangles for a cover of this size. Wide covers put
 *  the hero on the left; square and portrait covers stack it on top. */
export function panelsFor(width, height) {
  if (width / height > 1.15) {
    const heroW = Math.round(width * 0.6) - GUTTER;
    const sideX = heroW + GUTTER * 2;
    const sideW = width - sideX;
    const halfH = Math.round(height / 2) - GUTTER;
    return [
      { x: 0, y: 0, w: heroW, h: height },
      { x: sideX, y: 0, w: sideW, h: halfH },
      { x: sideX, y: halfH + GUTTER * 2, w: sideW, h: height - halfH - GUTTER * 2 },
    ];
  }
  const heroH = Math.round(height * 0.58) - GUTTER;
  const rowY = heroH + GUTTER * 2;
  const halfW = Math.round(width / 2) - GUTTER;
  return [
    { x: 0, y: 0, w: width, h: heroH },
    { x: 0, y: rowY, w: halfW, h: height - rowY },
    { x: halfW + GUTTER * 2, y: rowY, w: width - halfW - GUTTER * 2, h: height - rowY },
  ];
}

/** Draws one photo cover-fit into a rectangle, honouring its view
 *  ({ zoom, dx, dy }: zoom 1..2.2, pan as a fraction of the rect). */
function drawPanel(ctx, photo, rect, view) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!photo) {
    const fill = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    fill.addColorStop(0, '#3b2350');
    fill.addColorStop(1, '#1c1030');
    ctx.fillStyle = fill;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `700 ${Math.max(14, rect.h * 0.05)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const zoom = view?.zoom ?? 1;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * base;
  const ph = photo.naturalHeight * base;
  const dx = (view?.dx ?? 0) * rect.w;
  const dy = (view?.dy ?? 0) * rect.h;
  ctx.drawImage(photo, rect.x + (rect.w - pw) / 2 + dx, rect.y + (rect.h - ph) / 2 + dy, pw, ph);
  ctx.restore();
}

/** Washes the whole cover in the chosen grade, then darkens the corners. */
function applyGrade(ctx, width, height, grade) {
  const wash = ctx.createLinearGradient(0, 0, 0, height);
  if (grade === 'neon') {
    wash.addColorStop(0, 'rgba(232, 62, 140, 0.16)');
    wash.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
    wash.addColorStop(1, 'rgba(0, 229, 255, 0.20)');
  } else if (grade === 'noir') {
    wash.addColorStop(0, 'rgba(8, 6, 18, 0.30)');
    wash.addColorStop(1, 'rgba(8, 6, 18, 0.45)');
  } else {
    wash.addColorStop(0, 'rgba(255, 190, 80, 0.05)');
    wash.addColorStop(0.5, 'rgba(255, 120, 80, 0.10)');
    wash.addColorStop(1, 'rgba(200, 40, 120, 0.38)');
  }
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  const edge = Math.max(width, height) * 0.75;
  const shade = ctx.createRadialGradient(
    width / 2, height / 2, edge * 0.35, width / 2, height / 2, edge,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, grade === 'noir' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
}

/** The caption band: a dark strip at the foot, the tagline in small spaced
 *  capitals, and the caption in big Anton capitals with a black outline
 *  and a magenta drop shadow, shrunk until it fits. */
function drawCaption(ctx, caption, tagline, width, height) {
  const bandH = height * 0.2;
  const band = ctx.createLinearGradient(0, height - bandH, 0, height);
  band.addColorStop(0, 'rgba(10, 5, 20, 0)');
  band.addColorStop(1, 'rgba(10, 5, 20, 0.72)');
  ctx.fillStyle = band;
  ctx.fillRect(0, height - bandH, width, bandH);

  const cleanTag = (tagline || '').trim().toUpperCase();
  const cleanCap = (caption || '').trim().toUpperCase();
  const base = height - height * 0.045;
  ctx.textAlign = 'center';

  if (cleanTag) {
    const tagSize = Math.max(16, height * 0.028);
    ctx.font = `700 ${tagSize}px system-ui, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(tagSize * 0.35)}px`; } catch (e) { /* older canvas */ }
    ctx.fillStyle = '#ffd166';
    ctx.fillText(cleanTag, width / 2, base - height * 0.105);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  }
  if (!cleanCap) return;
  let size = height * 0.115;
  ctx.font = `${size}px ${CAPTION_FONT}`;
  while (ctx.measureText(cleanCap).width > width * 0.92 && size > 24) {
    size -= 4;
    ctx.font = `${size}px ${CAPTION_FONT}`;
  }
  ctx.lineWidth = Math.max(4, size * 0.09);
  ctx.strokeStyle = '#12081f';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(232, 62, 140, 0.9)';
  ctx.shadowOffsetX = size * 0.05;
  ctx.shadowOffsetY = size * 0.05;
  ctx.shadowBlur = 0;
  ctx.strokeText(cleanCap, width / 2, base);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(cleanCap, width / 2, base);
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Draws the whole cover onto the canvas at its export size.
 *  photos: [hero, second, third] images (or null); views: one { zoom, dx, dy }
 *  per panel. */
export function drawCover(canvas, photos, views, caption, tagline, sizeKey, grade) {
  const size = SIZES[sizeKey] ?? SIZES.wide;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#1a1026';
  ctx.fillRect(0, 0, w, h);
  const panels = panelsFor(w, h);
  panels.forEach((rect, i) => drawPanel(ctx, photos[i] ?? null, rect, views[i]));
  applyGrade(ctx, w, h, grade);
  drawCaption(ctx, caption, tagline, w, h);
}
