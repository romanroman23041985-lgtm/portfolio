/* ═══════════════════════════════════════════
   LANGUAGE SWITCHER (RU ↔ EN)
   Uses data-ru / data-en attributes on elements
   with class [i18n]. Persists choice in localStorage.
   ═══════════════════════════════════════════ */

(function () {
    const STORAGE_KEY = 'winterai-lang';
    let currentLang = localStorage.getItem(STORAGE_KEY) || 'ru';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;

        // Update all translatable text nodes
        document.querySelectorAll('[data-ru]').forEach(el => {
            const text = el.getAttribute('data-' + lang);
            if (text) {
                // For inputs: update placeholder or value
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = text;
                } else if (el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        // Update toggle button text
        const toggle = document.getElementById('lang-toggle');
        if (toggle) {
            toggle.textContent = lang === 'ru' ? 'EN' : 'RU';
            toggle.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
        }
    }

    // Initialize on DOM ready
    function init() {
        // Create toggle button and insert into nav
        const navLinks = document.querySelector('.nav__links');
        if (navLinks) {
            const btn = document.createElement('button');
            btn.id = 'lang-toggle';
            btn.className = 'glass-btn glass-btn--sm lang-toggle';
            btn.style.cssText = 'padding: 6px 14px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; min-width: 42px; border-radius: 12px; margin-left: 8px;';
            btn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
            btn.setAttribute('aria-label', currentLang === 'ru' ? 'Switch to English' : 'Переключить на русский');
            btn.addEventListener('click', () => {
                applyLanguage(currentLang === 'ru' ? 'en' : 'ru');
            });
            navLinks.appendChild(btn);
        }

        // Apply saved language
        applyLanguage(currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
