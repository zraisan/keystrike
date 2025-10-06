import { useEffect, useRef } from "react";
import * as THREE from "three";

interface KeyboardProps {
  letter: string;
  cameraPosition: number;
  size?: number;
}

export default function Keyboard({
  letter,
  cameraPosition,
  size = 1,
}: KeyboardProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const width = 120 * size;
    const height = 120 * size;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.background = "transparent";
    mountRef.current.appendChild(renderer.domElement);

    const keyGroup = new THREE.Group();

    const keyGeometry = new THREE.BoxGeometry(
      1.5 * size,
      1.5 * size,
      0.3 * size
    );
    const keyMaterial = new THREE.MeshStandardMaterial({
      color: 0x234c6a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const keyBase = new THREE.Mesh(keyGeometry, keyMaterial);
    keyGroup.add(keyBase);

    const keyTopGeometry = new THREE.BoxGeometry(
      1.3 * size,
      1.3 * size,
      0.1 * size
    );
    const keyTopMaterial = new THREE.MeshStandardMaterial({
      color: 0x456882,
      roughness: 0.3,
      metalness: 0.4,
    });
    const keyTop = new THREE.Mesh(keyTopGeometry, keyTopMaterial);
    keyTop.position.z = 0.2 * size;
    keyGroup.add(keyTop);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx!.fillStyle = "#D2C1B6";
    ctx!.font = "bold 180px Arial";
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    ctx!.fillText(letter, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const letterMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const letterGeometry = new THREE.PlaneGeometry(1 * size, 1 * size);
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.z = 0.26 * size;
    keyGroup.add(letterMesh);

    scene.add(keyGroup);

    const ambientLight = new THREE.AmbientLight(0xd2c1b6, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0x456882, 0.4);
    rimLight.position.set(-5, -5, 5);
    scene.add(rimLight);

    camera.position.z = cameraPosition;

    let floatOffset = 0;

    const animate = function () {
      requestAnimationFrame(animate);

      keyGroup.rotation.y += 0.005;
      keyGroup.rotation.x += 0.002;

      floatOffset += 0.02;
      keyGroup.position.y = Math.sin(floatOffset) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [letter, cameraPosition, size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${Math.round(120 * size)}px`,
        height: `${Math.round(120 * size)}px`,
      }}
    />
  );
}
