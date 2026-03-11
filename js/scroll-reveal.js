/* ============================================
   SCROLL REVEAL — IntersectionObserver
   ============================================ */

(function () {
    'use strict';

    const THRESHOLD = 0.15;
    const ROOT_MARGIN = '0px 0px -50px 0px';

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Instantly reveal all elements
            revealElements.forEach(el => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, {
            threshold: THRESHOLD,
            rootMargin: ROOT_MARGIN
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollReveal);
    } else {
        initScrollReveal();
    }
})();
