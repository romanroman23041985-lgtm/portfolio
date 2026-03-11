/* ═══════════════════════════════════════════════════════
   THREE.JS CLEAR GLASS SPHERES — Reference Studio Light
   ═══════════════════════════════════════════════════════
   Only spheres. Pure clear glass with refraction simulation.
   Added dispersion (chromatic aberration) for realism.
   Studio lighting: bright white key, cool fill, strong rim.
   ═══════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

(function () {
    'use strict';

    const SPHERE_COUNT = 14;
    const MOUSE_INFLUENCE = 0.5;
    const FLOAT_AMPLITUDE = 0.5;

    let scene, camera, renderer, envMap;
    let spheres = [];
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let width, height;
    let clock;

    function init() {
        width = window.innerWidth;
        height = window.innerHeight;
        clock = new THREE.Clock();

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f6f8); // Light studio background

        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 16);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const canvas = renderer.domElement;
        canvas.id = 'glass-scene';
        canvas.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
    `;
        document.body.prepend(canvas);

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envMap;
        pmremGenerator.dispose();

        // ── LIGHTING — bright crisp studio ──
        const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
        keyLight.position.set(5, 10, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xedf2f7, 2.0);
        fillLight.position.set(-6, 4, 3);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 3.0);
        rimLight.position.set(0, -5, -8);
        scene.add(rimLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        createSpheres();
        bindEvents();
        animate();
    }


    function createSpheres() {
        // Pure clear glass material simulating reference UI elements
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            // Core transparency
            transmission: 1.0,
            transparent: true,
            opacity: 1.0,

            // Refraction / Dispersion Simulation
            ior: 1.5,
            dispersion: 2.0, // Chromatic aberration (requires r162+)
            thickness: 4.0,

            // Wet, crisp surface reflections
            roughness: 0.0,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.01,

            // Remove color — pure white
            color: new THREE.Color(0xffffff),
            attenuationColor: new THREE.Color(0xffffff),
            attenuationDistance: 100.0,

            // Highlights
            specularIntensity: 1.0,
            specularColor: new THREE.Color(0xffffff),

            envMapIntensity: 1.5,
            side: THREE.FrontSide,
        });

        for (let i = 0; i < SPHERE_COUNT; i++) {
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const mesh = new THREE.Mesh(geometry, glassMaterial.clone());

            const angle = (i / SPHERE_COUNT) * Math.PI * 2;
            const radiusX = 5 + Math.random() * 2;
            const radiusY = 3 + Math.random() * 1.5;

            mesh.position.set(
                Math.cos(angle) * radiusX + (Math.random() - 0.5) * 2,
                Math.sin(angle) * radiusY + (Math.random() - 0.5) * 2,
                -1 + Math.random() * 3
            );

            const scale = 0.4 + Math.random() * 1.1;
            mesh.scale.setScalar(scale);

            scene.add(mesh);

            spheres.push({
                mesh,
                basePosition: mesh.position.clone(),
                floatPhaseX: Math.random() * Math.PI * 2,
                floatPhaseY: Math.random() * Math.PI * 2,
                floatFreqX: 0.15 + Math.random() * 0.25,
                floatFreqY: 0.1 + Math.random() * 0.2,
                parallaxFactor: 0.3 + Math.random() * 0.5,
            });
        }
    }


    function bindEvents() {
        document.addEventListener('mousemove', (e) => {
            mouse.targetX = (e.clientX / width) * 2 - 1;
            mouse.targetY = -(e.clientY / height) * 2 + 1;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouse.targetX = 0;
            mouse.targetY = 0;
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                mouse.targetX = (e.touches[0].clientX / width) * 2 - 1;
                mouse.targetY = -(e.touches[0].clientY / height) * 2 + 1;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            mouse.targetX = 0;
            mouse.targetY = 0;
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                width = window.innerWidth;
                height = window.innerHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }, 100);
        });
    }


    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;

        for (let i = 0; i < spheres.length; i++) {
            const s = spheres[i];
            const m = s.mesh;

            const fx = Math.sin(time * s.floatFreqX + s.floatPhaseX) * FLOAT_AMPLITUDE;
            const fy = Math.cos(time * s.floatFreqY + s.floatPhaseY) * FLOAT_AMPLITUDE;

            m.position.x = s.basePosition.x + fx + mouse.x * MOUSE_INFLUENCE * s.parallaxFactor;
            m.position.y = s.basePosition.y + fy + mouse.y * MOUSE_INFLUENCE * s.parallaxFactor;
        }

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
