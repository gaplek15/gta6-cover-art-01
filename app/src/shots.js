// Fixed scenes for screenshots: build a scene from the ?shot= query,
// hand it to the page's applyScene, and signal readiness for the
// screenshot once the frame has painted.

export async function runShot(shot, query, applyScene) {
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }

  const scene = {
    size: query.get('size') || 'wide',
    grade: query.get('grade') || 'sunset',
    caption: query.get('caption') || 'Sunset Heist',
    tagline: query.get('tagline') || 'VICE COAST',
    photos: [
      query.get('photo0') || 'boulevard.jpg',
      query.get('photo1') || 'neon.jpg',
      query.get('photo2') || 'sunset.jpg',
    ],
  };

  try {
    await document.fonts.load('100px Anton');
  } catch {
    // Fall back to the system font if Anton fails to load.
  }
  await applyScene(scene);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
