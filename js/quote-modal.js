/* ==========================================================================
   STAELER — 3D Quote Modal
   ES module: listens for the staeler:openProfile3DModal event dispatched by
   custom-configurator.js, renders the drawn cross-section as an interactive
   3D extruded profile, and shows it alongside the quote summary.
   ========================================================================== */

import { setupProfileScene } from './profile3d.js';

(function () {
    'use strict';

    const modal   = document.getElementById('profile3dModal');
    const canvas  = document.getElementById('profile3dCanvas');
    const closeBtn = document.getElementById('profile3dModalClose');
    const confirmBtn = document.getElementById('profile3dConfirmQuote');
    const specsEl = document.getElementById('profile3dSpecs');
    const quoteEl = document.getElementById('profile3dQuote');

    if (!modal || !canvas) return;

    let currentScene = null;  // { dispose() } returned by setupProfileScene

    // ── Open modal ───────────────────────────────────────────────────────────
    function openModal(profileData) {
        // Tear down any previous scene
        if (currentScene) {
            currentScene.dispose();
            currentScene = null;
        }

        // Populate specs from configurator state (if exposed on window)
        populateSpecs(profileData);

        // Copy quote summary from the configurator sidebar
        const ccQuote = document.getElementById('ccQuoteSummary');
        if (ccQuote && quoteEl) {
            quoteEl.innerHTML = ccQuote.innerHTML || '<em>Berechne…</em>';
        }

        // Show modal, then init Three.js (canvas needs to be visible for size)
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Use rAF so the browser has painted and the canvas has real dimensions
        requestAnimationFrame(() => {
            currentScene = setupProfileScene(
                canvas,
                profileData.outer,
                profileData.hollows || [],
                {
                    extrudeDepth: 800,
                    rotation: { x: -4.0, y: 0.8, z: 0 },
                    position: { x: 38, y: -6, z: 0 },
                    meshScale: 0.4,
                }
            );
        });
    }

    // ── Close modal ──────────────────────────────────────────────────────────
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (currentScene) {
            // Dispose on next tick to avoid killing the render mid-frame
            const s = currentScene;
            currentScene = null;
            setTimeout(() => s.dispose(), 100);
        }
    }

    // ── Populate spec cards ──────────────────────────────────────────────────
    function populateSpecs(profileData) {
        if (!specsEl) return;

        // Compute basic metrics from the outer polygon
        const outer = profileData.outer;
        let area = 0;
        for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) {
            const [xi, yi] = outer[i];
            const [xj, yj] = outer[j];
            area += (xj + xi) * (yi - yj);
        }
        const outerArea = Math.abs(area) / 2;

        const hollowArea = (profileData.hollows || []).reduce((sum, h) => {
            let a = 0;
            for (let i = 0, j = h.length - 1; i < h.length; j = i++) {
                const [xi, yi] = h[i]; const [xj, yj] = h[j];
                a += (xj + xi) * (yi - yj);
            }
            return sum + Math.abs(a) / 2;
        }, 0);

        const netArea = outerArea - hollowArea;
        const weightPerM = ((netArea / 1e6) * 2700).toFixed(2);  // density 2700 kg/m³

        const xs = outer.map(p => p[0]);
        const ys = outer.map(p => p[1]);
        const w = (Math.max(...xs) - Math.min(...xs)).toFixed(1);
        const h = (Math.max(...ys) - Math.min(...ys)).toFixed(1);
        const circDia = Math.sqrt(w * w + h * h).toFixed(1);

        const specs = [
            { label: 'Nettofläche', value: netArea.toFixed(0) + ' mm²' },
            { label: 'Gewicht / m', value: weightPerM + ' kg/m' },
            { label: 'Breite × Höhe', value: `${w} × ${h} mm` },
            { label: 'Umschr. Kreis ⌀', value: circDia + ' mm' },
            { label: 'Hohlräume', value: (profileData.hollows || []).length.toString() },
            { label: 'Ecken gesamt', value: (outer.length + (profileData.hollows || []).reduce((s, h) => s + h.length, 0)).toString() },
        ];

        specsEl.innerHTML = specs.map(s => `
            <div class="profile3d-spec-item">
                <div class="profile3d-spec-label">${s.label}</div>
                <div class="profile3d-spec-value">${s.value}</div>
            </div>
        `).join('');
    }

    // ── Event listeners ──────────────────────────────────────────────────────
    document.addEventListener('staeler:openProfile3DModal', (e) => openModal(e.detail));

    closeBtn?.addEventListener('click', closeModal);

    modal.querySelector('.profile3d-modal-backdrop')
        ?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // "Confirm quote" — close this modal and open the standard success modal
    confirmBtn?.addEventListener('click', () => {
        closeModal();
        const ref = 'STL-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        const refEl = document.getElementById('modalRef');
        if (refEl) refEl.textContent = ref;
        const successModal = document.getElementById('quoteModal');
        if (successModal) successModal.classList.add('active');
    });
})();
