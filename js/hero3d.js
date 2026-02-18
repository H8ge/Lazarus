/* ==========================================================================
   STAELER — 3D Hero Profile (Three.js)
   Renders a NUT-8 40×40 T-Slot aluminum profile with metallic materials
   ========================================================================== */

import * as THREE from 'three';

(function () {
    'use strict';

    const canvas = document.getElementById('hero3d');
    if (!canvas) return;

    const container = canvas.parentElement;

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

    // Camera: close-up, looking at the near face of the profile at an angle
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 5000);
    camera.position.set(70, 45, 95);
    camera.lookAt(10, -5, -40);

    // ── Lighting ────────────────────────────────────────────────────────
    // Strong key light — illuminates the cross-section face from upper-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 5);
    keyLight.position.set(60, 80, 120);
    scene.add(keyLight);

    // Secondary key — more frontal, lights the cross-section face directly
    const faceLight = new THREE.DirectionalLight(0xffffff, 3.5);
    faceLight.position.set(30, 30, 150);
    scene.add(faceLight);

    // Fill light — from the left for the body
    const fillLight = new THREE.DirectionalLight(0x8899bb, 1.5);
    fillLight.position.set(-80, 20, 0);
    scene.add(fillLight);

    // Rim/edge light — from behind to outline the profile body edges
    const rimLight = new THREE.DirectionalLight(0xffffff, 3);
    rimLight.position.set(-30, 60, -120);
    scene.add(rimLight);

    // Subtle top highlight
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 120, 0);
    scene.add(topLight);

    // Very subtle ambient
    const ambient = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambient);

    // ── NUT-8 40×40 T-Slot Profile Shape ────────────────────────────────
    // Accurate cross-section with 4 T-slots, center bore, 4 corner chambers
    function createNut8Shape() {
        const H = 20;         // half of 40mm
        const sW = 4.1;       // half slot opening (8.2mm total)
        const uW = 8.0;       // half undercut width (16mm total)
        const sD = 10;        // slot depth from face
        const lip = 1.8;      // lip thickness
        const wall = 2.5;     // core wall thickness

        const shape = new THREE.Shape();

        // Build outer contour clockwise with 4 T-slot indentations
        // Each face: go along face -> enter slot -> undercut -> back out
        // Connect corners through internal web structure

        // Start at top-left corner
        shape.moveTo(-H, H);

        // ── Top face (left to right) with T-slot ──
        shape.lineTo(-sW, H);
        shape.lineTo(-sW, H - lip);
        shape.lineTo(-uW, H - lip);
        shape.lineTo(-uW, H - sD);
        // Connect to top-left internal corner
        shape.lineTo(-H + wall, H - sD);
        shape.lineTo(-H + wall, H - wall);
        shape.lineTo(-H + sD, H - wall);
        // Go up to left T-slot upper entry
        shape.lineTo(-H + sD, uW);
        shape.lineTo(-H + lip, uW);
        shape.lineTo(-H + lip, sW);
        shape.lineTo(-H, sW);

        // ── Left face (top to bottom) with T-slot ──
        shape.lineTo(-H, -sW);
        shape.lineTo(-H + lip, -sW);
        shape.lineTo(-H + lip, -uW);
        shape.lineTo(-H + sD, -uW);
        // Connect to bottom-left internal corner
        shape.lineTo(-H + sD, -H + wall);
        shape.lineTo(-H + wall, -H + wall);
        shape.lineTo(-H + wall, -H + sD);
        shape.lineTo(-uW, -H + sD);
        shape.lineTo(-uW, -H + lip);
        shape.lineTo(-sW, -H + lip);
        shape.lineTo(-sW, -H);

        // ── Bottom face (left to right) with T-slot ──
        shape.lineTo(sW, -H);
        shape.lineTo(sW, -H + lip);
        shape.lineTo(uW, -H + lip);
        shape.lineTo(uW, -H + sD);
        // Connect to bottom-right internal corner
        shape.lineTo(H - wall, -H + sD);
        shape.lineTo(H - wall, -H + wall);
        shape.lineTo(H - sD, -H + wall);
        shape.lineTo(H - sD, -uW);
        shape.lineTo(H - lip, -uW);
        shape.lineTo(H - lip, -sW);
        shape.lineTo(H, -sW);

        // ── Right face (bottom to top) with T-slot ──
        shape.lineTo(H, sW);
        shape.lineTo(H - lip, sW);
        shape.lineTo(H - lip, uW);
        shape.lineTo(H - sD, uW);
        // Connect to top-right internal corner
        shape.lineTo(H - sD, H - wall);
        shape.lineTo(H - wall, H - wall);
        shape.lineTo(H - wall, H - sD);
        shape.lineTo(uW, H - sD);
        shape.lineTo(uW, H - lip);
        shape.lineTo(sW, H - lip);
        shape.lineTo(sW, H);

        // Close back to start
        shape.lineTo(-H, H);

        // ── Center bore (M8 tapping hole, ~6.8mm dia) ──
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

        // ── 4 corner chambers (triangular/rectangular internal voids) ──
        const ci = wall + 0.8; // inset from outer edge
        const cs = sD - wall - 1.5; // chamber size
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
    const sideMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1e,
        metalness: 0.95,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
        reflectivity: 0.5,
    });

    // Cap material — bright machined/cut aluminum cross-section face
    const capMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x999999,
        metalness: 0.95,
        roughness: 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
    });

    // Build procedural env map for reflections (no external HDR)
    const envScene = new THREE.Scene();
    const envTarget = new THREE.WebGLCubeRenderTarget(256);
    const envCam = new THREE.CubeCamera(1, 2000, envTarget);
    const envSphere = new THREE.Mesh(
        new THREE.SphereGeometry(500, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide })
    );
    envScene.add(envSphere);

    // Bright spots that will reflect on the metallic surfaces
    [
        { pos: [300, 300, 100], color: 0xffffff, size: 80 },
        { pos: [-200, 200, 300], color: 0xccccdd, size: 60 },
        { pos: [100, -200, 200], color: 0x8899aa, size: 50 },
        { pos: [-100, 100, -300], color: 0xddddee, size: 70 },
        { pos: [200, 0, -100], color: 0xaabbcc, size: 55 },
        { pos: [0, 300, -200], color: 0xffffff, size: 65 },
    ].forEach(({ pos, color, size }) => {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(size, 8, 8),
            new THREE.MeshBasicMaterial({ color })
        );
        m.position.set(...pos);
        envScene.add(m);
    });

    const mesh = new THREE.Mesh(geometry, [sideMaterial, capMaterial]);

    // Rotate so the profile extends diagonally from lower-left to upper-right
    // with the cross-section face facing toward the camera
    mesh.rotation.x = -0.35;
    mesh.rotation.y = 0.55;
    mesh.rotation.z = -0.75;

    // Position: shift right and slightly down so the near face is visible
    // and the body extends out of frame to the upper right
    mesh.position.set(15, -10, -200);

    scene.add(mesh);

    // ── Generate env map ────────────────────────────────────────────────
    function generateEnvMap() {
        envCam.position.set(0, 0, 0);
        envCam.update(renderer, envScene);
        const envMap = envTarget.texture;
        sideMaterial.envMap = envMap;
        sideMaterial.envMapIntensity = 1.2;
        sideMaterial.needsUpdate = true;
        capMaterial.envMap = envMap;
        capMaterial.envMapIntensity = 2.0;
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
