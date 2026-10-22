import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';

function Orb() {
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.7}>
      <mesh>
        <icosahedronGeometry args={[1.25, 5]} />
        <MeshDistortMaterial color="#b9f36b" roughness={0.2} metalness={0.25} distort={0.27} speed={1.6} wireframe />
      </mesh>
      <mesh rotation={[0.6, 0.2, 0.8]}>
        <torusGeometry args={[1.75, 0.008, 16, 160]} />
        <meshBasicMaterial color="#6a8a42" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[1.05, 0.9, 0.2]}>
        <torusGeometry args={[2.0, 0.006, 16, 160]} />
        <meshBasicMaterial color="#5b6c80" transparent opacity={0.75} />
      </mesh>
    </Float>
  );
}

export default function OrbScene() {
  return (
    <div className="orb-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5.8], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.25} />
        <pointLight position={[4, 4, 4]} intensity={18} color="#b9f36b" />
        <Suspense fallback={null}>
          <Orb />
          <Sparkles count={55} scale={7} size={1.3} speed={0.18} color="#d8f7a9" opacity={0.55} />
        </Suspense>
      </Canvas>
    </div>
  );
}
