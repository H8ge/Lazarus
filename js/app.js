/* ==========================================================================
   STAELER — Main Application Script (Redesign)
   Navigation, scroll animations, counters, configurator tabs, contact form
   ========================================================================== */

(function () {
    'use strict';

    // ========================================================================
    // NAVIGATION
    // Full-screen overlay menu with scroll-based styling
    // ========================================================================

    var nav = document.getElementById('nav');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    // Scroll-based nav styling — add "scrolled" class when past 60px
    function handleNavScroll() {
        if (!nav) return;
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // Mobile overlay toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            // menu-open on nav: expands to full viewport, drops backdrop-filter
            // so the fixed overlay isn't trapped inside a 72px containing block
            nav.classList.toggle('menu-open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close overlay when any link inside it is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
                nav.classList.remove('menu-open');
                document.body.style.overflow = '';
            });
        });
    }


    // ========================================================================
    // SMOOTH SCROLL
    // All anchor links scroll smoothly with nav height offset
    // ========================================================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            // Reveal hidden legal sections (privacy / imprint) when linked
            if (href === '#privacy' || href === '#impressum') {
                target.style.display = 'block';
            }

            var offset = nav ? nav.offsetHeight + 20 : 20;
            var top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });


    // ========================================================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // Replaces the old canvas particle animation with CSS-driven reveals
    // ========================================================================

    var animatedElements = document.querySelectorAll('[data-animate]');

    if (animatedElements.length > 0) {
        var animObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseInt(el.getAttribute('data-delay'), 10) || 0;

                    if (delay > 0) {
                        setTimeout(function () {
                            el.classList.add('visible');
                        }, delay);
                    } else {
                        el.classList.add('visible');
                    }

                    animObserver.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        animatedElements.forEach(function (el) {
            animObserver.observe(el);
        });
    }


    // ========================================================================
    // COUNTER ANIMATION
    // Animate [data-count] elements from 0 to their target value
    // ========================================================================

    var counterElements = document.querySelectorAll('[data-count]');

    if (counterElements.length > 0) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                counterObserver.unobserve(el);

                var target = parseInt(el.getAttribute('data-count'), 10);
                if (isNaN(target)) return;

                var duration = 2000;
                var startTime = null;

                function easeOutCubic(t) {
                    return 1 - Math.pow(1 - t, 3);
                }

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;

                    var elapsed = timestamp - startTime;
                    var progress = Math.min(elapsed / duration, 1);
                    var easedProgress = easeOutCubic(progress);
                    var current = Math.round(easedProgress * target);

                    el.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target;
                    }
                }

                requestAnimationFrame(step);
            });
        }, {
            threshold: 0.1
        });

        counterElements.forEach(function (el) {
            counterObserver.observe(el);
        });
    }


    // ========================================================================
    // CONFIGURATOR TAB SWITCHING
    // Toggle between standard and custom configuration panels
    // ========================================================================

    var tabStandard = document.getElementById('tabStandard');
    var tabCustom = document.getElementById('tabCustom');
    var standardPanel = document.getElementById('standardConfigPanel');
    var customPanel = document.getElementById('customConfigPanel');

    if (tabStandard && tabCustom && standardPanel && customPanel) {
        tabStandard.addEventListener('click', function () {
            tabStandard.classList.add('active');
            tabCustom.classList.remove('active');
            standardPanel.style.display = '';
            customPanel.style.display = 'none';
        });

        tabCustom.addEventListener('click', function () {
            tabCustom.classList.add('active');
            tabStandard.classList.remove('active');
            customPanel.style.display = '';
            standardPanel.style.display = 'none';

            // Trigger resize so child canvases / layouts render correctly
            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        });
    }


    // ========================================================================
    // CONTACT FORM
    // Simulated submission with loading and success states
    // ========================================================================

    var contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;

            var get = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
            var name = get('contactName'), company = get('contactCompany'), email = get('contactEmail');

            // basic validation (static site — no backend to validate server-side)
            if (!name || !company || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                [['contactName', name], ['contactCompany', company], ['contactEmail', email]].forEach(function (p) {
                    var el = document.getElementById(p[0]);
                    if (el && !p[1]) { el.classList.add('input-error'); el.addEventListener('input', function () { el.classList.remove('input-error'); }, { once: true }); }
                });
                return;
            }

            // Build a real mailto: so the enquiry actually reaches the company
            var subjectSel = document.getElementById('contactSubject');
            var subjectTxt = subjectSel && subjectSel.value ? subjectSel.options[subjectSel.selectedIndex].text : 'Anfrage';
            var body = [
                'Anfrage über staeler.de', '',
                'Name:     ' + name,
                'Firma:    ' + company,
                'E-Mail:   ' + email,
                'Telefon:  ' + (get('contactPhone') || '-'),
                'Betreff:  ' + subjectTxt, '',
                'Nachricht:',
                get('contactMessage') || '-'
            ].join('\n');
            window.location.href = 'mailto:anfrage@staeler.de?subject=' +
                encodeURIComponent('Anfrage: ' + subjectTxt) + '&body=' + encodeURIComponent(body);

            // success feedback
            var originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML =
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ' +
                'E-Mail-Programm geöffnet';
            btn.style.background = '#22c55e';
            btn.style.borderColor = '#22c55e';
            setTimeout(function () {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
                btn.style.background = '';
                btn.style.borderColor = '';
                contactForm.reset();
            }, 3500);
        });
    }


    // ========================================================================
    // SPIN ANIMATION (injected CSS keyframe for loading indicator)
    // ========================================================================

    var style = document.createElement('style');
    style.textContent =
        '@keyframes spin { to { transform: rotate(360deg); } }' +
        ' .spin { animation: spin 1s linear infinite; }';
    document.head.appendChild(style);

})();
