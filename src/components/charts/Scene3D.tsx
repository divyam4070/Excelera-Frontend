
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import Bar3D from './Bar3D';

interface Scene3DProps {
  processedData: any[];
  animationSpeed: number;
}

const Scene3D: React.FC<Scene3DProps> = ({ processedData, animationSpeed }) => {
  const { camera } = useThree();
  
  useFrame((state) => {
    // Gentle camera movement
    const time = state.clock.elapsedTime * 0.2;
    camera.position.x = Math.sin(time) * 2 + 10;
    camera.position.z = Math.cos(time) * 2 + 10;
    camera.lookAt(0, 2, 0);
  });

  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight 
        position={[0, 20, 0]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Directional light for better shadows */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Environment for reflections */}
      <Environment preset="sunset" background={false} />
      
      {/* Animated stars background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={1000} 
        factor={4} 
        saturation={0.5}
        fade
      />

      {/* Animated floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial 
          color="#f0f8ff" 
          transparent 
          opacity={0.1}
          shininess={100}
        />
      </mesh>

      {/* Data bars */}
      {processedData.map((item, index) => (
        <Bar3D
          key={index}
          position={item.position}
          height={item.normalizedHeight}
          color={item.color}
          label={item.label}
          value={item.value}
          animationSpeed={animationSpeed}
          index={index}
        />
      ))}

      {/* Grid helper with animation */}
      <gridHelper 
        args={[20, 20, '#cccccc', '#eeeeee']} 
        position={[0, -0.5, 0]}
      />

      {/* Orbit controls */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export default Scene3D;
