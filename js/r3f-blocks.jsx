import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, RoundedBox, Text, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

// 3D Liquid Glass Button Component
function LiquidButton3D({ text, colorMode = 'blue', width = 3, height = 0.8 }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    // Colors based on user's examples
    const colors = {
        blue: { core: '#1e90ff', glow: '#0056b3' },
        red: { core: '#ff4757', glow: '#c0392b' },
        clear: { core: '#ffffff', glow: '#ffffff' }
    };

    const activeColor = colors[colorMode] || colors.blue;

    useFrame((state, delta) => {
        // Gentle floating
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;

            // Hover animation
            const targetZ = hovered ? 0.2 : 0;
            meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;

            const targetRotX = hovered ? -0.05 : 0;
            meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            {/* 3D Text behind the glass (This gets distorted by the glass thickness) */}
            <Text
                position={[0, 0, -0.5]}
                fontSize={0.25}
                color={colorMode === 'clear' ? '#1e2025' : '#ffffff'}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
                anchorX="center"
                anchorY="middle"
                fontWeight={600}
            >
                {text}
            </Text>

            {/* The thick RoundedBox geometry for the glass pill */}
            <RoundedBox args={[width, height, 0.4]} radius={0.4} smoothness={16} position={[0, 0, 0]}>
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={0.5}
                    thickness={1.5}
                    chromaticAberration={0.06}
                    ior={1.5}
                    roughness={0.02}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    transmission={1}
                    color={colorMode === 'clear' ? '#ffffff' : activeColor.core}
                    attenuationDistance={1}
                    attenuationColor={colorMode === 'clear' ? '#ffffff' : activeColor.glow}
                />
            </RoundedBox>

            {/* Invisible interaction plane */}
            <mesh
                position={[0, 0, 0.2]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => console.log(`Clicked ${text}`)}
            >
                <boxGeometry args={[width, height, 0.5]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </group>
    );
}

// Scene setup wrapper
function R3FScene({ text, colorMode, width }) {
    return (
        <Canvas camera={{ position: [0, 0, 4], fov: 30 }} dpr={[1, 2]} style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <color attach="background" args={['transparent']} />

            {/* The Environment provides the bright reflections required for specular highlights */}
            <Environment resolution={256}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                    <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
                    <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[5, 1, -1]} scale={[20, 0.1, 1]} />
                    <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
                </group>
            </Environment>

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />

            <LiquidButton3D text={text} colorMode={colorMode} width={width} />
        </Canvas>
    );
}

// Initialize R3F roots
export function mountR3FButtons() {
    const containers = document.querySelectorAll('.r3f-button-container');
    containers.forEach(container => {
        const text = container.getAttribute('data-text') || 'Button';
        const colorMode = container.getAttribute('data-color') || 'blue';
        const width = parseFloat(container.getAttribute('data-width')) || 3;

        // Create root and render
        const root = createRoot(container);
        root.render(<R3FScene text={text} colorMode={colorMode} width={width} />);
    });
}

// Auto mount if ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountR3FButtons);
} else {
    mountR3FButtons();
}
