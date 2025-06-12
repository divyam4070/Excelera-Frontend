
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface Bar3DProps {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  value: number;
  animationSpeed: number;
  index: number;
}

const Bar3D: React.FC<Bar3DProps> = ({ position, height, color, label, value, animationSpeed, index }) => {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation with different phases for each bar
      const time = state.clock.elapsedTime * animationSpeed;
      const floatOffset = Math.sin(time + index * 0.5) * 0.1;
      
      // Rotation animation
      meshRef.current.rotation.y = Math.sin(time * 0.5 + index * 0.3) * 0.2;
      
      // Scale animation on hover
      const targetScale = hovered ? 1.2 : clicked ? 1.1 : 1;
      meshRef.current.scale.lerp({ x: targetScale, y: 1, z: targetScale }, 0.1);
      
      // Position floating
      meshRef.current.position.y = position[1] + height / 2 + floatOffset;
      
      // Pulsing effect for clicked bars
      if (clicked) {
        const pulse = Math.sin(time * 4) * 0.05 + 1;
        meshRef.current.scale.y = pulse;
      }
    }
  });

  const handleClick = useCallback(() => {
    setClicked(!clicked);
  }, [clicked]);

  // Generate different shades for gradient effect
  const getGradientColor = (baseColor: string, intensity: number) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgb(${Math.min(255, r + intensity)}, ${Math.min(255, g + intensity)}, ${Math.min(255, b + intensity)})`;
  };

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Main bar with gradient effect */}
      <mesh 
        ref={meshRef} 
        position={[0, height / 2, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshPhongMaterial 
          color={hovered ? getGradientColor(color, 50) : color}
          emissive={hovered ? color : clicked ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : clicked ? 0.2 : 0}
          shininess={100}
          transparent
          opacity={hovered ? 0.9 : 0.8}
        />
      </mesh>

      {/* Glowing base */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 8]} />
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Floating particles around hovered bars */}
      {hovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[
              Math.sin(i * 2) * 1.5,
              height / 2 + Math.cos(i * 2) * 0.5,
              Math.cos(i * 2) * 1.5
            ]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
          ))}
        </>
      )}

      {/* Label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.25}
        color={hovered ? '#ffffff' : '#333333'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Value display */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color={hovered ? '#ffff00' : '#0066cc'}
        anchorX="center"
        anchorY="middle"
      >
        {value.toFixed(1)}
      </Text>

      {/* Animated ring for selected bars */}
      {clicked && (
        <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 16]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.5}
            side={2}
          />
        </mesh>
      )}
    </group>
  );
};

export default Bar3D;
