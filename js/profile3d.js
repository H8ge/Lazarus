/* ==========================================================================
   STAELER — Profile 3D Renderer
   Shared module: converts a 2D cross-section (outer contour + holes) into
   an interactive Three.js extruded profile. Used by both the hero and the
   quote-modal 3D preview.
   ========================================================================== */

import * as THREE from 'three';

// ── Shape builder ──────────────────────────────────────────────────────────
/**
 * Build a THREE.Shape from an outer contour + hole arrays.
 * Points are [{x,y}] or [[x,y]] in mm space, y-up.
 */
export function buildShape(outer, hollows = []) {
    const shape = new THREE.Shape();
    const pt = (p) => Array.isArray(p) ? p : [p.x, p.y];

    const [x0, y0] = pt(outer[0]);
    shape.moveTo(x0, y0);
    for (let i = 1; i < outer.length; i++) {
        const [x, y] = pt(outer[i]);
        shape.lineTo(x, y);
    }
    shape.lineTo(x0, y0);

    for (const hole of hollows) {
        if (!hole || hole.length < 3) continue;
        const path = new THREE.Path();
        const [hx0, hy0] = pt(hole[0]);
        path.moveTo(hx0, hy0);
        for (let i = 1; i < hole.length; i++) {
            const [hx, hy] = pt(hole[i]);
            path.lineTo(hx, hy);
        }
        path.lineTo(hx0, hy0);
        shape.holes.push(path);
    }
    return shape;
}

// ── Bounding box helper ────────────────────────────────────────────────────
function profileBounds(outer) {
    const pt = (p) => Array.isArray(p) ? p : [p.x, p.y];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of outer) {
        const [x, y] = pt(p);
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

// ── Shared lighting setup ──────────────────────────────────────────────────
function addStudioLights(scene) {
    // Primary key — upper-front-left, illuminates cross-section face
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.5);
    keyLight.position.set(20, 80, 200);
    scene.add(keyLight);

    // Top edge strip — creates specular streak on raised rails
    const edgeLight = new THREE.DirectionalLight(0xcce0ff, 4.5);
    edgeLight.position.set(-25, 160, 60);
    scene.add(edgeLight);

    // Dim right-face fill
    const fillLight = new THREE.DirectionalLight(0x151a22, 6.0);
    fillLight.position.set(160, 10, 40);
    scene.add(fillLight);

    // Cold blue rim from behind
    const rimLight = new THREE.DirectionalLight(0x0a1828, 8.0);
    rimLight.position.set(60, 80, -280);
    scene.add(rimLight);

    // Near-black ambient
    scene.add(new THREE.AmbientLight(0x0e0e14, 1));
}

// ── Shared env map builder ─────────────────────────────────────────────────
function buildEnvMap(renderer) {
    const envScene = new THREE.Scene();
    const envTarget = new THREE.WebGLCubeRenderTarget(256);
    const envCam = new THREE.CubeCamera(1, 2000, envTarget);

    envScene.add(new THREE.Mesh(
        new THREE.SphereGeometry(500, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x0a0a10, side: THREE.BackSide })
    ));
    [
        { pos: [-60, 420, 120], color: 0xffffff, size: 110 },
        { pos: [ 30, 400, 220], color: 0xddeeff, size: 90  },
        { pos: [-180, 200, 80], color: 0x889aaa, size: 70  },
        { pos: [ 200, 150, 60], color: 0x222233, size: 130 },
    ].forEach(({ pos, color, size }) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), new THREE.MeshBasicMaterial({ color }));
        m.position.set(...pos);
        envScene.add(m);
    });

    envCam.position.set(0, 0, 0);
    envCam.update(renderer, envScene);
    return envTarget.texture;
}

