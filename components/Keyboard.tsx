"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface KeyMeshProps {
  letter: string;
  size: number;
  animate: boolean;
}

function KeyMesh({ letter, size, animate }: KeyMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const floatOffset = useRef(0);

  useFrame(() => {
    if (!groupRef.current || !animate) return;

    groupRef.current.rotation.y += 0.005;
    groupRef.current.rotation.x += 0.002;
    floatOffset.current += 0.02;
    groupRef.current.position.y = Math.sin(floatOffset.current) * 0.3;
  });

  const texture = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#D2C1B6";
      ctx.font = "bold 180px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  })();

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1.5 * size, 1.5 * size, 0.3 * size]} />
        <meshStandardMaterial color="#234c6a" roughness={0.4} metalness={0.6} />
      </mesh>

      <mesh position={[0, 0, 0.2 * size]}>
        <boxGeometry args={[1.3 * size, 1.3 * size, 0.1 * size]} />
        <meshStandardMaterial color="#456882" roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, 0, 0.26 * size]}>
        <planeGeometry args={[1 * size, 1 * size]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}

interface KeyboardProps {
  letter: string;
  cameraPosition?: number;
  size?: number;
  animate?: boolean;
  interactive?: boolean;
  className?: string;
  containerWidth?: number;
}

export default function Keyboard({
  letter,
  cameraPosition = 5,
  size = 1,
  animate = true,
  interactive = false,
  className = "",
  containerWidth,
}: KeyboardProps) {
  const defaultWidth = Math.round(100 * size);
  const width = containerWidth ?? defaultWidth;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${defaultWidth}px`,
        cursor: interactive ? "grab" : "default",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraPosition], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} color="#d2c1b6" />
        <directionalLight position={[5, 5, 5]} intensity={1.0} />
        <directionalLight
          position={[-5, -5, 5]}
          intensity={0.4}
          color="#456882"
        />

        <KeyMesh letter={letter} size={size} animate={animate} />

        {interactive && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enableZoom={false}
            enablePan={false}
          />
        )}
      </Canvas>
    </div>
  );
}
