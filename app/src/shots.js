// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, full-bleed, at the
// size the `size` query asks for (wide, square or portrait). The caption,
// tagline and grade come from the query too. window.__shotReady is set
// once the font has loaded and the cover has painted.

const DEFAULT_PHOTOS = ['boulevard.jpg', 'neon.jpg', 'sunset.jpg'];

export async function runShot(shot, query, applyScene) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const scene = {
    size: query.get('size') ?? 'wide',
    grade: query.get('grade') ?? 'sunset',
    caption: query.get('caption') ?? 'Sunset Heist',
    tagline: query.get('tagline') ?? 'VICE COAST',
    photos: [
      query.get('photo0') ?? DEFAULT_PHOTOS[0],
      query.get('photo1') ?? DEFAULT_PHOTOS[1],
      query.get('photo2') ?? DEFAULT_PHOTOS[2],
    ],
  };
  try { await document.fonts.load('100px Anton'); } catch (e) { /* fallback font */ }
  await applyScene(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
