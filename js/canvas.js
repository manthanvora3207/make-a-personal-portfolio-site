/**
 * Ambient Particle & Interactive Physics Canvas
 */

class ParticleNetwork {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      particleCount: 55,
      maxDistance: 130,
      baseSpeed: 0.6,
      mouseRadius: 160,
      interactive: true,
      accentColor: '99, 102, 241'
    }, options);

    this.particles = [];
    this.mouse = { x: null, y: null, active: false };
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    const count = this.options.particleCount;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.options.baseSpeed,
        vy: (Math.random() - 0.5) * this.options.baseSpeed,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    if (this.options.interactive) {
      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.active = true;
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
    }
  }

  updateConfig(newOptions) {
    Object.assign(this.options, newOptions);
    this.createParticles();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const theme = document.documentElement.getAttribute('data-theme');
    let colorRgb = '99, 102, 241';
    let lineAlphaMultiplier = 0.18;

    if (theme === 'light') {
      colorRgb = '79, 70, 229';
      lineAlphaMultiplier = 0.14;
    } else if (theme === 'cyber') {
      colorRgb = '0, 240, 255';
      lineAlphaMultiplier = 0.28;
    }

    const particles = this.particles;
    const len = particles.length;

    // Move & draw particles
    for (let i = 0; i < len; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse repulsion/attraction
      if (this.mouse.active && this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.options.mouseRadius) {
          const force = (1 - dist / this.options.mouseRadius) * 0.8;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      // Draw particle dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${colorRgb}, ${p.alpha})`;
      this.ctx.fill();

      // Connect with neighbors
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.options.maxDistance) {
          const lineAlpha = (1 - dist / this.options.maxDistance) * lineAlphaMultiplier;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${colorRgb}, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  // Main background particle canvas
  window.bgParticles = new ParticleNetwork('bg-canvas', {
    particleCount: 45,
    maxDistance: 140,
    baseSpeed: 0.45,
    mouseRadius: 180
  });

  // Interactive Lab Canvas
  const labCanvas = document.getElementById('lab-canvas');
  if (labCanvas) {
    window.labParticles = new ParticleNetwork('lab-canvas', {
      particleCount: 50,
      maxDistance: 110,
      baseSpeed: 0.8,
      mouseRadius: 120
    });

    // Wire up Lab Controls
    const countSlider = document.getElementById('lab-count');
    const speedSlider = document.getElementById('lab-speed');
    const distSlider = document.getElementById('lab-dist');
    const countVal = document.getElementById('lab-count-val');
    const speedVal = document.getElementById('lab-speed-val');
    const distVal = document.getElementById('lab-dist-val');

    if (countSlider && countVal) {
      countSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        countVal.textContent = val;
        window.labParticles.updateConfig({ particleCount: val });
      });
    }

    if (speedSlider && speedVal) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        speedVal.textContent = val.toFixed(1) + 'x';
        window.labParticles.updateConfig({ baseSpeed: val });
      });
    }

    if (distSlider && distVal) {
      distSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        distVal.textContent = val + 'px';
        window.labParticles.updateConfig({ maxDistance: val });
      });
    }

    const resetBtn = document.getElementById('lab-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        countSlider.value = 50;
        speedSlider.value = 0.8;
        distSlider.value = 110;
        countVal.textContent = '50';
        speedVal.textContent = '0.8x';
        distVal.textContent = '110px';
        window.labParticles.updateConfig({
          particleCount: 50,
          baseSpeed: 0.8,
          maxDistance: 110
        });
        if (window.playFeedbackSound) window.playFeedbackSound('click');
      });
    }

    const burstBtn = document.getElementById('lab-burst-btn');
    if (burstBtn) {
      burstBtn.addEventListener('click', () => {
        // Scatter particles
        window.labParticles.particles.forEach(p => {
          p.vx = (Math.random() - 0.5) * 5;
          p.vy = (Math.random() - 0.5) * 5;
        });
        if (window.playFeedbackSound) window.playFeedbackSound('chime');
      });
    }
  }
});
