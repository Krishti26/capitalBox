/**
 * React Bits PixelCard Component Implementation (Vanilla JS)
 * Interactive Canvas Pixel Grid & Shimmer Animation
 */
(function () {
  'use strict';

  class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = this.getRandomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;
      this.maxSizeInteger = 2;
      this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
      this.isIdle = false;
      this.isReverse = false;
      this.isShimmer = false;
    }

    getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }

    draw() {
      const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
    }

    appear() {
      this.isIdle = false;
      if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
      }
      if (this.size >= this.maxSize) {
        this.isShimmer = true;
      }
      if (this.isShimmer) {
        this.shimmer();
      } else {
        this.size += this.sizeStep;
      }
      this.draw();
    }

    disappear() {
      this.isShimmer = false;
      this.counter = 0;
      if (this.size <= 0) {
        this.isIdle = true;
        return;
      } else {
        this.size -= 0.1;
      }
      this.draw();
    }

    shimmer() {
      if (this.size >= this.maxSize) {
        this.isReverse = true;
      } else if (this.size <= this.minSize) {
        this.isReverse = false;
      }
      if (this.isReverse) {
        this.size -= this.speed;
      } else {
        this.size += this.speed;
      }
    }
  }

  function getEffectiveSpeed(value, reducedMotion) {
    const min = 0;
    const max = 100;
    const throttle = 0.001;
    const parsed = parseInt(value, 10);

    if (parsed <= min || reducedMotion) {
      return min;
    } else if (parsed >= max) {
      return max * throttle;
    } else {
      return parsed * throttle;
    }
  }

  const VARIANTS = {
    default: {
      activeColor: null,
      gap: 5,
      speed: 35,
      colors: '#f8fafc,#f1f5f9,#cbd5e1',
      noFocus: false
    },
    blue: {
      activeColor: '#e0f2fe',
      gap: 10,
      speed: 25,
      colors: '#e0f2fe,#7dd3fc,#0ea5e9',
      noFocus: false
    },
    yellow: {
      activeColor: '#fef08a',
      gap: 3,
      speed: 20,
      colors: '#fef08a,#fde047,#eab308',
      noFocus: false
    },
    pink: {
      activeColor: '#fecdd3',
      gap: 6,
      speed: 80,
      colors: '#fecdd3,#fda4af,#e11d48',
      noFocus: true
    },
    gold: {
      activeColor: 'rgba(242,202,80,0.25)',
      gap: 5,
      speed: 40,
      colors: '#f2ca50,#d4af37,#cbba4f,#ffe088',
      noFocus: false
    }
  };

  class PixelCardElement {
    constructor(container) {
      this.container = container;
      
      let canvas = container.querySelector('canvas.pixel-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'pixel-canvas';
        container.appendChild(canvas);
      }
      this.canvas = canvas;
      this.pixels = [];
      this.animationId = null;
      this.timePrevious = performance.now();
      this.reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.variant = container.dataset.variant || 'gold';
      const variantCfg = VARIANTS[this.variant] || VARIANTS.gold;

      this.gap = container.dataset.gap ? parseInt(container.dataset.gap, 10) : variantCfg.gap;
      this.speed = container.dataset.speed ? parseInt(container.dataset.speed, 10) : variantCfg.speed;
      this.colors = container.dataset.colors || variantCfg.colors;
      this.noFocus = container.dataset.noFocus !== undefined ? container.dataset.noFocus === 'true' : variantCfg.noFocus;

      if (variantCfg.activeColor) {
        container.style.setProperty('--pixel-card-active-color', variantCfg.activeColor);
      }

      this.initPixels();
      this.setupEvents();
    }

    initPixels() {
      if (!this.container || !this.canvas) return;

      const rect = this.container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      const ctx = this.canvas.getContext('2d');

      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      const colorsArray = this.colors.split(',');
      const pxs = [];
      for (let x = 0; x < width; x += parseInt(this.gap, 10)) {
        for (let y = 0; y < height; y += parseInt(this.gap, 10)) {
          const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];

          const dx = x - width / 2;
          const dy = y - height / 2;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const delay = this.reducedMotion ? 0 : distance;

          pxs.push(new Pixel(this.canvas, ctx, x, y, color, getEffectiveSpeed(this.speed, this.reducedMotion), delay));
        }
      }
      this.pixels = pxs;
    }

    doAnimate(fnName) {
      this.animationId = requestAnimationFrame(() => this.doAnimate(fnName));
      const timeNow = performance.now();
      const timePassed = timeNow - this.timePrevious;
      const timeInterval = 1000 / 60;

      if (timePassed < timeInterval) return;
      this.timePrevious = timeNow - (timePassed % timeInterval);

      const ctx = this.canvas?.getContext('2d');
      if (!ctx || !this.canvas) return;

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let allIdle = true;
      for (let i = 0; i < this.pixels.length; i++) {
        const pixel = this.pixels[i];
        pixel[fnName]();
        if (!pixel.isIdle) {
          allIdle = false;
        }
      }
      if (allIdle) {
        cancelAnimationFrame(this.animationId);
      }
    }

    handleAnimation(name) {
      cancelAnimationFrame(this.animationId);
      this.animationId = requestAnimationFrame(() => this.doAnimate(name));
    }

    setupEvents() {
      this.container.addEventListener('mouseenter', () => this.handleAnimation('appear'));
      this.container.addEventListener('mouseleave', () => this.handleAnimation('disappear'));

      if (!this.noFocus) {
        if (!this.container.hasAttribute('tabindex')) {
          this.container.setAttribute('tabindex', '0');
        }
        this.container.addEventListener('focus', e => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          this.handleAnimation('appear');
        });
        this.container.addEventListener('blur', e => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          this.handleAnimation('disappear');
        });
      }

      const observer = new ResizeObserver(() => {
        this.initPixels();
      });
      observer.observe(this.container);
    }
  }

  function initPixelCards() {
    document.querySelectorAll('.pixel-card').forEach(container => {
      if (!container._pixelCard) {
        container._pixelCard = new PixelCardElement(container);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPixelCards);
  } else {
    initPixelCards();
  }

  window.initPixelCards = initPixelCards;
})();
