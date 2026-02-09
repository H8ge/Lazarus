/* ==========================================================================
   FERRON Custom Profile Configurator
   Canvas-based drawing tool for custom aluminum extrusion profiles.
   Users draw cross-sections, get real-time constraint validation
   and pricing estimates based on extrusion manufacturing parameters.
   ========================================================================== */

const CustomConfigurator = (() => {
    'use strict';

    // ========================================================================
    // EXTRUSION PRESS CONSTRAINTS
    // ========================================================================
    const PRESS = {
        maxCircumscribingCircle: 300,  // mm — mid-sized modern press
        minWallThickness: {
            '6060-T6': 1.0,
            '6063-T6': 1.0,
            '6082-T6': 1.2,
        },
        minWallDefault: 1.0,          // mm
        minHollowGap: 2.0,            // mm between hollows
        minFeatureSize: 1.5,          // mm smallest detail
        maxWeightPerMeter: 25,        // kg/m practical limit
    };

    // ========================================================================
    // PRICING MODEL — Aluminum Extrusion
    // ========================================================================
    const PRICING = {
        // Die costs by circumscribing circle range (€)
        dieCost: {
            solid: [
                { maxDia: 80,  cost: 1800 },
                { maxDia: 120, cost: 2500 },
                { maxDia: 180, cost: 3800 },
                { maxDia: 250, cost: 5500 },
                { maxDia: 300, cost: 7500 },
                { maxDia: Infinity, cost: 10000 },
            ],
            hollow: [
                { maxDia: 80,  cost: 3200 },
                { maxDia: 120, cost: 4800 },
                { maxDia: 180, cost: 6500 },
                { maxDia: 250, cost: 9000 },
                { maxDia: 300, cost: 13000 },
                { maxDia: Infinity, cost: 18000 },
            ],
        },
        // Additional die cost factors
        dieComplexity: {
            perHollow: 0.20,          // +20% per additional hollow
            asymmetry: 0.10,          // +10% if asymmetric
            thinWall: 0.15,           // +15% if min wall < 1.5mm
            manyCorners: 0.10,        // +10% if > 12 corners total
        },
        // Material cost per kg by alloy
        materialPerKg: {
            '6060-T6': 4.20,
            '6063-T6': 4.50,
            '6082-T6': 4.90,
        },
        // Extrusion complexity surcharge on material price
        extrusionComplexity: {
            simple: 1.00,             // solid, few features
            moderate: 1.08,           // 1-2 hollows
            complex: 1.18,            // 3+ hollows or thin walls
            veryComplex: 1.30,        // many chambers, tight tolerances
        },
        // Surface treatments (add per kg)
        treatments: {
            'raw':        { label: 'Mill Finish',              add: 0,    labelDe: 'Pressblank' },
            'anodized':   { label: 'Anodized Natural (E6/EV1)',add: 0.55, labelDe: 'Eloxiert Natur' },
            'anodized_c': { label: 'Anodized Coloured',        add: 0.70, labelDe: 'Eloxiert farbig' },
            'powder':     { label: 'Powder Coated (RAL)',       add: 0.42, labelDe: 'Pulverbeschichtet' },
            'anodized_hard':{ label: 'Hard Anodized (Hardcoat)',add: 0.90, labelDe: 'Harteloxiert' },
        },
        // Quantity tiers (total kg)
        qtyTiers: [
            { maxKg: 200,  factor: 1.40 },
            { maxKg: 500,  factor: 1.15 },
            { maxKg: 1000, factor: 1.05 },
            { maxKg: 2500, factor: 1.00 },
            { maxKg: 5000, factor: 0.96 },
            { maxKg: Infinity, factor: 0.92 },
        ],
        minOrderKg: 200,
        standardLengths: [6000, 12000],  // mm
        cuttingSurcharge: 0.10,
    };

    // ========================================================================
    // TEMPLATES — Common extrusion profiles
    // ========================================================================
    const TEMPLATES = {
        'rect-tube': {
            name: 'Rectangular Tube',
            nameDe: 'Rechteckrohr',
            desc: 'Simple hollow rectangle',
            outer: [{x:0,y:0},{x:60,y:0},{x:60,y:40},{x:0,y:40}],
            hollows: [{type:'rect',x:3,y:3,w:54,h:34}],
        },
        'window-frame': {
            name: 'Window Frame (2-chamber)',
            nameDe: 'Fensterrahmen (2-Kammer)',
            desc: 'Typical window frame profile',
            outer: [
                {x:0,y:0},{x:56,y:0},{x:56,y:14},{x:62,y:14},
                {x:62,y:0},{x:76,y:0},{x:76,y:60},{x:0,y:60}
            ],
            hollows: [
                {type:'rect',x:2,y:2,w:52,h:26},
                {type:'rect',x:2,y:32,w:72,h:26},
            ],
        },
        'window-sash': {
            name: 'Window Sash (3-chamber)',
            nameDe: 'Fensterflügel (3-Kammer)',
            desc: 'Multi-chamber sash profile',
            outer: [
                {x:0,y:0},{x:70,y:0},{x:70,y:10},{x:76,y:10},
                {x:76,y:0},{x:86,y:0},{x:86,y:58},{x:0,y:58}
            ],
            hollows: [
                {type:'rect',x:2,y:2,w:66,h:18},
                {type:'rect',x:2,y:24,w:40,h:32},
                {type:'rect',x:46,y:24,w:38,h:32},
            ],
        },
        'curtain-wall': {
            name: 'Curtain Wall Mullion',
            nameDe: 'Fassadenpfosten',
            desc: 'Structural curtain wall profile',
            outer: [
                {x:0,y:0},{x:52,y:0},{x:52,y:24},{x:64,y:24},
                {x:64,y:0},{x:120,y:0},{x:120,y:160},
                {x:64,y:160},{x:64,y:136},{x:52,y:136},
                {x:52,y:160},{x:0,y:160}
            ],
            hollows: [
                {type:'rect',x:3,y:3,w:46,h:154},
                {type:'rect',x:67,y:3,w:50,h:70},
                {type:'rect',x:67,y:80,w:50,h:77},
            ],
        },
        't-slot': {
            name: 'T-Slot Rail',
            nameDe: 'T-Nut-Profil',
            desc: 'Industrial T-slot aluminum',
            outer: [
                {x:15,y:0},{x:25,y:0},{x:25,y:12},{x:40,y:12},
                {x:40,y:18},{x:25,y:18},{x:25,y:22},
                {x:40,y:22},{x:40,y:28},{x:25,y:28},{x:25,y:40},
                {x:15,y:40},{x:15,y:28},{x:0,y:28},
                {x:0,y:22},{x:15,y:22},{x:15,y:18},
                {x:0,y:18},{x:0,y:12},{x:15,y:12}
            ],
            hollows: [],
        },
        'heatsink': {
            name: 'Heatsink Profile',
            nameDe: 'Kühlkörper-Profil',
            desc: 'Finned heatsink extrusion',
            outer: (function() {
                const pts = [];
                const baseW = 80, baseH = 5, finH = 30, finW = 2, finGap = 8;
                const nFins = 8;
                const totalW = (nFins - 1) * finGap + finW;
                const xOff = (baseW - totalW) / 2;
                // Top-left base
                pts.push({x:0, y:finH + baseH});
                pts.push({x:0, y:finH});
                // Fins
                for (let i = 0; i < nFins; i++) {
                    const fx = xOff + i * finGap;
                    pts.push({x:fx, y:finH});
                    pts.push({x:fx, y:0});
                    pts.push({x:fx + finW, y:0});
                    pts.push({x:fx + finW, y:finH});
                }
                pts.push({x:baseW, y:finH});
                pts.push({x:baseW, y:finH + baseH});
                return pts;
            })(),
            hollows: [],
        },
        'u-channel': {
            name: 'U-Channel',
            nameDe: 'U-Profil',
            desc: 'Simple U-shaped channel',
            outer: [
                {x:0,y:0},{x:4,y:0},{x:4,y:46},{x:36,y:46},
                {x:36,y:0},{x:40,y:0},{x:40,y:50},{x:0,y:50}
            ],
            hollows: [],
        },
        'blank': {
            name: 'Start from Scratch',
            nameDe: 'Leere Zeichnung',
            desc: 'Empty canvas',
            outer: [],
            hollows: [],
        },
    };

    // ========================================================================
    // CANVAS STATE
    // ========================================================================
    const SVG_SIZE = 400;
    let canvas, ctx;
    let canvasRect = { width: 600, height: 500 };

    let state = {
        outer: [],                  // [{x,y}] polygon points in mm
        hollows: [],                // [{type:'rect'|'polygon', ...}]
        drawingPoints: [],          // points being drawn currently
        mode: 'draw-outer',         // draw-outer | draw-hollow | add-rect | select
        selectedIndex: -1,          // index in hollows, or -2 for outer
        dragging: false,
        dragOffset: {x:0, y:0},
        // View
        scale: 3.5,                 // pixels per mm
        offsetX: 0,
        offsetY: 0,
        // Grid
        gridSize: 5,                // mm
        snapToGrid: true,
        // Material
        alloy: '6063-T6',
        treatment: 'raw',
        // Order
        pieceLength: 6000,
        quantity: 50,
        delivery: 'standard',
        // History
        history: [],
        historyIndex: -1,
    };

    // ========================================================================
    // COORDINATE TRANSFORMS
    // ========================================================================
    function mmToCanvas(x, y) {
        return {
            x: x * state.scale + state.offsetX + canvasRect.width / 2,
            y: y * state.scale + state.offsetY + canvasRect.height / 2,
        };
    }

    function canvasToMm(cx, cy) {
        let x = (cx - state.offsetX - canvasRect.width / 2) / state.scale;
        let y = (cy - state.offsetY - canvasRect.height / 2) / state.scale;
        if (state.snapToGrid) {
            x = Math.round(x / state.gridSize) * state.gridSize;
            y = Math.round(y / state.gridSize) * state.gridSize;
        }
        return { x, y };
    }

    // ========================================================================
    // HISTORY (Undo/Redo)
    // ========================================================================
    function saveHistory() {
        const snapshot = JSON.stringify({ outer: state.outer, hollows: state.hollows });
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(snapshot);
        state.historyIndex = state.history.length - 1;
        if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
        }
    }

    function undo() {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            const snap = JSON.parse(state.history[state.historyIndex]);
            state.outer = snap.outer;
            state.hollows = snap.hollows;
            state.drawingPoints = [];
            state.selectedIndex = -1;
            render();
            updateCalculations();
        }
    }

    function redo() {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            const snap = JSON.parse(state.history[state.historyIndex]);
            state.outer = snap.outer;
            state.hollows = snap.hollows;
            render();
            updateCalculations();
        }
    }

    // ========================================================================
    // GEOMETRY CALCULATIONS
    // ========================================================================

    // Polygon area using Shoelace formula (signed)
    function polygonArea(pts) {
        if (pts.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            area += pts[i].x * pts[j].y;
            area -= pts[j].x * pts[i].y;
        }
        return Math.abs(area) / 2;
    }

    function rectArea(h) {
        return h.w * h.h;
    }

    function hollowArea(h) {
        if (h.type === 'rect') return rectArea(h);
        if (h.type === 'polygon') return polygonArea(h.points);
        return 0;
    }

    // Bounding box of points
    function boundingBox(pts) {
        if (pts.length === 0) return { minX:0, minY:0, maxX:0, maxY:0, width:0, height:0 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of pts) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }

    // Circumscribing circle diameter
    function circumscribingCircle(pts) {
        if (pts.length === 0) return 0;
        const bb = boundingBox(pts);
        return Math.sqrt(bb.width ** 2 + bb.height ** 2);
    }

    // Point-to-segment distance
    function pointToSegmentDist(px, py, ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - ax, py - ay);
        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }

    // Distance from point to polygon boundary
    function pointToPolygonDist(px, py, poly) {
        let minDist = Infinity;
        for (let i = 0; i < poly.length; i++) {
            const j = (i + 1) % poly.length;
            const d = pointToSegmentDist(px, py, poly[i].x, poly[i].y, poly[j].x, poly[j].y);
            minDist = Math.min(minDist, d);
        }
        return minDist;
    }

    // Approximate minimum wall thickness
    function estimateMinWallThickness() {
        if (state.outer.length < 3 || state.hollows.length === 0) return Infinity;

        let minWall = Infinity;
        const sampleDensity = 0.5; // sample every 0.5mm along edges

        for (const h of state.hollows) {
            const pts = h.type === 'rect'
                ? [{x:h.x,y:h.y},{x:h.x+h.w,y:h.y},{x:h.x+h.w,y:h.y+h.h},{x:h.x,y:h.y+h.h}]
                : (h.points || []);

            for (let i = 0; i < pts.length; i++) {
                const j = (i + 1) % pts.length;
                const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
                const segLen = Math.hypot(dx, dy);
                const steps = Math.max(2, Math.ceil(segLen / sampleDensity));
                for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = pts[i].x + dx * t;
                    const py = pts[i].y + dy * t;
                    const dist = pointToPolygonDist(px, py, state.outer);
                    minWall = Math.min(minWall, dist);
                }
            }
        }
        return minWall;
    }

    // Check if point is inside polygon (ray casting)
    function pointInPolygon(px, py, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y;
            const xj = poly[j].x, yj = poly[j].y;
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    // Count total corners across all shapes
    function totalCorners() {
        let n = state.outer.length;
        for (const h of state.hollows) {
            n += h.type === 'rect' ? 4 : (h.points ? h.points.length : 0);
        }
        return n;
    }

    // Check profile symmetry (rough approximation)
    function isAsymmetric() {
        if (state.outer.length < 3) return false;
        const bb = boundingBox(state.outer);
        const cx = (bb.minX + bb.maxX) / 2;
        let asymScore = 0;
        for (const p of state.outer) {
            const mirror = cx + (cx - p.x);
            let minDist = Infinity;
            for (const q of state.outer) {
                minDist = Math.min(minDist, Math.hypot(mirror - q.x, p.y - q.y));
            }
            asymScore += minDist;
        }
        return (asymScore / state.outer.length) > 2;
    }


    // ========================================================================
    // PRICING CALCULATION
    // ========================================================================

    function calculatePricing() {
        const profile = PROFILES_CALC();
        if (!profile.valid) return null;

        const isHollow = state.hollows.length > 0;
        const diaDiameter = profile.circumCircle;
        const nHollows = state.hollows.length;

        // Die cost
        const dieTable = isHollow ? PRICING.dieCost.hollow : PRICING.dieCost.solid;
        let baseDieCost = dieTable.find(t => diaDiameter <= t.maxDia).cost;
        let dieMultiplier = 1;
        if (nHollows > 1) dieMultiplier += PRICING.dieComplexity.perHollow * (nHollows - 1);
        if (isAsymmetric()) dieMultiplier += PRICING.dieComplexity.asymmetry;
        if (profile.minWall < 1.5) dieMultiplier += PRICING.dieComplexity.thinWall;
        if (totalCorners() > 12) dieMultiplier += PRICING.dieComplexity.manyCorners;
        const dieCost = baseDieCost * dieMultiplier;

        // Material price per kg
        const matBase = PRICING.materialPerKg[state.alloy] || 4.50;
        const treatment = PRICING.treatments[state.treatment] || PRICING.treatments.raw;

        // Complexity class
        let complexClass = 'simple';
        if (nHollows >= 3 || profile.minWall < 1.5) complexClass = 'veryComplex';
        else if (nHollows >= 1) complexClass = nHollows === 1 ? 'moderate' : 'complex';
        else if (totalCorners() > 10) complexClass = 'moderate';

        const complexFactor = PRICING.extrusionComplexity[complexClass];
        let pricePerKg = (matBase + treatment.add) * complexFactor;

        // Quantity tier
        const pieceLenM = state.pieceLength / 1000;
        const pieceWeight = profile.weightPerMeter * pieceLenM;
        const totalWeight = pieceWeight * state.quantity;
        const qtyTier = PRICING.qtyTiers.find(t => totalWeight <= t.maxKg);
        const qtyFactor = qtyTier ? qtyTier.factor : 0.92;
        pricePerKg *= qtyFactor;

        // Cutting surcharge
        const isStandard = PRICING.standardLengths.includes(state.pieceLength);
        if (!isStandard) pricePerKg *= (1 + PRICING.cuttingSurcharge);

        // Delivery
        const delivFactor = state.delivery === 'express' ? 1.15 : 1.0;

        const materialTotal = totalWeight * pricePerKg * delivFactor;
        const grandTotal = dieCost + materialTotal;
        const perPiece = grandTotal / state.quantity;
        const perMeter = grandTotal / (pieceLenM * state.quantity);

        return {
            dieCost: dieCost,
            pricePerKg: pricePerKg,
            pieceWeight,
            totalWeight,
            materialTotal,
            grandTotal,
            perPiece,
            perMeter,
            complexClass,
            isStandard,
            qtyFactor,
            delivFactor,
            belowMoq: totalWeight < PRICING.minOrderKg,
            treatmentLabel: treatment.label,
        };
    }

    function PROFILES_CALC() {
        if (state.outer.length < 3) {
            return { valid: false };
        }

        const outerArea = polygonArea(state.outer);
        let hollowAreaTotal = 0;
        for (const h of state.hollows) hollowAreaTotal += hollowArea(h);

        const netArea = outerArea - hollowAreaTotal;       // mm²
        const netAreaM2 = netArea / 1e6;                   // m²
        const density = 2700;                               // kg/m³ aluminum
        const weightPerMeter = netAreaM2 * density;         // kg/m
        const circumCircle = circumscribingCircle(state.outer);
        const minWall = estimateMinWallThickness();
        const bb = boundingBox(state.outer);

        return {
            valid: true,
            outerArea,
            hollowAreaTotal,
            netArea,
            weightPerMeter,
            circumCircle,
            minWall: minWall === Infinity ? 0 : minWall,
            bb,
            nHollows: state.hollows.length,
        };
    }


    // ========================================================================
    // CANVAS RENDERING
    // ========================================================================

    function render() {
        if (!ctx) return;
        const w = canvasRect.width;
        const h = canvasRect.height;
        ctx.clearRect(0, 0, w, h);

        drawGrid();
        drawProfile();
        drawCurrentDrawing();
        drawSelection();
        drawConstraintWarnings();
    }

    function drawGrid() {
        const w = canvasRect.width, h = canvasRect.height;
        const gridPx = state.gridSize * state.scale;

        // Minor grid
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
        ctx.lineWidth = 0.5;
        const startMm = canvasToMm(0, 0);
        const endMm = canvasToMm(w, h);
        const gs = state.gridSize;

        const startX = Math.floor(startMm.x / gs) * gs;
        const startY = Math.floor(startMm.y / gs) * gs;
        const endX = Math.ceil(endMm.x / gs) * gs;
        const endY = Math.ceil(endMm.y / gs) * gs;

        for (let x = startX; x <= endX; x += gs) {
            const cp = mmToCanvas(x, 0);
            ctx.beginPath();
            ctx.moveTo(cp.x, 0);
            ctx.lineTo(cp.x, h);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y += gs) {
            const cp = mmToCanvas(0, y);
            ctx.beginPath();
            ctx.moveTo(0, cp.y);
            ctx.lineTo(w, cp.y);
            ctx.stroke();
        }

        // Major grid (every 5 gridSize)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.lineWidth = 0.8;
        const major = gs * 5;
        const mStartX = Math.floor(startMm.x / major) * major;
        const mStartY = Math.floor(startMm.y / major) * major;
        for (let x = mStartX; x <= endX; x += major) {
            const cp = mmToCanvas(x, 0);
            ctx.beginPath();
            ctx.moveTo(cp.x, 0);
            ctx.lineTo(cp.x, h);
            ctx.stroke();
        }
        for (let y = mStartY; y <= endY; y += major) {
            const cp = mmToCanvas(0, y);
            ctx.beginPath();
            ctx.moveTo(0, cp.y);
            ctx.lineTo(w, cp.y);
            ctx.stroke();
        }

        // Origin crosshair
        const origin = mmToCanvas(0, 0);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, h);
        ctx.moveTo(0, origin.y); ctx.lineTo(w, origin.y);
        ctx.stroke();
    }

    function drawProfile() {
        // Draw outer profile
        if (state.outer.length >= 3) {
            ctx.beginPath();
            const p0 = mmToCanvas(state.outer[0].x, state.outer[0].y);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < state.outer.length; i++) {
                const p = mmToCanvas(state.outer[i].x, state.outer[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
            ctx.fill();
            ctx.strokeStyle = '#c8102e';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw vertices
            for (const pt of state.outer) {
                const p = mmToCanvas(pt.x, pt.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#c8102e';
                ctx.fill();
            }
        }

        // Draw hollows
        for (let i = 0; i < state.hollows.length; i++) {
            const h = state.hollows[i];
            ctx.fillStyle = '#111827';
            ctx.strokeStyle = state.selectedIndex === i ? '#f5a623' : '#e0132f';
            ctx.lineWidth = state.selectedIndex === i ? 2.5 : 1.5;

            if (h.type === 'rect') {
                const tl = mmToCanvas(h.x, h.y);
                const br = mmToCanvas(h.x + h.w, h.y + h.h);
                const rw = br.x - tl.x, rh = br.y - tl.y;
                ctx.fillRect(tl.x, tl.y, rw, rh);
                ctx.strokeRect(tl.x, tl.y, rw, rh);

                // Drag handles
                if (state.selectedIndex === i) {
                    drawHandle(tl.x, tl.y);
                    drawHandle(br.x, tl.y);
                    drawHandle(br.x, br.y);
                    drawHandle(tl.x, br.y);
                }
            } else if (h.type === 'polygon' && h.points.length >= 3) {
                ctx.beginPath();
                const fp = mmToCanvas(h.points[0].x, h.points[0].y);
                ctx.moveTo(fp.x, fp.y);
                for (let j = 1; j < h.points.length; j++) {
                    const pp = mmToCanvas(h.points[j].x, h.points[j].y);
                    ctx.lineTo(pp.x, pp.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                for (const pt of h.points) {
                    const p = mmToCanvas(pt.x, pt.y);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#e0132f';
                    ctx.fill();
                }
            }
        }
    }

    function drawHandle(x, y) {
        ctx.fillStyle = '#f5a623';
        ctx.fillRect(x - 4, y - 4, 8, 8);
    }

    function drawCurrentDrawing() {
        if (state.drawingPoints.length === 0) return;

        ctx.beginPath();
        const fp = mmToCanvas(state.drawingPoints[0].x, state.drawingPoints[0].y);
        ctx.moveTo(fp.x, fp.y);
        for (let i = 1; i < state.drawingPoints.length; i++) {
            const p = mmToCanvas(state.drawingPoints[i].x, state.drawingPoints[i].y);
            ctx.lineTo(p.x, p.y);
        }

        // Line to cursor
        if (state.cursorMm) {
            const cp = mmToCanvas(state.cursorMm.x, state.cursorMm.y);
            ctx.lineTo(cp.x, cp.y);
        }

        ctx.strokeStyle = state.mode === 'draw-outer' ? '#22c55e' : '#f5a623';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vertices
        for (const pt of state.drawingPoints) {
            const p = mmToCanvas(pt.x, pt.y);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = state.mode === 'draw-outer' ? '#22c55e' : '#f5a623';
            ctx.fill();
        }

        // Close indicator - highlight first point when cursor is near it
        if (state.drawingPoints.length >= 3 && state.cursorMm) {
            const first = state.drawingPoints[0];
            const dist = Math.hypot(state.cursorMm.x - first.x, state.cursorMm.y - first.y);
            if (dist < state.gridSize * 1.5) {
                const fp2 = mmToCanvas(first.x, first.y);
                ctx.beginPath();
                ctx.arc(fp2.x, fp2.y, 10, 0, Math.PI * 2);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    function drawSelection() {
        if (state.selectedIndex === -2 && state.outer.length > 0) {
            ctx.beginPath();
            const p0 = mmToCanvas(state.outer[0].x, state.outer[0].y);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < state.outer.length; i++) {
                const p = mmToCanvas(state.outer[i].x, state.outer[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.strokeStyle = '#f5a623';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawConstraintWarnings() {
        if (state.outer.length < 3) return;
        const profile = PROFILES_CALC();
        if (!profile.valid) return;

        const minAllowed = PRESS.minWallThickness[state.alloy] || PRESS.minWallDefault;

        // Circumscribing circle warning
        if (profile.circumCircle > PRESS.maxCircumscribingCircle) {
            const bb = profile.bb;
            const center = mmToCanvas((bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2);
            const radiusPx = (profile.circumCircle / 2) * state.scale;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Max allowed circle
            const maxRadiusPx = (PRESS.maxCircumscribingCircle / 2) * state.scale;
            ctx.beginPath();
            ctx.arc(center.x, center.y, maxRadiusPx, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }


    // ========================================================================
    // MOUSE EVENTS
    // ========================================================================

    let rectStartMm = null;  // for add-rect mode

    function getMouseMm(e) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        return canvasToMm(cx, cy);
    }

    function onMouseDown(e) {
        if (e.button === 1) {
            // Middle-click pan
            state.isPanning = true;
            state.panStart = { x: e.clientX, y: e.clientY };
            e.preventDefault();
            return;
        }

        if (e.button !== 0) return;
        const mm = getMouseMm(e);

        if (state.mode === 'add-rect') {
            rectStartMm = { x: mm.x, y: mm.y };
            return;
        }

        if (state.mode === 'select') {
            // Hit test hollows
            for (let i = state.hollows.length - 1; i >= 0; i--) {
                const h = state.hollows[i];
                if (h.type === 'rect') {
                    if (mm.x >= h.x && mm.x <= h.x + h.w && mm.y >= h.y && mm.y <= h.y + h.h) {
                        state.selectedIndex = i;
                        state.dragging = true;
                        state.dragOffset = { x: mm.x - h.x, y: mm.y - h.y };
                        render();
                        return;
                    }
                } else if (h.type === 'polygon' && h.points) {
                    if (pointInPolygon(mm.x, mm.y, h.points)) {
                        state.selectedIndex = i;
                        state.dragging = true;
                        state.dragOffset = { x: mm.x - h.points[0].x, y: mm.y - h.points[0].y };
                        render();
                        return;
                    }
                }
            }
            // Hit test outer
            if (state.outer.length >= 3 && pointInPolygon(mm.x, mm.y, state.outer)) {
                state.selectedIndex = -2;
                state.dragging = true;
                state.dragOffset = { x: mm.x - state.outer[0].x, y: mm.y - state.outer[0].y };
                render();
                return;
            }
            state.selectedIndex = -1;
            render();
        }
    }

    function onMouseMove(e) {
        const mm = getMouseMm(e);
        state.cursorMm = mm;

        // Pan
        if (state.isPanning) {
            state.offsetX += e.clientX - state.panStart.x;
            state.offsetY += e.clientY - state.panStart.y;
            state.panStart = { x: e.clientX, y: e.clientY };
            render();
            updateCursorDisplay(mm);
            return;
        }

        // Drag in select mode
        if (state.dragging && state.mode === 'select') {
            if (state.selectedIndex >= 0) {
                const h = state.hollows[state.selectedIndex];
                if (h.type === 'rect') {
                    h.x = mm.x - state.dragOffset.x;
                    h.y = mm.y - state.dragOffset.y;
                    if (state.snapToGrid) {
                        h.x = Math.round(h.x / state.gridSize) * state.gridSize;
                        h.y = Math.round(h.y / state.gridSize) * state.gridSize;
                    }
                } else if (h.type === 'polygon' && h.points) {
                    const dx = mm.x - state.dragOffset.x - h.points[0].x;
                    const dy = mm.y - state.dragOffset.y - h.points[0].y;
                    for (const p of h.points) { p.x += dx; p.y += dy; }
                    state.dragOffset = { x: mm.x - h.points[0].x, y: mm.y - h.points[0].y };
                }
            } else if (state.selectedIndex === -2) {
                const dx = mm.x - state.dragOffset.x - state.outer[0].x;
                const dy = mm.y - state.dragOffset.y - state.outer[0].y;
                for (const p of state.outer) { p.x += dx; p.y += dy; }
                for (const h of state.hollows) {
                    if (h.type === 'rect') { h.x += dx; h.y += dy; }
                    else if (h.points) { for (const p of h.points) { p.x += dx; p.y += dy; } }
                }
                state.dragOffset = { x: mm.x - state.outer[0].x, y: mm.y - state.outer[0].y };
            }
            render();
            updateCalculations();
            return;
        }

        // Rectangle preview in add-rect mode
        if (state.mode === 'add-rect' && rectStartMm) {
            render();
            const s = mmToCanvas(rectStartMm.x, rectStartMm.y);
            const e2 = mmToCanvas(mm.x, mm.y);
            ctx.strokeStyle = '#f5a623';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(Math.min(s.x, e2.x), Math.min(s.y, e2.y),
                           Math.abs(e2.x - s.x), Math.abs(e2.y - s.y));
            ctx.setLineDash([]);
            updateCursorDisplay(mm);
            return;
        }

        render();
        updateCursorDisplay(mm);
    }

    function onMouseUp(e) {
        if (state.isPanning) {
            state.isPanning = false;
            return;
        }

        if (state.dragging) {
            state.dragging = false;
            saveHistory();
            updateCalculations();
            return;
        }

        // Complete rectangle
        if (state.mode === 'add-rect' && rectStartMm && e.button === 0) {
            const mm = getMouseMm(e);
            const x = Math.min(rectStartMm.x, mm.x);
            const y = Math.min(rectStartMm.y, mm.y);
            const w = Math.abs(mm.x - rectStartMm.x);
            const h = Math.abs(mm.y - rectStartMm.y);
            if (w >= PRESS.minFeatureSize && h >= PRESS.minFeatureSize) {
                state.hollows.push({ type: 'rect', x, y, w, h });
                saveHistory();
                updateCalculations();
            }
            rectStartMm = null;
            render();
        }
    }

    function onClick(e) {
        if (e.button !== 0) return;
        const mm = getMouseMm(e);

        if (state.mode === 'draw-outer' || state.mode === 'draw-hollow') {
            // Check if clicking near first point to close
            if (state.drawingPoints.length >= 3) {
                const first = state.drawingPoints[0];
                const dist = Math.hypot(mm.x - first.x, mm.y - first.y);
                if (dist < state.gridSize * 1.5) {
                    closeCurrentShape();
                    return;
                }
            }
            state.drawingPoints.push({ x: mm.x, y: mm.y });
            render();
        }
    }

    function onDblClick(e) {
        if (state.mode === 'draw-outer' || state.mode === 'draw-hollow') {
            if (state.drawingPoints.length >= 3) {
                closeCurrentShape();
            }
        }
    }

    function closeCurrentShape() {
        if (state.mode === 'draw-outer') {
            state.outer = [...state.drawingPoints];
            state.drawingPoints = [];
            // Auto-switch to select mode
            setMode('select');
        } else if (state.mode === 'draw-hollow') {
            state.hollows.push({ type: 'polygon', points: [...state.drawingPoints] });
            state.drawingPoints = [];
        }
        saveHistory();
        render();
        updateCalculations();
    }

    function onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        // Zoom towards cursor
        const mmBefore = canvasToMm(cx, cy);
        state.scale = Math.max(0.5, Math.min(15, state.scale * zoomFactor));
        const mmAfter = canvasToMm(cx, cy);

        state.offsetX += (mmAfter.x - mmBefore.x) * state.scale;
        state.offsetY += (mmAfter.y - mmBefore.y) * state.scale;

        render();
    }

    function onKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.selectedIndex >= 0) {
                state.hollows.splice(state.selectedIndex, 1);
                state.selectedIndex = -1;
                saveHistory();
                render();
                updateCalculations();
            } else if (state.selectedIndex === -2) {
                state.outer = [];
                state.hollows = [];
                state.selectedIndex = -1;
                saveHistory();
                render();
                updateCalculations();
            }
            e.preventDefault();
        }
        if (e.key === 'Escape') {
            state.drawingPoints = [];
            rectStartMm = null;
            state.selectedIndex = -1;
            render();
        }
        if (e.ctrlKey && e.key === 'z') { undo(); e.preventDefault(); }
        if (e.ctrlKey && e.key === 'y') { redo(); e.preventDefault(); }
    }


    // ========================================================================
    // UI CONTROLS
    // ========================================================================

    function setMode(mode) {
        state.mode = mode;
        state.drawingPoints = [];
        rectStartMm = null;
        state.selectedIndex = -1;

        // Update toolbar active state
        document.querySelectorAll('.cc-tool-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        // Update canvas cursor
        if (canvas) {
            canvas.style.cursor = mode === 'select' ? 'default' : 'crosshair';
        }
        render();
    }

    function loadTemplate(key) {
        const tpl = TEMPLATES[key];
        if (!tpl) return;

        state.outer = JSON.parse(JSON.stringify(tpl.outer));
        state.hollows = JSON.parse(JSON.stringify(tpl.hollows));
        state.drawingPoints = [];
        state.selectedIndex = -1;

        // Center view on profile
        centerView();
        saveHistory();
        render();
        updateCalculations();
        setMode('select');
    }

    function centerView() {
        if (state.outer.length === 0) {
            state.offsetX = 0;
            state.offsetY = 0;
            return;
        }
        const bb = boundingBox(state.outer);
        const cx = (bb.minX + bb.maxX) / 2;
        const cy = (bb.minY + bb.maxY) / 2;

        // Calculate scale to fit
        const margin = 40;
        const scaleX = (canvasRect.width - margin * 2) / Math.max(bb.width, 20);
        const scaleY = (canvasRect.height - margin * 2) / Math.max(bb.height, 20);
        state.scale = Math.min(scaleX, scaleY, 8);
        state.scale = Math.max(state.scale, 0.8);

        state.offsetX = -cx * state.scale;
        state.offsetY = -cy * state.scale;
    }

    function clearAll() {
        state.outer = [];
        state.hollows = [];
        state.drawingPoints = [];
        state.selectedIndex = -1;
        saveHistory();
        render();
        updateCalculations();
    }

    function updateCursorDisplay(mm) {
        const el = document.getElementById('ccCursorPos');
        if (el) el.textContent = `${mm.x.toFixed(1)} , ${mm.y.toFixed(1)} mm`;
    }

    function updateCalculations() {
        const profile = PROFILES_CALC();
        const infoEl = document.getElementById('ccProfileInfo');
        const quoteEl = document.getElementById('ccQuoteSummary');
        const warningsEl = document.getElementById('ccWarnings');

        if (!infoEl) return;

        if (!profile.valid) {
            infoEl.innerHTML = '<p class="cc-info-empty">Draw an outer profile to see calculations</p>';
            if (quoteEl) quoteEl.innerHTML = '';
            if (warningsEl) warningsEl.innerHTML = '';
            return;
        }

        const minAllowed = PRESS.minWallThickness[state.alloy] || PRESS.minWallDefault;

        // Warnings
        let warnings = [];
        if (profile.circumCircle > PRESS.maxCircumscribingCircle) {
            warnings.push(`<div class="cc-warning cc-warning-error">
                <strong>Exceeds press capacity:</strong> Circumscribing circle is ${profile.circumCircle.toFixed(0)} mm (max: ${PRESS.maxCircumscribingCircle} mm). Scale down the profile.
            </div>`);
        }
        if (profile.minWall > 0 && profile.minWall < minAllowed) {
            warnings.push(`<div class="cc-warning cc-warning-error">
                <strong>Wall too thin:</strong> Minimum wall is ${profile.minWall.toFixed(1)} mm (min for ${state.alloy}: ${minAllowed} mm).
            </div>`);
        }
        if (profile.minWall > 0 && profile.minWall < 1.5 && profile.minWall >= minAllowed) {
            warnings.push(`<div class="cc-warning cc-warning-warn">
                <strong>Thin wall:</strong> ${profile.minWall.toFixed(1)} mm walls increase die cost and may affect tolerances.
            </div>`);
        }
        if (profile.weightPerMeter > PRESS.maxWeightPerMeter) {
            warnings.push(`<div class="cc-warning cc-warning-warn">
                <strong>Heavy profile:</strong> ${profile.weightPerMeter.toFixed(2)} kg/m exceeds typical limits. May require special handling.
            </div>`);
        }
        if (warningsEl) warningsEl.innerHTML = warnings.join('');

        // Profile info
        infoEl.innerHTML = `
            <div class="cc-info-grid">
                <div class="cc-info-item">
                    <span class="cc-info-label">Net Area</span>
                    <span class="cc-info-value">${profile.netArea.toFixed(1)} mm²</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Weight/Meter</span>
                    <span class="cc-info-value">${profile.weightPerMeter.toFixed(3)} kg/m</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Circ. Circle</span>
                    <span class="cc-info-value">${profile.circumCircle.toFixed(1)} mm</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Min Wall</span>
                    <span class="cc-info-value">${profile.nHollows > 0 ? profile.minWall.toFixed(1) + ' mm' : '—'}</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Bounding Box</span>
                    <span class="cc-info-value">${profile.bb.width.toFixed(0)} × ${profile.bb.height.toFixed(0)} mm</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Hollows</span>
                    <span class="cc-info-value">${profile.nHollows}</span>
                </div>
            </div>
        `;

        // Quote
        const pricing = calculatePricing();
        if (!pricing || !quoteEl) return;

        quoteEl.innerHTML = `
            ${pricing.belowMoq ? `<div class="cc-warning cc-warning-warn" style="margin-bottom:12px;">
                <strong>Below MOQ:</strong> Total weight ${pricing.totalWeight.toFixed(0)} kg is under the ${PRICING.minOrderKg} kg minimum. Small order surcharge applied.
            </div>` : ''}
            <div class="quote-line">
                <span class="quote-line-label">Die (tooling) cost</span>
                <span class="quote-line-value">€${pricing.dieCost.toFixed(0)}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Complexity class</span>
                <span class="quote-line-value">${pricing.complexClass}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Material (${state.alloy})</span>
                <span class="quote-line-value">€${(PRICING.materialPerKg[state.alloy] || 4.5).toFixed(2)}/kg</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Surface</span>
                <span class="quote-line-value">${pricing.treatmentLabel}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Piece weight</span>
                <span class="quote-line-value">${pricing.pieceWeight.toFixed(2)} kg</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Total weight (${state.quantity} pcs)</span>
                <span class="quote-line-value">${pricing.totalWeight.toFixed(1)} kg</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Volume tier</span>
                <span class="quote-line-value">${pricing.qtyFactor < 1 ? 'Discount' : pricing.qtyFactor > 1.1 ? 'Surcharge' : 'Standard'} (×${pricing.qtyFactor.toFixed(2)})</span>
            </div>
            ${!pricing.isStandard ? `<div class="quote-line"><span class="quote-line-label">Cutting surcharge</span><span class="quote-line-value">+10%</span></div>` : ''}
            <div class="quote-line">
                <span class="quote-line-label">Material total</span>
                <span class="quote-line-value">€${pricing.materialTotal.toFixed(2)}</span>
            </div>
            <div class="quote-line quote-line-total">
                <span class="quote-line-label">Estimated Total</span>
                <span class="quote-line-value">€${pricing.grandTotal.toFixed(2)}</span>
            </div>
            <div class="quote-line quote-line-per-unit">
                <span class="quote-line-label">Per piece / Per meter</span>
                <span class="quote-line-value">€${pricing.perPiece.toFixed(2)} / pc — €${pricing.perMeter.toFixed(2)} / m</span>
            </div>
            <div class="cc-die-note">
                Die cost is one-time. For repeat orders, only material cost applies.
            </div>
        `;
    }


    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    function init() {
        canvas = document.getElementById('ccCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        function resizeCanvas() {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvasRect.width = rect.width;
            canvasRect.height = rect.height;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            render();
        }

        resizeCanvas();
        window.addEventListener('resize', () => { setTimeout(resizeCanvas, 100); });

        // Event listeners
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('click', onClick);
        canvas.addEventListener('dblclick', onDblClick);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', (e) => {
            // Only handle if custom configurator is visible
            const ccSection = document.getElementById('customConfigPanel');
            if (ccSection && ccSection.style.display !== 'none') {
                onKeyDown(e);
            }
        });

        // Toolbar buttons
        document.querySelectorAll('.cc-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => setMode(btn.dataset.mode));
        });

        // Template buttons
        document.querySelectorAll('.cc-tpl-btn').forEach(btn => {
            btn.addEventListener('click', () => loadTemplate(btn.dataset.template));
        });

        // Clear button
        const clearBtn = document.getElementById('ccClearBtn');
        if (clearBtn) clearBtn.addEventListener('click', clearAll);

        // Center view button
        const centerBtn = document.getElementById('ccCenterBtn');
        if (centerBtn) centerBtn.addEventListener('click', () => { centerView(); render(); });

        // Undo/redo
        const undoBtn = document.getElementById('ccUndoBtn');
        const redoBtn = document.getElementById('ccRedoBtn');
        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);

        // Grid size
        const gridInput = document.getElementById('ccGridSize');
        if (gridInput) {
            gridInput.addEventListener('change', () => {
                state.gridSize = parseInt(gridInput.value) || 5;
                render();
            });
        }

        // Snap toggle
        const snapToggle = document.getElementById('ccSnapToggle');
        if (snapToggle) {
            snapToggle.addEventListener('change', () => { state.snapToGrid = snapToggle.checked; });
        }

        // Material inputs
        const alloySelect = document.getElementById('ccAlloy');
        if (alloySelect) {
            alloySelect.addEventListener('change', () => {
                state.alloy = alloySelect.value;
                updateCalculations();
            });
        }

        const treatmentSelect = document.getElementById('ccTreatment');
        if (treatmentSelect) {
            treatmentSelect.addEventListener('change', () => {
                state.treatment = treatmentSelect.value;
                updateCalculations();
            });
        }

        // Order inputs
        const lengthInput = document.getElementById('ccLength');
        const qtyInput = document.getElementById('ccQuantity');
        const delivInput = document.getElementById('ccDelivery');
        if (lengthInput) lengthInput.addEventListener('input', () => {
            state.pieceLength = parseInt(lengthInput.value) || 6000;
            updateCalculations();
        });
        if (qtyInput) qtyInput.addEventListener('input', () => {
            state.quantity = parseInt(qtyInput.value) || 1;
            updateCalculations();
        });
        if (delivInput) delivInput.addEventListener('change', () => {
            state.delivery = delivInput.value;
            updateCalculations();
        });

        // Request quote button
        const reqQuoteBtn = document.getElementById('ccRequestQuote');
        if (reqQuoteBtn) {
            reqQuoteBtn.addEventListener('click', () => {
                const modal = document.getElementById('quoteModal');
                const ref = 'FRN-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
                document.getElementById('modalRef').textContent = ref;
                if (modal) modal.classList.add('active');
            });
        }

        // Save initial history state
        saveHistory();
        setMode('draw-outer');
    }

    return { init, loadTemplate, setMode, clearAll };
})();

document.addEventListener('DOMContentLoaded', CustomConfigurator.init);
