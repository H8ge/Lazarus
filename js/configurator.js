/* ==========================================================================
   FERRON Profile Configurator
   Interactive tool for configuring steel & aluminum profiles with
   real-time SVG preview, weight calculation, and price estimation.

   All profile dimensions based on EN/DIN standards.
   Pricing is indicative — based on approximate European market rates.
   ========================================================================== */

const Configurator = (() => {

    // ========================================================================
    // MATERIAL DATA
    // ========================================================================

    const MATERIALS = {
        steel: {
            label: 'Structural Steel',
            density: 7850, // kg/m³
            grades: {
                'S235JR': { label: 'S235JR (1.0038)', pricePerKg: 0.82 },
                'S275JR': { label: 'S275JR (1.0044)', pricePerKg: 0.87 },
                'S355J2': { label: 'S355J2 (1.0577)', pricePerKg: 0.93 },
            },
            treatments: {
                'raw':        { label: 'Raw / Mill Finish', addPerKg: 0 },
                'galvanized': { label: 'Hot-Dip Galvanized (EN ISO 1461)', addPerKg: 0.22 },
                'painted':    { label: 'Primer Painted', addPerKg: 0.18 },
                'powder':     { label: 'Powder Coated (RAL)', addPerKg: 0.38 },
            }
        },
        stainless: {
            label: 'Stainless Steel',
            density: 7930,
            grades: {
                '1.4301': { label: '1.4301 / 304', pricePerKg: 3.70 },
                '1.4404': { label: '1.4404 / 316L', pricePerKg: 4.90 },
                '1.4571': { label: '1.4571 / 316Ti', pricePerKg: 5.30 },
            },
            treatments: {
                'raw':       { label: 'Mill Finish (2B)', addPerKg: 0 },
                'brushed':   { label: 'Brushed Finish', addPerKg: 0.35 },
                'polished':  { label: 'Mirror Polished', addPerKg: 0.70 },
                'bead':      { label: 'Bead Blasted', addPerKg: 0.40 },
            }
        },
        aluminum: {
            label: 'Aluminum',
            density: 2700,
            grades: {
                '6060-T6':  { label: '6060-T6 (AlMgSi)', pricePerKg: 4.20 },
                '6063-T6':  { label: '6063-T6 (AlMg0.7Si)', pricePerKg: 4.50 },
                '6082-T6':  { label: '6082-T6 (AlSi1MgMn)', pricePerKg: 4.90 },
            },
            treatments: {
                'raw':       { label: 'Mill Finish', addPerKg: 0 },
                'anodized':  { label: 'Anodized (natural)', addPerKg: 0.55 },
                'anodized_c':{ label: 'Anodized (coloured)', addPerKg: 0.70 },
                'powder':    { label: 'Powder Coated (RAL)', addPerKg: 0.42 },
            }
        }
    };

    // Complexity multiplier by profile type
    const COMPLEXITY = {
        ipe:       1.15,
        hea:       1.15,
        upn:       1.10,
        angle:     1.05,
        tee:       1.10,
        shs:       1.18,
        rhs:       1.20,
        chs:       1.18,
        flat:      1.00,
        round:     1.00,
    };

    // Quantity discount tiers (total weight in kg)
    const QTY_TIERS = [
        { maxKg: 100,    factor: 1.35 },  // Small order surcharge
        { maxKg: 250,    factor: 1.20 },
        { maxKg: 500,    factor: 1.10 },
        { maxKg: 1000,   factor: 1.05 },
        { maxKg: 2500,   factor: 1.00 },
        { maxKg: 5000,   factor: 0.97 },
        { maxKg: Infinity, factor: 0.94 },
    ];

    // Minimum order: 100 kg or 6m total length
    const MIN_ORDER_KG = 100;
    const MIN_PIECE_LENGTH_MM = 500;
    const STANDARD_LENGTHS_MM = [6000, 12000];
    const CUTTING_SURCHARGE = 0.12; // 12% for non-standard lengths

    // ========================================================================
    // PROFILE TYPE DEFINITIONS
    // ========================================================================

    const PROFILES = {
        ipe: {
            name: 'IPE Beam',
            category: 'I-Beam',
            desc: 'European I-beam',
            params: [
                { key: 'h',  label: 'Height',           unit: 'mm', min: 80,  max: 600, step: 1 },
                { key: 'b',  label: 'Flange Width',     unit: 'mm', min: 46,  max: 220, step: 1 },
                { key: 'tw', label: 'Web Thickness',    unit: 'mm', min: 3.8, max: 12.0, step: 0.1 },
                { key: 'tf', label: 'Flange Thickness',unit: 'mm', min: 5.2, max: 19.0, step: 0.1 },
            ],
            standardSizes: {
                'IPE 80':  { h: 80,  b: 46,  tw: 3.8, tf: 5.2 },
                'IPE 100': { h: 100, b: 55,  tw: 4.1, tf: 5.7 },
                'IPE 120': { h: 120, b: 64,  tw: 4.4, tf: 6.3 },
                'IPE 140': { h: 140, b: 73,  tw: 4.7, tf: 6.9 },
                'IPE 160': { h: 160, b: 82,  tw: 5.0, tf: 7.4 },
                'IPE 180': { h: 180, b: 91,  tw: 5.3, tf: 8.0 },
                'IPE 200': { h: 200, b: 100, tw: 5.6, tf: 8.5 },
                'IPE 220': { h: 220, b: 110, tw: 5.9, tf: 9.2 },
                'IPE 240': { h: 240, b: 120, tw: 6.2, tf: 9.8 },
                'IPE 270': { h: 270, b: 135, tw: 6.6, tf: 10.2 },
                'IPE 300': { h: 300, b: 150, tw: 7.1, tf: 10.7 },
                'IPE 330': { h: 330, b: 160, tw: 7.5, tf: 11.5 },
                'IPE 360': { h: 360, b: 170, tw: 8.0, tf: 12.7 },
                'IPE 400': { h: 400, b: 180, tw: 8.6, tf: 13.5 },
                'IPE 450': { h: 450, b: 190, tw: 9.4, tf: 14.6 },
                'IPE 500': { h: 500, b: 200, tw: 10.2, tf: 16.0 },
                'IPE 550': { h: 550, b: 210, tw: 11.1, tf: 17.2 },
                'IPE 600': { h: 600, b: 220, tw: 12.0, tf: 19.0 },
            },
            calcArea(p) {
                // Area of I-beam: 2 * flanges + web
                const flangeArea = 2 * p.b * p.tf;
                const webArea = (p.h - 2 * p.tf) * p.tw;
                return flangeArea + webArea; // mm²
            },
            drawSvg(p, size) {
                const s = size / Math.max(p.h, p.b) * 0.65;
                const cx = size / 2, cy = size / 2;
                const h = p.h * s, b = p.b * s, tw = p.tw * s, tf = p.tf * s;

                let svg = '';
                // Profile shape
                const x0 = cx - b/2, y0 = cy - h/2;
                svg += `<path d="
                    M ${x0} ${y0}
                    L ${x0 + b} ${y0}
                    L ${x0 + b} ${y0 + tf}
                    L ${cx + tw/2} ${y0 + tf}
                    L ${cx + tw/2} ${y0 + h - tf}
                    L ${x0 + b} ${y0 + h - tf}
                    L ${x0 + b} ${y0 + h}
                    L ${x0} ${y0 + h}
                    L ${x0} ${y0 + h - tf}
                    L ${cx - tw/2} ${y0 + h - tf}
                    L ${cx - tw/2} ${y0 + tf}
                    L ${x0} ${y0 + tf}
                    Z
                " fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;

                // Dimension lines
                svg += drawDimLine(x0 - 30, y0, x0 - 30, y0 + h, `${p.h}`, 'left', size);
                svg += drawDimLine(x0, y0 - 20, x0 + b, y0 - 20, `${p.b}`, 'top', size);
                svg += drawDimLine(cx + tw/2 + 8, y0 + tf + 4, cx + tw/2 + 8, y0 + h - tf - 4, '', 'right', size);
                // Web thickness indicator
                svg += drawDimLabel(cx, cy, `tw=${p.tw}`, size);

                return svg;
            }
        },

        hea: {
            name: 'HEA Beam',
            category: 'H-Beam',
            desc: 'Wide flange beam',
            params: [
                { key: 'h',  label: 'Height',           unit: 'mm', min: 96,  max: 590, step: 1 },
                { key: 'b',  label: 'Flange Width',     unit: 'mm', min: 100, max: 300, step: 1 },
                { key: 'tw', label: 'Web Thickness',    unit: 'mm', min: 5.0, max: 15.0, step: 0.1 },
                { key: 'tf', label: 'Flange Thickness',unit: 'mm', min: 8.0, max: 24.0, step: 0.1 },
            ],
            standardSizes: {
                'HEA 100': { h: 96,  b: 100, tw: 5.0, tf: 8.0 },
                'HEA 120': { h: 114, b: 120, tw: 5.0, tf: 8.0 },
                'HEA 140': { h: 133, b: 140, tw: 5.5, tf: 8.5 },
                'HEA 160': { h: 152, b: 160, tw: 6.0, tf: 9.0 },
                'HEA 180': { h: 171, b: 180, tw: 6.0, tf: 9.5 },
                'HEA 200': { h: 190, b: 200, tw: 6.5, tf: 10.0 },
                'HEA 220': { h: 210, b: 220, tw: 7.0, tf: 11.0 },
                'HEA 240': { h: 230, b: 240, tw: 7.5, tf: 12.0 },
                'HEA 260': { h: 250, b: 260, tw: 7.5, tf: 12.5 },
                'HEA 280': { h: 270, b: 280, tw: 8.0, tf: 13.0 },
                'HEA 300': { h: 290, b: 300, tw: 8.5, tf: 14.0 },
                'HEA 340': { h: 330, b: 300, tw: 9.5, tf: 16.5 },
                'HEA 360': { h: 350, b: 300, tw: 10.0, tf: 17.5 },
                'HEA 400': { h: 390, b: 300, tw: 11.0, tf: 19.0 },
                'HEA 450': { h: 440, b: 300, tw: 11.5, tf: 21.0 },
                'HEA 500': { h: 490, b: 300, tw: 12.0, tf: 23.0 },
                'HEA 550': { h: 540, b: 300, tw: 12.5, tf: 24.0 },
            },
            calcArea(p) {
                return 2 * p.b * p.tf + (p.h - 2 * p.tf) * p.tw;
            },
            drawSvg(p, size) {
                // Same shape as IPE
                return PROFILES.ipe.drawSvg.call(this, p, size);
            }
        },

        upn: {
            name: 'UPN Channel',
            category: 'Channel',
            desc: 'U-shaped channel',
            params: [
                { key: 'h',  label: 'Height',           unit: 'mm', min: 50,  max: 400, step: 1 },
                { key: 'b',  label: 'Flange Width',     unit: 'mm', min: 38,  max: 110, step: 1 },
                { key: 'tw', label: 'Web Thickness',    unit: 'mm', min: 5.0, max: 14.0, step: 0.1 },
                { key: 'tf', label: 'Flange Thickness',unit: 'mm', min: 7.0, max: 16.0, step: 0.1 },
            ],
            standardSizes: {
                'UPN 50':  { h: 50,  b: 38,  tw: 5.0, tf: 7.0 },
                'UPN 65':  { h: 65,  b: 42,  tw: 5.5, tf: 7.5 },
                'UPN 80':  { h: 80,  b: 45,  tw: 6.0, tf: 8.0 },
                'UPN 100': { h: 100, b: 50,  tw: 6.0, tf: 8.5 },
                'UPN 120': { h: 120, b: 55,  tw: 7.0, tf: 9.0 },
                'UPN 140': { h: 140, b: 60,  tw: 7.0, tf: 10.0 },
                'UPN 160': { h: 160, b: 65,  tw: 7.5, tf: 10.5 },
                'UPN 180': { h: 180, b: 70,  tw: 8.0, tf: 11.0 },
                'UPN 200': { h: 200, b: 75,  tw: 8.5, tf: 11.5 },
                'UPN 220': { h: 220, b: 80,  tw: 9.0, tf: 12.5 },
                'UPN 240': { h: 240, b: 85,  tw: 9.5, tf: 13.0 },
                'UPN 260': { h: 260, b: 90,  tw: 10.0, tf: 14.0 },
                'UPN 280': { h: 280, b: 95,  tw: 10.0, tf: 15.0 },
                'UPN 300': { h: 300, b: 100, tw: 10.0, tf: 16.0 },
                'UPN 400': { h: 400, b: 110, tw: 14.0, tf: 18.0 },
            },
            calcArea(p) {
                // Channel: web + 2 flanges
                return (p.h - 2 * p.tf) * p.tw + 2 * p.b * p.tf;
            },
            drawSvg(p, size) {
                const s = size / Math.max(p.h, p.b * 1.6) * 0.6;
                const cx = size / 2, cy = size / 2;
                const h = p.h * s, b = p.b * s, tw = p.tw * s, tf = p.tf * s;

                const x0 = cx - b / 2, y0 = cy - h / 2;
                let svg = '';
                svg += `<path d="
                    M ${x0} ${y0}
                    L ${x0 + b} ${y0}
                    L ${x0 + b} ${y0 + tf}
                    L ${x0 + tw} ${y0 + tf}
                    L ${x0 + tw} ${y0 + h - tf}
                    L ${x0 + b} ${y0 + h - tf}
                    L ${x0 + b} ${y0 + h}
                    L ${x0} ${y0 + h}
                    Z
                " fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;

                svg += drawDimLine(x0 - 30, y0, x0 - 30, y0 + h, `${p.h}`, 'left', size);
                svg += drawDimLine(x0, y0 - 20, x0 + b, y0 - 20, `${p.b}`, 'top', size);

                return svg;
            }
        },

        angle: {
            name: 'L-Angle',
            category: 'Angle',
            desc: 'Equal/unequal angle',
            params: [
                { key: 'a', label: 'Leg A (vertical)', unit: 'mm', min: 20, max: 250, step: 1 },
                { key: 'b', label: 'Leg B (horizontal)', unit: 'mm', min: 20, max: 250, step: 1 },
                { key: 't', label: 'Thickness',        unit: 'mm', min: 3,  max: 28,  step: 0.5 },
            ],
            standardSizes: {
                'L 20x20x3':   { a: 20,  b: 20,  t: 3 },
                'L 25x25x3':   { a: 25,  b: 25,  t: 3 },
                'L 30x30x3':   { a: 30,  b: 30,  t: 3 },
                'L 40x40x4':   { a: 40,  b: 40,  t: 4 },
                'L 45x45x5':   { a: 45,  b: 45,  t: 5 },
                'L 50x50x5':   { a: 50,  b: 50,  t: 5 },
                'L 60x60x6':   { a: 60,  b: 60,  t: 6 },
                'L 70x70x7':   { a: 70,  b: 70,  t: 7 },
                'L 80x80x8':   { a: 80,  b: 80,  t: 8 },
                'L 90x90x9':   { a: 90,  b: 90,  t: 9 },
                'L 100x100x10': { a: 100, b: 100, t: 10 },
                'L 120x120x12': { a: 120, b: 120, t: 12 },
                'L 150x150x15': { a: 150, b: 150, t: 15 },
                'L 200x200x20': { a: 200, b: 200, t: 20 },
                'L 60x40x5':   { a: 60,  b: 40,  t: 5 },
                'L 80x60x7':   { a: 80,  b: 60,  t: 7 },
                'L 100x65x8':  { a: 100, b: 65,  t: 8 },
                'L 120x80x10': { a: 120, b: 80,  t: 10 },
                'L 150x100x12':{ a: 150, b: 100, t: 12 },
            },
            calcArea(p) {
                // L = a*t + (b - t)*t
                return p.a * p.t + (p.b - p.t) * p.t;
            },
            drawSvg(p, size) {
                const s = size / Math.max(p.a, p.b) * 0.55;
                const cx = size / 2, cy = size / 2;
                const a = p.a * s, b = p.b * s, t = p.t * s;

                const x0 = cx - b / 3, y0 = cy - a / 2;
                let svg = '';
                svg += `<path d="
                    M ${x0} ${y0}
                    L ${x0 + t} ${y0}
                    L ${x0 + t} ${y0 + a - t}
                    L ${x0 + b} ${y0 + a - t}
                    L ${x0 + b} ${y0 + a}
                    L ${x0} ${y0 + a}
                    Z
                " fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;

                svg += drawDimLine(x0 - 25, y0, x0 - 25, y0 + a, `${p.a}`, 'left', size);
                svg += drawDimLine(x0, y0 + a + 20, x0 + b, y0 + a + 20, `${p.b}`, 'bottom', size);

                return svg;
            }
        },

        tee: {
            name: 'T-Profile',
            category: 'T-Section',
            desc: 'T-shaped section',
            params: [
                { key: 'h',  label: 'Height',           unit: 'mm', min: 20,  max: 200, step: 1 },
                { key: 'b',  label: 'Flange Width',     unit: 'mm', min: 20,  max: 200, step: 1 },
                { key: 'tw', label: 'Web Thickness',    unit: 'mm', min: 3,   max: 16,  step: 0.5 },
                { key: 'tf', label: 'Flange Thickness',unit: 'mm', min: 3,   max: 16,  step: 0.5 },
            ],
            standardSizes: {
                'T 30x30x4':   { h: 30,  b: 30,  tw: 4,  tf: 4 },
                'T 40x40x5':   { h: 40,  b: 40,  tw: 5,  tf: 5 },
                'T 50x50x6':   { h: 50,  b: 50,  tw: 6,  tf: 6 },
                'T 60x60x7':   { h: 60,  b: 60,  tw: 7,  tf: 7 },
                'T 70x70x8':   { h: 70,  b: 70,  tw: 8,  tf: 8 },
                'T 80x80x9':   { h: 80,  b: 80,  tw: 9,  tf: 9 },
                'T 100x100x11':{ h: 100, b: 100, tw: 11, tf: 11 },
            },
            calcArea(p) {
                return p.b * p.tf + (p.h - p.tf) * p.tw;
            },
            drawSvg(p, size) {
                const s = size / Math.max(p.h, p.b) * 0.55;
                const cx = size / 2, cy = size / 2;
                const h = p.h * s, b = p.b * s, tw = p.tw * s, tf = p.tf * s;

                const x0 = cx - b / 2, y0 = cy - h / 2;
                let svg = '';
                svg += `<path d="
                    M ${x0} ${y0}
                    L ${x0 + b} ${y0}
                    L ${x0 + b} ${y0 + tf}
                    L ${cx + tw/2} ${y0 + tf}
                    L ${cx + tw/2} ${y0 + h}
                    L ${cx - tw/2} ${y0 + h}
                    L ${cx - tw/2} ${y0 + tf}
                    L ${x0} ${y0 + tf}
                    Z
                " fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;

                svg += drawDimLine(x0 - 25, y0, x0 - 25, y0 + h, `${p.h}`, 'left', size);
                svg += drawDimLine(x0, y0 - 20, x0 + b, y0 - 20, `${p.b}`, 'top', size);

                return svg;
            }
        },

        shs: {
            name: 'Square Tube',
            category: 'Hollow Section',
            desc: 'SHS — EN 10210/10219',
            params: [
                { key: 'a', label: 'Side Length',   unit: 'mm', min: 20,  max: 400, step: 1 },
                { key: 't', label: 'Wall Thickness', unit: 'mm', min: 2.0, max: 16.0, step: 0.1 },
            ],
            standardSizes: {
                'SHS 20x2':    { a: 20,  t: 2.0 },
                'SHS 25x2.5':  { a: 25,  t: 2.5 },
                'SHS 30x3':    { a: 30,  t: 3.0 },
                'SHS 40x3':    { a: 40,  t: 3.0 },
                'SHS 40x4':    { a: 40,  t: 4.0 },
                'SHS 50x3':    { a: 50,  t: 3.0 },
                'SHS 50x4':    { a: 50,  t: 4.0 },
                'SHS 50x5':    { a: 50,  t: 5.0 },
                'SHS 60x4':    { a: 60,  t: 4.0 },
                'SHS 60x5':    { a: 60,  t: 5.0 },
                'SHS 70x5':    { a: 70,  t: 5.0 },
                'SHS 80x4':    { a: 80,  t: 4.0 },
                'SHS 80x5':    { a: 80,  t: 5.0 },
                'SHS 80x6':    { a: 80,  t: 6.0 },
                'SHS 90x5':    { a: 90,  t: 5.0 },
                'SHS 100x5':   { a: 100, t: 5.0 },
                'SHS 100x6':   { a: 100, t: 6.0 },
                'SHS 100x8':   { a: 100, t: 8.0 },
                'SHS 120x6':   { a: 120, t: 6.0 },
                'SHS 120x8':   { a: 120, t: 8.0 },
                'SHS 150x6':   { a: 150, t: 6.0 },
                'SHS 150x8':   { a: 150, t: 8.0 },
                'SHS 150x10':  { a: 150, t: 10.0 },
                'SHS 200x8':   { a: 200, t: 8.0 },
                'SHS 200x10':  { a: 200, t: 10.0 },
                'SHS 250x8':   { a: 250, t: 8.0 },
                'SHS 250x10':  { a: 250, t: 10.0 },
                'SHS 300x10':  { a: 300, t: 10.0 },
                'SHS 300x12':  { a: 300, t: 12.0 },
            },
            calcArea(p) {
                // Outer area - inner area
                return p.a * p.a - (p.a - 2 * p.t) * (p.a - 2 * p.t);
            },
            drawSvg(p, size) {
                const s = size / p.a * 0.55;
                const cx = size / 2, cy = size / 2;
                const a = p.a * s, t = p.t * s;

                const x0 = cx - a / 2, y0 = cy - a / 2;
                const r = Math.min(t * 1.5, 8);
                let svg = '';
                // Outer rect
                svg += `<rect x="${x0}" y="${y0}" width="${a}" height="${a}" rx="${r}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;
                // Inner rect (hole)
                svg += `<rect x="${x0 + t}" y="${y0 + t}" width="${a - 2*t}" height="${a - 2*t}" rx="${r*0.5}" fill="#111827" stroke="#3b82f6" stroke-width="0.8" stroke-dasharray="4 3"/>`;

                svg += drawDimLine(x0 - 25, y0, x0 - 25, y0 + a, `${p.a}`, 'left', size);
                svg += drawDimLabel(x0 + t/2, cy, `t=${p.t}`, size);

                return svg;
            }
        },

        rhs: {
            name: 'Rectangular Tube',
            category: 'Hollow Section',
            desc: 'RHS — EN 10210/10219',
            params: [
                { key: 'h', label: 'Height',         unit: 'mm', min: 30,  max: 500, step: 1 },
                { key: 'b', label: 'Width',           unit: 'mm', min: 20,  max: 300, step: 1 },
                { key: 't', label: 'Wall Thickness',  unit: 'mm', min: 2.0, max: 16.0, step: 0.1 },
            ],
            standardSizes: {
                'RHS 40x20x2.5': { h: 40,  b: 20,  t: 2.5 },
                'RHS 50x25x3':   { h: 50,  b: 25,  t: 3.0 },
                'RHS 50x30x3':   { h: 50,  b: 30,  t: 3.0 },
                'RHS 60x30x3':   { h: 60,  b: 30,  t: 3.0 },
                'RHS 60x40x3':   { h: 60,  b: 40,  t: 3.0 },
                'RHS 60x40x4':   { h: 60,  b: 40,  t: 4.0 },
                'RHS 80x40x3':   { h: 80,  b: 40,  t: 3.0 },
                'RHS 80x40x4':   { h: 80,  b: 40,  t: 4.0 },
                'RHS 80x40x5':   { h: 80,  b: 40,  t: 5.0 },
                'RHS 100x50x4':  { h: 100, b: 50,  t: 4.0 },
                'RHS 100x50x5':  { h: 100, b: 50,  t: 5.0 },
                'RHS 100x60x5':  { h: 100, b: 60,  t: 5.0 },
                'RHS 120x60x5':  { h: 120, b: 60,  t: 5.0 },
                'RHS 120x60x6':  { h: 120, b: 60,  t: 6.0 },
                'RHS 120x80x5':  { h: 120, b: 80,  t: 5.0 },
                'RHS 120x80x6':  { h: 120, b: 80,  t: 6.0 },
                'RHS 150x100x5': { h: 150, b: 100, t: 5.0 },
                'RHS 150x100x6': { h: 150, b: 100, t: 6.0 },
                'RHS 160x80x5':  { h: 160, b: 80,  t: 5.0 },
                'RHS 200x100x6': { h: 200, b: 100, t: 6.0 },
                'RHS 200x100x8': { h: 200, b: 100, t: 8.0 },
                'RHS 250x150x8': { h: 250, b: 150, t: 8.0 },
                'RHS 300x200x8': { h: 300, b: 200, t: 8.0 },
                'RHS 300x200x10':{ h: 300, b: 200, t: 10.0 },
                'RHS 400x200x10':{ h: 400, b: 200, t: 10.0 },
            },
            calcArea(p) {
                return p.h * p.b - (p.h - 2 * p.t) * (p.b - 2 * p.t);
            },
            drawSvg(p, size) {
                const s = size / Math.max(p.h, p.b) * 0.55;
                const cx = size / 2, cy = size / 2;
                const h = p.h * s, b = p.b * s, t = p.t * s;

                const x0 = cx - b / 2, y0 = cy - h / 2;
                const r = Math.min(t * 1.5, 8);
                let svg = '';
                svg += `<rect x="${x0}" y="${y0}" width="${b}" height="${h}" rx="${r}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;
                svg += `<rect x="${x0 + t}" y="${y0 + t}" width="${b - 2*t}" height="${h - 2*t}" rx="${r*0.5}" fill="#111827" stroke="#3b82f6" stroke-width="0.8" stroke-dasharray="4 3"/>`;

                svg += drawDimLine(x0 - 30, y0, x0 - 30, y0 + h, `${p.h}`, 'left', size);
                svg += drawDimLine(x0, y0 - 20, x0 + b, y0 - 20, `${p.b}`, 'top', size);

                return svg;
            }
        },

        chs: {
            name: 'Round Tube',
            category: 'Hollow Section',
            desc: 'CHS — EN 10210/10219',
            params: [
                { key: 'd', label: 'Outer Diameter',   unit: 'mm', min: 21.3, max: 508, step: 0.1 },
                { key: 't', label: 'Wall Thickness',   unit: 'mm', min: 2.0,  max: 16.0, step: 0.1 },
            ],
            standardSizes: {
                'CHS 21.3x2.3':  { d: 21.3,  t: 2.3 },
                'CHS 26.9x2.3':  { d: 26.9,  t: 2.3 },
                'CHS 33.7x3.2':  { d: 33.7,  t: 3.2 },
                'CHS 42.4x3.2':  { d: 42.4,  t: 3.2 },
                'CHS 48.3x3.2':  { d: 48.3,  t: 3.2 },
                'CHS 60.3x3.6':  { d: 60.3,  t: 3.6 },
                'CHS 76.1x3.6':  { d: 76.1,  t: 3.6 },
                'CHS 88.9x4.0':  { d: 88.9,  t: 4.0 },
                'CHS 101.6x4.0': { d: 101.6, t: 4.0 },
                'CHS 114.3x4.0': { d: 114.3, t: 4.0 },
                'CHS 139.7x5.0': { d: 139.7, t: 5.0 },
                'CHS 168.3x5.0': { d: 168.3, t: 5.0 },
                'CHS 193.7x6.3': { d: 193.7, t: 6.3 },
                'CHS 219.1x6.3': { d: 219.1, t: 6.3 },
                'CHS 244.5x6.3': { d: 244.5, t: 6.3 },
                'CHS 273x6.3':   { d: 273,   t: 6.3 },
                'CHS 323.9x8':   { d: 323.9, t: 8.0 },
                'CHS 355.6x8':   { d: 355.6, t: 8.0 },
                'CHS 406.4x10':  { d: 406.4, t: 10.0 },
                'CHS 457x10':    { d: 457,   t: 10.0 },
                'CHS 508x10':    { d: 508,   t: 10.0 },
            },
            calcArea(p) {
                const outer = Math.PI * (p.d / 2) ** 2;
                const inner = Math.PI * ((p.d / 2) - p.t) ** 2;
                return outer - inner;
            },
            drawSvg(p, size) {
                const s = size / p.d * 0.5;
                const cx = size / 2, cy = size / 2;
                const r = p.d / 2 * s;
                const ri = (p.d / 2 - p.t) * s;

                let svg = '';
                svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;
                svg += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="#111827" stroke="#3b82f6" stroke-width="0.8" stroke-dasharray="4 3"/>`;

                // Diameter dimension
                svg += `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4 2"/>`;
                svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="var(--font-mono)">D=${p.d}</text>`;
                // Wall thickness
                svg += drawDimLabel(cx + r - (r - ri) / 2, cy + r * 0.6, `t=${p.t}`, size);

                return svg;
            }
        },

        flat: {
            name: 'Flat Bar',
            category: 'Bar',
            desc: 'EN 10058 flat bar',
            params: [
                { key: 'b', label: 'Width',     unit: 'mm', min: 10,  max: 300, step: 1 },
                { key: 't', label: 'Thickness', unit: 'mm', min: 3,   max: 60,  step: 0.5 },
            ],
            standardSizes: {
                'Flat 20x3':   { b: 20,  t: 3 },
                'Flat 20x5':   { b: 20,  t: 5 },
                'Flat 25x5':   { b: 25,  t: 5 },
                'Flat 30x3':   { b: 30,  t: 3 },
                'Flat 30x5':   { b: 30,  t: 5 },
                'Flat 30x6':   { b: 30,  t: 6 },
                'Flat 40x4':   { b: 40,  t: 4 },
                'Flat 40x5':   { b: 40,  t: 5 },
                'Flat 40x8':   { b: 40,  t: 8 },
                'Flat 50x5':   { b: 50,  t: 5 },
                'Flat 50x6':   { b: 50,  t: 6 },
                'Flat 50x8':   { b: 50,  t: 8 },
                'Flat 50x10':  { b: 50,  t: 10 },
                'Flat 60x6':   { b: 60,  t: 6 },
                'Flat 60x8':   { b: 60,  t: 8 },
                'Flat 60x10':  { b: 60,  t: 10 },
                'Flat 80x8':   { b: 80,  t: 8 },
                'Flat 80x10':  { b: 80,  t: 10 },
                'Flat 100x10': { b: 100, t: 10 },
                'Flat 100x12': { b: 100, t: 12 },
                'Flat 120x10': { b: 120, t: 10 },
                'Flat 150x12': { b: 150, t: 12 },
                'Flat 150x15': { b: 150, t: 15 },
                'Flat 200x15': { b: 200, t: 15 },
                'Flat 200x20': { b: 200, t: 20 },
            },
            calcArea(p) {
                return p.b * p.t;
            },
            drawSvg(p, size) {
                const maxDim = Math.max(p.b, p.t * 3);
                const s = size / maxDim * 0.5;
                const cx = size / 2, cy = size / 2;
                const b = p.b * s, t = p.t * s;

                const x0 = cx - b / 2, y0 = cy - t / 2;
                const r = 2;
                let svg = '';
                svg += `<rect x="${x0}" y="${y0}" width="${b}" height="${t}" rx="${r}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;

                svg += drawDimLine(x0, y0 - 20, x0 + b, y0 - 20, `${p.b}`, 'top', size);
                svg += drawDimLine(x0 - 25, y0, x0 - 25, y0 + t, `${p.t}`, 'left', size);

                return svg;
            }
        },

        round: {
            name: 'Round Bar',
            category: 'Bar',
            desc: 'EN 10060 round bar',
            params: [
                { key: 'd', label: 'Diameter', unit: 'mm', min: 6, max: 300, step: 0.5 },
            ],
            standardSizes: {
                'Round 6':   { d: 6 },
                'Round 8':   { d: 8 },
                'Round 10':  { d: 10 },
                'Round 12':  { d: 12 },
                'Round 14':  { d: 14 },
                'Round 16':  { d: 16 },
                'Round 18':  { d: 18 },
                'Round 20':  { d: 20 },
                'Round 22':  { d: 22 },
                'Round 25':  { d: 25 },
                'Round 28':  { d: 28 },
                'Round 30':  { d: 30 },
                'Round 32':  { d: 32 },
                'Round 35':  { d: 35 },
                'Round 40':  { d: 40 },
                'Round 45':  { d: 45 },
                'Round 50':  { d: 50 },
                'Round 55':  { d: 55 },
                'Round 60':  { d: 60 },
                'Round 70':  { d: 70 },
                'Round 80':  { d: 80 },
                'Round 90':  { d: 90 },
                'Round 100': { d: 100 },
                'Round 120': { d: 120 },
                'Round 150': { d: 150 },
                'Round 200': { d: 200 },
            },
            calcArea(p) {
                return Math.PI * (p.d / 2) ** 2;
            },
            drawSvg(p, size) {
                const s = size / p.d * 0.45;
                const cx = size / 2, cy = size / 2;
                const r = p.d / 2 * s;

                let svg = '';
                svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5"/>`;
                svg += `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4 2"/>`;
                svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="var(--font-mono)">D=${p.d}</text>`;

                return svg;
            }
        }
    };


    // ========================================================================
    // SVG HELPER FUNCTIONS
    // ========================================================================

    function drawDimLine(x1, y1, x2, y2, label, position, svgSize) {
        const isVertical = Math.abs(x1 - x2) < 1;
        let svg = '';
        const cap = 4;

        // Line
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="0.8"/>`;

        // End caps
        if (isVertical) {
            svg += `<line x1="${x1-cap}" y1="${y1}" x2="${x1+cap}" y2="${y1}" stroke="#64748b" stroke-width="0.8"/>`;
            svg += `<line x1="${x2-cap}" y1="${y2}" x2="${x2+cap}" y2="${y2}" stroke="#64748b" stroke-width="0.8"/>`;
        } else {
            svg += `<line x1="${x1}" y1="${y1-cap}" x2="${x1}" y2="${y1+cap}" stroke="#64748b" stroke-width="0.8"/>`;
            svg += `<line x1="${x2}" y1="${y2-cap}" x2="${x2}" y2="${y2+cap}" stroke="#64748b" stroke-width="0.8"/>`;
        }

        // Label
        if (label) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            if (isVertical) {
                svg += `<text x="${mx - 8}" y="${my + 4}" text-anchor="end" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace">${label}</text>`;
            } else {
                svg += `<text x="${mx}" y="${my - 6}" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace">${label}</text>`;
            }
        }

        return svg;
    }

    function drawDimLabel(x, y, label, svgSize) {
        return `<text x="${x}" y="${y}" text-anchor="middle" fill="#60a5fa" font-size="9" font-family="'JetBrains Mono', monospace" opacity="0.8">${label}</text>`;
    }

    // Profile type SVG icons for the selection grid
    function getProfileIcon(typeKey) {
        const icons = {
            ipe: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="16" y="10" width="40" height="8" rx="1.5" fill="#3b82f6" opacity="0.7"/>
                <rect x="31" y="18" width="10" height="36" rx="1" fill="#3b82f6" opacity="0.5"/>
                <rect x="16" y="54" width="40" height="8" rx="1.5" fill="#3b82f6" opacity="0.7"/>
            </svg>`,
            hea: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="10" y="10" width="52" height="10" rx="1.5" fill="#3b82f6" opacity="0.7"/>
                <rect x="29" y="20" width="14" height="32" rx="1" fill="#3b82f6" opacity="0.5"/>
                <rect x="10" y="52" width="52" height="10" rx="1.5" fill="#3b82f6" opacity="0.7"/>
            </svg>`,
            upn: `<svg viewBox="0 0 72 72" fill="none">
                <path d="M16 10 H52 V20 H26 V52 H52 V62 H16 Z" fill="#3b82f6" opacity="0.6" rx="1.5"/>
            </svg>`,
            angle: `<svg viewBox="0 0 72 72" fill="none">
                <path d="M16 10 H26 V52 H62 V62 H16 Z" fill="#3b82f6" opacity="0.6"/>
            </svg>`,
            tee: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="12" y="10" width="48" height="10" rx="1.5" fill="#3b82f6" opacity="0.7"/>
                <rect x="30" y="20" width="12" height="42" rx="1" fill="#3b82f6" opacity="0.5"/>
            </svg>`,
            shs: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="12" y="12" width="48" height="48" rx="4" fill="#3b82f6" opacity="0.6"/>
                <rect x="20" y="20" width="32" height="32" rx="2" fill="#111827"/>
            </svg>`,
            rhs: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="8" y="16" width="56" height="40" rx="4" fill="#3b82f6" opacity="0.6"/>
                <rect x="16" y="24" width="40" height="24" rx="2" fill="#111827"/>
            </svg>`,
            chs: `<svg viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="26" fill="#3b82f6" opacity="0.6"/>
                <circle cx="36" cy="36" r="18" fill="#111827"/>
            </svg>`,
            flat: `<svg viewBox="0 0 72 72" fill="none">
                <rect x="8" y="26" width="56" height="20" rx="2" fill="#3b82f6" opacity="0.6"/>
            </svg>`,
            round: `<svg viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="24" fill="#3b82f6" opacity="0.6"/>
            </svg>`,
        };
        return icons[typeKey] || '';
    }


    // ========================================================================
    // STATE
    // ========================================================================

    let state = {
        step: 1,
        profileType: null,
        dimensions: {},
        materialCategory: 'steel',
        materialGrade: 'S235JR',
        surfaceTreatment: 'raw',
        pieceLength: 6000,
        quantity: 10,
        delivery: 'standard',
    };


    // ========================================================================
    // DOM REFERENCES
    // ========================================================================

    let els = {};

    function cacheDom() {
        els.configurator = document.getElementById('configuratorApp');
        els.steps = document.querySelectorAll('.config-step');
        els.panels = document.querySelectorAll('.config-panel');
        els.profileGrid = document.getElementById('profileGrid');
        els.profileSvg = document.getElementById('profileSvg');
        els.profileSvg2 = document.getElementById('profileSvg2');
        els.previewInfo = document.getElementById('previewInfo');
        els.previewInfo2 = document.getElementById('previewInfo2');
        els.standardSizeSelect = document.getElementById('standardSizeSelect');
        els.dimensionInputs = document.getElementById('dimensionInputs');
        els.materialGrade = document.getElementById('materialGrade');
        els.surfaceTreatment = document.getElementById('surfaceTreatment');
        els.quoteSummary = document.getElementById('quoteSummary');
        els.pieceLength = document.getElementById('pieceLength');
        els.quantity = document.getElementById('quantity');
        els.delivery = document.getElementById('delivery');
        els.quoteModal = document.getElementById('quoteModal');
        els.modalRef = document.getElementById('modalRef');
    }


    // ========================================================================
    // STEP NAVIGATION
    // ========================================================================

    function goToStep(n) {
        state.step = n;

        // Update step indicators
        els.steps.forEach(el => {
            const stepNum = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (stepNum === n) el.classList.add('active');
            else if (stepNum < n) el.classList.add('completed');
        });

        // Show correct panel
        els.panels.forEach((panel, i) => {
            panel.classList.toggle('active', i + 1 === n);
        });

        // Panel-specific updates
        if (n === 2) renderDimensions();
        if (n === 3) renderMaterialOptions();
        if (n === 4) renderQuote();

        // Scroll configurator into view
        els.configurator.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    // ========================================================================
    // STEP 1: Profile Selection
    // ========================================================================

    function renderProfileGrid() {
        let html = '';
        for (const [key, profile] of Object.entries(PROFILES)) {
            html += `
                <div class="profile-card" data-type="${key}">
                    <div class="profile-card-icon">${getProfileIcon(key)}</div>
                    <div class="profile-card-name">${profile.name}</div>
                    <div class="profile-card-desc">${profile.desc}</div>
                </div>
            `;
        }
        els.profileGrid.innerHTML = html;

        // Bind click events
        els.profileGrid.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', () => {
                state.profileType = card.dataset.type;
                const profile = PROFILES[state.profileType];

                // Set default dimensions from first standard size
                const firstSize = Object.values(profile.standardSizes)[0];
                state.dimensions = { ...firstSize };

                // Visual selection feedback
                els.profileGrid.querySelectorAll('.profile-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                // Move to step 2 after brief delay for visual feedback
                setTimeout(() => goToStep(2), 200);
            });
        });
    }


    // ========================================================================
    // STEP 2: Dimensions
    // ========================================================================

    function renderDimensions() {
        const profile = PROFILES[state.profileType];
        if (!profile) return;

        // Standard size dropdown
        let opts = '<option value="">— Select standard size —</option>';
        for (const [name, dims] of Object.entries(profile.standardSizes)) {
            const desc = profile.params.map(p => `${dims[p.key]}${p.unit}`).join(' x ');
            opts += `<option value="${name}">${name} (${desc})</option>`;
        }
        els.standardSizeSelect.innerHTML = opts;

        // Select matching standard size if possible
        for (const [name, dims] of Object.entries(profile.standardSizes)) {
            const match = profile.params.every(p => state.dimensions[p.key] === dims[p.key]);
            if (match) {
                els.standardSizeSelect.value = name;
                break;
            }
        }

        // Dimension inputs
        let inputsHtml = '';
        for (const param of profile.params) {
            inputsHtml += `
                <div class="config-input-group">
                    <label>${param.label}
                        <span style="color: var(--text-muted); font-weight: 400;">(${param.min}–${param.max})</span>
                    </label>
                    <div class="config-input-unit">
                        <input type="number"
                            class="config-input dim-input"
                            data-param="${param.key}"
                            value="${state.dimensions[param.key]}"
                            min="${param.min}"
                            max="${param.max}"
                            step="${param.step}">
                        <span class="config-unit">${param.unit}</span>
                    </div>
                </div>
            `;
        }
        els.dimensionInputs.innerHTML = inputsHtml;

        // Bind events
        els.standardSizeSelect.onchange = (e) => {
            if (e.target.value) {
                state.dimensions = { ...profile.standardSizes[e.target.value] };
                renderDimensions();
            }
        };

        els.dimensionInputs.querySelectorAll('.dim-input').forEach(input => {
            input.addEventListener('input', () => {
                const param = profile.params.find(p => p.key === input.dataset.param);
                let val = parseFloat(input.value);
                if (isNaN(val)) return;
                val = Math.max(param.min, Math.min(param.max, val));
                state.dimensions[input.dataset.param] = val;
                updatePreview();

                // Clear standard size selection since user is customizing
                els.standardSizeSelect.value = '';
            });
        });

        updatePreview();
    }

    function updatePreview() {
        const profile = PROFILES[state.profileType];
        if (!profile) return;

        const svgSize = 400;
        const svgContent = profile.drawSvg(state.dimensions, svgSize);
        els.profileSvg.innerHTML = svgContent;
        if (els.profileSvg2) els.profileSvg2.innerHTML = svgContent;

        // Calculate area and weight
        const areaMm2 = profile.calcArea(state.dimensions);
        const areaM2 = areaMm2 / 1e6; // m²
        const matCat = MATERIALS[state.materialCategory];
        const density = matCat ? matCat.density : 7850;
        const weightPerMeter = areaM2 * density; // kg/m

        const infoHtml = `
            <div class="preview-info-item">
                <span class="preview-info-label">Cross-Section Area</span>
                <span class="preview-info-value">${areaMm2.toFixed(1)} mm²</span>
            </div>
            <div class="preview-info-item">
                <span class="preview-info-label">Weight per Meter</span>
                <span class="preview-info-value">${weightPerMeter.toFixed(2)} kg/m</span>
            </div>
            <div class="preview-info-item">
                <span class="preview-info-label">Profile Type</span>
                <span class="preview-info-value">${profile.name}</span>
            </div>
            <div class="preview-info-item">
                <span class="preview-info-label">Standard</span>
                <span class="preview-info-value">${profile.desc}</span>
            </div>
        `;
        els.previewInfo.innerHTML = infoHtml;
        if (els.previewInfo2) els.previewInfo2.innerHTML = infoHtml;
    }


    // ========================================================================
    // STEP 3: Material & Finish
    // ========================================================================

    function renderMaterialOptions() {
        updatePreview();

        // Material category radio buttons
        document.querySelectorAll('input[name="materialCat"]').forEach(radio => {
            radio.checked = radio.value === state.materialCategory;
            radio.addEventListener('change', () => {
                state.materialCategory = radio.value;
                renderGrades();
                renderTreatments();
                updatePreview();
            });
        });

        renderGrades();
        renderTreatments();
    }

    function renderGrades() {
        const mat = MATERIALS[state.materialCategory];
        let opts = '';
        let first = true;
        for (const [key, grade] of Object.entries(mat.grades)) {
            if (first && !mat.grades[state.materialGrade]) {
                state.materialGrade = key;
            }
            opts += `<option value="${key}" ${key === state.materialGrade ? 'selected' : ''}>${grade.label}</option>`;
            first = false;
        }
        els.materialGrade.innerHTML = opts;
        els.materialGrade.onchange = (e) => { state.materialGrade = e.target.value; };

        // Set first grade as default if current doesn't exist in new category
        if (!mat.grades[state.materialGrade]) {
            state.materialGrade = Object.keys(mat.grades)[0];
            els.materialGrade.value = state.materialGrade;
        }
    }

    function renderTreatments() {
        const mat = MATERIALS[state.materialCategory];
        let opts = '';
        let first = true;
        for (const [key, treat] of Object.entries(mat.treatments)) {
            if (first && !mat.treatments[state.surfaceTreatment]) {
                state.surfaceTreatment = key;
            }
            const priceTag = treat.addPerKg > 0 ? ` (+€${treat.addPerKg.toFixed(2)}/kg)` : '';
            opts += `<option value="${key}" ${key === state.surfaceTreatment ? 'selected' : ''}>${treat.label}${priceTag}</option>`;
            first = false;
        }
        els.surfaceTreatment.innerHTML = opts;
        els.surfaceTreatment.onchange = (e) => { state.surfaceTreatment = e.target.value; };

        if (!mat.treatments[state.surfaceTreatment]) {
            state.surfaceTreatment = Object.keys(mat.treatments)[0];
            els.surfaceTreatment.value = state.surfaceTreatment;
        }
    }


    // ========================================================================
    // STEP 4: Quote Calculation
    // ========================================================================

    function renderQuote() {
        const profile = PROFILES[state.profileType];
        const mat = MATERIALS[state.materialCategory];
        const grade = mat.grades[state.materialGrade];
        const treatment = mat.treatments[state.surfaceTreatment];

        // Read current values from inputs
        state.pieceLength = parseFloat(els.pieceLength.value) || 6000;
        state.quantity = parseInt(els.quantity.value) || 1;
        state.delivery = els.delivery.value;

        // Enforce minimums
        state.pieceLength = Math.max(MIN_PIECE_LENGTH_MM, state.pieceLength);
        state.quantity = Math.max(1, state.quantity);

        // Calculate
        const areaMm2 = profile.calcArea(state.dimensions);
        const areaM2 = areaMm2 / 1e6;
        const weightPerMeter = areaM2 * mat.density;
        const pieceLengthM = state.pieceLength / 1000;
        const pieceWeight = weightPerMeter * pieceLengthM;
        const totalWeight = pieceWeight * state.quantity;
        const totalLength = pieceLengthM * state.quantity;

        // Base price per kg
        let pricePerKg = grade.pricePerKg;

        // Add surface treatment
        pricePerKg += treatment.addPerKg;

        // Complexity multiplier
        const complexity = COMPLEXITY[state.profileType] || 1.0;
        pricePerKg *= complexity;

        // Cutting surcharge for non-standard lengths
        const isStandardLength = STANDARD_LENGTHS_MM.includes(state.pieceLength);
        if (!isStandardLength) {
            pricePerKg *= (1 + CUTTING_SURCHARGE);
        }

        // Quantity tier discount
        const tier = QTY_TIERS.find(t => totalWeight <= t.maxKg);
        const qtyFactor = tier ? tier.factor : 0.94;
        pricePerKg *= qtyFactor;

        // Delivery surcharge
        const deliverySurcharge = state.delivery === 'express' ? 1.15 : 1.0;

        // Final calculation
        const subtotal = totalWeight * pricePerKg;
        const deliveryCost = subtotal * (deliverySurcharge - 1);
        const total = subtotal + deliveryCost;
        const pricePerPiece = total / state.quantity;
        const pricePerMeter = total / totalLength;

        // MOQ check
        const belowMoq = totalWeight < MIN_ORDER_KG;

        // Find the selected standard size name
        let sizeName = 'Custom';
        for (const [name, dims] of Object.entries(profile.standardSizes)) {
            const match = profile.params.every(p => state.dimensions[p.key] === dims[p.key]);
            if (match) { sizeName = name; break; }
        }

        let html = '';

        if (belowMoq) {
            html += `
                <div class="quote-moq-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Below minimum order quantity (${MIN_ORDER_KG} kg). Total weight: ${totalWeight.toFixed(1)} kg. Small order surcharge applied.
                </div>
            `;
        }

        html += `
            <div class="quote-summary-title">Estimate Breakdown</div>
            <div class="quote-line">
                <span class="quote-line-label">Profile</span>
                <span class="quote-line-value">${profile.name} — ${sizeName}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Material</span>
                <span class="quote-line-value">${grade.label}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Surface</span>
                <span class="quote-line-value">${treatment.label}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Dimensions</span>
                <span class="quote-line-value">${profile.params.map(p => `${state.dimensions[p.key]} mm`).join(' × ')}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Piece Length</span>
                <span class="quote-line-value">${pieceLengthM.toFixed(1)} m ${isStandardLength ? '' : '(non-standard, +12%)'}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Quantity</span>
                <span class="quote-line-value">${state.quantity} pcs</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Weight per Piece</span>
                <span class="quote-line-value">${pieceWeight.toFixed(2)} kg</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Total Weight</span>
                <span class="quote-line-value">${totalWeight.toFixed(1)} kg</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Total Length</span>
                <span class="quote-line-value">${totalLength.toFixed(1)} m</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Price per kg</span>
                <span class="quote-line-value">€${pricePerKg.toFixed(2)}</span>
            </div>
            ${!isStandardLength ? `<div class="quote-line"><span class="quote-line-label">Cutting Surcharge</span><span class="quote-line-value">+12%</span></div>` : ''}
            ${state.delivery === 'express' ? `<div class="quote-line"><span class="quote-line-label">Express Delivery</span><span class="quote-line-value">+€${deliveryCost.toFixed(2)}</span></div>` : ''}
            <div class="quote-line">
                <span class="quote-line-label">Volume Tier</span>
                <span class="quote-line-value">${qtyFactor < 1 ? 'Discount' : qtyFactor > 1.1 ? 'Small Order Surcharge' : 'Standard'} (×${qtyFactor.toFixed(2)})</span>
            </div>
            <div class="quote-line quote-line-total">
                <span class="quote-line-label">Estimated Total</span>
                <span class="quote-line-value">€${total.toFixed(2)}</span>
            </div>
            <div class="quote-line quote-line-per-unit">
                <span class="quote-line-label">Per Piece / Per Meter</span>
                <span class="quote-line-value">€${pricePerPiece.toFixed(2)} / pc — €${pricePerMeter.toFixed(2)} / m</span>
            </div>
        `;

        els.quoteSummary.innerHTML = html;
    }


    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    function init() {
        cacheDom();
        renderProfileGrid();

        // Navigation buttons
        document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
        document.getElementById('toStep3').addEventListener('click', () => goToStep(3));
        document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
        document.getElementById('toStep4').addEventListener('click', () => goToStep(4));
        document.getElementById('backToStep3').addEventListener('click', () => goToStep(3));

        // Quote step: re-render on input change
        els.pieceLength.addEventListener('input', () => { if (state.step === 4) renderQuote(); });
        els.quantity.addEventListener('input', () => { if (state.step === 4) renderQuote(); });
        els.delivery.addEventListener('change', () => { if (state.step === 4) renderQuote(); });

        // Request Quote button
        document.getElementById('requestQuote').addEventListener('click', () => {
            // Generate reference number
            const ref = 'FRN-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            els.modalRef.textContent = ref;
            els.quoteModal.classList.add('active');
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            els.quoteModal.classList.remove('active');
        });
        document.getElementById('modalOk').addEventListener('click', () => {
            els.quoteModal.classList.remove('active');
        });
        els.quoteModal.addEventListener('click', (e) => {
            if (e.target === els.quoteModal) els.quoteModal.classList.remove('active');
        });

        // Start over
        document.getElementById('startOver').addEventListener('click', () => {
            state.profileType = null;
            state.dimensions = {};
            els.profileGrid.querySelectorAll('.profile-card').forEach(c => c.classList.remove('selected'));
            goToStep(1);
        });
    }

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', Configurator.init);
