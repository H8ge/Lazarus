/* ==========================================================================
   STAELER Custom Profile Configurator  —  v2 geometry engine
   --------------------------------------------------------------------------
   Canvas drawing tool for custom aluminium extrusion cross-sections, modelled
   after a Fusion 360 sketch:

     • ONE resolved shape, never stacked layers. Every primitive is a boolean
       operation (Material +  =  union,  Aussparung −  =  difference) that is
       baked immediately into a single resolved geometry. After a subtraction
       the real contour vertices change — there are no overlapping ghost shapes.
     • Primitives: Rectangle, Circle, Polygon — each usable as add or subtract.
     • Select/Edit: drag any vertex of the resolved shape, type exact coords,
       insert vertices on edges, delete vertices/islands.
     • Snapping: grid + magnetic vertex snap + ortho (Shift) + typed length.
     • Mobile: pointer events with pinch-zoom and two-finger pan.

   Geometry model
     state.geom : MultiPolygon  =  [ Polygon, ... ]
       Polygon  =  [ outerRing, hole1, hole2, ... ]
       Ring     =  [ {x,y}, ... ]   (open — no duplicated closing point)
   Booleans run through polygon-clipping (Martinez-Rueda-Feito), which is
   multipolygon/hole aware. Results are rounded to kill float fuzz.

   Pricing is grounded in the Werk ERP (staging_masked.auftragspos), June 2026.
   See the PRICING block for per-figure provenance.
   ========================================================================== */