// ── Shared materials ───────────────────────────────────────────────────────
export function makeMaterials() {
    const side = new THREE.MeshPhysicalMaterial({
        color: 0x18181c, metalness: 0.95, roughness: 0.45,
        clearcoat: 0.2, clearcoatRoughness: 0.4,
    });
    const cap = new THREE.MeshPhysicalMaterial({
        color: 0xb8c4d0, metalness: 0.9, roughness: 0.18,
        clearcoat: 0.8, clearcoatRoughness: 0.08,
    });
    return { side, cap };
}

// ── Main: build a profile mesh from a 2D shape ─────────────────────────────
/**
 * Create an extruded mesh from a profile cross-section.
 * @param {object} renderer — existing WebGLRenderer (shares gl context)
 * @param {Array}  outer    — outer contour points [{x,y}] or [[x,y]]
 * @param {Array}  hollows  — array of hole arrays
 * @param {number} extrudeDepth — mm to extrude
 * @returns { mesh, side, cap, geometry }
 */
export function buildProfileMesh(renderer, outer, hollows = [], extrudeDepth = 800) {
    const shape = buildShape(outer, hollows);
    const bounds = profileBounds(outer);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: extrudeDepth,
        bevelEnabled: false,
        steps: 1,
    });
    // Center XY, not Z (so near face is at z=0)
    geometry.translate(-bounds.cx, -bounds.cy, 0);

    const { side, cap } = makeMaterials();
    const mesh = new THREE.Mesh(geometry, [side, cap]);

    // Apply env map reflections
    const envMap = buildEnvMap(renderer);
    side.envMap = envMap;
    side.envMapIntensity = 1.5;
    side.needsUpdate = true;
    cap.envMap = envMap;
    cap.envMapIntensity = 4.0;
    cap.needsUpdate = true;

    return { mesh, side, cap, geometry, bounds };
}

// ── Full self-contained scene for a canvas ─────────────────────────────────
/**
 * Set up a complete interactive 3D profile scene on a canvas.
 * Returns a dispose() function to clean up.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Array} outer    outer contour [{x,y}] or [[x,y]]
 * @param {Array} hollows  array of holes
 * @param {object} opts    { rotation, position, scale, extrudeDepth }
 */
export function setupProfileScene(canvas, outer, hollows = [], opts = {}) {
    const {
        extrudeDepth = 800,
        rotation = { x: -4.0, y: 0.8, z: 0 },
        position  = { x: 38, y: -6, z: 0 },
        meshScale = 0.4,
    } = opts;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    addStudioLights(scene);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 5000);
    camera.position.set(0, 5, 100);
    camera.lookAt(15, -5, 0);

    const { mesh, geometry, bounds } = buildProfileMesh(renderer, outer, hollows, extrudeDepth);

    // Scale so the cross-section fits the same visual size as the NUT-8 hero
    // NUT-8 is 40mm across; we scale the custom profile to match proportionally
    const profileMaxDim = Math.max(bounds.w, bounds.h);
    const normScale = profileMaxDim > 0 ? (40 / profileMaxDim) * meshScale : meshScale;

    mesh.scale.set(normScale, normScale, normScale);
    mesh.rotation.x = rotation.x;
    mesh.rotation.y = rotation.y;
    mesh.rotation.z = rotation.z;
    mesh.position.set(position.x, position.y, position.z);
    scene.add(mesh);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    const baseRot = { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z };

    function onMouseMove(e) {
        mouse.x = (e.clientX / window.innerWidth) - 0.5;
        mouse.y = (e.clientY / window.innerHeight) - 0.5;
    }
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    function resize() {
        const w = canvas.clientWidth || canvas.width;
        const h = canvas.clientHeight || canvas.height;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    let running = true;
    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.04;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.04;
        mesh.rotation.x = baseRot.x + smoothMouse.y * 0.12;
        mesh.rotation.y = baseRot.y + smoothMouse.x * 0.18;
        mesh.rotation.z = baseRot.z + smoothMouse.x * 0.04;
        renderer.render(scene, camera);
    }
    animate();

    return {
        mesh, renderer, scene, camera,
        dispose() {
            running = false;
            document.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', resize);
            geometry.dispose();
            renderer.dispose();
        }
    };
}
