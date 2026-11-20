// Wires the page: three photo slots with zoom and drag-to-pan, a caption and
// a tagline, three post sizes, three colour grades, and a PNG export. A
// `?shot=` query sets up a fixed scene for a screenshot instead (shots.js).

import { drawCover, panelsFor, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const taglineInput = document.getElementById('tagline');
const status = document.getElementById('status');

const photos = [null, null, null];
const views = [
  { zoom: 1, dx: 0, dy: 0 },
  { zoom: 1, dx: 0, dy: 0 },
  { zoom: 1, dx: 0, dy: 0 },
];
let sizeKey = 'wide';
let grade = 'sunset';
let activePanel = -1;
let dragStart = null;

function redraw() {
  drawCover(canvas, photos, views, captionInput.value, taglineInput.value, sizeKey, grade);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function setPhoto(panel, url) {
  try {
    photos[panel] = await loadImage(url);
    views[panel] = { zoom: 1, dx: 0, dy: 0 };
    const slider = document.querySelector(`[data-zoom="${panel}"]`);
    if (slider) slider.value = 100;
    redraw();
  } catch (e) {
    status.textContent = 'That photo could not be loaded.';
  }
}

document.querySelectorAll('[data-photo]').forEach((input) => {
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(Number(input.dataset.photo), URL.createObjectURL(file));
  });
});

document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    setPhoto(Number(button.dataset.panel), `samples/${button.dataset.sample}`);
  });
});

document.querySelectorAll('[data-zoom]').forEach((slider) => {
  slider.addEventListener('input', () => {
    views[Number(slider.dataset.zoom)].zoom = Number(slider.value) / 100;
    redraw();
  });
});

document.getElementById('one-photo').addEventListener('click', () => {
  if (!photos[0]) return;
  photos[1] = photos[0];
  photos[2] = photos[0];
  redraw();
  status.textContent = 'The hero photo now fills all three panels.';
});

captionInput.addEventListener('input', redraw);
taglineInput.addEventListener('input', redraw);

document.querySelectorAll('[data-size]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-size]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    sizeKey = button.dataset.size;
    redraw();
  });
});

document.querySelectorAll('[data-grade]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-grade]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    grade = button.dataset.grade;
    redraw();
  });
});

document.getElementById('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const size = SIZES[sizeKey];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${sizeKey}-${size.width}x${size.height}.png`;
    a.click();
    status.textContent = `Saved ${a.download}`;
  }, 'image/png');
});

/** Canvas coordinates of a pointer event, in the canvas's own pixels. */
function canvasPoint(e) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - box.left) / box.width) * canvas.width,
    y: ((e.clientY - box.top) / box.height) * canvas.height,
  };
}

canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const panels = panelsFor(canvas.width, canvas.height);
  const hit = panels.findIndex((r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h);
  if (hit < 0 || !photos[hit]) return;
  activePanel = hit;
  dragStart = { x: p.x, y: p.y, dx: views[hit].dx, dy: views[hit].dy };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (activePanel < 0 || !dragStart) return;
  const p = canvasPoint(e);
  const rect = panelsFor(canvas.width, canvas.height)[activePanel];
  const view = views[activePanel];
  view.dx = Math.max(-0.35, Math.min(0.35, dragStart.dx + (p.x - dragStart.x) / rect.w));
  view.dy = Math.max(-0.35, Math.min(0.35, dragStart.dy + (p.y - dragStart.y) / rect.h));
  redraw();
});

canvas.addEventListener('pointerup', () => {
  activePanel = -1;
  dragStart = null;
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');

/** Applies a fixed scene (for screenshots): size, grade, words, photos. */
async function applyScene(scene) {
  sizeKey = scene.size;
  grade = scene.grade;
  captionInput.value = scene.caption;
  taglineInput.value = scene.tagline;
  document.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b.dataset.size === scene.size));
  document.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === scene.grade));
  for (let i = 0; i < 3; i++) {
    photos[i] = await loadImage(`samples/${scene.photos[i]}`);
    views[i] = { zoom: 1, dx: 0, dy: 0 };
  }
  redraw();
}

if (shot) {
  runShot(shot, query, applyScene);
} else {
  redraw();
  document.fonts.load('100px Anton').then(redraw).catch(() => {});
}
