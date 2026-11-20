// Page wiring for Vice Cover Studio: photos, zoom, drag-to-pan, size,
// grade, caption, export, and the ?shot= handoff for screenshots.

import { drawCover, panelsFor, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const captionInput = document.getElementById('caption');
const taglineInput = document.getElementById('tagline');

const photos = [null, null, null];
const views = [
  { zoom: 1, dx: 0, dy: 0 },
  { zoom: 1, dx: 0, dy: 0 },
  { zoom: 1, dx: 0, dy: 0 },
];
let sizeKey = 'wide';
let grade = 'sunset';

function setStatus(text) {
  statusEl.textContent = text;
}

function redraw() {
  drawCover(canvas, photos, views, captionInput.value, taglineInput.value, sizeKey, grade);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function resetView(panel) {
  views[panel] = { zoom: 1, dx: 0, dy: 0 };
  const slider = document.querySelector(`[data-zoom="${panel}"]`);
  if (slider) slider.value = '100';
}

async function putPhoto(panel, src) {
  try {
    const img = await loadImage(src);
    photos[panel] = img;
    resetView(panel);
    redraw();
    return true;
  } catch {
    setStatus('That photo could not be loaded.');
    return false;
  }
}

// Upload inputs.
for (const input of document.querySelectorAll('[data-photo]')) {
  const panel = Number(input.dataset.photo);
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadImage(url)
      .then((img) => {
        photos[panel] = img;
        resetView(panel);
        redraw();
      })
      .catch(() => setStatus('That photo could not be loaded.'));
  });
}

// Sample buttons.
for (const button of document.querySelectorAll('[data-sample]')) {
  button.addEventListener('click', () => {
    const panel = Number(button.dataset.panel);
    putPhoto(panel, `samples/${button.dataset.sample}`);
  });
}

// Zoom sliders.
for (const slider of document.querySelectorAll('[data-zoom]')) {
  const panel = Number(slider.dataset.zoom);
  slider.addEventListener('input', () => {
    views[panel].zoom = Number(slider.value) / 100;
    redraw();
  });
}

// One photo in all three panels.
document.getElementById('one-photo').addEventListener('click', () => {
  if (!photos[0]) return;
  photos[1] = photos[0];
  photos[2] = photos[0];
  redraw();
  setStatus('The hero photo now fills all three panels.');
});

// Caption and tagline redraw on every keystroke.
captionInput.addEventListener('input', redraw);
taglineInput.addEventListener('input', redraw);

// Size buttons.
for (const button of document.querySelectorAll('[data-size]')) {
  button.addEventListener('click', () => {
    sizeKey = button.dataset.size;
    for (const b of document.querySelectorAll('[data-size]')) b.classList.toggle('active', b === button);
    redraw();
  });
}

// Grade buttons.
for (const button of document.querySelectorAll('[data-grade]')) {
  button.addEventListener('click', () => {
    grade = button.dataset.grade;
    for (const b of document.querySelectorAll('[data-grade]')) b.classList.toggle('active', b === button);
    redraw();
  });
}

// Export PNG.
document.getElementById('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('That photo could not be loaded.');
      return;
    }
    const filename = `vice-cover-${sizeKey}-${canvas.width}x${canvas.height}.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Saved ${filename}`);
  }, 'image/png');
});

// Drag-to-pan: drag a photo inside its own panel.
let drag = null;

function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const panels = panelsFor(canvas.width, canvas.height);
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return { index: i, x, y, panel: p };
  }
  return null;
}

canvas.addEventListener('pointerdown', (event) => {
  const hit = panelAt(event.clientX, event.clientY);
  if (!hit || !photos[hit.index]) return;
  drag = { index: hit.index, lastX: hit.x, lastY: hit.y, panel: hit.panel };
  canvas.classList.add('dragging');
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const view = views[drag.index];
  view.dx = Math.max(-0.35, Math.min(0.35, view.dx + (x - drag.lastX) / drag.panel.w));
  view.dy = Math.max(-0.35, Math.min(0.35, view.dy + (y - drag.lastY) / drag.panel.h));
  drag.lastX = x;
  drag.lastY = y;
  redraw();
});

function endDrag() {
  drag = null;
  canvas.classList.remove('dragging');
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// A scene for screenshots: set size, grade, caption, tagline, load the
// three scene photos and redraw. Returns a promise that resolves once
// the photos are in place.
async function applyScene(scene) {
  sizeKey = scene.size;
  grade = scene.grade;
  captionInput.value = scene.caption;
  taglineInput.value = scene.tagline;
  for (const b of document.querySelectorAll('[data-size]')) b.classList.toggle('active', b.dataset.size === sizeKey);
  for (const b of document.querySelectorAll('[data-grade]')) b.classList.toggle('active', b.dataset.grade === grade);
  await Promise.all(scene.photos.map((name, i) =>
    loadImage(`samples/${name}`)
      .then((img) => { photos[i] = img; resetView(i); })
      .catch(() => { /* leave the panel empty on a missing sample */ }),
  ));
  redraw();
}

const query = new URLSearchParams(window.location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, applyScene);
} else {
  redraw();
  // Anton arrives after first paint; repaint once it is ready.
  document.fonts.load('100px Anton').then(redraw).catch(() => {});
}
