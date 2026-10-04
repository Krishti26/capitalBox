/**
 * React Bits PixelSwap Component Implementation (Vanilla JS)
 * Grid of animated pixel windows with counter-transformed content.
 */
(function () {
  'use strict';

  const MAX_PIXELS = 220;
  const KEYFRAME_STEPS = 14;

  const PATTERNS = {
    random: () => null,
    center: (x, y) => Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2,
    edges: (x, y) => Math.min(x, 1 - x, y, 1 - y) * 2,
    'left-to-right': x => x,
    'right-to-left': x => 1 - x,
    'top-to-bottom': (_x, y) => y,
    'bottom-to-top': (_x, y) => 1 - y,
    diagonal: (x, y) => (x + y) / 2,
    spiral: (x, y) => {
      const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);
      const radius = Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;
      return (angle + radius) % 1;
    }
  };

  const EASINGS = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1]
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const noise = seed => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  const makeEasing = value => {
    const match = /cubic-bezier\(([^)]+)\)/.exec(value);
    const points = match ? match[1].split(',').map(Number) : EASINGS[value];
    if (!points || points.length !== 4 || points.some(Number.isNaN)) return makeEasing('ease');

    const [x1, y1, x2, y2] = points;
    if (x1 === y1 && x2 === y2) return progress => progress;

    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    return progress => {
      let t = progress;
      for (let i = 0; i < 5; i += 1) {
        const slope = (3 * ax * t + 2 * bx) * t + cx;
        if (!slope) break;
        t -= (((ax * t + bx) * t + cx) * t - progress) / slope;
      }
      t = clamp(t, 0, 1);
      return ((ay * t + by) * t + cy) * t;
    };
  };

  const coverScale = (size, gap, radius) => {
    const p = clamp(radius, 0, 50) / 100;
    const corner = Math.SQRT1_2 / (Math.SQRT2 * (0.5 - p) + p);
    return ((size + gap) / size) * Math.max(1, corner);
  };

  const buildGrid = ({ width, height, pixelSize, gap, pattern, randomness }) => {
    let size = pixelSize;
    let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));
    let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));

    if (columns * rows > MAX_PIXELS) {
      size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));
      columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));
      rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));
    }

    const stride = size + gap;
    const originX = (width - (columns * stride - gap)) / 2;
    const originY = (height - (rows * stride - gap)) / 2;
    const order = PATTERNS[pattern] ?? PATTERNS.random;
    const mix = clamp(randomness, 0, 1);
    const pixels = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;
        const x = columns <= 1 ? 0.5 : column / (columns - 1);
        const y = rows <= 1 ? 0.5 : row / (rows - 1);
        const base = order(x, y);
        const random = noise(index + 1);

        pixels.push({
          id: index,
          left: originX + column * stride,
          top: originY + row * stride,
          offset: base === null ? random : base * (1 - mix) + random * mix
        });
      }
    }

    return { pixels, size, gap, width, height };
  };

  const buildKeyframes = ({ ease, startScale, endScale, spin, fade }) => {
    const windowFrames = [];
    const contentFrames = [];

    for (let step = 0; step <= KEYFRAME_STEPS; step += 1) {
      const progress = step / KEYFRAME_STEPS;
      const eased = ease(progress);
      const scale = startScale + (endScale - startScale) * eased;
      const angle = spin * (1 - eased);

      windowFrames.push({
        offset: progress,
        opacity: fade ? Math.min(1, eased * 1.6) : 1,
        transform: `rotate(${angle}deg) scale(${scale})`
      });
      contentFrames.push({
        offset: progress,
        transform: `scale(${1 / scale}) rotate(${-angle}deg)`
      });
    }

    return { window: windowFrames, content: contentFrames };
  };

  class PixelSwapElement {
    constructor(container) {
      this.container = container;
      this.active = container.dataset.active === 'true';
      this.transitioning = false;
      this.animations = [];
      this.timer = 0;

      this.pixelSize = parseInt(container.dataset.pixelSize || '64', 10);
      this.gap = parseInt(container.dataset.gap || '0', 10);
      this.pixelRadius = parseInt(container.dataset.pixelRadius || '0', 10);
      this.pixelSpin = parseInt(container.dataset.pixelSpin || '0', 10);
      this.pixelScale = parseFloat(container.dataset.pixelScale || '0.35');
      this.fade = container.dataset.fade !== 'false';
      this.duration = parseInt(container.dataset.duration || '1400', 10);
      this.pixelDuration = parseInt(container.dataset.pixelDuration || '450', 10);
      this.pattern = container.dataset.pattern || 'random';
      this.randomness = parseFloat(container.dataset.randomness || '0');
      this.easing = container.dataset.easing || 'cubic-bezier(0.22, 1, 0.36, 1)';
      this.trigger = container.dataset.trigger || 'hover';

      this.layers = Array.from(container.querySelectorAll('.pixel-swap__layer'));
      if (this.layers.length < 2) return;

      this.setupLayers();
      this.setupEvents();
    }

    setupLayers() {
      this.layers.forEach((layer, idx) => {
        const isShown = idx === (this.active ? 1 : 0);
        layer.setAttribute('data-visible', isShown ? 'true' : 'false');
        layer.setAttribute('aria-hidden', !isShown ? 'true' : 'false');
      });
    }

    setupEvents() {
      if (this.trigger === 'hover') {
        this.container.addEventListener('mouseenter', () => this.swap(true));
        this.container.addEventListener('mouseleave', () => this.swap(false));
      } else if (this.trigger === 'click') {
        this.container.addEventListener('click', () => this.swap(!this.active));
      }

      if (this.container.dataset.autoInterval) {
        const interval = parseInt(this.container.dataset.autoInterval, 10) || 6000;
        setInterval(() => this.swap(!this.active), interval);
      }
    }

    swap(nextActive) {
      if (this.transitioning || nextActive === this.active) return;
      this.transitioning = true;
      const toIndex = nextActive ? 1 : 0;
      const targetLayer = this.layers[toIndex];

      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      if (!width || !height || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.finish(nextActive);
        return;
      }

      const grid = buildGrid({
        width,
        height,
        pixelSize: this.pixelSize,
        gap: this.gap,
        pattern: this.pattern,
        randomness: this.randomness
      });

      const gridElement = document.createElement('div');
      gridElement.className = 'pixel-swap__grid';
      gridElement.setAttribute('aria-hidden', 'true');

      const total = Math.max(200, this.duration);
      const pixelMs = clamp(this.pixelDuration, 60, total);
      const spread = Math.max(0, total - pixelMs);
      const endScale = coverScale(grid.size, grid.gap, this.pixelRadius);
      const keyframes = buildKeyframes({
        ease: makeEasing(this.easing),
        startScale: clamp(this.pixelScale, 0.05, 1) * endScale,
        endScale,
        spin: this.pixelSpin,
        fade: this.fade
      });

      grid.pixels.forEach(pixel => {
        const pixelEl = document.createElement('div');
        pixelEl.className = 'pixel-swap__pixel';
        pixelEl.style.left = `${pixel.left}px`;
        pixelEl.style.top = `${pixel.top}px`;
        pixelEl.style.width = `${grid.size}px`;
        pixelEl.style.height = `${grid.size}px`;
        pixelEl.style.borderRadius = `${clamp(this.pixelRadius, 0, 50)}%`;

        const content = document.createElement('div');
        content.className = 'pixel-swap__pixel-content';
        content.style.left = `${-pixel.left}px`;
        content.style.top = `${-pixel.top}px`;
        content.style.width = `${grid.width}px`;
        content.style.height = `${grid.height}px`;

        const originX = pixel.left + grid.size / 2;
        const originY = pixel.top + grid.size / 2;
        content.style.transformOrigin = `${originX}px ${originY}px`;

        const clone = targetLayer.cloneNode(true);
        clone.setAttribute('data-visible', 'true');
        clone.removeAttribute('aria-hidden');
        content.appendChild(clone);
        pixelEl.appendChild(content);
        gridElement.appendChild(pixelEl);

        const timing = { duration: pixelMs, delay: pixel.offset * spread, easing: 'linear', fill: 'both' };
        this.animations.push(
          pixelEl.animate(keyframes.window, timing),
          content.animate(keyframes.content, timing)
        );
      });

      this.container.appendChild(gridElement);

      this.timer = window.setTimeout(() => {
        gridElement.remove();
        this.finish(nextActive);
      }, total);
    }

    finish(nextActive) {
      this.animations.forEach(anim => anim.cancel());
      this.animations = [];
      if (this.timer) window.clearTimeout(this.timer);
      this.timer = 0;

      this.active = nextActive;
      this.setupLayers();
      this.transitioning = false;
    }
  }

  function initPixelSwap() {
    document.querySelectorAll('.pixel-swap').forEach(container => {
      if (!container._pixelSwap) {
        container._pixelSwap = new PixelSwapElement(container);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPixelSwap);
  } else {
    initPixelSwap();
  }

  window.initPixelSwap = initPixelSwap;
})();
