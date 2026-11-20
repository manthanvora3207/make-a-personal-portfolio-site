/**
 * Manthan Vora — Personal Portfolio Core Application Logic
 * Pure ES6+, Zero external runtime dependencies.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Toast Notification Manager
  // ==========================================================================
  function showToast(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    if (window.playFeedbackSound) {
      window.playFeedbackSound(type === 'error' ? 'error' : 'pop');
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, duration);
  }
  window.showToast = showToast;

  // ==========================================================================
  // 2. Web Audio API Sound Synthesizer
  // ==========================================================================
  class SoundController {
    constructor() {
      this.audioCtx = null;
      this.enabled = localStorage.getItem('portfolio_sound_enabled') === 'true';
      this.btn = document.getElementById('sound-toggle-btn');
      this.updateBtnState();
      this.bindEvents();
    }

    initAudioContext() {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    bindEvents() {
      if (this.btn) {
        this.btn.addEventListener('click', () => {
          this.toggleSound();
        });
      }
      // Unlock AudioContext on first user interaction
      const unlock = () => {
        if (this.enabled) this.initAudioContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
    }

    toggleSound() {
      this.enabled = !this.enabled;
      localStorage.setItem('portfolio_sound_enabled', this.enabled ? 'true' : 'false');
      this.updateBtnState();
      if (this.enabled) {
        this.initAudioContext();
        this.play('chime');
        showToast('UI Sound Effects Enabled', 'info');
      } else {
        showToast('UI Sound Effects Muted', 'info');
      }
    }

    updateBtnState() {
      if (!this.btn) return;
      if (this.enabled) {
        this.btn.classList.add('sound-active');
        this.btn.title = 'Sound Effects: ON (Click to mute)';
        this.btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      } else {
        this.btn.classList.remove('sound-active');
        this.btn.title = 'Sound Effects: Muted (Click to enable)';
        this.btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
      }
    }

    play(type = 'click') {
      if (!this.enabled) return;
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'key') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.03);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'chime') {
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain2.gain.setValueAtTime(0.05, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    }
  }

  const soundController = new SoundController();
  window.playFeedbackSound = (type) => soundController.play(type);

  // ==========================================================================
  // 3. Theme Switcher (Dark -> Light -> Cyber)
  // ==========================================================================
  class ThemeController {
    constructor() {
      this.themes = ['dark', 'light', 'cyber'];
      this.currentTheme = localStorage.getItem('portfolio_theme') || 'dark';
      this.themeBtn = document.getElementById('theme-toggle-btn');
      this.applyTheme(this.currentTheme, false);
      this.bindEvents();
    }

    bindEvents() {
      if (this.themeBtn) {
        this.themeBtn.addEventListener('click', () => {
          this.cycleTheme();
        });
      }
    }

    cycleTheme() {
      const nextIdx = (this.themes.indexOf(this.currentTheme) + 1) % this.themes.length;
      this.applyTheme(this.themes[nextIdx], true);
    }

    applyTheme(theme, notify = true) {
      this.currentTheme = theme;
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('portfolio_theme', theme);
      this.updateBtnIcon();

      if (notify) {
        const themeNames = { dark: 'Deep Slate Dark', light: 'Clean Modern Light', cyber: 'Neon Cyberpunk' };
        showToast(`Theme changed to ${themeNames[theme]}`, 'info');
      }
    }

    updateBtnIcon() {
      if (!this.themeBtn) return;
      if (this.currentTheme === 'light') {
        // Sun icon
        this.themeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        this.themeBtn.title = 'Current: Light (Click for Cyberpunk)';
      } else if (this.currentTheme === 'cyber') {
        // Zap / Cyber icon
        this.themeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
        this.themeBtn.title = 'Current: Cyberpunk (Click for Dark)';
      } else {
        // Moon icon
        this.themeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        this.themeBtn.title = 'Current: Dark (Click for Light)';
      }
    }
  }

  const themeController = new ThemeController();
  window.themeController = themeController;

  // ==========================================================================
  // 4. Interactive Terminal CLI Controller
  // ==========================================================================
  class TerminalController {
    constructor() {
      this.body = document.getElementById('terminal-body');
      this.input = document.getElementById('terminal-input');
      this.history = [];
      this.historyIdx = -1;
      this.init();
    }

    init() {
      if (!this.input || !this.body) return;

      // Handle Enter and Up/Down arrows
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = this.input.value.trim();
          if (cmd) {
            this.history.push(cmd);
            this.historyIdx = this.history.length;
            this.execute(cmd);
            this.input.value = '';
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.historyIdx > 0) {
            this.historyIdx--;
            this.input.value = this.history[this.historyIdx];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.input.value = this.history[this.historyIdx];
          } else {
            this.historyIdx = this.history.length;
            this.input.value = '';
          }
        } else {
          if (window.playFeedbackSound) window.playFeedbackSound('key');
        }
      });

      // Quick Chips Click
      document.querySelectorAll('.terminal-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const cmd = chip.getAttribute('data-cmd') || chip.textContent.trim();
          this.input.value = cmd;
          this.execute(cmd);
          this.input.value = '';
          this.input.focus();
        });
      });
    }

    printLine(html) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = html;
      this.body.appendChild(line);
      this.body.scrollTop = this.body.scrollHeight;
    }

    execute(cmdRaw) {
      const cmd = cmdRaw.toLowerCase().trim();
      const parts = cmd.split(' ');
      const mainCmd = parts[0];
      const arg = parts.slice(1).join(' ');

      // Print command prompt echo
      this.printLine(`<span class="terminal-prompt">manthan@dev:~$</span> <span class="term-cyan">${escapeHtml(cmdRaw)}</span>`);

      switch (mainCmd) {
        case 'help':
          this.printLine(`
<div style="margin: 4px 0 8px;">
  <span class="term-green font-bold">Available Commands:</span><br>
  • <span class="term-accent">about</span>        : Brief background & engineering philosophy<br>
  • <span class="term-accent">skills</span>       : Core languages, distributed stacks & cloud systems<br>
  • <span class="term-accent">projects</span>     : Showcase of key production architectures<br>
  • <span class="term-accent">exp</span>          : Professional career journey & timeline<br>
  • <span class="term-accent">neofetch</span>     : Display system profile & tech specifications<br>
  • <span class="term-accent">theme</span> [dark|light|cyber] : Switch active design theme<br>
  • <span class="term-accent">matrix</span>       : Run matrix simulation mode<br>
  • <span class="term-accent">contact</span>      : Reach out & social coordinates<br>
  • <span class="term-accent">resume</span>       : Launch ATS-formatted resume viewer<br>
  • <span class="term-accent">clear</span>        : Clear the terminal console<br>
  • <span class="term-accent">whoami</span>       : Check your terminal privileges
</div>`);
          break;

        case 'about':
          this.printLine(`
<div>
  <span class="term-green">Manthan Vora</span> — Full Stack Engineer & Distributed Systems Architect.<br>
  Specializing in building ultra-resilient distributed architectures, real-time streaming engines, and high-performance Web applications.<br>
  <span class="term-dim">"Focus on sub-millisecond efficiency, fault-tolerant consensus, and clean developer experiences."</span>
</div>`);
          break;

        case 'skills':
          this.printLine(`
<div>
  <span class="term-yellow">Core Languages:</span> TypeScript, Python, Go, Rust, Modern SQL<br>
  <span class="term-yellow">Distributed & Cloud:</span> gRPC, Kafka, Redis, AWS, Kubernetes, Docker, Terraform<br>
  <span class="term-yellow">Web & Interactive:</span> React, Next.js, WebGL, TailwindCSS, WebSockets<br>
  <span class="term-yellow">AI & Data:</span> LangChain, Semantic Caching, Vector Databases, Time-series DBs
</div>`);
          break;

        case 'projects':
          this.printLine(`
<div>
  <span class="term-green">Featured Architectures:</span><br>
  1. <span class="term-cyan">OmniGraph Engine</span>: 150k QPS real-time distributed knowledge graph (Go + Raft)<br>
  2. <span class="term-cyan">PulseAI Orchestrator</span>: Multi-agent LLM DAG pipeline with semantic caching (Python + Redis)<br>
  3. <span class="term-cyan">HyperMesh CDN</span>: Geo-distributed edge asset cache & WS multiplexer (Rust + Wasm)<br>
  4. <span class="term-cyan">FinPulse Terminal</span>: Ultra-low latency financial telemetry & WebGL charting<br>
  5. <span class="term-cyan">ChronoDB</span>: Append-only SIMD time-series telemetry engine (Go)<br>
  <span class="term-dim">Tip: Scroll down to the Projects section or type 'resume' to see more details.</span>
</div>`);
          break;

        case 'exp':
        case 'experience':
          this.printLine(`
<div>
  • <span class="term-green">Staff / Lead Engineer</span> @ CloudScale Tech (2023 - Present)<br>
    <span class="term-dim">Streamlined 250M+ events/day Kafka ingestion; p99 latency cut to 45ms.</span><br>
  • <span class="term-green">Senior Backend & Systems Engineer</span> @ DataPulse (2021 - 2023)<br>
    <span class="term-dim">Architected ACID-compliant distributed microservices & Redis multi-tier caching.</span><br>
  • <span class="term-green">Full-Stack Software Engineer</span> @ Nexus Labs (2019 - 2021)<br>
    <span class="term-dim">Created high-concurrency real-time analytics dashboards for 200k+ enterprise users.</span>
</div>`);
          break;

        case 'education':
          this.printLine(`
<div>
  <span class="term-cyan">B.S. in Computer Science & Engineering</span><br>
  Honors Graduate • Specialization in Distributed Systems & Software Reliability.
</div>`);
          break;

        case 'contact':
          this.printLine(`
<div>
  Email: <span class="term-green">manthanvora.dev@gmail.com</span><br>
  GitHub: <a href="https://github.com/manthanvora3207" target="_blank" class="term-cyan">github.com/manthanvora3207</a><br>
  Availability: <span class="term-yellow">Available for Select Consulting & Engineering Roles</span>
</div>`);
          break;

        case 'neofetch':
          this.printLine(`
<pre class="term-ascii">
        /\\
       /  \\       manthan@portfolio-v2
      / /\\ \\      -------------------
     / /  \\ \\     OS: Linux CloudScale 6.8.0-arch
    / /    \\ \\    Host: Edge Node Alpha (us-east-1)
   / / /\\/\\ \\ \\   Kernel: 6.8.0-dist-sys
  / / /    \\ \\ \\  Uptime: 6+ years in production
 / / /      \\ \\ \\ Shell: zsh 5.9 (x86_64-pc-linux-gnu)
/_/_/        \\_\\_\\ DE: Custom Glassmorphism UI
                  Terminal: Antigravity Interactive v2.4
                  Languages: Go, TypeScript, Python, Rust
                  Memory: 99.99% Availability SLA
</pre>`);
          break;

        case 'theme':
          if (['dark', 'light', 'cyber'].includes(arg)) {
            themeController.applyTheme(arg);
            this.printLine(`<span class="term-green">✓ Switched theme to '${arg}'.</span>`);
          } else {
            this.printLine(`<span class="term-yellow">Usage: theme [dark | light | cyber]</span>`);
          }
          break;

        case 'matrix':
          this.printLine(`
<div class="term-green" style="font-family: var(--font-mono); line-height: 1.3;">
  01001101 01100001 01101110 01110100 01101000 01100001 01101110<br>
  Wake up, engineer... The matrix has you.<br>
  Follow the distributed event streams...<br>
  <span class="term-magenta">System initialized in hyperspeed mode.</span>
</div>`);
          if (window.playFeedbackSound) window.playFeedbackSound('chime');
          break;

        case 'clear':
          this.body.innerHTML = '';
          break;

        case 'resume':
          const resumeModal = document.getElementById('resume-modal');
          if (resumeModal) {
            resumeModal.classList.add('open');
            this.printLine(`<span class="term-green">✓ Opened interactive resume window.</span>`);
          }
          break;

        case 'whoami':
          this.printLine(`<span class="term-green">guest@portfolio (Full read access, prospective collaborator)</span>`);
          break;

        case 'date':
          this.printLine(`<span class="term-cyan">${new Date().toUTCString()}</span>`);
          break;

        case 'sudo':
          this.printLine(`<span class="term-error">Permission denied: 'manthan' owns the master encryption keys! :)</span>`);
          break;

        default:
          this.printLine(`<span class="term-error">command not found: ${escapeHtml(cmdRaw)}. Type <span class="term-accent">'help'</span> for a list of commands.</span>`);
          if (window.playFeedbackSound) window.playFeedbackSound('error');
          break;
      }
    }
  }

  // ==========================================================================
  // 5. Featured Projects Data Store & Modal Quick-View
  // ==========================================================================
  const projectsData = [
    {
      id: 'omnigraph',
      title: 'OmniGraph Engine',
      category: 'distributed',
      year: '2024',
      badge: 'High Throughput',
      tagline: 'Distributed Real-Time Knowledge Graph with Raft Consensus',
      tags: ['Go', 'Raft Consensus', 'gRPC', 'Vector DB', 'Docker', 'Prometheus'],
      summary: 'High-throughput distributed graph database engine engineered in Go. Features linearizable Raft consensus, vector similarity indexing, and sub-10ms query execution across sharded nodes.',
      highlights: [
        'Sustained 150,000+ queries per second with sub-5ms P99 latency across a 7-node clustered topology.',
        'Engineered custom memory-mapped B+ Tree indexes and SIMD-accelerated cosine similarity search.',
        'Zero-downtime leader election, snapshot compaction, and automatic failover under network partition testing.'
      ],
      architecture: 'Written in pure Go with minimal Cgo dependencies. Incorporates HashiCorp Raft for state replication, gRPC with Protobuf wire protocol for inter-node RPCs, and OpenTelemetry spans for end-to-end tracing.',
      metrics: '150k QPS • P99 < 5ms • 7-Node Consensus',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    },
    {
      id: 'pulseai',
      title: 'PulseAI Orchestrator',
      category: 'ai',
      year: '2024',
      badge: 'LLM Agent Platform',
      tagline: 'Multi-Agent LLM DAG Framework with Semantic Caching',
      tags: ['Python', 'FastAPI', 'LangChain', 'Redis Vector', 'WebSockets', 'OpenAI'],
      summary: 'Enterprise multi-agent LLM workflow framework featuring low-latency semantic caching, dynamic function routing, automated guardrails, and streaming token delivery over WebSockets.',
      highlights: [
        'Cut LLM API operational costs by 48% via intelligent Redis vector similarity caching for redundant prompts.',
        'Real-time streaming agent DAG visualization rendered through reactive WebSocket state sync.',
        'Pluggable safety guardrails that detect prompt injections, PII leakage, and hallucinations before user delivery.'
      ],
      architecture: 'Async Python 3.12 architecture running on FastAPI and Uvicorn. Backed by Redis Vector Search for millisecond embedding retrieval and Celery workers for parallelized agent tooling execution.',
      metrics: '48% Cost Reduction • < 40ms Semantic Hit • 100+ Parallel Agents',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    },
    {
      id: 'hypermesh',
      title: 'HyperMesh CDN',
      category: 'distributed',
      year: '2023',
      badge: 'Infrastructure',
      tagline: 'Geo-Distributed Edge Asset Cache & WebSocket Multiplexer',
      tags: ['Rust', 'WebAssembly', 'Cloudflare Workers', 'Redis Cluster', 'Terraform'],
      summary: 'Edge-computed asset delivery and WebSocket multiplexing gateway with automatic regional failover, token bucket rate limiting, and zero-downtime blue/green routing.',
      highlights: [
        'Handles 1.2 billion monthly edge requests across 285 global POPs with median TTFB under 14ms.',
        'Compiled Rust code to WebAssembly for edge microsecond header transformations and security checks.',
        'Geo-distributed token bucket rate-limiting algorithms to mitigate volumetric L7 DDoS attacks.'
      ],
      architecture: 'Rust core compiled to Wasm running at the cloud edge. Leverages Terraform for infrastructure-as-code and Cloudflare Workers KV for distributed metadata synchronization.',
      metrics: '1.2B Req/Mo • 14ms Median TTFB • 285 Global POPs',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    },
    {
      id: 'finpulse',
      title: 'FinPulse Terminal',
      category: 'fullstack',
      year: '2023',
      badge: 'Real-Time Fintech',
      tagline: 'Ultra-Low Latency Financial Telemetry & WebGL Charting',
      tags: ['React 18', 'TypeScript', 'WebGL', 'Node.js', 'Kafka', 'TimescaleDB'],
      summary: 'Ultra-low latency algorithmic trading & financial telemetry workstation with high-frequency WebSocket order book feeds, custom WebGL candlestick charting, and automated backtesting.',
      highlights: [
        'Renders 100,000+ live tick data points at 60 FPS using raw WebGL shaders and off-screen canvas buffers.',
        'Zero-allocation binary WebSocket parser in TypeScript to prevent garbage collection frame drops.',
        'Comprehensive historical strategy backtesting engine simulating execution slippage and exchange fees.'
      ],
      architecture: 'React 18 frontend with custom WebGL render pipeline. Backend event streaming powered by Apache Kafka, Node.js ingestion microservices, and TimescaleDB hypertable partitioning.',
      metrics: '60 FPS @ 100k Ticks • < 2ms WS Parse • 150+ Technical Indicators',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    },
    {
      id: 'chronodb',
      title: 'ChronoDB Telemetry Store',
      category: 'opensource',
      year: '2023',
      badge: 'Open Source',
      tagline: 'Append-Only SIMD Time-Series Telemetry Engine',
      tags: ['Go', 'Timeseries', 'SIMD', 'Zero-Copy', 'Prometheus Exporter'],
      summary: 'Ultra-compact, append-only time series telemetry storage engine engineered with zero-copy JSON parsing, SIMD compression, and sub-5ms aggregations across millions of data points.',
      highlights: [
        'Achieved 12x storage compression ratio using modified Gorilla floating-point XOR and delta-of-delta timestamps.',
        'Custom zero-allocation byte scanner parsing 2.5 GB of raw log records per second on commodity hardware.',
        'Full Prometheus remote write & query compatibility for drop-in monitoring infrastructure integration.'
      ],
      architecture: 'Engineered in Go with CPU architecture vectorization. Disk format utilizes immutable append-only blocks, memory-mapped bloom filters, and background LSM compaction routines.',
      metrics: '12x Compression • 2.5 GB/s Parsing • Zero-Alloc Hot Path',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    },
    {
      id: 'aetherui',
      title: 'Aether UI Design System',
      category: 'fullstack',
      year: '2024',
      badge: 'Design System',
      tagline: 'Accessible Micro-Animated Headless Design Architecture',
      tags: ['TypeScript', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'Storybook'],
      summary: 'Production-ready design system and component architecture boasting 50+ accessible primitives, multi-theme token switching, fluid physics-based micro-interactions, and WCAG AAA compliance.',
      highlights: [
        'Full keyboard navigation, screen reader ARIA live region support, and automated axe-core accessibility audits.',
        'CSS Custom Property token architecture allowing instant dark, light, and neon cyberpunk theme transitions.',
        'Extensively documented Storybook suite with automated visual regression testing in GitHub Actions.'
      ],
      architecture: 'Component primitives built atop Radix UI unstyled cores, styled with modern Tailwind CSS variables, and bundled with Rollup as treeshakeable ESM modules with zero style injection leaks.',
      metrics: '50+ Components • WCAG AAA • 0 CSS Leaks • 100% Tree-shakable',
      github: 'https://github.com/manthanvora3207',
      demo: '#'
    }
  ];

  class ProjectsController {
    constructor() {
      this.filterBtns = document.querySelectorAll('.filter-btn');
      this.projectCards = document.querySelectorAll('.project-card');
      this.modal = document.getElementById('project-modal');
      this.modalContent = document.getElementById('project-modal-container');
      this.init();
    }

    init() {
      // Filter button handlers
      this.filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.filterBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.getAttribute('data-filter') || 'all';
          this.filterProjects(filter);
          if (window.playFeedbackSound) window.playFeedbackSound('click');
        });
      });

      // Quick-View trigger handlers
      document.querySelectorAll('.open-project-modal-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const projectId = btn.getAttribute('data-project');
          this.openModal(projectId);
        });
      });
    }

    filterProjects(filter) {
      this.projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    }

    openModal(projectId) {
      const project = projectsData.find((p) => p.id === projectId);
      if (!project || !this.modal || !this.modalContent) return;

      this.modalContent.innerHTML = `
        <div class="project-modal-header">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="project-category">${project.category.toUpperCase()} • ${project.year}</span>
            <span class="tag-pill" style="color:var(--accent-secondary);">${project.badge}</span>
          </div>
          <h2 class="project-modal-title">${project.title}</h2>
          <p class="project-modal-tagline">${project.tagline}</p>
        </div>

        <div class="project-modal-meta-row">
          <div class="project-modal-meta-item">
            <span class="project-modal-meta-label">Performance Metrics</span>
            <span class="project-modal-meta-val" style="color:var(--accent-primary); font-family:var(--font-mono);">${project.metrics}</span>
          </div>
          <div class="project-modal-meta-item">
            <span class="project-modal-meta-label">Tech Stack</span>
            <span class="project-modal-meta-val">${project.tags.join(', ')}</span>
          </div>
        </div>

        <div class="project-modal-section">
          <h3 class="project-modal-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            System Overview & Objectives
          </h3>
          <p class="project-modal-text">${project.summary}</p>
        </div>

        <div class="project-modal-section">
          <h3 class="project-modal-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Key Engineering Highlights
          </h3>
          <ul class="project-modal-list">
            ${project.highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div class="project-modal-section">
          <h3 class="project-modal-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            Architectural Design & Decisions
          </h3>
          <p class="project-modal-text">${project.architecture}</p>
        </div>

        <div class="project-modal-actions">
          <a href="${project.github}" target="_blank" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            View GitHub Repository
          </a>
          <button class="btn btn-secondary modal-inner-close">Close Window</button>
        </div>
      `;

      this.modal.classList.add('open');
      if (window.playFeedbackSound) window.playFeedbackSound('pop');

      const innerClose = this.modalContent.querySelector('.modal-inner-close');
      if (innerClose) {
        innerClose.addEventListener('click', () => {
          this.modal.classList.remove('open');
        });
      }
    }
  }

  // ==========================================================================
  // 6. Command Palette (Cmd + K / Ctrl + K)
  // ==========================================================================
  class CmdPaletteController {
    constructor() {
      this.modal = document.getElementById('cmd-palette-modal');
      this.input = document.getElementById('cmd-search-input');
      this.resultsList = document.getElementById('cmd-results-list');
      this.openBtn = document.getElementById('cmd-k-trigger');

      this.items = [
        { title: 'Home / Hero', category: 'Navigation', icon: '⚡', action: () => scrollToSection('hero') },
        { title: 'Interactive Terminal CLI', category: 'Navigation', icon: '>_', action: () => scrollToSection('terminal') },
        { title: 'Featured Projects', category: 'Navigation', icon: '📂', action: () => scrollToSection('projects') },
        { title: 'Technical Skills Matrix', category: 'Navigation', icon: '🧠', action: () => scrollToSection('skills') },
        { title: 'Experience & Career Journey', category: 'Navigation', icon: '🚀', action: () => scrollToSection('experience') },
        { title: 'Particle Physics Canvas Lab', category: 'Navigation', icon: '🧪', action: () => scrollToSection('lab') },
        { title: 'Contact Coordinates', category: 'Navigation', icon: '✉️', action: () => scrollToSection('contact') },
        { title: 'View ATS Resume Window', category: 'Action', icon: '📄', action: () => openResumeModal() },
        { title: 'Switch to Dark Slate Theme', category: 'Theme', icon: '🌙', action: () => themeController.applyTheme('dark') },
        { title: 'Switch to Clean Light Theme', category: 'Theme', icon: '☀️', action: () => themeController.applyTheme('light') },
        { title: 'Switch to Neon Cyberpunk Theme', category: 'Theme', icon: '👾', action: () => themeController.applyTheme('cyber') },
        { title: 'Copy Email Address', category: 'Action', icon: '📋', action: () => copyEmail() },
        { title: 'Toggle Audio Sound Effects', category: 'Action', icon: '🔊', action: () => soundController.toggleSound() }
      ];

      this.filteredItems = [...this.items];
      this.selectedIndex = 0;

      this.init();
    }

    init() {
      if (this.openBtn) {
        this.openBtn.addEventListener('click', () => this.open());
      }

      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape' && this.modal && this.modal.classList.contains('open')) {
          this.close();
        }
      });

      if (this.input) {
        this.input.addEventListener('input', (e) => {
          this.filter(e.target.value);
        });

        this.input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.moveSelection(1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.moveSelection(-1);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.executeSelected();
          }
        });
      }
    }

    toggle() {
      if (this.modal.classList.contains('open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (!this.modal) return;
      this.modal.classList.add('open');
      if (this.input) {
        this.input.value = '';
        this.filter('');
        setTimeout(() => this.input.focus(), 80);
      }
      if (window.playFeedbackSound) window.playFeedbackSound('pop');
    }

    close() {
      if (!this.modal) return;
      this.modal.classList.remove('open');
    }

    filter(query) {
      const q = query.toLowerCase().trim();
      if (!q) {
        this.filteredItems = [...this.items];
      } else {
        this.filteredItems = this.items.filter((item) =>
          item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
        );
      }
      this.selectedIndex = 0;
      this.render();
    }

    render() {
      if (!this.resultsList) return;
      if (this.filteredItems.length === 0) {
        this.resultsList.innerHTML = `<div class="cmd-palette-empty">No matching actions found. Try typing 'theme', 'project', or 'resume'.</div>`;
        return;
      }

      let html = '';
      let currentCategory = '';

      this.filteredItems.forEach((item, idx) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          html += `<div class="cmd-category-heading">${currentCategory}</div>`;
        }
        const isSelected = idx === this.selectedIndex;
        html += `
          <div class="cmd-item ${isSelected ? 'selected' : ''}" data-idx="${idx}">
            <div class="cmd-item-left">
              <span>${item.icon}</span>
              <span>${item.title}</span>
            </div>
            <span class="cmd-item-shortcut">${item.category}</span>
          </div>
        `;
      });

      this.resultsList.innerHTML = html;

      // Click event for rendered items
      this.resultsList.querySelectorAll('.cmd-item').forEach((el) => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-idx'));
          this.selectedIndex = idx;
          this.executeSelected();
        });
      });
    }

    moveSelection(delta) {
      if (this.filteredItems.length === 0) return;
      this.selectedIndex = (this.selectedIndex + delta + this.filteredItems.length) % this.filteredItems.length;
      this.render();
      if (window.playFeedbackSound) window.playFeedbackSound('click');
    }

    executeSelected() {
      const item = this.filteredItems[this.selectedIndex];
      if (item && item.action) {
        this.close();
        item.action();
        if (window.playFeedbackSound) window.playFeedbackSound('chime');
      }
    }
  }

  // ==========================================================================
  // 7. Navigation, Smooth Scroll & Mobile Drawer
  // ==========================================================================
  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function initNav() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const overlay = document.getElementById('mobile-nav-overlay');

    function toggleDrawer(open) {
      if (open) {
        drawer.classList.add('open');
        overlay.classList.add('open');
      } else {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
      }
    }

    if (mobileBtn && drawer && overlay) {
      mobileBtn.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('open')));
      overlay.addEventListener('click', () => toggleDrawer(false));
      drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleDrawer(false));
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('open');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
        }
      });
    });

    // Scrollspy active link highlighter
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollY = window.pageYOffset;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // ==========================================================================
  // 8. Resume Modal & Print Handlers
  // ==========================================================================
  function openResumeModal() {
    const resumeModal = document.getElementById('resume-modal');
    if (resumeModal) {
      resumeModal.classList.add('open');
      if (window.playFeedbackSound) window.playFeedbackSound('pop');
    }
  }
  window.openResumeModal = openResumeModal;

  function initResumeHandlers() {
    const triggerBtn = document.getElementById('view-resume-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => openResumeModal());
    }

    const printBtn = document.getElementById('resume-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ==========================================================================
  // 9. One-Click Email Copy & Live Clock
  // ==========================================================================
  const EMAIL_ADDRESS = 'manthanvora.dev@gmail.com';

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
        showToast('Email copied to clipboard: ' + EMAIL_ADDRESS, 'success');
      }).catch(() => {
        fallbackCopyText(EMAIL_ADDRESS);
      });
    } else {
      fallbackCopyText(EMAIL_ADDRESS);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Email copied to clipboard: ' + text, 'success');
    } catch (err) {
      showToast('Could not copy email automatically.', 'error');
    }
    document.body.removeChild(textArea);
  }

  function initEmailCopy() {
    const btn = document.getElementById('copy-email-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        copyEmail();
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2200);
      });
    }
  }

  function updateLiveClock() {
    const clockEl = document.getElementById('live-time-clock');
    if (!clockEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    clockEl.textContent = `${timeZone} • ${timeStr}`;
  }

  // ==========================================================================
  // 10. Interactive Contact Form
  // ==========================================================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending Dispatch...</span>`;
      }

      // Simulate network request
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Message Sent Successfully!</span>`;
        }
        showToast(`Thank you, ${name}! Your message has been received.`, 'success');
        form.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = `<span>Send Message</span> <span class="btn-icon-suffix"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></span>`;
          }
        }, 3000);
      }, 1000);
    });
  }

  // Helper
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // DOM Ready Initialization
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initNav();
    new TerminalController();
    new ProjectsController();
    new CmdPaletteController();
    initResumeHandlers();
    initEmailCopy();
    initContactForm();

    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Initial greeting toast
    setTimeout(() => {
      showToast('Welcome to Manthan Vora\'s Engineering Portfolio. Press Cmd+K or click >_ for CLI.', 'info', 4500);
    }, 900);
  });
})();