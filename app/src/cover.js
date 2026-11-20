// Drawing engine for Vice Cover Studio: lays out three photo panels,
// paints a colour grade over the whole cover, and draws the caption band.

export const SIZES = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  wide: { width: 1920, height: 1080 },
};

export const GRADES = ['sunset', 'neon', 'noir'];

const GUTTER = 6;

// Panel rectangles for a cover of the given size. Wide covers put the
// hero on the left (~60% of the width, full height) with the other two
// stacked on the right; square and portrait covers put the hero across
// the top (~58% of the height) with the other two side by side below.
export function panelsFor(width, height) {
  if (width / height > 1.15) {
    const heroW = Math.round((width - GUTTER) * 0.6);
    const sideW = width - heroW - GUTTER;
    const halfH = Math.round((height - GUTTER) / 2);
    return [
      { x: 0, y: 0, w: heroW, h: height },
      { x: heroW + GUTTER, y: 0, w: sideW, h: halfH },
      { x: heroW + GUTTER, y: halfH + GUTTER, w: sideW, h: height - halfH - GUTTER },
    ];
  }
  const heroH = Math.round((height - GUTTER) * 0.58);
  const bottomH = height - heroH - GUTTER;
  const halfW = Math.round((width - GUTTER) / 2);
  return [
    { x: 0, y: 0, w: width, h: heroH },
    { x: 0, y: heroH + GUTTER, w: halfW, h: bottomH },
    { x: halfW + GUTTER, y: heroH + GUTTER, w: width - halfW - GUTTER, h: bottomH },
  ];
}

function drawPanel(ctx, rect, photo, view) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();

  if (!photo) {
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0, '#3b2350');
    grad.addColorStop(1, '#1c1030');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.max(18, rect.h * 0.06)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }

  // Cover-fit: scale so the photo covers the panel, then apply zoom.
  const zoom = view?.zoom ?? 1;
  const scale = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * zoom;
  const drawW = photo.naturalWidth * scale;
  const drawH = photo.naturalHeight * scale;
  const dx = (view?.dx ?? 0) * rect.w;
  const dy = (view?.dy ?? 0) * rect.h;
  ctx.drawImage(photo, rect.x + (rect.w - drawW) / 2 + dx, rect.y + (rect.h - drawH) / 2 + dy, drawW, drawH);
  ctx.restore();
}

const WASHES = {
  sunset: [
    [0, 'rgba(255,190,80,0.05)'],
    [0.5, 'rgba(255,120,80,0.10)'],
    [1, 'rgba(200,40,120,0.38)'],
  ],
  neon: [
    [0, 'rgba(232,62,140,0.16)'],
    [0.5, 'rgba(232,62,140,0)'],
    [1, 'rgba(0,229,255,0.20)'],
  ],
  noir: [
    [0, 'rgba(8,6,18,0.30)'],
    [1, 'rgba(8,6,18,0.45)'],
  ],
};

const VIGNETTE = { sunset: 0.38, neon: 0.38, noir: 0.55 };

function drawGrade(ctx, width, height, grade) {
  const stops = WASHES[grade] ?? WASHES.sunset;
  const wash = ctx.createLinearGradient(0, 0, 0, height);
  for (const [at, color] of stops) wash.addColorStop(at, color);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const radius = Math.hypot(width, height) / 2;
  const vig = ctx.createRadialGradient(
    width / 2, height / 2, radius * 0.45,
    width / 2, height / 2, radius,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, `rgba(0,0,0,${VIGNETTE[grade] ?? 0.38})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

// Fit one line of text into maxWidth by shrinking from startSize.
function fitFont(ctx, text, startSize, maxWidth, family, weight = '') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`.trim();
  while (size > 8 && ctx.measureText(text).width > maxWidth) {
    size *= 0.92;
    ctx.font = `${weight} ${size}px ${family}`.trim();
  }
  return size;
}

function drawCaptionBand(ctx, width, height, caption, tagline) {
  const bandH = height * 0.2;
  const band = ctx.createLinearGradient(0, height - bandH, 0, height);
  band.addColorStop(0, 'rgba(10,5,20,0)');
  band.addColorStop(1, 'rgba(10,5,20,0.72)');
  ctx.fillStyle = band;
  ctx.fillRect(0, height - bandH, width, bandH);

  const captionText = (caption || '').toUpperCase();
  const taglineText = (tagline || '').toUpperCase();

  // Caption first (its size anchors the layout), then the tagline above it.
  const captionSize = fitFont(
    ctx, captionText, height * 0.115, width * 0.92,
    'Anton, "Arial Black", sans-serif',
  );
  const captionBaseline = height - height * 0.028;
  const taglineSize = taglineText
    ? fitFont(ctx, taglineText, height * 0.032, width * 0.9, 'system-ui, sans-serif', '700')
    : 0;
  const taglineBaseline = captionBaseline - captionSize * 0.95;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (taglineText) {
    ctx.font = `700 ${taglineSize}px system-ui, sans-serif`;
    // Letter-spacing via manual spacing: draw with wide tracking by
    // inserting hair spaces is fragile, so set the canvas property
    // where supported and fall back to the plain draw.
    try { ctx.letterSpacing = `${taglineSize * 0.35}px`; } catch { /* older canvas */ }
    ctx.fillStyle = '#ffd166';
    ctx.fillText(taglineText, width / 2, taglineBaseline);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }

  if (captionText) {
    ctx.font = `${captionSize}px Anton, "Arial Black", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#12081f';
    ctx.lineWidth = captionSize * 0.09;
    ctx.shadowColor = 'rgba(232,62,140,0.9)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = captionSize * 0.05;
    ctx.shadowOffsetY = captionSize * 0.05;
    ctx.strokeText(captionText, width / 2, captionBaseline);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(captionText, width / 2, captionBaseline);
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

export function drawCover(canvas, photos, views, caption, tagline, sizeKey, grade) {
  const size = SIZES[sizeKey] ?? SIZES.wide;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  const panels = panelsFor(size.width, size.height);
  for (let i = 0; i < 3; i++) {
    drawPanel(ctx, panels[i], photos[i], views[i]);
  }
  drawGrade(ctx, size.width, size.height, grade);
  drawCaptionBand(ctx, size.width, size.height, caption, tagline);
}
