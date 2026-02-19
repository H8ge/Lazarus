/* ==========================================================================
   STAELER — 3D Hero Profile (Three.js)
   Renders a NUT-8 40×40 T-Slot aluminum profile with metallic materials
   ========================================================================== */

import * as THREE from 'three';

(function () {
    'use strict';

    const canvas = document.getElementById('hero3d');
    if (!canvas) return;

    const container = canvas.closest('.hero');

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Camera: positioned to show the cross-section face prominently on the right
    // side of the viewport, with the body extending diagonally upper-right
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 5000);
    camera.position.set(0, 5, 100);
    camera.lookAt(15, -5, 0);

    // ── Lighting ────────────────────────────────────────────────────────
    // Studio product-photography setup:
    // — Two SpotLights near the cross-section face, both with inverse-square
    //   decay so the body fades naturally to black along its length.
    // — Dark ambient so shadows stay deep.

    // Primary key spot — upper-front, slightly left.
    // Illuminates the cross-section face strongly and creates the specular
    // streak along the top-left edge of the body as it grazes past.
    const keySpot = new THREE.SpotLight(0xffffff, 700);
    keySpot.position.set(10, 90, 140);
    keySpot.target.position.set(40, -15, -60);
    keySpot.angle = Math.PI / 5.5;  // ~33° cone
    keySpot.penumbra = 0.5;
    keySpot.decay = 2;              // inverse-square — bright near face, dark far end
    keySpot.distance = 520;
    scene.add(keySpot);
    scene.add(keySpot.target);

    // Top strip light — steep downward angle, narrower cone.
    // Creates the characteristic thin specular line along the raised profile edges.
    const topStrip = new THREE.SpotLight(0xd0dcf0, 400);
    topStrip.position.set(-15, 140, 70);
    topStrip.target.position.set(42, -15, -130);
    topStrip.angle = Math.PI / 9;   // ~20° narrow
    topStrip.penumbra = 0.35;
    topStrip.decay = 2;
    topStrip.distance = 460;
    scene.add(topStrip);
    scene.add(topStrip.target);

    // Cold blue rim — from upper-behind, barely visible.
    // Separates the profile silhouette from the dark background.
    const rimLight = new THREE.DirectionalLight(0x0d1a30, 3.5);
    rimLight.position.set(50, 60, -300);
    scene.add(rimLight);

    // Near-black ambient — shadows stay almost fully dark
    const ambient = new THREE.AmbientLight(0x040406, 1);
    scene.add(ambient);


    // ── NUT-8 40×40 T-Slot Profile Shape ────────────────────────────────
    // Simple outer contour tracing only the outer boundary with T-slot
    // notches cut into each face. Holes handle internal voids.
    function createNut8Shape() {
        const H = 20;       // half of 40mm
        const sW = 4.1;     // half slot opening (8.2mm total)
        const uW = 8.0;     // half undercut width (16mm total)
        const sD = 10;      // slot depth from face
        const lip = 1.8;    // narrow lip thickness

        const shape = new THREE.Shape();

        // Outer contour — simple polygon, clockwise from top-left.
        // Each face dips inward to trace the T-slot cavity, then returns
        // to the outer face. No internal web traversal.

        // ── Top face (left → right), slot opens downward ──────────────
        shape.moveTo(-H, H);
        shape.lineTo(-sW, H);           // face to left edge of slot
        shape.lineTo(-sW, H - lip);     // down into narrow left wall
        shape.lineTo(-uW, H - lip);     // step left (wider undercut)
        shape.lineTo(-uW, H - sD);      // down to slot bottom
        shape.lineTo( uW, H - sD);      // across slot bottom
        shape.lineTo( uW, H - lip);     // up from slot bottom
        shape.lineTo( sW, H - lip);     // step right (back to narrow)
        shape.lineTo( sW, H);           // up narrow right wall
        shape.lineTo( H, H);            // face to top-right corner

        // ── Right face (top → bottom), slot opens rightward ───────────
        shape.lineTo( H,  sW);          // face to top edge of slot
        shape.lineTo( H - lip,  sW);    // left into narrow top wall
        shape.lineTo( H - lip,  uW);    // step up (wider undercut)
        shape.lineTo( H - sD,   uW);    // left to slot bottom
        shape.lineTo( H - sD,  -uW);    // down across slot bottom
        shape.lineTo( H - lip, -uW);    // right from slot bottom
        shape.lineTo( H - lip, -sW);    // step down (back to narrow)
        shape.lineTo( H,       -sW);    // right out of slot
        shape.lineTo( H,       -H);     // face to bottom-right corner

        // ── Bottom face (right → left), slot opens downward ───────────
        shape.lineTo( sW, -H);          // face to right edge of slot
        shape.lineTo( sW, -H + lip);    // up into narrow right wall
        shape.lineTo( uW, -H + lip);    // step right (wider undercut)
        shape.lineTo( uW, -H + sD);     // up to slot bottom
        shape.lineTo(-uW, -H + sD);     // across slot bottom
        shape.lineTo(-uW, -H + lip);    // down from slot bottom
        shape.lineTo(-sW, -H + lip);    // step left (back to narrow)
        shape.lineTo(-sW, -H);          // down narrow left wall
        shape.lineTo(-H,  -H);          // face to bottom-left corner

        // ── Left face (bottom → top), slot opens leftward ─────────────
        shape.lineTo(-H, -sW);          // face to bottom edge of slot
        shape.lineTo(-H + lip, -sW);    // right into narrow bottom wall
        shape.lineTo(-H + lip, -uW);    // step down (wider undercut)
        shape.lineTo(-H + sD,  -uW);    // right to slot bottom
        shape.lineTo(-H + sD,   uW);    // up across slot bottom
        shape.lineTo(-H + lip,  uW);    // left from slot bottom
        shape.lineTo(-H + lip,  sW);    // step up (back to narrow)
        shape.lineTo(-H,        sW);    // left out of slot
        shape.lineTo(-H,        H);     // closes back to top-left corner

        // ── Center bore (M8 tapping hole, ~6.8mm dia) ─────────────────
        const bore = new THREE.Path();
        const boreR = 3.4;
        const segs = 32;
        for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            const x = Math.cos(a) * boreR;
            const y = Math.sin(a) * boreR;
            if (i === 0) bore.moveTo(x, y);
            else bore.lineTo(x, y);
        }
        shape.holes.push(bore);

        // ── 4 corner chambers (rectangular internal voids) ────────────
        const ci = 3.3;   // inset from outer corner
        const cs = 6.0;   // chamber size (square)
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => {
            const ch = new THREE.Path();
            const ox = sx * (H - ci - cs / 2);
            const oy = sy * (H - ci - cs / 2);
            const r = cs / 2;
            ch.moveTo(ox - r, oy - r);
            ch.lineTo(ox + r, oy - r);
            ch.lineTo(ox + r, oy + r);
            ch.lineTo(ox - r, oy + r);
            ch.lineTo(ox - r, oy - r);
            shape.holes.push(ch);
        });

        return shape;
    }

    // ── Build the extruded mesh ─────────────────────────────────────────
    const profileShape = createNut8Shape();
    const extrudeLen = 800; // very long so it extends out of frame
    const geometry = new THREE.ExtrudeGeometry(profileShape, {
        depth: extrudeLen,
        bevelEnabled: false,
        steps: 1,
    });

    // Don't center on Z — we want the near face visible and the body extending away
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const centerX = (bbox.max.x + bbox.min.x) / 2;
    const centerY = (bbox.max.y + bbox.min.y) / 2;
    geometry.translate(-centerX, -centerY, 0);

    // ── Materials ───────────────────────────────────────────────────────
    // ExtrudeGeometry material groups: index 0 = side faces, index 1 = cap faces
    // We use an array: [sideMaterial, capMaterial]

    // Side material — dark anodized aluminum body
    // Slightly higher roughness so the body stays dark, spotlight specular stays tight
    const sideMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x18181c,
        metalness: 0.95,
        roughness: 0.45,
        clearcoat: 0.2,
        clearcoatRoughness: 0.4,
    });

    // Cap material — machined aluminum cross-section face
    // Cooler silver, low roughness = tight reflections for that studio-lit look
    const capMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb8c4d0,
        metalness: 0.9,
        roughness: 0.18,
        clearcoat: 0.8,
        clearcoatRoughness: 0.08,
    });

    // Build procedural env map — studio setup for metallic reflections
    // Dark background + two bright overhead softboxes
    const envScene = new THREE.Scene();
    const envTarget = new THREE.WebGLCubeRenderTarget(256);
    const envCam = new THREE.CubeCamera(1, 2000, envTarget);
    const envSphere = new THREE.Mesh(
        new THREE.SphereGeometry(500, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x060608, side: THREE.BackSide })
    );
    envScene.add(envSphere);

    // Two studio softboxes — top-left and top-front — reflect as tight highlights
    // on the metallic cross-section face and top-edge of the body
    [
        { pos: [-80, 400, 100],  color: 0xffffff, size: 120 },   // top-left softbox
        { pos: [40,  380, 200],  color: 0xddeeff, size: 100 },   // top-front softbox
        { pos: [300, 60,  -50],  color: 0x080810, size: 180 },   // right void
        { pos: [-200, -100, 80], color: 0x050508, size: 150 },   // bottom void
    ].forEach(({ pos, color, size }) => {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(size, 8, 8),
            new THREE.MeshBasicMaterial({ color })
        );
        m.position.set(...pos);
        envScene.add(m);
    });

    const mesh = new THREE.Mesh(geometry, [sideMaterial, capMaterial]);

    mesh.scale.set(0.4, 0.4, 0.4); // uniform scale

    // Rotate so the profile body extends diagonally from lower-left to upper-right
    // Cross-section face angled toward the camera at a 3/4 view
    mesh.rotation.x = -4.0;
    mesh.rotation.y = 0.8;
    mesh.rotation.z = -0.0;

    // Position: offset right and slightly down. Near face visible in center-right,
    // body extends out of frame to the upper-right (extrusion is 800mm long)
    mesh.position.set(38, -6, 0);

    scene.add(mesh);

    // ── Generate env map ────────────────────────────────────────────────
    function generateEnvMap() {
        envCam.position.set(0, 0, 0);
        envCam.update(renderer, envScene);
        const envMap = envTarget.texture;
        sideMaterial.envMap = envMap;
        sideMaterial.envMapIntensity = 0.8;   // subtle body reflections
        sideMaterial.needsUpdate = true;
        capMaterial.envMap = envMap;
        capMaterial.envMapIntensity = 3.0;    // strong softbox reflections on face
        capMaterial.needsUpdate = true;
    }

    // ── Mouse tracking ──────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    const baseRotation = {
        x: mesh.rotation.x,
        y: mesh.rotation.y,
        z: mesh.rotation.z,
    };

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) - 0.5;
        mouse.y = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    // ── Resize handling ─────────────────────────────────────────────────
    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // ── Visibility-based rendering ──────────────────────────────────────
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // ── Animation loop ──────────────────────────────────────────────────
    let envGenerated = false;

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        // Generate env map on first visible frame
        if (!envGenerated) {
            generateEnvMap();
            envGenerated = true;
        }

        // Smooth mouse interpolation
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.04;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.04;

        // Apply mouse-reactive rotation (subtle shifts)
        mesh.rotation.x = baseRotation.x + smoothMouse.y * 0.12;
        mesh.rotation.y = baseRotation.y + smoothMouse.x * 0.18;
        mesh.rotation.z = baseRotation.z + smoothMouse.x * 0.04;

        renderer.render(scene, camera);
    }

    animate();
})();
