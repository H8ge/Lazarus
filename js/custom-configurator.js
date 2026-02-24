/* ==========================================================================
   STAELER Custom Profile Configurator
   Canvas-based drawing tool for custom aluminum extrusion profiles.
   Users draw cross-sections with boolean cut operations (like Fusion 360
   sketch mode), get real-time constraint validation and pricing estimates.

   Positive shape = outer contour
   Negative shapes = cuts that boolean-subtract from the outer
   Result = computed via polygon-clipping (Martinez-Rueda-Feito algorithm)
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
        dieComplexity: {
            perHollow: 0.20,
            asymmetry: 0.10,
            thinWall: 0.15,
            manyCorners: 0.10,
        },
        materialPerKg: {
            '6060-T6': 4.20,
            '6063-T6': 4.50,
            '6082-T6': 4.90,
        },
        extrusionComplexity: {
            simple: 1.00,
            moderate: 1.08,
            complex: 1.18,
            veryComplex: 1.30,
        },
        treatments: {
            'raw':        { label: 'Mill Finish',              add: 0,    labelDe: 'Pressblank' },
            'anodized':   { label: 'Anodized Natural (E6/EV1)',add: 0.55, labelDe: 'Eloxiert Natur' },
            'anodized_c': { label: 'Anodized Coloured',        add: 0.70, labelDe: 'Eloxiert farbig' },
            'powder':     { label: 'Powder Coated (RAL)',       add: 0.42, labelDe: 'Pulverbeschichtet' },
            'anodized_hard':{ label: 'Hard Anodized (Hardcoat)',add: 0.90, labelDe: 'Harteloxiert' },
        },
        qtyTiers: [
            { maxKg: 200,  factor: 1.40 },
            { maxKg: 500,  factor: 1.15 },
            { maxKg: 1000, factor: 1.05 },
            { maxKg: 2500, factor: 1.00 },
            { maxKg: 5000, factor: 0.96 },
            { maxKg: Infinity, factor: 0.92 },
        ],
        minOrderKg: 200,
        standardLengths: [6000, 12000],
        cuttingSurcharge: 0.10,
    };

    // ========================================================================
    // TEMPLATES — Common extrusion profiles (cuts as polygon arrays)
    // ========================================================================
    const TEMPLATES = {
        'rect-tube': {
            name: 'Rectangular Tube',
            nameDe: 'Rechteckrohr',
            desc: 'Simple hollow rectangle',
            outer: [{x:0,y:0},{x:60,y:0},{x:60,y:40},{x:0,y:40}],
            cuts: [[{x:3,y:3},{x:57,y:3},{x:57,y:37},{x:3,y:37}]],
        },
        'window-frame': {
            name: 'Window Frame (2-chamber)',
            nameDe: 'Fensterrahmen (2-Kammer)',
            desc: 'Typical window frame profile',
            outer: [
                {x:0,y:0},{x:56,y:0},{x:56,y:14},{x:62,y:14},
                {x:62,y:0},{x:76,y:0},{x:76,y:60},{x:0,y:60}
            ],
            cuts: [
                [{x:2,y:2},{x:54,y:2},{x:54,y:28},{x:2,y:28}],
                [{x:2,y:32},{x:74,y:32},{x:74,y:58},{x:2,y:58}],
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
            cuts: [
                [{x:2,y:2},{x:68,y:2},{x:68,y:20},{x:2,y:20}],
                [{x:2,y:24},{x:42,y:24},{x:42,y:56},{x:2,y:56}],
                [{x:46,y:24},{x:84,y:24},{x:84,y:56},{x:46,y:56}],
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
            cuts: [
                [{x:3,y:3},{x:49,y:3},{x:49,y:157},{x:3,y:157}],
                [{x:67,y:3},{x:117,y:3},{x:117,y:73},{x:67,y:73}],
                [{x:67,y:80},{x:117,y:80},{x:117,y:157},{x:67,y:157}],
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
            cuts: [],
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
                pts.push({x:0, y:finH + baseH});
                pts.push({x:0, y:finH});
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
            cuts: [],
        },
        'u-channel': {
            name: 'U-Channel',
            nameDe: 'U-Profil',
            desc: 'Simple U-shaped channel',
            outer: [
                {x:0,y:0},{x:4,y:0},{x:4,y:46},{x:36,y:46},
                {x:36,y:0},{x:40,y:0},{x:40,y:50},{x:0,y:50}
            ],
            cuts: [],
        },
        'blank': {
            name: 'Start from Scratch',
            nameDe: 'Leere Zeichnung',
            desc: 'Empty canvas',
            outer: [],
            cuts: [],
        },
    };

    // ========================================================================
    // CANVAS STATE
    // ========================================================================
    const SVG_SIZE = 400;
    let canvas, ctx;
    let canvasRect = { width: 600, height: 500 };

    let state = {
        outer: [],                  // [{x,y}] polygon points in mm (positive shape)
        cuts: [],                   // Array of polygon arrays [{x,y}, ...] (negative shapes)
        resultPolygon: null,        // MultiPolygon from polygon-clipping boolean result
        drawingPoints: [],          // points being drawn currently
        mode: 'draw-outer',         // draw-outer | draw-cut | rect-cut | select
        selectedIndex: -1,          // index in cuts, or -2 for outer
        dragging: false,
        dragOffset: {x:0, y:0},
        draggingVertex: null,       // {source:'outer'|'cut', cutIdx:n, pointIdx:n}
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
        const snapshot = JSON.stringify({ outer: state.outer, cuts: state.cuts });
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
            state.cuts = snap.cuts;
            state.drawingPoints = [];
            state.selectedIndex = -1;
            computeResult();
            render();
            updateCalculations();
        }
    }

    function redo() {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            const snap = JSON.parse(state.history[state.historyIndex]);
            state.outer = snap.outer;
            state.cuts = snap.cuts;
            computeResult();
            render();
            updateCalculations();
        }
    }

    // ========================================================================
    // GEOMETRY CALCULATIONS
    // ========================================================================

    // Polygon area using Shoelace formula (signed) — for [{x,y}] arrays
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

    // Polygon area from [[x,y]] coordinate arrays (GeoJSON rings)
    function polygonAreaFromCoords(ring) {
        if (ring.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < ring.length; i++) {
            const j = (i + 1) % ring.length;
            area += ring[i][0] * ring[j][1];
            area -= ring[j][0] * ring[i][1];
        }
        return Math.abs(area) / 2;
    }

    // Bounding box of [{x,y}] points
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

    // Approximate minimum wall thickness (distance from cut edges to outer contour)
    function estimateMinWallThickness() {
        if (state.outer.length < 3 || state.cuts.length === 0) return Infinity;

        let minWall = Infinity;
        const sampleDensity = 0.5;

        for (const cut of state.cuts) {
            if (cut.length < 3) continue;

            for (let i = 0; i < cut.length; i++) {
                const j = (i + 1) % cut.length;
                const dx = cut[j].x - cut[i].x, dy = cut[j].y - cut[i].y;
                const segLen = Math.hypot(dx, dy);
                const steps = Math.max(2, Math.ceil(segLen / sampleDensity));
                for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const px = cut[i].x + dx * t;
                    const py = cut[i].y + dy * t;
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

    // Number of chambers (holes) in the boolean result
    function nResultHoles() {
        if (!state.resultPolygon || state.resultPolygon.length === 0) return 0;
        let holes = 0;
        for (const poly of state.resultPolygon) {
            holes += poly.length - 1; // rings beyond the first are holes
        }
        return holes;
    }

    // Count total corners in the final result shape
    function totalCorners() {
        if (state.resultPolygon && state.resultPolygon.length > 0) {
            let n = 0;
            for (const poly of state.resultPolygon) {
                for (const ring of poly) {
                    // GeoJSON rings are closed (first = last), so subtract 1
                    n += Math.max(0, ring.length - 1);
                }
            }
            return n;
        }
        return state.outer.length;
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
    // BOOLEAN OPERATIONS — polygon-clipping
    // ========================================================================

    function computeResult() {
        if (state.outer.length < 3) {
            state.resultPolygon = null;
            return;
        }
        if (state.cuts.length === 0) {
            state.resultPolygon = null;
            return;
        }

        // Convert outer to GeoJSON ring (closed)
        const outerRing = state.outer.map(p => [p.x, p.y]);
        outerRing.push([state.outer[0].x, state.outer[0].y]);
        const subject = [outerRing];

        // Build clip polygons from cuts
        const clips = state.cuts.filter(c => c.length >= 3).map(cut => {
            const ring = cut.map(p => [p.x, p.y]);
            ring.push([cut[0].x, cut[0].y]);
            return [ring];
        });

        if (clips.length === 0) {
            state.resultPolygon = null;
            return;
        }

        try {
            if (typeof polygonClipping !== 'undefined') {
                state.resultPolygon = polygonClipping.difference(subject, ...clips);
            } else {
                console.warn('polygon-clipping library not loaded');
                state.resultPolygon = null;
            }
        } catch (e) {
            console.warn('Boolean subtraction failed:', e);
            state.resultPolygon = null;
        }
    }


    // ========================================================================
    // PRICING CALCULATION
    // ========================================================================

    function calculatePricing() {
        const profile = PROFILES_CALC();
        if (!profile.valid) return null;

        const isHollow = nResultHoles() > 0;
        const diaDiameter = profile.circumCircle;
        const nHollows = profile.nHollows;

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
            dieCost,
            pricePerKg,
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
        let netArea;
        let hollowAreaTotal = 0;

        if (state.resultPolygon && state.resultPolygon.length > 0) {
            // Use the boolean result for accurate net area
            netArea = 0;
            for (const poly of state.resultPolygon) {
                netArea += polygonAreaFromCoords(poly[0]);
                for (let i = 1; i < poly.length; i++) {
                    netArea -= polygonAreaFromCoords(poly[i]);
                }
            }
            hollowAreaTotal = outerArea - netArea;
        } else {
            netArea = outerArea;
        }

        const netAreaM2 = netArea / 1e6;
        const density = 2700;
        const weightPerMeter = netAreaM2 * density;
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
            nHollows: nResultHoles(),
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
        drawDimensions();
        drawCurrentDrawing();
        drawSelection();
        drawConstraintWarnings();
        drawPointHandles();
    }

    function drawGrid() {
        const w = canvasRect.width, h = canvasRect.height;

        // Minor grid
        ctx.strokeStyle = 'rgba(200, 16, 46, 0.06)';
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
        ctx.strokeStyle = 'rgba(200, 16, 46, 0.12)';
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
        ctx.strokeStyle = 'rgba(200, 16, 46, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, h);
        ctx.moveTo(0, origin.y); ctx.lineTo(w, origin.y);
        ctx.stroke();
    }

    function drawProfile() {
        if (state.outer.length < 3) return;

        // --- Draw the result polygon (boolean output) or plain outer ---
        if (state.resultPolygon && state.resultPolygon.length > 0) {
            // Draw the boolean result — the actual material shape
            for (const poly of state.resultPolygon) {
                const outerRing = poly[0];
                const holes = poly.slice(1);

                ctx.beginPath();
                let p0 = mmToCanvas(outerRing[0][0], outerRing[0][1]);
                ctx.moveTo(p0.x, p0.y);
                for (let i = 1; i < outerRing.length; i++) {
                    const p = mmToCanvas(outerRing[i][0], outerRing[i][1]);
                    ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();

                // Draw holes using even-odd fill
                for (const hole of holes) {
                    const h0 = mmToCanvas(hole[0][0], hole[0][1]);
                    ctx.moveTo(h0.x, h0.y);
                    for (let i = 1; i < hole.length; i++) {
                        const hp = mmToCanvas(hole[i][0], hole[i][1]);
                        ctx.lineTo(hp.x, hp.y);
                    }
                    ctx.closePath();
                }

                ctx.fillStyle = 'rgba(200, 16, 46, 0.15)';
                ctx.fill('evenodd');
                ctx.strokeStyle = '#c8102e';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else {
            // No cuts or boolean not computed — draw outer as-is
            ctx.beginPath();
            const p0 = mmToCanvas(state.outer[0].x, state.outer[0].y);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < state.outer.length; i++) {
                const p = mmToCanvas(state.outer[i].x, state.outer[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(200, 16, 46, 0.15)';
            ctx.fill();
            ctx.strokeStyle = '#c8102e';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw outer contour vertices
        for (const pt of state.outer) {
            const p = mmToCanvas(pt.x, pt.y);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#c8102e';
            ctx.fill();
        }

        // --- Draw cut shapes (negative) ---
        for (let i = 0; i < state.cuts.length; i++) {
            const cut = state.cuts[i];
            if (cut.length < 3) continue;

            const isSelected = state.selectedIndex === i;

            ctx.beginPath();
            const fp = mmToCanvas(cut[0].x, cut[0].y);
            ctx.moveTo(fp.x, fp.y);
            for (let j = 1; j < cut.length; j++) {
                const pp = mmToCanvas(cut[j].x, cut[j].y);
                ctx.lineTo(pp.x, pp.y);
            }
            ctx.closePath();

            if (state.resultPolygon) {
                // Boolean result already baked holes into the shape via evenodd fill.
                // Only draw a dashed outline so the user can see/select cut boundaries
                // without covering the transparent holes.
                ctx.strokeStyle = isSelected ? '#f5a623' : 'rgba(224, 19, 47, 0.55)';
                ctx.lineWidth = isSelected ? 2 : 1.5;
                ctx.setLineDash([5, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                // No boolean result yet — show dark overlay with hatch
                ctx.fillStyle = 'rgba(5, 5, 8, 0.6)';
                ctx.fill();

                ctx.save();
                ctx.clip();
                const cbb = boundingBox(cut);
                const ctl = mmToCanvas(cbb.minX, cbb.minY);
                const cbr = mmToCanvas(cbb.maxX, cbb.maxY);
                drawHatchPattern(ctl.x, ctl.y, cbr.x - ctl.x, cbr.y - ctl.y);
                ctx.restore();

                ctx.beginPath();
                const fp2 = mmToCanvas(cut[0].x, cut[0].y);
                ctx.moveTo(fp2.x, fp2.y);
                for (let j = 1; j < cut.length; j++) {
                    const pp = mmToCanvas(cut[j].x, cut[j].y);
                    ctx.lineTo(pp.x, pp.y);
                }
                ctx.closePath();
                ctx.strokeStyle = isSelected ? '#f5a623' : '#e0132f';
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.stroke();
            }

            // Cut vertices
            for (const pt of cut) {
                const p = mmToCanvas(pt.x, pt.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = isSelected ? '#f5a623' : '#e0132f';
                ctx.fill();
            }
        }
    }

    function drawHatchPattern(x, y, w, h) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = 'rgba(200, 16, 46, 0.18)';
        ctx.lineWidth = 0.5;
        const spacing = 8;
        const maxDim = Math.max(Math.abs(w), Math.abs(h)) * 2;
        for (let d = -maxDim; d < maxDim; d += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + d, y);
            ctx.lineTo(x + d + Math.abs(h), y + Math.abs(h));
            ctx.stroke();
        }
        ctx.restore();
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

        // Live length + angle HUD near cursor
        if (state.drawingPoints.length > 0 && state.cursorMm) {
            const last = state.drawingPoints[state.drawingPoints.length - 1];
            const dx = state.cursorMm.x - last.x;
            const dy = state.cursorMm.y - last.y;
            const len = Math.hypot(dx, dy).toFixed(1);
            // Angle: 0° = right, 90° = up (canvas y increases downward so negate dy)
            let angle = Math.atan2(-dy, dx) * 180 / Math.PI;
            if (angle < 0) angle += 360;
            const label = `${len} mm  ${angle.toFixed(1)}°`;

            const cp = mmToCanvas(state.cursorMm.x, state.cursorMm.y);
            ctx.save();
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            const tw = ctx.measureText(label).width;
            const pad = 5;
            const tx = cp.x + 16;
            const ty = cp.y - 16;
            ctx.fillStyle = 'rgba(10, 10, 14, 0.88)';
            ctx.fillRect(tx - pad, ty - 9 - pad, tw + pad * 2, 18 + pad * 2);
            ctx.fillStyle = state.mode === 'draw-outer' ? '#22c55e' : '#f5a623';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, tx, ty);
            ctx.restore();
        }

        // Close indicator - highlight first point when cursor is near it
        if (state.drawingPoints.length >= 3 && state.cursorMm) {
            const first = state.drawingPoints[0];
            const dist = Math.hypot(state.cursorMm.x - first.x, state.cursorMm.y - first.y);
            if (dist < state.gridSize * 1.5) {
                const fp2 = mmToCanvas(first.x, first.y);
                ctx.beginPath();
                ctx.arc(fp2.x, fp2.y, 10, 0, Math.PI * 2);
                ctx.strokeStyle = state.mode === 'draw-outer' ? '#22c55e' : '#f5a623';
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
    // DIMENSION LABELS & POINT EDITING
    // ========================================================================

    function drawDimensions() {
        if (state.outer.length < 2) return;

        ctx.save();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw dimension labels on outer edges
        for (let i = 0; i < state.outer.length; i++) {
            const j = (i + 1) % state.outer.length;
            const p1 = state.outer[i];
            const p2 = state.outer[j];
            const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (len < 2) continue;

            const cp1 = mmToCanvas(p1.x, p1.y);
            const cp2 = mmToCanvas(p2.x, p2.y);
            const mx = (cp1.x + cp2.x) / 2;
            const my = (cp1.y + cp2.y) / 2;

            const dx = cp2.x - cp1.x;
            const dy = cp2.y - cp1.y;
            const edgeLen = Math.hypot(dx, dy);
            if (edgeLen < 30) continue;

            const nx = -dy / edgeLen * 14;
            const ny = dx / edgeLen * 14;

            const lx = mx + nx;
            const ly = my + ny;

            const text = len.toFixed(1);
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
            ctx.fillRect(lx - textWidth / 2 - 4, ly - 7, textWidth + 8, 14);
            ctx.strokeStyle = 'rgba(200, 16, 46, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(lx - textWidth / 2 - 4, ly - 7, textWidth + 8, 14);
            ctx.fillStyle = 'rgba(200, 16, 46, 0.8)';
            ctx.fillText(text, lx, ly);

            ctx.strokeStyle = 'rgba(200, 16, 46, 0.35)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(cp1.x + nx * 0.5 - nx * 0.3, cp1.y + ny * 0.5 - ny * 0.3);
            ctx.lineTo(cp1.x + nx * 1.3, cp1.y + ny * 1.3);
            ctx.moveTo(cp2.x + nx * 0.5 - nx * 0.3, cp2.y + ny * 0.5 - ny * 0.3);
            ctx.lineTo(cp2.x + nx * 1.3, cp2.y + ny * 1.3);
            ctx.stroke();
        }

        // Bounding box dimensions
        if (state.outer.length >= 3) {
            const bb = boundingBox(state.outer);
            const tl = mmToCanvas(bb.minX, bb.minY);
            const br = mmToCanvas(bb.maxX, bb.maxY);

            const widthText = bb.width.toFixed(1) + ' mm';
            const wtw = ctx.measureText(widthText).width;
            const wmy = br.y + 20;
            ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
            ctx.fillRect((tl.x + br.x) / 2 - wtw / 2 - 4, wmy - 7, wtw + 8, 14);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect((tl.x + br.x) / 2 - wtw / 2 - 4, wmy - 7, wtw + 8, 14);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(widthText, (tl.x + br.x) / 2, wmy);

            const heightText = bb.height.toFixed(1) + ' mm';
            const htw = ctx.measureText(heightText).width;
            const hmx = br.x + 24;
            ctx.save();
            ctx.translate(hmx, (tl.y + br.y) / 2);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
            ctx.fillRect(-htw / 2 - 4, -7, htw + 8, 14);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-htw / 2 - 4, -7, htw + 8, 14);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(heightText, 0, 0);
            ctx.restore();
        }

        ctx.restore();
    }

    function drawPointHandles() {
        if (state.mode !== 'select') return;

        // Draw editable point handles on outer polygon
        if (state.outer.length >= 3) {
            for (let i = 0; i < state.outer.length; i++) {
                const pt = state.outer[i];
                const p = mmToCanvas(pt.x, pt.y);

                let isHovered = false;
                if (state.cursorMm) {
                    const dist = Math.hypot(state.cursorMm.x - pt.x, state.cursorMm.y - pt.y);
                    isHovered = dist < state.gridSize * 1.5;
                }

                if (isHovered) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 16, 46, 0.3)';
                    ctx.fill();
                    ctx.strokeStyle = '#c8102e';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.save();
                    ctx.font = '10px "JetBrains Mono", monospace';
                    ctx.textAlign = 'left';
                    const coordText = `(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`;
                    const tw = ctx.measureText(coordText).width;
                    ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
                    ctx.fillRect(p.x + 10, p.y - 18, tw + 8, 16);
                    ctx.strokeStyle = '#c8102e';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(p.x + 10, p.y - 18, tw + 8, 16);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(coordText, p.x + 14, p.y - 10);
                    ctx.restore();
                }
            }
        }

        // Draw editable point handles on cut polygons
        for (const cut of state.cuts) {
            for (const pt of cut) {
                const p = mmToCanvas(pt.x, pt.y);

                let isHovered = false;
                if (state.cursorMm) {
                    const dist = Math.hypot(state.cursorMm.x - pt.x, state.cursorMm.y - pt.y);
                    isHovered = dist < state.gridSize * 1.5;
                }

                if (isHovered) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(224, 19, 47, 0.3)';
                    ctx.fill();
                    ctx.strokeStyle = '#e0132f';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.save();
                    ctx.font = '10px "JetBrains Mono", monospace';
                    ctx.textAlign = 'left';
                    const coordText = `(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`;
                    const tw = ctx.measureText(coordText).width;
                    ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
                    ctx.fillRect(p.x + 10, p.y - 18, tw + 8, 16);
                    ctx.strokeStyle = '#e0132f';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(p.x + 10, p.y - 18, tw + 8, 16);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(coordText, p.x + 14, p.y - 10);
                    ctx.restore();
                }
            }
        }
    }

    // ========================================================================
    // POINT EDITING
    // ========================================================================

    let editingPoint = null;
    let pointEditOverlay = null;

    function showPointEditor(pt, onSave) {
        removePointEditor();
        const canvasWrapper = canvas.parentElement;
        const cp = mmToCanvas(pt.x, pt.y);

        pointEditOverlay = document.createElement('div');
        pointEditOverlay.className = 'cc-point-editor';
        pointEditOverlay.style.cssText = `
            position: absolute;
            left: ${cp.x + 12}px;
            top: ${cp.y - 40}px;
            background: #161616;
            border: 1px solid #c8102e;
            border-radius: 6px;
            padding: 8px;
            display: flex;
            gap: 4px;
            align-items: center;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;

        const inputX = document.createElement('input');
        inputX.type = 'number';
        inputX.value = pt.x.toFixed(1);
        inputX.step = state.gridSize;
        inputX.style.cssText = 'width:60px;padding:4px 6px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;font-family:"JetBrains Mono",monospace;font-size:11px;text-align:center;';

        const separator = document.createElement('span');
        separator.textContent = ',';
        separator.style.cssText = 'color:#666;font-size:11px;';

        const inputY = document.createElement('input');
        inputY.type = 'number';
        inputY.value = pt.y.toFixed(1);
        inputY.step = state.gridSize;
        inputY.style.cssText = inputX.style.cssText;

        const okBtn = document.createElement('button');
        okBtn.textContent = '\u2713';
        okBtn.style.cssText = 'padding:4px 8px;background:#c8102e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:700;';

        okBtn.addEventListener('click', () => {
            const nx = parseFloat(inputX.value);
            const ny = parseFloat(inputY.value);
            if (!isNaN(nx) && !isNaN(ny)) {
                onSave(nx, ny);
            }
            removePointEditor();
        });

        const onKey = (e) => {
            if (e.key === 'Enter') { okBtn.click(); e.preventDefault(); }
            if (e.key === 'Escape') { removePointEditor(); }
        };
        inputX.addEventListener('keydown', onKey);
        inputY.addEventListener('keydown', onKey);

        pointEditOverlay.appendChild(inputX);
        pointEditOverlay.appendChild(separator);
        pointEditOverlay.appendChild(inputY);
        pointEditOverlay.appendChild(okBtn);

        canvasWrapper.appendChild(pointEditOverlay);
        inputX.focus();
        inputX.select();
    }

    function removePointEditor() {
        if (pointEditOverlay && pointEditOverlay.parentElement) {
            pointEditOverlay.parentElement.removeChild(pointEditOverlay);
        }
        pointEditOverlay = null;
        editingPoint = null;
    }

    // ========================================================================
    // MOUSE EVENTS
    // ========================================================================

    let rectStartMm = null;  // for rect-cut mode

    function getMouseMm(e) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        return canvasToMm(cx, cy);
    }

    function onMouseDown(e) {
        if (e.button === 1) {
            state.isPanning = true;
            state.panStart = { x: e.clientX, y: e.clientY };
            e.preventDefault();
            return;
        }

        if (e.button !== 0) return;
        const mm = getMouseMm(e);

        if (state.mode === 'rect-cut') {
            rectStartMm = { x: mm.x, y: mm.y };
            return;
        }

        if (state.mode === 'select') {
            // Hit test outer polygon vertices first
            for (let i = 0; i < state.outer.length; i++) {
                const pt = state.outer[i];
                const dist = Math.hypot(mm.x - pt.x, mm.y - pt.y);
                if (dist < state.gridSize * 1.5) {
                    state.draggingVertex = { source: 'outer', pointIdx: i };
                    state.dragging = true;
                    render();
                    return;
                }
            }

            // Hit test cut polygon vertices
            for (let ci = 0; ci < state.cuts.length; ci++) {
                const cut = state.cuts[ci];
                for (let pi = 0; pi < cut.length; pi++) {
                    const pt = cut[pi];
                    const dist = Math.hypot(mm.x - pt.x, mm.y - pt.y);
                    if (dist < state.gridSize * 1.5) {
                        state.draggingVertex = { source: 'cut', cutIdx: ci, pointIdx: pi };
                        state.dragging = true;
                        render();
                        return;
                    }
                }
            }

            // Hit test whole cut shapes
            for (let i = state.cuts.length - 1; i >= 0; i--) {
                const cut = state.cuts[i];
                if (cut.length >= 3 && pointInPolygon(mm.x, mm.y, cut)) {
                    state.selectedIndex = i;
                    state.dragging = true;
                    state.dragOffset = { x: mm.x - cut[0].x, y: mm.y - cut[0].y };
                    render();
                    return;
                }
            }

            // Hit test outer shape
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

        // Vertex drag in select mode
        if (state.dragging && state.draggingVertex && state.mode === 'select') {
            const v = state.draggingVertex;
            let nx = mm.x, ny = mm.y;
            if (state.snapToGrid) {
                nx = Math.round(nx / state.gridSize) * state.gridSize;
                ny = Math.round(ny / state.gridSize) * state.gridSize;
            }
            if (v.source === 'outer') {
                state.outer[v.pointIdx] = { x: nx, y: ny };
            } else if (v.source === 'cut') {
                state.cuts[v.cutIdx][v.pointIdx] = { x: nx, y: ny };
            }
            computeResult();
            render();
            updateCalculations();
            updateCursorDisplay(mm);
            return;
        }

        // Drag in select mode (whole shape)
        if (state.dragging && state.mode === 'select') {
            if (state.selectedIndex >= 0) {
                const cut = state.cuts[state.selectedIndex];
                const dx = mm.x - state.dragOffset.x - cut[0].x;
                const dy = mm.y - state.dragOffset.y - cut[0].y;
                for (const p of cut) { p.x += dx; p.y += dy; }
                state.dragOffset = { x: mm.x - cut[0].x, y: mm.y - cut[0].y };
            } else if (state.selectedIndex === -2) {
                const dx = mm.x - state.dragOffset.x - state.outer[0].x;
                const dy = mm.y - state.dragOffset.y - state.outer[0].y;
                for (const p of state.outer) { p.x += dx; p.y += dy; }
                for (const cut of state.cuts) {
                    for (const p of cut) { p.x += dx; p.y += dy; }
                }
                state.dragOffset = { x: mm.x - state.outer[0].x, y: mm.y - state.outer[0].y };
            }
            computeResult();
            render();
            updateCalculations();
            return;
        }

        // Rectangle preview in rect-cut mode
        if (state.mode === 'rect-cut' && rectStartMm) {
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
            state.draggingVertex = null;
            computeResult();
            saveHistory();
            updateCalculations();
            return;
        }

        // Complete rectangle cut
        if (state.mode === 'rect-cut' && rectStartMm && e.button === 0) {
            const mm = getMouseMm(e);
            const x = Math.min(rectStartMm.x, mm.x);
            const y = Math.min(rectStartMm.y, mm.y);
            const w = Math.abs(mm.x - rectStartMm.x);
            const h = Math.abs(mm.y - rectStartMm.y);
            if (w >= PRESS.minFeatureSize && h >= PRESS.minFeatureSize) {
                state.cuts.push([
                    {x: x, y: y},
                    {x: x + w, y: y},
                    {x: x + w, y: y + h},
                    {x: x, y: y + h}
                ]);
                computeResult();
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

        if (state.mode === 'draw-outer' || state.mode === 'draw-cut') {
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
        if (state.mode === 'draw-outer' || state.mode === 'draw-cut') {
            if (state.drawingPoints.length >= 3) {
                closeCurrentShape();
            }
            return;
        }

        // In select mode, double-click on a vertex to edit coordinates
        if (state.mode === 'select') {
            const mm = getMouseMm(e);

            // Check outer polygon points
            for (let i = 0; i < state.outer.length; i++) {
                const pt = state.outer[i];
                const dist = Math.hypot(mm.x - pt.x, mm.y - pt.y);
                if (dist < state.gridSize * 1.5) {
                    showPointEditor(pt, (nx, ny) => {
                        state.outer[i] = { x: nx, y: ny };
                        computeResult();
                        saveHistory();
                        render();
                        updateCalculations();
                    });
                    return;
                }
            }

            // Check cut polygon points
            for (let ci = 0; ci < state.cuts.length; ci++) {
                const cut = state.cuts[ci];
                for (let pi = 0; pi < cut.length; pi++) {
                    const pt = cut[pi];
                    const dist = Math.hypot(mm.x - pt.x, mm.y - pt.y);
                    if (dist < state.gridSize * 1.5) {
                        showPointEditor(pt, (nx, ny) => {
                            cut[pi] = { x: nx, y: ny };
                            computeResult();
                            saveHistory();
                            render();
                            updateCalculations();
                        });
                        return;
                    }
                }
            }
        }
    }

    function closeCurrentShape() {
        if (state.mode === 'draw-outer') {
            state.outer = [...state.drawingPoints];
            state.drawingPoints = [];
            computeResult();
            setMode('select');
        } else if (state.mode === 'draw-cut') {
            state.cuts.push([...state.drawingPoints]);
            state.drawingPoints = [];
            computeResult();
            // Stay in draw-cut mode for drawing multiple cuts
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
                state.cuts.splice(state.selectedIndex, 1);
                state.selectedIndex = -1;
                computeResult();
                saveHistory();
                render();
                updateCalculations();
            } else if (state.selectedIndex === -2) {
                state.outer = [];
                state.cuts = [];
                state.resultPolygon = null;
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

        document.querySelectorAll('.cc-tool-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });

        if (canvas) {
            canvas.style.cursor = mode === 'select' ? 'default' : 'crosshair';
        }
        render();
    }

    function loadTemplate(key) {
        const tpl = TEMPLATES[key];
        if (!tpl) return;

        state.outer = JSON.parse(JSON.stringify(tpl.outer));
        state.cuts = JSON.parse(JSON.stringify(tpl.cuts));
        state.drawingPoints = [];
        state.selectedIndex = -1;

        computeResult();
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
        state.cuts = [];
        state.resultPolygon = null;
        state.drawingPoints = [];
        state.selectedIndex = -1;
        saveHistory();
        render();
        updateCalculations();
    }

    function updateCursorDisplay(mm) {
        const el = document.getElementById('ccCursorPos');
        if (!el) return;
        if ((state.mode === 'draw-outer' || state.mode === 'draw-cut') && state.drawingPoints.length > 0) {
            const last = state.drawingPoints[state.drawingPoints.length - 1];
            const dx = mm.x - last.x;
            const dy = mm.y - last.y;
            const len = Math.hypot(dx, dy).toFixed(1);
            let angle = Math.atan2(-dy, dx) * 180 / Math.PI;
            if (angle < 0) angle += 360;
            el.textContent = `${mm.x.toFixed(1)}, ${mm.y.toFixed(1)} mm  |  L: ${len} mm  ∠: ${angle.toFixed(1)}°`;
        } else {
            el.textContent = `${mm.x.toFixed(1)} , ${mm.y.toFixed(1)} mm`;
        }
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
                    <span class="cc-info-value">${profile.netArea.toFixed(1)} mm\u00B2</span>
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
                    <span class="cc-info-value">${state.cuts.length > 0 ? profile.minWall.toFixed(1) + ' mm' : '\u2014'}</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Bounding Box</span>
                    <span class="cc-info-value">${profile.bb.width.toFixed(0)} \u00D7 ${profile.bb.height.toFixed(0)} mm</span>
                </div>
                <div class="cc-info-item">
                    <span class="cc-info-label">Cuts / Chambers</span>
                    <span class="cc-info-value">${state.cuts.length} / ${profile.nHollows}</span>
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
                <span class="quote-line-value">\u20AC${pricing.dieCost.toFixed(0)}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Complexity class</span>
                <span class="quote-line-value">${pricing.complexClass}</span>
            </div>
            <div class="quote-line">
                <span class="quote-line-label">Material (${state.alloy})</span>
                <span class="quote-line-value">\u20AC${(PRICING.materialPerKg[state.alloy] || 4.5).toFixed(2)}/kg</span>
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
                <span class="quote-line-value">${pricing.qtyFactor < 1 ? 'Discount' : pricing.qtyFactor > 1.1 ? 'Surcharge' : 'Standard'} (\u00D7${pricing.qtyFactor.toFixed(2)})</span>
            </div>
            ${!pricing.isStandard ? `<div class="quote-line"><span class="quote-line-label">Cutting surcharge</span><span class="quote-line-value">+10%</span></div>` : ''}
            <div class="quote-line">
                <span class="quote-line-label">Material total</span>
                <span class="quote-line-value">\u20AC${pricing.materialTotal.toFixed(2)}</span>
            </div>
            <div class="quote-line quote-line-total">
                <span class="quote-line-label">Estimated Total</span>
                <span class="quote-line-value">\u20AC${pricing.grandTotal.toFixed(2)}</span>
            </div>
            <div class="quote-line quote-line-per-unit">
                <span class="quote-line-label">Per piece / Per meter</span>
                <span class="quote-line-value">\u20AC${pricing.perPiece.toFixed(2)} / pc \u2014 \u20AC${pricing.perMeter.toFixed(2)} / m</span>
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

        // Touch event support for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX, clientY: touch.clientY, button: 0
            });
            onMouseDown(mouseEvent);
            if (state.mode === 'draw-outer' || state.mode === 'draw-cut') {
                const clickEvent = new MouseEvent('click', {
                    clientX: touch.clientX, clientY: touch.clientY, button: 0
                });
                onClick(clickEvent);
            }
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX, clientY: touch.clientY
            });
            onMouseMove(mouseEvent);
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', { button: 0 });
            onMouseUp(mouseEvent);
        }, { passive: false });
        document.addEventListener('keydown', (e) => {
            const ccSection = document.getElementById('customConfigPanel');
            if (ccSection && ccSection.style.display !== 'none') {
                onKeyDown(e);
            }
        });

        // Toolbar buttons
        document.querySelectorAll('.cc-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.mode) setMode(btn.dataset.mode);
            });
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

        // Request quote button — compute result, save to sessionStorage, open 3D preview
        const reqQuoteBtn = document.getElementById('ccRequestQuote');
        if (reqQuoteBtn) {
            reqQuoteBtn.addEventListener('click', () => {
                if (!state.outer || state.outer.length < 3) {
                    alert('Please draw an outer contour first.');
                    return;
                }

                // Build profile data from the boolean result polygon
                let profileData;

                if (state.resultPolygon && state.resultPolygon.length > 0) {
                    // Use the first polygon from the boolean result
                    const poly = state.resultPolygon[0];
                    profileData = {
                        outer: poly[0],          // outer ring as [[x,y], ...]
                        hollows: poly.slice(1),  // hole rings as [[[x,y], ...], ...]
                    };
                } else {
                    // No cuts — just the outer contour
                    profileData = {
                        outer: state.outer.map(p => [p.x, p.y]),
                        hollows: [],
                    };
                }

                // Persist for session — hero3d.js reads on load
                try { sessionStorage.setItem('staeler_custom_profile', JSON.stringify(profileData)); } catch (_) {}

                // Live-update the hero 3D
                document.dispatchEvent(new CustomEvent('staeler:profileUpdate', { detail: profileData }));

                // Open the quote confirmation modal directly
                const ref = 'STL-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
                const refEl = document.getElementById('modalRef');
                if (refEl) refEl.textContent = ref;
                const successModal = document.getElementById('quoteModal');
                if (successModal) successModal.classList.add('active');
            });
        }

        // Save initial history state
        saveHistory();
        setMode('draw-outer');
    }

    return { init, loadTemplate, setMode, clearAll };
})();

document.addEventListener('DOMContentLoaded', CustomConfigurator.init);
