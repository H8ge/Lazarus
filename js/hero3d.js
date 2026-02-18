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
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 2000);
    camera.position.set(90, 60, 120);
    camera.lookAt(0, 0, 0);

    // ── Lighting ────────────────────────────────────────────────────────
    // Key light — strong from upper-right-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(80, 100, 60);
    scene.add(keyLight);

    // Fill light — softer, from the left
    const fillLight = new THREE.DirectionalLight(0xb0c4de, 1.2);
    fillLight.position.set(-60, 20, 40);
    scene.add(fillLight);

    // Rim light — from behind to outline edges
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(-20, 40, -80);
    scene.add(rimLight);

    // Bottom-front subtle fill
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
    bottomLight.position.set(0, -60, 40);
    scene.add(bottomLight);

    // Very subtle ambient to avoid pure-black areas
    const ambient = new THREE.AmbientLight(0x1a1a1a, 1);
    scene.add(ambient);

    // ── NUT-8 40×40 T-Slot Profile Shape ────────────────────────────────
    function createNut8Shape() {
        const S = 40;           // overall size
        const H = S / 2;        // half = 20
        const slotW = 8.2;      // slot opening width
        const sHW = slotW / 2;  // half slot width = 4.1
        const ucW = 16.5;       // undercut width
        const uHW = ucW / 2;    // half undercut = 8.25
        const slotD = 10;       // slot depth from face
        const lipT = 1.8;       // lip overhang thickness
        const wallT = 2.5;      // wall thickness
        const coreR = 5.5;      // center bore radius

        const shape = new THREE.Shape();

        // Outer contour — clockwise, starting top-left corner
        // Top-left to top-right, with top T-slot
        shape.moveTo(-H, H);
        shape.lineTo(-sHW, H);
        shape.lineTo(-sHW, H - lipT);
        shape.lineTo(-uHW, H - lipT);
        shape.lineTo(-uHW, H - slotD);
        shape.lineTo(-H + wallT, H - slotD);
        shape.lineTo(-H + wallT, H - wallT);
        shape.lineTo(-H + slotD, H - wallT);
        shape.lineTo(-H + slotD, uHW);
        shape.lineTo(-H + lipT, uHW);
        shape.lineTo(-H + lipT, sHW);
        shape.lineTo(-H, sHW);

        // Left T-slot
        shape.lineTo(-H, -sHW);
        shape.lineTo(-H + lipT, -sHW);
        shape.lineTo(-H + lipT, -uHW);
        shape.lineTo(-H + slotD, -uHW);
        shape.lineTo(-H + slotD, -H + wallT);
        shape.lineTo(-H + wallT, -H + wallT);
        shape.lineTo(-H + wallT, -H + slotD);
        shape.lineTo(-uHW, -H + slotD);
        shape.lineTo(-uHW, -H + lipT);
        shape.lineTo(-sHW, -H + lipT);
        shape.lineTo(-sHW, -H);

        // Bottom T-slot
        shape.lineTo(sHW, -H);
        shape.lineTo(sHW, -H + lipT);
        shape.lineTo(uHW, -H + lipT);
        shape.lineTo(uHW, -H + slotD);
        shape.lineTo(H - wallT, -H + slotD);
        shape.lineTo(H - wallT, -H + wallT);
        shape.lineTo(H - slotD, -H + wallT);
        shape.lineTo(H - slotD, -uHW);
        shape.lineTo(H - lipT, -uHW);
        shape.lineTo(H - lipT, -sHW);
        shape.lineTo(H, -sHW);

        // Right T-slot
        shape.lineTo(H, sHW);
        shape.lineTo(H - lipT, sHW);
        shape.lineTo(H - lipT, uHW);
        shape.lineTo(H - slotD, uHW);
        shape.lineTo(H - slotD, H - wallT);
        shape.lineTo(H - wallT, H - wallT);
        shape.lineTo(H - wallT, H - slotD);
        shape.lineTo(uHW, H - slotD);
        shape.lineTo(uHW, H - lipT);
        shape.lineTo(sHW, H - lipT);
        shape.lineTo(sHW, H);
        shape.lineTo(-H, H); // close

        // Center bore
        const bore = new THREE.Path();
        const segments = 32;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * coreR;
            const y = Math.sin(angle) * coreR;
            if (i === 0) bore.moveTo(x, y);
            else bore.lineTo(x, y);
        }
        shape.holes.push(bore);

        // Corner chambers — 4 roughly trapezoidal internal hollows
        const chamberInset = wallT + 0.5;
        const chamberSize = slotD - wallT - 1;

        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => {
            const ch = new THREE.Path();
            const ox = sx * (H - chamberInset - chamberSize / 2);
            const oy = sy * (H - chamberInset - chamberSize / 2);
            const cs = chamberSize / 2;
            ch.moveTo(ox - cs, oy - cs);
            ch.lineTo(ox + cs, oy - cs);
            ch.lineTo(ox + cs, oy + cs);
            ch.lineTo(ox - cs, oy + cs);
            ch.lineTo(ox - cs, oy - cs);
            shape.holes.push(ch);
        });

        return shape;
    }

    // ── Build the extruded mesh ─────────────────────────────────────────
    const profileShape = createNut8Shape();
    const extrudeLen = 280;
    const geometry = new THREE.ExtrudeGeometry(profileShape, {
        depth: extrudeLen,
        bevelEnabled: false,
        steps: 1,
    });

    // Center the geometry
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const cx = (bbox.max.x + bbox.min.x) / 2;
    const cy = (bbox.max.y + bbox.min.y) / 2;
    const cz = (bbox.max.z + bbox.min.z) / 2;
    geometry.translate(-cx, -cy, -cz);

    // ── Material — dark brushed aluminum ────────────────────────────────
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.92,
        roughness: 0.38,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25,
        reflectivity: 0.6,
        envMapIntensity: 1.0,
    });

    // Build a simple cube env map for reflections without loading HDR
    const envScene = new THREE.Scene();
    const envCam = new THREE.CubeCamera(1, 1000, new THREE.WebGLCubeRenderTarget(128));
    // Add some bright surfaces to the env scene for reflections
    const envBox = new THREE.Mesh(
        new THREE.SphereGeometry(400, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x222222,
            side: THREE.BackSide,
        })
    );
    envScene.add(envBox);

    // Add bright spots for nice reflections
    [
        { pos: [200, 200, 100], color: 0xffffff, size: 40 },
        { pos: [-150, 100, 200], color: 0x8899aa, size: 30 },
        { pos: [0, -150, 150], color: 0x445566, size: 25 },
        { pos: [100, 50, -200], color: 0xaabbcc, size: 35 },
    ].forEach(({ pos, color, size }) => {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(size, 8, 8),
            new THREE.MeshBasicMaterial({ color })
        );
        light.position.set(...pos);
        envScene.add(light);
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Rotate to show at a dramatic angle — tilted diagonal like in the mockup
    mesh.rotation.x = -0.45;
    mesh.rotation.y = -0.6;
    mesh.rotation.z = 0.25;

    scene.add(mesh);

    // ── Generate env map ────────────────────────────────────────────────
    function generateEnvMap() {
        envCam.position.set(0, 0, 0);
        envCam.update(renderer, envScene);
        material.envMap = envCam.renderTarget.texture;
        material.needsUpdate = true;
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

        // Apply mouse-reactive rotation (subtle)
        mesh.rotation.x = baseRotation.x + smoothMouse.y * 0.15;
        mesh.rotation.y = baseRotation.y + smoothMouse.x * 0.25;
        mesh.rotation.z = baseRotation.z + smoothMouse.x * 0.05;

        renderer.render(scene, camera);
    }

    animate();
})();
