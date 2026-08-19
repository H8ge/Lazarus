/* ==========================================================================
   STAELER — Custom Profile "Request Quote" modal
   --------------------------------------------------------------------------
   Opened from the configurator's "Angebot anfragen" button via the
   `staeler:openProfile3DModal` event, whose detail carries everything:
     { profile:{outer,hollows,disconnected}, pricing:{…}, meta:{…} }

   ONE screen: the contact form is the focus; the right column shows a large
   hero-style 3D preview and a compact profile/price summary. Quantity and
   length were already entered in the configurator (which drives the price),
   so they are shown read-only in the summary — NOT re-asked here. Everything
   follows the active page language. Submitting builds a fully-specified
   mailto: to anfrage@staeler.de (static site → honest send) and shows the
   success modal. No second click.
   ========================================================================== */

import { setupProfileScene } from './profile3d.js';

(function () {
    'use strict';

    const COMPANY_EMAIL = 'anfrage@staeler.de';

    const modal    = document.getElementById('profile3dModal');
    const canvas   = document.getElementById('profile3dCanvas');
    const closeBtn = document.getElementById('profile3dModalClose');
    const miniEl   = document.getElementById('rqMini');
    const form     = document.getElementById('rqForm');

    if (!modal || !canvas) return;

    let scene = null;
    let data = null;     // { profile, pricing, meta }

    const val  = (id) => (document.getElementById(id)?.value || '').trim();
    const t    = (k)  => (window.I18n && window.I18n.t ? window.I18n.t(k) : k);
    const lang = ()   => (window.I18n && window.I18n.lang ? window.I18n.lang() : (document.documentElement.lang || 'de'));
    const eur  = (v)  => '€' + (v || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const eur0 = (v)  => '€' + Math.round(v || 0).toLocaleString('de-DE');

    // ── Open ──────────────────────────────────────────────────────────────────
    function openModal(detail) {
        // accept both the rich detail and a bare profile (back-compat)
        data = detail && detail.profile ? detail : { profile: detail, pricing: null, meta: {} };
        if (scene) { scene.dispose(); scene = null; }

        renderMini();

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            scene = setupProfileScene(canvas, data.profile.outer, data.profile.hollows || [], {
                meshScale: 1.0,
                autoRotate: false,
            });
        });
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (scene) { const s = scene; scene = null; setTimeout(() => s.dispose(), 100); }
    }

    // ── Compact summary: specs (incl. the qty/length already chosen) + price ──
    function renderMini() {
        if (!miniEl) return;
        const m = data.meta?.metrics || {};
        const p = data.pricing;
        const alloy = data.meta?.alloy || '6063-T6';
        const qty = data.meta?.quantity;
        const len = data.meta?.pieceLength;
        const w = m.bb ? m.bb.width : 0, h = m.bb ? m.bb.height : 0;
        const nf = new Intl.NumberFormat(lang() === 'de' ? 'de-DE' : 'en-US');

        const specs = [
            [t('rq.mini.section'),  `${w.toFixed(0)} × ${h.toFixed(0)} mm`],
            [t('rq.mini.weight'),   (m.weightPerMeter || 0).toFixed(2) + ' kg/m'],
            [t('rq.mini.chambers'), String(m.holes ?? 0)],
            [t('rq.mini.alloy'),    alloy],
        ];
        if (qty != null) specs.push([t('rq.mini.qty'),    nf.format(qty) + ' ' + t('cc.pcs')]);
        if (len != null) specs.push([t('rq.mini.length'), nf.format(len) + ' mm']);

        let html = '<div class="rq-mini-specs">' +
            specs.map(([l, v]) => `<div class="rq-mini-spec"><span>${l}</span><b>${v}</b></div>`).join('') +
            '</div>';
        if (p) {
            html += `<div class="rq-mini-price">
                <div class="rq-mini-price-row"><span>${t('rq.mini.price')}</span><strong>${eur0(p.grandTotal)}</strong></div>
                <div class="rq-mini-price-sub">${eur(p.perPiece)} ${t('rq.mini.perpiece')} · ${eur(p.perMeter)} ${t('rq.mini.permeter')} · ${t('rq.mini.reorder')} ${eur(p.perPieceReorder)} ${t('rq.mini.perpiece')}</div>
            </div>`;
        }
        miniEl.innerHTML = html;
    }

    // ── Build mailto + send ─────────────────────────────────────────────────
    function makeRef() {
        const d = new Date();
        return `STL-${d.getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    }
    function geometryText(prof, L) {
        const fmt = (r) => r.map(([x, y]) => `(${(+x).toFixed(1)},${(+y).toFixed(1)})`).join(' ');
        let s = L.outer + ': ' + fmt(prof.outer);
        (prof.hollows || []).forEach((hh, i) => { s += `\n${L.chamber} ${i + 1}: ` + fmt(hh); });
        if (prof.disconnected) s += '\n[' + L.disconnected + ']';
        return s;
    }

    // Section headers / words that have no UI equivalent — de + en (en is the
    // fallback for fr/pl/es so a customer never gets a German email by surprise).
    const MAIL = {
        de: { subject:'Profil-Anfrage', heading:'Angebotsanfrage — Individuelles Strangpressprofil', ref:'Referenz',
              contact:'KONTAKT', order:'BESTELLUNG', profile:'PROFIL', price:'RICHTPREIS (unverbindlich)',
              geometry:'GEOMETRIE (mm)', message:'NACHRICHT', pieces:'Stück', perPiece:'mm pro Stück',
              section:'Querschnitt', circ:'Hüllkreis ⌀', netArea:'Nettofläche', chambers:'Kammer(n)',
              surface:'Oberfläche', die:'Werkzeug (einmalig)', firstTotal:'Erstbestellung gesamt',
              perPc:'Pro Stück', reorder:'Folgebestellung', outer:'Außenkontur', chamber:'Kammer',
              disconnected:'Hinweis: mehrere getrennte Flächen gezeichnet' },
        en: { subject:'Profile inquiry', heading:'Quote request — Custom extrusion profile', ref:'Reference',
              contact:'CONTACT', order:'ORDER', profile:'PROFILE', price:'INDICATIVE PRICE (non-binding)',
              geometry:'GEOMETRY (mm)', message:'MESSAGE', pieces:'pcs', perPiece:'mm per piece',
              section:'Cross-section', circ:'Circumscribing circle ⌀', netArea:'Net area', chambers:'chamber(s)',
              surface:'Surface', die:'Tooling (one-time)', firstTotal:'First order total',
              perPc:'Per piece', reorder:'reorder', outer:'Outer contour', chamber:'Chamber',
              disconnected:'Note: several disconnected areas were drawn' },
    };

    function submit(e) {
        e.preventDefault();
        const name = val('rqName'), company = val('rqCompany'), email = val('rqEmail');
        const privacy = document.getElementById('rqPrivacy')?.checked;
        const missing = [];
        if (!name) missing.push('rqName');
        if (!company) missing.push('rqCompany');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) missing.push('rqEmail');
        if (!privacy) missing.push('rqPrivacy');
        if (missing.length) {
            missing.forEach(id => { const el = document.getElementById(id); if (el) { el.classList.add('input-error'); el.addEventListener('input', () => el.classList.remove('input-error'), { once: true }); } });
            document.getElementById(missing[0])?.focus();
            return;
        }

        const L = MAIL[lang() === 'de' ? 'de' : 'en'];
        const r = makeRef();
        const m = data.meta?.metrics || {};
        const p = data.pricing;
        const qty = data.meta?.quantity, len = data.meta?.pieceLength;
        const w = m.bb ? m.bb.width : 0, h = m.bb ? m.bb.height : 0;

        const lines = [
            L.heading,
            L.ref + ': ' + r, '',
            L.contact,
            '  ' + t('contact.name') + ':    ' + name,
            '  ' + t('contact.company') + ': ' + company,
            '  ' + t('contact.email') + ':   ' + email,
            '  ' + t('contact.phone') + ': ' + (val('rqPhone') || '-'), '',
            L.order,
            '  ' + t('cc.qty') + ':    ' + (qty != null ? qty + ' ' + L.pieces : '-'),
            '  ' + t('cc.length') + ': ' + (len != null ? len + ' ' + L.perPiece : '-'), '',
            L.profile,
            `  ${L.section}: ${w.toFixed(1)} × ${h.toFixed(1)} mm (${L.circ} ${(m.circumCircle || 0).toFixed(1)} mm)`,
            `  ${L.netArea}: ${(m.netArea || 0).toFixed(0)} mm² · ${(m.weightPerMeter || 0).toFixed(2)} kg/m · ${m.holes ?? 0} ${L.chambers}`,
            `  ${t('cc.alloy')}: ${data.meta?.alloy || '-'}`,
            `  ${L.surface}: ${data.meta?.treatmentLabel || '-'}`,
        ];
        if (p) lines.push('',
            L.price,
            `  ${L.die}: ${eur0(p.dieCost)}`,
            `  ${L.firstTotal}: ${eur(p.grandTotal)}`,
            `  ${L.perPc}: ${eur(p.perPiece)} (${L.reorder} ${eur(p.perPieceReorder)})`);
        lines.push('', L.geometry, data.profile ? geometryText(data.profile, L) : '', '',
            L.message, val('rqMessage') || '-');

        const href = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(L.subject + ' ' + r)}&body=${encodeURIComponent(lines.join('\n'))}`;
        window.location.href = href;

        const refEl = document.getElementById('modalRef');
        if (refEl) refEl.textContent = r;
        closeModal();
        document.getElementById('quoteModal')?.classList.add('active');
        try { form.reset(); } catch (_) {}
    }

    // ── Wire ────────────────────────────────────────────────────────────────
    document.addEventListener('staeler:openProfile3DModal', (e) => openModal(e.detail));
    closeBtn?.addEventListener('click', closeModal);
    modal.querySelector('.profile3d-modal-backdrop')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
    form?.addEventListener('submit', submit);
})();
