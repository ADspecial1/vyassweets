import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles, ContactShadows } from '@react-three/drei';
import type { Group } from 'three';

/* A single ladoo — matte sphere that bobs on its own. */
function Ladoo({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.3}>
      <mesh position={position} scale={scale} castShadow>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
      </mesh>
    </Float>
  );
}

/* A barfi diamond — flattened gold slab, slowly spinning. */
function Barfi({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={ref} position={position} scale={scale} rotation={[0, 0, Math.PI / 4]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.16, 0.62]} />
          <meshStandardMaterial color="#E7C766" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* The brass-rimmed crimson mithai box — the anchor of the scene. */
function GiftBox() {
  return (
    <group position={[0, -0.55, 0]}>
      {/* box body */}
      <RoundedBox args={[2.5, 1, 2.5]} radius={0.14} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color="#9B0E25" roughness={0.4} metalness={0.15} />
      </RoundedBox>
      {/* brass rim */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.62, 0.12, 2.62]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* ribbon — two crossing brass bands */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.22, 1.04, 2.66]} />
        <meshStandardMaterial color="#F0CE6A" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.66, 1.04, 0.22]} />
        <meshStandardMaterial color="#F0CE6A" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/* Whole arrangement: rotates gently on its own and leans toward the cursor. */
function Scene() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    group.current.rotation.y += (Math.sin(t * 0.18) * 0.35 + px * 0.5 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (py * -0.22 - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group}>
      <GiftBox />
      <Ladoo position={[-1.5, 0.9, 0.4]} color="#B5651D" scale={1.05} />
      <Ladoo position={[1.5, 1.15, -0.2]} color="#C77B30" scale={0.9} />
      <Ladoo position={[0.2, 1.7, 0.8]} color="#8B4513" scale={0.75} />
      <Barfi position={[1.7, 0.2, 1]} scale={1.1} />
      <Barfi position={[-1.7, 0.35, -0.6]} scale={0.85} />
      <Sparkles count={38} scale={[7, 4, 4]} size={3.2} speed={0.28} color="#F0CE6A" opacity={0.7} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1, 6.2], fov: 34 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 3, 3]} intensity={40} color="#D4AF37" />
      <pointLight position={[3, -2, 4]} intensity={12} color="#C41230" />
      <Suspense fallback={null}>
        <Scene />
        <ContactShadows position={[0, -1.7, 0]} opacity={0.32} blur={2.6} scale={9} far={4} color="#5C1818" />
      </Suspense>
    </Canvas>
  );
}
