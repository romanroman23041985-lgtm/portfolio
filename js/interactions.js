/* ============================================
   INTERACTIONS — Nav, Parallax, Smooth Scroll
   ============================================ */

(function () {
    'use strict';

    /* ---- Smooth Scroll for Anchor Links ---- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav__links');
                if (navLinks) navLinks.classList.remove('open');

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without scroll jump
                history.pushState(null, null, targetId);
            });
        });
    }

    /* ---- Mobile Nav Toggle ---- */
    function initMobileNav() {
        const toggle = document.querySelector('.nav__toggle');
        const links = document.querySelector('.nav__links');
        if (!toggle || !links) return;

        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            const isOpen = links.classList.contains('open');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav__inner')) {
                links.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---- Subtle Mouse Parallax on Hero Floats ---- */
    function initHeroParallax() {
        const heroFloats = document.querySelectorAll('.hero__float');
        if (!heroFloats.length) return;

        // Reduced motion check
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let rafId = null;
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        const LERP = 0.05; // Smooth interpolation factor
        const STRENGTH_X = 15; // Max pixel offset
        const STRENGTH_Y = 10;

        function onMouseMove(e) {
            // Normalize mouse position to -1...1
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }

        function animate() {
            // Smooth lerp
            currentX += (mouseX - currentX) * LERP;
            currentY += (mouseY - currentY) * LERP;

            heroFloats.forEach((el, i) => {
                // Alternate direction per element for depth
                const dirX = i % 2 === 0 ? 1 : -1;
                const dirY = i % 3 === 0 ? 1 : -1;
                const depth = 0.5 + (i * 0.2); // Parallax depth factor

                const tx = currentX * STRENGTH_X * depth * dirX;
                const ty = currentY * STRENGTH_Y * depth * dirY;

                el.style.transform = `translate(${tx}px, ${ty}px)`;
            });

            rafId = requestAnimationFrame(animate);
        }

        // Only run on hero section visibility
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.addEventListener('mousemove', onMouseMove, { passive: true });
                    rafId = requestAnimationFrame(animate);
                } else {
                    document.removeEventListener('mousemove', onMouseMove);
                    if (rafId) cancelAnimationFrame(rafId);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(hero);
    }

    /* ---- Active Nav Highlight on Scroll ---- */
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav__link');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('nav__link--active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    /* ---- Initialize Everything ---- */
    function init() {
        initSmoothScroll();
        initMobileNav();
        initHeroParallax();
        initActiveNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