const CustomConfigurator = (() => {
    'use strict';

    // ========================================================================
    // EXTRUSION PRESS CONSTRAINTS  (match the site's spec section)
    // ========================================================================
    const PRESS = {
        maxCircumscribingCircle: 300,   // mm — hüllkreis, 28 MN press
        minWallThickness: { '6060-T6': 1.0, '6063-T6': 1.0, '6082-T6': 1.2 },
        minWallDefault: 1.0,            // mm
        minHollowGap: 2.0,              // mm minimum wall between chambers
        minFeatureSize: 1.0,            // mm smallest drawable detail
        maxWeightPerMeter: 25,          // kg/m practical limit
    };

    // ========================================================================
    // PRICING MODEL — Aluminium extrusion, grounded in Werk ERP, June 2026
    // ------------------------------------------------------------------------
    // Source: staging_masked.auftragspos (masked ERP mirror, commercial values
    // intact). All-in alu sell, FY2025+ invoiced lines:
    //   blank/mill ≈ 4.95 €/kg · anodized E6/EV1 ≈ 7.0 · machined ≈ 7.3 ·
    //   powder/RAL ≈ 8.3 (up to 12 for special).  Conversion premium alone
    //   (metal billed separately) ≈ 1.0–1.4 €/kg.  Die (PW lines): p25 1550 /
    //   median 1675 / p75 2231 / p90 2750 €.  Setup (Rüstkosten) ≈ 280–480 €.
    //   Cut-to-length (FIXLÄNGE) ≈ 3.5 €/m.  No LME series in DB → metalBase is
    //   an LME-indexed assumption, adjust as the alu price moves.
    // ========================================================================
    const PRICING = {
        // all-in €/kg blank = metalBase (LME-indexed) + conversionPremium
        metalBasePerKg: { '6060-T6': 3.55, '6063-T6': 3.65, '6082-T6': 3.85 },
        conversionPremium: 1.30,        // €/kg press conversion + finishing overhead
        surfaceAdderPerKg: {            // €/kg over blank, calibrated to DB bands
            raw: 0, anodized: 2.05, anodized_c: 2.45, powder: 3.35, anodized_hard: 2.80,
        },
        // one-time extrusion die (Werkzeug) by circumscribing-circle ⌀
        dieSolid: [
            { maxDia: 60,  cost: 1200 }, { maxDia: 100, cost: 1550 },
            { maxDia: 150, cost: 1950 }, { maxDia: 200, cost: 2400 },
            { maxDia: 250, cost: 2900 }, { maxDia: 300, cost: 3500 },
            { maxDia: Infinity, cost: 4500 },
        ],
        dieHollowFactor: 1.75,          // port/bridge die ≈ 1.6–2× a solid die
        diePerExtraChamber: 350,        // € per hollow beyond the first
        dieComplexity: { thinWall: 0.12, asymmetry: 0.08, manyCorners: 0.08 },
        setupPerOrder: 400,             // Rüstkosten per press run
        cuttingPerCutPiece: 1.5,        // € per piece for non-standard cut length
        packagingFlat: 30,              // pallet/packaging (A-EURO/AVVP basis)
        minPressBatchKg: 300,           // practical min press run per profile/alloy
        qtyTiers: [                     // factor on €/kg by total order weight
            { maxKg: 100,  factor: 1.35 }, { maxKg: 300,  factor: 1.15 },
            { maxKg: 500,  factor: 1.05 }, { maxKg: 1000, factor: 1.00 },
            { maxKg: 2500, factor: 0.97 }, { maxKg: Infinity, factor: 0.93 },
        ],
        standardLengths: [3000, 6000, 12000],
        expressFactor: 1.15,
        densityKgM3: 2700,              // aluminium
    };

    // ========================================================================
    // TEMPLATES — outer contour + cuts (baked into resolved geom on load)
    // ========================================================================
    const TEMPLATES = {
        'rect-tube': {
            outer: [{x:0,y:0},{x:60,y:0},{x:60,y:40},{x:0,y:40}],
            cuts: [[{x:3,y:3},{x:57,y:3},{x:57,y:37},{x:3,y:37}]],
        },
        'window-frame': {
            outer: [{x:0,y:0},{x:56,y:0},{x:56,y:14},{x:62,y:14},{x:62,y:0},{x:76,y:0},{x:76,y:60},{x:0,y:60}],
            cuts: [
                [{x:2,y:2},{x:54,y:2},{x:54,y:28},{x:2,y:28}],
                [{x:2,y:32},{x:74,y:32},{x:74,y:58},{x:2,y:58}],
            ],
        },
        'window-sash': {
            outer: [{x:0,y:0},{x:70,y:0},{x:70,y:10},{x:76,y:10},{x:76,y:0},{x:86,y:0},{x:86,y:58},{x:0,y:58}],
            cuts: [
                [{x:2,y:2},{x:68,y:2},{x:68,y:20},{x:2,y:20}],
                [{x:2,y:24},{x:42,y:24},{x:42,y:56},{x:2,y:56}],
                [{x:46,y:24},{x:84,y:24},{x:84,y:56},{x:46,y:56}],
            ],
        },
        'curtain-wall': {
            outer: [{x:0,y:0},{x:52,y:0},{x:52,y:24},{x:64,y:24},{x:64,y:0},{x:120,y:0},{x:120,y:160},{x:64,y:160},{x:64,y:136},{x:52,y:136},{x:52,y:160},{x:0,y:160}],
            cuts: [
                [{x:3,y:3},{x:49,y:3},{x:49,y:157},{x:3,y:157}],
                [{x:67,y:3},{x:117,y:3},{x:117,y:73},{x:67,y:73}],
                [{x:67,y:80},{x:117,y:80},{x:117,y:157},{x:67,y:157}],
            ],
        },
        't-slot': {
            outer: [{x:15,y:0},{x:25,y:0},{x:25,y:12},{x:40,y:12},{x:40,y:18},{x:25,y:18},{x:25,y:22},{x:40,y:22},{x:40,y:28},{x:25,y:28},{x:25,y:40},{x:15,y:40},{x:15,y:28},{x:0,y:28},{x:0,y:22},{x:15,y:22},{x:15,y:18},{x:0,y:18},{x:0,y:12},{x:15,y:12}],
            cuts: [],
        },
        'heatsink': {
            outer: (function () {
                const pts = []; const baseW = 80, baseH = 5, finH = 30, finW = 2, finGap = 8, nFins = 8;
                const totalW = (nFins - 1) * finGap + finW; const xOff = (baseW - totalW) / 2;
                pts.push({x:0, y:finH + baseH}, {x:0, y:finH});
                for (let i = 0; i < nFins; i++) {
                    const fx = xOff + i * finGap;
                    pts.push({x:fx, y:finH}, {x:fx, y:0}, {x:fx + finW, y:0}, {x:fx + finW, y:finH});
                }
                pts.push({x:baseW, y:finH}, {x:baseW, y:finH + baseH});
                return pts;
            })(),
            cuts: [],
        },
        'u-channel': {
            outer: [{x:0,y:0},{x:4,y:0},{x:4,y:46},{x:36,y:46},{x:36,y:0},{x:40,y:0},{x:40,y:50},{x:0,y:50}],
            cuts: [],
        },
        'blank': { outer: [], cuts: [] },
    };

    // ========================================================================
    // STATE
    // ========================================================================
    let canvas, ctx;
    let canvasRect = { width: 600, height: 500 };

    const EPS = 1e-3;            // mm rounding to suppress float fuzz
    const CIRCLE_SEGMENTS = 48;  // tessellation for circle primitive

    let state = {
        geom: [],                 // resolved MultiPolygon (the ONLY shape)
        // active tool
        tool: 'rect',             // rect | circle | poly | select
        op: 'add',                // add | subtract (ignored for select)
        // transient drawing
        drawPts: [],              // polygon points being placed
        dragStart: null,          // {x,y} for rect/circle drag
        lengthInput: '',          // typed exact length (poly)
        // editing
        dragVertex: null,         // {poly,ring,idx}
        hoverVertex: null,
        cursorMm: null,
        shiftKey: false,
        // view
        scale: 3.5,               // px per mm
        offsetX: 0, offsetY: 0,
        // grid
        gridSize: 5, snapToGrid: true,
        // material / order
        alloy: '6063-T6', treatment: 'raw',
        pieceLength: 6000, quantity: 50, delivery: 'standard',
        // history
        history: [], historyIndex: -1,
        // pointers (for pinch)
        pointers: new Map(), pinchDist: 0,
    };

    // ========================================================================
    // SMALL MATH / RING HELPERS
    // ========================================================================
    const round = (v) => Math.round(v / EPS) * EPS;

    function ringArea(ring) { // signed shoelace, [{x,y}]
        let a = 0;
        for (let i = 0; i < ring.length; i++) {
            const j = (i + 1) % ring.length;
            a += ring[i].x * ring[j].y - ring[j].x * ring[i].y;
        }
        return a / 2;
    }
    const absArea = (ring) => Math.abs(ringArea(ring));

    function ringBBox(ring) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of ring) {
            if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
        }
        return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }

    function geomBBox() {
        let b = null;
        for (const poly of state.geom) {
            const bb = ringBBox(poly[0]);
            if (!b) b = { ...bb };
            else {
                b.minX = Math.min(b.minX, bb.minX); b.minY = Math.min(b.minY, bb.minY);
                b.maxX = Math.max(b.maxX, bb.maxX); b.maxY = Math.max(b.maxY, bb.maxY);
            }
        }
        if (!b) return { minX:0, minY:0, maxX:0, maxY:0, width:0, height:0 };
        b.width = b.maxX - b.minX; b.height = b.maxY - b.minY;
        return b;
    }

    // all outer-ring vertices across the resolved geometry
    function allOuterPoints() {
        const pts = [];
        for (const poly of state.geom) for (const p of poly[0]) pts.push(p);
        return pts;
    }

    function pointToSegmentDist(px, py, ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - ax, py - ay);
        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }

    function pointInRing(px, py, ring) {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i].x, yi = ring[i].y, xj = ring[j].x, yj = ring[j].y;
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
    }

    // is (px,py) inside the solid material of the resolved geometry?
    function pointInSolid(px, py) {
        for (const poly of state.geom) {
            if (pointInRing(px, py, poly[0])) {
                let inHole = false;
                for (let h = 1; h < poly.length; h++) if (pointInRing(px, py, poly[h])) { inHole = true; break; }
                if (!inHole) return true;
            }
        }
        return false;
    }

    // Smallest enclosing circle (Welzl, deterministic) over outer points
    function minEnclosingCircle(pts) {
        if (pts.length === 0) return { x: 0, y: 0, r: 0 };
        const P = pts.map(p => ({ x: p.x, y: p.y }));
        const circContains = (c, p) => Math.hypot(p.x - c.x, p.y - c.y) <= c.r + 1e-6;
        const from2 = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: Math.hypot(a.x - b.x, a.y - b.y) / 2 });
        const from3 = (a, b, c) => {
            const ax = a.x, ay = a.y, bx = b.x, by = b.y, cx = c.x, cy = c.y;
            const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
            if (Math.abs(d) < 1e-9) return null;
            const ux = ((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d;
            const uy = ((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d;
            return { x: ux, y: uy, r: Math.hypot(ax - ux, ay - uy) };
        };
        let c = { x: P[0].x, y: P[0].y, r: 0 };
        for (let i = 0; i < P.length; i++) {
            if (circContains(c, P[i])) continue;
            c = { x: P[i].x, y: P[i].y, r: 0 };
            for (let j = 0; j < i; j++) {
                if (circContains(c, P[j])) continue;
                c = from2(P[i], P[j]);
                for (let k = 0; k < j; k++) {
                    if (circContains(c, P[k])) continue;
                    const cc = from3(P[i], P[j], P[k]);
                    if (cc) c = cc;
                }
            }
        }
        return c;
    }

    // ========================================================================
    // polygon-clipping <-> our model
    // ========================================================================
    function toPC(geom) {
        return geom.map(poly => poly.map(ring => {
            const r = ring.map(p => [round(p.x), round(p.y)]);
            if (r.length) r.push([round(ring[0].x), round(ring[0].y)]);
            return r;
        }));
    }
    function ringFromPC(ring) {
        const pts = ring.map(([x, y]) => ({ x: round(x), y: round(y) }));
        if (pts.length > 1) {
            const a = pts[0], b = pts[pts.length - 1];
            if (a.x === b.x && a.y === b.y) pts.pop();
        }
        return pts;
    }
    function fromPC(mp) {
        if (!mp) return [];
        return mp.map(poly => poly.map(ringFromPC)).filter(poly => poly.length && poly[0].length >= 3);
    }

    function sanitizeRing(ring) {
        // drop consecutive duplicates, require area & >=3 pts
        const out = [];
        for (const p of ring) {
            const q = { x: round(p.x), y: round(p.y) };
            const last = out[out.length - 1];
            if (!last || last.x !== q.x || last.y !== q.y) out.push(q);
        }
        if (out.length >= 2) {
            const a = out[0], b = out[out.length - 1];
            if (a.x === b.x && a.y === b.y) out.pop();
        }
        if (out.length < 3) return null;
        if (absArea(out) < 0.01) return null;
        return out;
    }

    // ========================================================================
    // BOOLEAN ENGINE — the core fix
    // ========================================================================
    function booleanAvailable() { return typeof polygonClipping !== 'undefined'; }

    // apply add(union) / subtract(difference) of a simple ring into state.geom
    function applyOp(opType, ring) {
        const clean = sanitizeRing(ring);
        if (!clean) { toast('Form zu klein oder ungültig.'); return false; }
        if (!booleanAvailable()) { toast('Geometrie-Engine nicht geladen.'); return false; }

        const shapeMP = [[clean.map(p => [round(p.x), round(p.y)]).concat([[round(clean[0].x), round(clean[0].y)]])]];
        let result;
        try {
            if (state.geom.length === 0) {
                result = (opType === 'add') ? shapeMP : [];
            } else {
                const cur = toPC(state.geom);
                result = (opType === 'add')
                    ? polygonClipping.union(cur, shapeMP)
                    : polygonClipping.difference(cur, shapeMP);
            }
        } catch (e) {
            console.warn('boolean failed', e);
            toast('Geometrie-Fehler bei dieser Operation.');
            return false;
        }
        state.geom = fromPC(result);
        return true;
    }

    // normalise / self-clean the resolved geom (used after vertex edits)
    function recleanGeom() {
        if (!state.geom.length || !booleanAvailable()) return;
        try {
            const cleaned = polygonClipping.union(toPC(state.geom));
            const g = fromPC(cleaned);
            if (g.length) state.geom = g;
        } catch (e) { /* keep as-is on failure */ }
    }

    // ========================================================================
    // METRICS
    // ========================================================================
    function metrics() {
        if (!state.geom.length) return { valid: false };
        let netArea = 0, outerArea = 0, holes = 0;
        for (const poly of state.geom) {
            outerArea += absArea(poly[0]);
            netArea += absArea(poly[0]);
            for (let h = 1; h < poly.length; h++) { netArea -= absArea(poly[h]); holes++; }
        }
        const weightPerMeter = (netArea / 1e6) * PRICING.densityKgM3;
        const mec = minEnclosingCircle(allOuterPoints());
        const bb = geomBBox();
        return {
            valid: true, netArea, outerArea, holeArea: outerArea - netArea, holes,
            weightPerMeter, circumCircle: mec.r * 2, mec, bb,
            islands: state.geom.length,
            minWall: estimateMinWall(),
            corners: totalCorners(),
        };
    }

    function totalCorners() {
        let n = 0;
        for (const poly of state.geom) for (const ring of poly) n += ring.length;
        return n;
    }

    // min wall: smallest gap across material — outer↔hole and hole↔hole, per piece
    function estimateMinWall() {
        if (!state.geom.length) return Infinity;
        let min = Infinity;
        const sampleEdge = (ring, cb) => {
            for (let i = 0; i < ring.length; i++) {
                const a = ring[i], b = ring[(i + 1) % ring.length];
                const segLen = Math.hypot(b.x - a.x, b.y - a.y);
                const steps = Math.max(1, Math.ceil(segLen / 1.0));
                for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    cb(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
                }
            }
        };
        const distToRing = (px, py, ring) => {
            let d = Infinity;
            for (let i = 0; i < ring.length; i++) {
                const a = ring[i], b = ring[(i + 1) % ring.length];
                d = Math.min(d, pointToSegmentDist(px, py, a.x, a.y, b.x, b.y));
            }
            return d;
        };
        for (const poly of state.geom) {
            for (let h = 1; h < poly.length; h++) {
                // hole -> outer (wall to outside)
                sampleEdge(poly[h], (px, py) => { min = Math.min(min, distToRing(px, py, poly[0])); });
                // hole -> other holes (wall between chambers)
                for (let k = 1; k < poly.length; k++) {
                    if (k === h) continue;
                    sampleEdge(poly[h], (px, py) => { min = Math.min(min, distToRing(px, py, poly[k])); });
                }
            }
        }
        return min;
    }

    function isAsymmetric() {
        const pts = allOuterPoints();
        if (pts.length < 3) return false;
        const bb = geomBBox();
        const cx = (bb.minX + bb.maxX) / 2;
        let score = 0;
        for (const p of pts) {
            const mx = cx + (cx - p.x);
            let md = Infinity;
            for (const q of pts) md = Math.min(md, Math.hypot(mx - q.x, p.y - q.y));
            score += md;
        }
        return (score / pts.length) > 2;
    }

    // ========================================================================
    // PRICING
    // ========================================================================
    function calculatePricing() {
        const m = metrics();
        if (!m.valid) return null;

        const isHollow = m.holes > 0;
        const dia = m.circumCircle;

        // die (one-time)
        let dieBase = (PRICING.dieSolid.find(t => dia <= t.maxDia) || PRICING.dieSolid[PRICING.dieSolid.length - 1]).cost;
        if (isHollow) dieBase *= PRICING.dieHollowFactor;
        let dieMult = 1;
        const minAllowed = PRESS.minWallThickness[state.alloy] || PRESS.minWallDefault;
        if (m.minWall !== Infinity && m.minWall < 1.5) dieMult += PRICING.dieComplexity.thinWall;
        if (isAsymmetric()) dieMult += PRICING.dieComplexity.asymmetry;
        if (m.corners > 14) dieMult += PRICING.dieComplexity.manyCorners;
        let dieCost = dieBase * dieMult;
        if (m.holes > 1) dieCost += PRICING.diePerExtraChamber * (m.holes - 1);

        // €/kg material (all-in)
        const metalBase = PRICING.metalBasePerKg[state.alloy] || 3.65;
        const surfAdd = PRICING.surfaceAdderPerKg[state.treatment] || 0;
        let pricePerKg = metalBase + PRICING.conversionPremium + surfAdd;

        // weights
        const pieceLenM = state.pieceLength / 1000;
        const pieceWeight = m.weightPerMeter * pieceLenM;
        const totalWeight = pieceWeight * state.quantity;

        // qty tier
        const tier = PRICING.qtyTiers.find(t => totalWeight <= t.maxKg) || PRICING.qtyTiers[PRICING.qtyTiers.length - 1];
        const qtyFactor = tier.factor;
        pricePerKg *= qtyFactor;

        // delivery
        const delivFactor = state.delivery === 'express' ? PRICING.expressFactor : 1.0;
        pricePerKg *= delivFactor;

        const materialTotal = totalWeight * pricePerKg;

        // adders
        const isStandard = PRICING.standardLengths.includes(state.pieceLength);
        const cutting = isStandard ? 0 : PRICING.cuttingPerCutPiece * state.quantity;
        const setup = PRICING.setupPerOrder;
        const packaging = PRICING.packagingFlat;

        const recurring = materialTotal + cutting + setup + packaging;
        const grandTotal = recurring + dieCost;          // first order incl. die
        const perPiece = grandTotal / state.quantity;
        const perPieceReorder = (recurring) / state.quantity;
        const perMeter = grandTotal / (pieceLenM * state.quantity);

        return {
            dieCost, pricePerKg, metalBase, surfAdd, conversionPremium: PRICING.conversionPremium,
            pieceWeight, totalWeight, materialTotal, cutting, setup, packaging,
            grandTotal, perPiece, perPieceReorder, perMeter,
            qtyFactor, delivFactor, isStandard, isHollow,
            belowBatch: totalWeight < PRICING.minPressBatchKg,
            minAllowed,
        };
    }

    // ========================================================================
    // COORDINATE TRANSFORMS
    // ========================================================================
    function mmToCanvas(x, y) {
        return { x: x * state.scale + state.offsetX + canvasRect.width / 2,
                 y: y * state.scale + state.offsetY + canvasRect.height / 2 };
    }
    function rawCanvasToMm(cx, cy) {
        return { x: (cx - state.offsetX - canvasRect.width / 2) / state.scale,
                 y: (cy - state.offsetY - canvasRect.height / 2) / state.scale };
    }
    // snapped: grid + magnetic vertex snap + ortho
    function snapMm(cx, cy, opts = {}) {
        let { x, y } = rawCanvasToMm(cx, cy);

        // magnetic snap to an existing resolved vertex (within ~10px)
        if (opts.vertexSnap !== false && state.geom.length) {
            const tolMm = 10 / state.scale;
            let best = null, bestD = tolMm;
            for (const poly of state.geom) for (const ring of poly) for (const p of ring) {
                const d = Math.hypot(p.x - x, p.y - y);
                if (d < bestD) { bestD = d; best = p; }
            }
            if (best) return { x: best.x, y: best.y, snappedVertex: true };
        }

        // ortho from the last drawing point (Shift)
        if (opts.ortho && state.shiftKey && state.drawPts.length) {
            const last = state.drawPts[state.drawPts.length - 1];
            const dx = x - last.x, dy = y - last.y;
            if (Math.abs(dx) > Math.abs(dy)) y = last.y; else x = last.x;
        }

        if (state.snapToGrid) {
            x = Math.round(x / state.gridSize) * state.gridSize;
            y = Math.round(y / state.gridSize) * state.gridSize;
        }
        return { x, y };
    }

    // exact-length cursor while typing (poly tool)
    function effectiveDrawCursor() {
        if (!state.cursorMm) return null;
        if (state.lengthInput && state.drawPts.length) {
            const len = parseFloat(state.lengthInput);
            if (!isNaN(len) && len > 0) {
                const last = state.drawPts[state.drawPts.length - 1];
                const dx = state.cursorMm.x - last.x, dy = state.cursorMm.y - last.y;
                const d = Math.hypot(dx, dy);
                if (d > 1e-4) return { x: last.x + dx / d * len, y: last.y + dy / d * len };
            }
        }
        return state.cursorMm;
    }

    // ========================================================================
    // HISTORY
    // ========================================================================
    function pushHistory() {
        const snap = JSON.stringify(state.geom);
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(snap);
        state.historyIndex = state.history.length - 1;
        if (state.history.length > 80) { state.history.shift(); state.historyIndex--; }
    }
    function applyHistory() {
        state.geom = JSON.parse(state.history[state.historyIndex] || '[]');
        state.drawPts = []; state.dragStart = null; state.lengthInput = '';
        recompute();
    }
    function undo() { if (state.historyIndex > 0) { state.historyIndex--; applyHistory(); } }
    function redo() { if (state.historyIndex < state.history.length - 1) { state.historyIndex++; applyHistory(); } }

    // commit a finished primitive
    function commit() { pushHistory(); recompute(); }

    function recompute() { render(); updateCalculations(); }

    // ========================================================================
    // RENDERING
    // ========================================================================
    const COL = { solid: '#c8102e', solidFill: 'rgba(200,16,46,0.16)', add: '#22c55e',
                  sub: '#f5a623', vertex: '#c8102e', grid: 'rgba(200,16,46,0.07)',
                  gridMaj: 'rgba(200,16,46,0.14)', danger: '#ef4444' };

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
        drawGrid();
        drawGeom();
        drawDimensions();
        drawCurrentDrawing();
        drawConstraints();
        drawHandles();
    }

    function drawGrid() {
        const w = canvasRect.width, h = canvasRect.height, gs = state.gridSize;
        const s = rawCanvasToMm(0, 0), e = rawCanvasToMm(w, h);
        const sx = Math.floor(s.x / gs) * gs, sy = Math.floor(s.y / gs) * gs;
        const ex = Math.ceil(e.x / gs) * gs, ey = Math.ceil(e.y / gs) * gs;
        ctx.strokeStyle = COL.grid; ctx.lineWidth = 0.5;
        for (let x = sx; x <= ex; x += gs) { const c = mmToCanvas(x, 0); ctx.beginPath(); ctx.moveTo(c.x, 0); ctx.lineTo(c.x, h); ctx.stroke(); }
        for (let y = sy; y <= ey; y += gs) { const c = mmToCanvas(0, y); ctx.beginPath(); ctx.moveTo(0, c.y); ctx.lineTo(w, c.y); ctx.stroke(); }
        const maj = gs * 5;
        ctx.strokeStyle = COL.gridMaj; ctx.lineWidth = 0.8;
        for (let x = Math.floor(s.x / maj) * maj; x <= ex; x += maj) { const c = mmToCanvas(x, 0); ctx.beginPath(); ctx.moveTo(c.x, 0); ctx.lineTo(c.x, h); ctx.stroke(); }
        for (let y = Math.floor(s.y / maj) * maj; y <= ey; y += maj) { const c = mmToCanvas(0, y); ctx.beginPath(); ctx.moveTo(0, c.y); ctx.lineTo(w, c.y); ctx.stroke(); }
        // origin
        const o = mmToCanvas(0, 0);
        ctx.strokeStyle = 'rgba(200,16,46,0.28)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, h); ctx.moveTo(0, o.y); ctx.lineTo(w, o.y); ctx.stroke();
    }

    function drawGeom() {
        if (!state.geom.length) return;
        for (const poly of state.geom) {
            ctx.beginPath();
            for (const ring of poly) {
                if (ring.length < 2) continue;
                const p0 = mmToCanvas(ring[0].x, ring[0].y);
                ctx.moveTo(p0.x, p0.y);
                for (let i = 1; i < ring.length; i++) { const p = mmToCanvas(ring[i].x, ring[i].y); ctx.lineTo(p.x, p.y); }
                ctx.closePath();
            }
            ctx.fillStyle = COL.solidFill; ctx.fill('evenodd');
            ctx.strokeStyle = COL.solid; ctx.lineWidth = 2; ctx.stroke();
        }
        // vertices (editable)
        for (const poly of state.geom) for (const ring of poly) for (const pt of ring) {
            const p = mmToCanvas(pt.x, pt.y);
            const hot = state.hoverVertex && state.hoverVertex.pt === pt;
            ctx.beginPath(); ctx.arc(p.x, p.y, hot ? 6 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = hot ? '#fff' : COL.vertex; ctx.fill();
            if (hot) { ctx.strokeStyle = COL.vertex; ctx.lineWidth = 2; ctx.stroke(); }
        }
    }

    function drawCurrentDrawing() {
        const col = state.op === 'add' ? COL.add : COL.sub;

        // polygon in progress
        if (state.tool === 'poly' && state.drawPts.length) {
            const eff = effectiveDrawCursor();
            ctx.beginPath();
            const p0 = mmToCanvas(state.drawPts[0].x, state.drawPts[0].y);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < state.drawPts.length; i++) { const p = mmToCanvas(state.drawPts[i].x, state.drawPts[i].y); ctx.lineTo(p.x, p.y); }
            if (eff) { const c = mmToCanvas(eff.x, eff.y); ctx.lineTo(c.x, c.y); }
            ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
            for (const pt of state.drawPts) { const p = mmToCanvas(pt.x, pt.y); ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
            drawLengthHud(eff, col);
            // close hint
            if (state.drawPts.length >= 3 && eff) {
                const d = Math.hypot(eff.x - state.drawPts[0].x, eff.y - state.drawPts[0].y);
                if (d < state.gridSize * 1.5) { const f = mmToCanvas(state.drawPts[0].x, state.drawPts[0].y); ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, Math.PI * 2); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
            }
        }

        // rectangle drag preview
        if (state.tool === 'rect' && state.dragStart && state.cursorMm) {
            const a = mmToCanvas(state.dragStart.x, state.dragStart.y);
            const b = mmToCanvas(state.cursorMm.x, state.cursorMm.y);
            ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
            ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
            ctx.setLineDash([]);
            const wmm = Math.abs(state.cursorMm.x - state.dragStart.x).toFixed(1);
            const hmm = Math.abs(state.cursorMm.y - state.dragStart.y).toFixed(1);
            hudText(`${wmm} × ${hmm} mm`, b.x + 14, b.y - 14, col);
        }

        // circle drag preview
        if (state.tool === 'circle' && state.dragStart && state.cursorMm) {
            const c = mmToCanvas(state.dragStart.x, state.dragStart.y);
            const r = Math.hypot(state.cursorMm.x - state.dragStart.x, state.cursorMm.y - state.dragStart.y) * state.scale;
            ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
            const dia = (Math.hypot(state.cursorMm.x - state.dragStart.x, state.cursorMm.y - state.dragStart.y) * 2).toFixed(1);
            hudText(`⌀ ${dia} mm`, c.x + r + 8, c.y, col);
        }
    }

    function hudText(label, x, y, col) {
        ctx.save();
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const tw = ctx.measureText(label).width, pad = 5;
        ctx.fillStyle = 'rgba(10,12,18,0.9)'; ctx.fillRect(x - pad, y - 9 - pad, tw + pad * 2, 18 + pad);
        ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y);
        ctx.restore();
    }

    function drawLengthHud(eff, col) {
        if (!state.drawPts.length || !eff) return;
        const last = state.drawPts[state.drawPts.length - 1];
        const dx = eff.x - last.x, dy = eff.y - last.y;
        const len = Math.hypot(dx, dy);
        let ang = Math.atan2(-dy, dx) * 180 / Math.PI; if (ang < 0) ang += 360;
        const c = mmToCanvas(eff.x, eff.y);
        const label = state.lengthInput ? `${state.lengthInput}_ mm  ${ang.toFixed(0)}°` : `${len.toFixed(1)} mm  ${ang.toFixed(0)}°`;
        hudText(label, c.x + 14, c.y - 16, col);
    }

    function drawDimensions() {
        if (!state.geom.length) return;
        ctx.save(); ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        // edge lengths on outer rings
        for (const poly of state.geom) {
            const ring = poly[0];
            for (let i = 0; i < ring.length; i++) {
                const a = ring[i], b = ring[(i + 1) % ring.length];
                const ca = mmToCanvas(a.x, a.y), cb = mmToCanvas(b.x, b.y);
                const edgeLen = Math.hypot(cb.x - ca.x, cb.y - ca.y);
                if (edgeLen < 34) continue;
                const len = Math.hypot(b.x - a.x, b.y - a.y).toFixed(1);
                const mx = (ca.x + cb.x) / 2, my = (ca.y + cb.y) / 2;
                const nx = -(cb.y - ca.y) / edgeLen * 13, ny = (cb.x - ca.x) / edgeLen * 13;
                const lx = mx + nx, ly = my + ny;
                const tw = ctx.measureText(len).width;
                ctx.fillStyle = 'rgba(10,12,18,0.85)'; ctx.fillRect(lx - tw / 2 - 4, ly - 7, tw + 8, 14);
                ctx.fillStyle = 'rgba(200,16,46,0.95)'; ctx.fillText(len, lx, ly);
            }
        }
        // bounding box W × H
        const bb = geomBBox();
        const br = mmToCanvas(bb.maxX, bb.maxY), tl = mmToCanvas(bb.minX, bb.minY);
        const wt = bb.width.toFixed(1) + ' mm', wtw = ctx.measureText(wt).width, wy = br.y + 20;
        ctx.fillStyle = 'rgba(10,12,18,0.85)'; ctx.fillRect((tl.x + br.x) / 2 - wtw / 2 - 4, wy - 7, wtw + 8, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(wt, (tl.x + br.x) / 2, wy);
        ctx.restore();
    }

    function drawConstraints() {
        const m = metrics(); if (!m.valid) return;
        if (m.circumCircle > PRESS.maxCircumscribingCircle) {
            const c = mmToCanvas(m.mec.x, m.mec.y);
            ctx.beginPath(); ctx.arc(c.x, c.y, m.mec.r * state.scale, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239,68,68,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(c.x, c.y, (PRESS.maxCircumscribingCircle / 2) * state.scale, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34,197,94,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        }
    }

    function drawHandles() {
        if (state.tool !== 'select' || !state.hoverVertex) return;
        const pt = state.hoverVertex.pt, p = mmToCanvas(pt.x, pt.y);
        ctx.save(); ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
        const t = `(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`;
        const tw = ctx.measureText(t).width;
        ctx.fillStyle = 'rgba(10,12,18,0.92)'; ctx.fillRect(p.x + 10, p.y - 20, tw + 8, 16);
        ctx.fillStyle = '#fff'; ctx.fillText(t, p.x + 14, p.y - 12);
        ctx.restore();
    }

    // ========================================================================
    // POINT EDITOR (numeric)
    // ========================================================================
    let pointEditOverlay = null;
    function showPointEditor(pt, onSave) {
        removePointEditor();
        const wrap = canvas.parentElement, cp = mmToCanvas(pt.x, pt.y);
        const o = document.createElement('div');
        o.className = 'cc-point-editor';
        o.style.cssText = `position:absolute;left:${cp.x + 12}px;top:${cp.y - 42}px;background:#161616;border:1px solid ${COL.solid};border-radius:6px;padding:8px;display:flex;gap:4px;align-items:center;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.5);`;
        const inp = (v) => { const e = document.createElement('input'); e.type = 'number'; e.value = (+v).toFixed(1); e.step = state.gridSize; e.style.cssText = 'width:62px;padding:4px 6px;background:#0a0a0a;border:1px solid rgba(255,255,255,.12);border-radius:4px;color:#fff;font:11px "JetBrains Mono",monospace;text-align:center;'; return e; };
        const ix = inp(pt.x), iy = inp(pt.y);
        const sep = document.createElement('span'); sep.textContent = ','; sep.style.cssText = 'color:#666;font-size:11px;';
        const ok = document.createElement('button'); ok.textContent = '✓'; ok.style.cssText = `padding:4px 8px;background:${COL.solid};color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:700;`;
        ok.onclick = () => { const nx = parseFloat(ix.value), ny = parseFloat(iy.value); if (!isNaN(nx) && !isNaN(ny)) onSave(nx, ny); removePointEditor(); };
        const key = (e) => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') removePointEditor(); };
        ix.onkeydown = key; iy.onkeydown = key;
        o.append(ix, sep, iy, ok); wrap.appendChild(o); pointEditOverlay = o; ix.focus(); ix.select();
    }
    function removePointEditor() { if (pointEditOverlay && pointEditOverlay.parentElement) pointEditOverlay.parentElement.removeChild(pointEditOverlay); pointEditOverlay = null; }

    // ========================================================================
    // HIT TESTING
    // ========================================================================
    function hitVertex(mm) {
        const tol = (12 / state.scale);
        for (let pi = 0; pi < state.geom.length; pi++)
            for (let ri = 0; ri < state.geom[pi].length; ri++)
                for (let i = 0; i < state.geom[pi][ri].length; i++) {
                    const pt = state.geom[pi][ri][i];
                    if (Math.hypot(mm.x - pt.x, mm.y - pt.y) < tol) return { poly: pi, ring: ri, idx: i, pt };
                }
        return null;
    }
    function hitEdge(mm) {
        const tol = (8 / state.scale);
        for (let pi = 0; pi < state.geom.length; pi++)
            for (let ri = 0; ri < state.geom[pi].length; ri++) {
                const ring = state.geom[pi][ri];
                for (let i = 0; i < ring.length; i++) {
                    const a = ring[i], b = ring[(i + 1) % ring.length];
                    if (pointToSegmentDist(mm.x, mm.y, a.x, a.y, b.x, b.y) < tol) return { poly: pi, ring: ri, idx: i };
                }
            }
        return null;
    }

    // ========================================================================
    // POINTER INPUT (mouse + touch unified)
    // ========================================================================
    function pointerMm(e, snap) {
        const r = canvas.getBoundingClientRect();
        const cx = e.clientX - r.left, cy = e.clientY - r.top;
        return snap ? snapMm(cx, cy, snap) : rawCanvasToMm(cx, cy);
    }

    function onPointerDown(e) {
        canvas.setPointerCapture?.(e.pointerId);
        state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // pinch start
        if (state.pointers.size === 2) {
            const [a, b] = [...state.pointers.values()];
            state.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
            state.drawPts = []; state.dragStart = null;  // cancel any draw
            return;
        }
        if (e.pointerType === 'mouse' && e.button === 1) { state.isPanning = true; state.panStart = { x: e.clientX, y: e.clientY }; return; }
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        const mm = pointerMm(e, { ortho: true });

        if (state.tool === 'select') {
            const v = hitVertex(rawCanvasToMm(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top));
            if (v) { state.dragVertex = v; return; }
            return;
        }
        if (state.tool === 'rect' || state.tool === 'circle') { state.dragStart = { x: mm.x, y: mm.y }; state.cursorMm = { x: mm.x, y: mm.y }; return; }
        // poly handled on click/tap (pointerup) to allow multi-point
    }

    function onPointerMove(e) {
        if (state.pointers.has(e.pointerId)) state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // pinch zoom + pan
        if (state.pointers.size === 2) {
            const [a, b] = [...state.pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            const r = canvas.getBoundingClientRect();
            const midx = (a.x + b.x) / 2 - r.left, midy = (a.y + b.y) / 2 - r.top;
            if (state.pinchDist > 0) {
                const factor = dist / state.pinchDist;
                const before = rawCanvasToMm(midx, midy);
                state.scale = Math.max(0.4, Math.min(20, state.scale * factor));
                const after = rawCanvasToMm(midx, midy);
                state.offsetX += (after.x - before.x) * state.scale;
                state.offsetY += (after.y - before.y) * state.scale;
            }
            state.pinchDist = dist;
            render();
            return;
        }

        if (state.isPanning) { state.offsetX += e.clientX - state.panStart.x; state.offsetY += e.clientY - state.panStart.y; state.panStart = { x: e.clientX, y: e.clientY }; render(); return; }

        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

        if (state.tool === 'select') {
            if (state.dragVertex) {
                const mm = snapMm(cx, cy, { vertexSnap: false });
                const v = state.dragVertex;
                state.geom[v.poly][v.ring][v.idx] = { x: mm.x, y: mm.y };
                render(); updateCalculations(); updateCursor(mm); return;
            }
            const mm = rawCanvasToMm(cx, cy);
            state.hoverVertex = hitVertex(mm); state.cursorMm = mm; render(); updateCursor(mm); return;
        }

        const snap = (state.tool === 'poly') ? { ortho: true } : { vertexSnap: true };
        const mm = snapMm(cx, cy, snap);
        state.cursorMm = mm; render(); updateCursor(mm);
    }

    function onPointerUp(e) {
        const wasMulti = state.pointers.size >= 2;
        state.pointers.delete(e.pointerId);
        if (state.pointers.size < 2) state.pinchDist = 0;
        canvas.releasePointerCapture?.(e.pointerId);
        if (wasMulti) return;
        if (state.isPanning) { state.isPanning = false; return; }

        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;

        if (state.tool === 'select') {
            if (state.dragVertex) { state.dragVertex = null; recleanGeom(); commit(); }
            return;
        }

        if (state.tool === 'rect' && state.dragStart) {
            const mm = snapMm(cx, cy, { vertexSnap: true });
            const x = Math.min(state.dragStart.x, mm.x), y = Math.min(state.dragStart.y, mm.y);
            const w = Math.abs(mm.x - state.dragStart.x), h = Math.abs(mm.y - state.dragStart.y);
            state.dragStart = null;
            if (w >= PRESS.minFeatureSize && h >= PRESS.minFeatureSize) {
                if (applyOp(state.op, [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}])) commit();
            }
            render(); return;
        }

        if (state.tool === 'circle' && state.dragStart) {
            const mm = snapMm(cx, cy, { vertexSnap: false });
            const r = Math.hypot(mm.x - state.dragStart.x, mm.y - state.dragStart.y);
            const c = state.dragStart; state.dragStart = null;
            if (r >= PRESS.minFeatureSize / 2) {
                const ring = [];
                for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
                    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
                    ring.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r });
                }
                if (applyOp(state.op, ring)) commit();
            }
            render(); return;
        }

        if (state.tool === 'poly') {
            // tap = place point (snapped, with exact length if typed)
            const eff = state.lengthInput ? effectiveDrawCursor() : snapMm(cx, cy, { ortho: true });
            if (!eff) return;
            if (state.drawPts.length >= 3) {
                const d = Math.hypot(eff.x - state.drawPts[0].x, eff.y - state.drawPts[0].y);
                if (d < state.gridSize * 1.5) { closePolygon(); return; }
            }
            state.drawPts.push({ x: eff.x, y: eff.y }); state.lengthInput = ''; render();
        }
    }

    function closePolygon() {
        if (state.drawPts.length >= 3) { if (applyOp(state.op, state.drawPts.slice())) { state.drawPts = []; state.lengthInput = ''; commit(); return; } }
        state.drawPts = []; state.lengthInput = ''; render();
    }

    function onDblClick(e) {
        const rect = canvas.getBoundingClientRect();
        const mm = rawCanvasToMm(e.clientX - rect.left, e.clientY - rect.top);
        if (state.tool === 'poly' && state.drawPts.length >= 3) { closePolygon(); return; }
        if (state.tool === 'select') {
            const v = hitVertex(mm);
            if (v) { showPointEditor(v.pt, (nx, ny) => { state.geom[v.poly][v.ring][v.idx] = { x: nx, y: ny }; recleanGeom(); commit(); }); return; }
            const ed = hitEdge(mm);
            if (ed) { // insert vertex at click on edge
                const snapped = snapMm(e.clientX - rect.left, e.clientY - rect.top, { vertexSnap: false });
                state.geom[ed.poly][ed.ring].splice(ed.idx + 1, 0, { x: snapped.x, y: snapped.y });
                commit();
            }
        }
    }

    function onWheel(e) {
        e.preventDefault();
        const f = e.deltaY < 0 ? 1.15 : 0.87;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        const before = rawCanvasToMm(cx, cy);
        state.scale = Math.max(0.4, Math.min(20, state.scale * f));
        const after = rawCanvasToMm(cx, cy);
        state.offsetX += (after.x - before.x) * state.scale;
        state.offsetY += (after.y - before.y) * state.scale;
        render();
    }

    function onKeyDown(e) {
        state.shiftKey = e.shiftKey;
        // length typing while drawing polygon
        if (state.tool === 'poly' && state.drawPts.length) {
            if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
                if (e.key === '.' && state.lengthInput.includes('.')) return;
                state.lengthInput += e.key; render(); e.preventDefault(); return;
            }
            if (e.key === 'Backspace' && state.lengthInput) { state.lengthInput = state.lengthInput.slice(0, -1); render(); e.preventDefault(); return; }
            if (e.key === 'Enter') {
                const eff = effectiveDrawCursor();
                if (eff) {
                    if (state.drawPts.length >= 3 && Math.hypot(eff.x - state.drawPts[0].x, eff.y - state.drawPts[0].y) < state.gridSize * 1.5) { closePolygon(); e.preventDefault(); return; }
                    state.drawPts.push({ x: eff.x, y: eff.y }); state.lengthInput = ''; render();
                }
                e.preventDefault(); return;
            }
        }
        if (e.key === 'Enter' && state.tool === 'poly' && state.drawPts.length >= 3) { closePolygon(); e.preventDefault(); return; }
        if (e.key === 'Delete' || (e.key === 'Backspace' && !state.lengthInput)) {
            if (state.tool === 'select' && state.hoverVertex) { deleteVertex(state.hoverVertex); e.preventDefault(); return; }
        }
        if (e.key === 'Escape') { state.drawPts = []; state.dragStart = null; state.lengthInput = ''; removePointEditor(); render(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { undo(); e.preventDefault(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { redo(); e.preventDefault(); }
    }
    function onKeyUp(e) { state.shiftKey = e.shiftKey; }

    function deleteVertex(v) {
        const ring = state.geom[v.poly][v.ring];
        if (ring.length <= 3) {
            // removing would collapse the ring: drop the whole ring (hole) or island
            if (v.ring === 0) state.geom.splice(v.poly, 1);
            else state.geom[v.poly].splice(v.ring, 1);
        } else {
            ring.splice(v.idx, 1);
        }
        state.hoverVertex = null; recleanGeom(); commit();
    }

    // ========================================================================
    // UI: cursor / info / quote
    // ========================================================================
    function updateCursor(mm) {
        const el = document.getElementById('ccCursorPos'); if (!el || !mm) return;
        if (state.tool === 'poly' && state.drawPts.length) {
            const eff = effectiveDrawCursor() || mm, last = state.drawPts[state.drawPts.length - 1];
            const len = Math.hypot(eff.x - last.x, eff.y - last.y);
            const ls = state.lengthInput ? state.lengthInput + '_' : len.toFixed(1);
            el.textContent = `${eff.x.toFixed(1)}, ${eff.y.toFixed(1)} mm  |  L: ${ls} mm`;
        } else el.textContent = `${mm.x.toFixed(1)} , ${mm.y.toFixed(1)} mm`;
    }

    function t(key, fallback) {
        try { if (typeof I18n !== 'undefined' && I18n.t) return I18n.t(key) || fallback; } catch (_) {}
        return fallback;
    }

    function updateCalculations() {
        const infoEl = document.getElementById('ccProfileInfo');
        const quoteEl = document.getElementById('ccQuoteSummary');
        const warnEl = document.getElementById('ccWarnings');
        if (!infoEl) return;
        const m = metrics();
        if (!m.valid) {
            infoEl.innerHTML = `<p class="cc-info-empty">${t('cc.draw.hint', 'Zeichnen Sie ein Profil, um Berechnungen zu sehen')}</p>`;
            if (quoteEl) quoteEl.innerHTML = ''; if (warnEl) warnEl.innerHTML = ''; return;
        }
        const minAllowed = PRESS.minWallThickness[state.alloy] || PRESS.minWallDefault;

        // warnings
        const warns = [];
        if (m.islands > 1) warns.push(warn('error', 'Mehrere getrennte Teile', `Das Profil besteht aus ${m.islands} getrennten Flächen. Ein Strangpressprofil muss zusammenhängend sein — verbinden Sie die Teile.`));
        if (m.circumCircle > PRESS.maxCircumscribingCircle) warns.push(warn('error', 'Über Presskapazität', `Hüllkreis ${m.circumCircle.toFixed(0)} mm (max. ${PRESS.maxCircumscribingCircle} mm). Profil verkleinern.`));
        if (m.minWall !== Infinity && m.minWall < minAllowed) warns.push(warn('error', 'Wand zu dünn', `Minimale Wand ${m.minWall.toFixed(1)} mm (min. für ${state.alloy}: ${minAllowed} mm).`));
        else if (m.minWall !== Infinity && m.minWall < 1.5) warns.push(warn('warn', 'Dünne Wand', `${m.minWall.toFixed(1)} mm Wände erhöhen Werkzeugkosten und beeinflussen Toleranzen.`));
        if (m.weightPerMeter > PRESS.maxWeightPerMeter) warns.push(warn('warn', 'Schweres Profil', `${m.weightPerMeter.toFixed(2)} kg/m über üblichem Limit (${PRESS.maxWeightPerMeter} kg/m).`));
        if (warnEl) warnEl.innerHTML = warns.join('');

        infoEl.innerHTML = `
            <div class="cc-info-grid">
                ${infoItem('Nettofläche', m.netArea.toFixed(0) + ' mm²')}
                ${infoItem('Gewicht/Meter', m.weightPerMeter.toFixed(3) + ' kg/m')}
                ${infoItem('Hüllkreis ⌀', m.circumCircle.toFixed(1) + ' mm')}
                ${infoItem('Min. Wand', m.holes > 0 && m.minWall !== Infinity ? m.minWall.toFixed(1) + ' mm' : '—')}
                ${infoItem('Abmessung', m.bb.width.toFixed(0) + ' × ' + m.bb.height.toFixed(0) + ' mm')}
                ${infoItem('Kammern', String(m.holes))}
            </div>`;

        const p = calculatePricing();
        if (!p || !quoteEl) return;
        const eur = (v) => '€' + v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const eur0 = (v) => '€' + v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
        quoteEl.innerHTML = `
            ${p.belowBatch ? warn('warn', 'Unter Mindest-Pressmenge', `Gesamtgewicht ${p.totalWeight.toFixed(0)} kg liegt unter der typischen Mindest-Pressmenge von ${PRICING.minPressBatchKg} kg/Profil. Kleinmengenzuschlag enthalten.`) : ''}
            ${qline('Werkzeug (einmalig)', eur0(p.dieCost))}
            ${qline('Material ' + state.alloy, eur(p.pricePerKg) + '/kg')}
            ${qline('Stückgewicht', p.pieceWeight.toFixed(2) + ' kg')}
            ${qline('Gesamtgewicht (' + state.quantity + ' Stk.)', p.totalWeight.toFixed(1) + ' kg')}
            ${qline('Materialkosten', eur(p.materialTotal))}
            ${!p.isStandard ? qline('Ablängen (Sonderlänge)', eur(p.cutting)) : ''}
            ${qline('Rüstkosten', eur0(p.setup))}
            ${qline('Verpackung', eur0(p.packaging))}
            ${qlineTotal('Erstbestellung gesamt', eur(p.grandTotal))}
            ${qline('Pro Stück (inkl. Werkzeug)', eur(p.perPiece) + ' / Stk.')}
            ${qline('Pro Stück (Folgebestellung)', eur(p.perPieceReorder) + ' / Stk.')}
            ${qline('Pro Meter', eur(p.perMeter) + ' / m')}
            <div class="cc-die-note">Werkzeugkosten fallen einmalig an. Folgebestellungen ohne Werkzeug. Richtpreis (metallpreisabhängig), kein verbindliches Angebot.</div>`;
    }

    const infoItem = (l, v) => `<div class="cc-info-item"><span class="cc-info-label">${l}</span><span class="cc-info-value">${v}</span></div>`;
    const qline = (l, v) => `<div class="quote-line"><span class="quote-line-label">${l}</span><span class="quote-line-value">${v}</span></div>`;
    const qlineTotal = (l, v) => `<div class="quote-line quote-line-total"><span class="quote-line-label">${l}</span><span class="quote-line-value">${v}</span></div>`;
    const warn = (kind, title, body) => `<div class="cc-warning cc-warning-${kind === 'error' ? 'error' : 'warn'}"><strong>${title}:</strong> ${body}</div>`;

    // simple transient toast
    let toastTimer = null;
    function toast(msg) {
        let el = document.getElementById('ccToast');
        if (!el) {
            el = document.createElement('div'); el.id = 'ccToast';
            el.style.cssText = 'position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(239,68,68,.95);color:#fff;padding:8px 14px;border-radius:6px;font-size:13px;z-index:20;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,.4);';
            (canvas?.parentElement || document.body).appendChild(el);
        }
        el.textContent = msg; el.style.opacity = '1';
        clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2600);
    }

    // ========================================================================
    // TOOLBAR / TEMPLATES / VIEW
    // ========================================================================
    function setTool(tool) {
        state.tool = tool; state.drawPts = []; state.dragStart = null; state.lengthInput = ''; state.hoverVertex = null;
        document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
        if (canvas) canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
        render();
    }
    function setOp(op) {
        state.op = op;
        document.querySelectorAll('[data-op]').forEach(b => b.classList.toggle('active', b.dataset.op === op));
        render();
    }
    // back-compat for app.js / external callers
    function setMode(mode) {
        const map = { 'draw-outer': ['poly', 'add'], 'draw-cut': ['poly', 'subtract'], 'rect-cut': ['rect', 'subtract'], 'select': ['select', null] };
        const [tool, op] = map[mode] || [mode, null];
        if (op) setOp(op);
        setTool(tool);
    }

    function loadTemplate(key) {
        const tpl = TEMPLATES[key]; if (!tpl) return;
        state.geom = [];
        if (tpl.outer && tpl.outer.length >= 3) {
            applyOp('add', tpl.outer.map(p => ({ ...p })));
            for (const cut of (tpl.cuts || [])) applyOp('subtract', cut.map(p => ({ ...p })));
        }
        state.drawPts = []; state.dragStart = null;
        centerView(); pushHistory(); recompute();
        setOp('add'); setTool(key === 'blank' ? 'rect' : 'select');
    }

    function centerView() {
        if (!state.geom.length) { state.offsetX = 0; state.offsetY = 0; return; }
        const bb = geomBBox();
        const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2, margin = 50;
        const sx = (canvasRect.width - margin * 2) / Math.max(bb.width, 20);
        const sy = (canvasRect.height - margin * 2) / Math.max(bb.height, 20);
        state.scale = Math.max(0.6, Math.min(sx, sy, 9));
        state.offsetX = -cx * state.scale; state.offsetY = -cy * state.scale;
    }

    function clearAll() { state.geom = []; state.drawPts = []; state.dragStart = null; state.hoverVertex = null; pushHistory(); recompute(); }

    // ========================================================================
    // EXPORT to 3D preview + quote
    // ========================================================================
    function buildProfileData() {
        if (!state.geom.length) return null;
        // pick the largest island as the profile to render
        let best = state.geom[0], bestA = absArea(state.geom[0][0]);
        for (const poly of state.geom) { const a = absArea(poly[0]); if (a > bestA) { bestA = a; best = poly; } }
        return {
            outer: best[0].map(p => [p.x, p.y]),
            hollows: best.slice(1).map(r => r.map(p => [p.x, p.y])),
            disconnected: state.geom.length > 1,
        };
    }

    function requestQuote() {
        const data = buildProfileData();
        if (!data) { toast('Bitte zuerst ein Profil zeichnen.'); return; }
        try { sessionStorage.setItem('staeler_custom_profile', JSON.stringify(data)); } catch (_) {}
        // live-swap the hero to the drawn profile
        document.dispatchEvent(new CustomEvent('staeler:profileUpdate', { detail: data }));
        // open the request-quote modal with everything it needs (no DOM scraping)
        const surfSel = document.getElementById('ccTreatment');
        const meta = {
            alloy: state.alloy,
            treatment: state.treatment,
            treatmentLabel: surfSel && surfSel.options[surfSel.selectedIndex] ? surfSel.options[surfSel.selectedIndex].text.trim() : state.treatment,
            quantity: state.quantity,
            pieceLength: state.pieceLength,
            metrics: metrics(),
        };
        document.dispatchEvent(new CustomEvent('staeler:openProfile3DModal', {
            detail: { profile: data, pricing: calculatePricing(), meta },
        }));
    }

    // ========================================================================
    // INIT
    // ========================================================================
    function init() {
        canvas = document.getElementById('ccCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        canvas.style.touchAction = 'none';

        function resize() {
            const r = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvasRect.width = r.width; canvasRect.height = r.height;
            canvas.width = r.width * dpr; canvas.height = r.height * dpr;
            canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            render();
        }
        resize();
        window.addEventListener('resize', () => setTimeout(resize, 100));

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('dblclick', onDblClick);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        document.addEventListener('keydown', (e) => {
            const panel = document.getElementById('customConfigPanel');
            if (panel && panel.style.display !== 'none') onKeyDown(e);
        });
        document.addEventListener('keyup', onKeyUp);

        // toolbar: tools + op
        document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
        document.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => setOp(b.dataset.op)));
        document.querySelectorAll('.cc-tpl-btn').forEach(b => b.addEventListener('click', () => loadTemplate(b.dataset.template)));
        bind('ccClearBtn', clearAll);
        bind('ccCenterBtn', () => { centerView(); render(); });
        bind('ccUndoBtn', undo);
        bind('ccRedoBtn', redo);
        bind('ccRequestQuote', requestQuote);

        const grid = document.getElementById('ccGridSize');
        if (grid) grid.addEventListener('change', () => { state.gridSize = parseInt(grid.value) || 5; render(); });
        const snap = document.getElementById('ccSnapToggle');
        if (snap) snap.addEventListener('change', () => { state.snapToGrid = snap.checked; });

        bindSel('ccAlloy', v => { state.alloy = v; updateCalculations(); });
        bindSel('ccTreatment', v => { state.treatment = v; updateCalculations(); });
        bindInput('ccLength', v => { state.pieceLength = parseInt(v) || 6000; updateCalculations(); });
        bindInput('ccQuantity', v => { state.quantity = parseInt(v) || 1; updateCalculations(); });
        bindSel('ccDelivery', v => { state.delivery = v; updateCalculations(); });

        pushHistory();
        setOp('add'); setTool('rect');
        updateCalculations();
    }

    function bind(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
    function bindSel(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('change', () => fn(el.value)); }
    function bindInput(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('input', () => fn(el.value)); }

    return { init, loadTemplate, setMode, setTool, setOp, clearAll };
})();

document.addEventListener('DOMContentLoaded', CustomConfigurator.init);
