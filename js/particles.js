/* ═══════════════════════════════════════════════════════
   LINKED PARTICLES — Canvas 2D Background
   ═══════════════════════════════════════════════════════
   Creates a constellation of particles that:
   - Float gently with organic motion
   - Draw lines between nearby particles
   - React to mouse position (particles attract toward cursor)
   - Uses subtle blue/cyan/pink colors matching the glass palette
   
   The canvas sits behind the glass UI (z-index: -1).
   backdrop-filter on glass panels distorts these particles,
   creating VISIBLE refraction = the actual glass effect.
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const PARTICLE_COUNT = 160;
    const LINK_DISTANCE = 160;
    const MOUSE_RADIUS = 300;
    const MOUSE_FORCE = 0.03;
    const BASE_SPEED = 0.35;
    const PARTICLE_MIN_SIZE = 1.8;
    const PARTICLE_MAX_SIZE = 4;

    // Colors — soft cyan, blue, pink, to match glass accents
    const COLORS = [
        { r: 100, g: 170, b: 255, a: 0.7 },  // blue
        { r: 0, g: 200, b: 230, a: 0.6 },  // cyan
        { r: 230, g: 120, b: 210, a: 0.55 }, // pink
        { r: 100, g: 220, b: 180, a: 0.5 },  // mint
        { r: 170, g: 140, b: 255, a: 0.55 }, // violet
        { r: 255, g: 180, b: 100, a: 0.4 },  // warm amber
    ];

    let canvas, ctx;
    let width, height;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = null;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'particles-bg';
        canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    `;
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');

        resize();
        createParticles();
        bindEvents();
        animate();
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * BASE_SPEED,
                vy: (Math.random() - 0.5) * BASE_SPEED,
                size: PARTICLE_MIN_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE),
                color: color,
                // Organic motion offset (unique per particle)
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                freqX: 0.0005 + Math.random() * 0.001,
                freqY: 0.0005 + Math.random() * 0.001,
                ampX: 0.1 + Math.random() * 0.2,
                ampY: 0.1 + Math.random() * 0.2,
            });
        }
    }

    function bindEvents() {
        // Throttled resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                // Redistribute particles to new dimensions
                particles.forEach(p => {
                    if (p.x > width) p.x = Math.random() * width;
                    if (p.y > height) p.y = Math.random() * height;
                });
            }, 100);
        });

        // Mouse tracking (passive for perf)
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        // Touch support
        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });
    }

    function animate() {
        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Draw one static frame
            drawFrame(Date.now());
            return;
        }

        function loop(time) {
            rafId = requestAnimationFrame(loop);
            drawFrame(time);
        }
        rafId = requestAnimationFrame(loop);
    }

    function drawFrame(time) {
        ctx.clearRect(0, 0, width, height);

        // Update particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Organic sinusoidal drift
            p.vx += Math.sin(time * p.freqX + p.phaseX) * p.ampX * 0.01;
            p.vy += Math.cos(time * p.freqY + p.phaseY) * p.ampY * 0.01;

            // Mouse attraction/repulsion
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
                p.vx += dx / dist * force;
                p.vy += dy / dist * force;
            }

            // Damping
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Clamp speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.5) {
                p.vx = (p.vx / speed) * 1.5;
                p.vy = (p.vy / speed) * 1.5;
            }

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges (with margin)
            if (p.x < -50) p.x = width + 50;
            if (p.x > width + 50) p.x = -50;
            if (p.y < -50) p.y = height + 50;
            if (p.y > height + 50) p.y = -50;
        }

        // Draw links between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < LINK_DISTANCE) {
                    const opacity = (1 - dist / LINK_DISTANCE) * 0.2;
                    const r = (a.color.r + b.color.r) >> 1;
                    const g = (a.color.g + b.color.g) >> 1;
                    const bl = (a.color.b + b.color.b) >> 1;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${r},${g},${bl},${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw links from particles to mouse (if close)
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const opacity = (1 - dist / MOUSE_RADIUS) * 0.3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(100,170,255,${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // Draw particles (circles with glow)
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const c = p.color;

            // Glow halo
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a * 0.12})`;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
            ctx.fill();
        }

        // Mouse cursor — large soft glow orb
        if (mouse.x > 0 && mouse.y > 0) {
            const gradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, 200
            );
            gradient.addColorStop(0, 'rgba(100, 170, 255, 0.12)');
            gradient.addColorStop(0.3, 'rgba(130, 120, 255, 0.06)');
            gradient.addColorStop(0.6, 'rgba(200, 100, 230, 0.03)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
