import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

interface Chart3DProps {
  data: Record<string, any>[];
  xAxis: string;
  yAxis: string;
  colorScheme?: string[];
  animationSpeed?: number;
}

interface AnimatedBar {
  mesh: THREE.Mesh;
  targetScale: number;
  currentScale: number;
  valueLabel: CSS2DObject;
  categoryLabel?: CSS2DObject;
}

const Chart3D: React.FC<Chart3DProps> = ({ 
  data, 
  xAxis, 
  yAxis, 
  colorScheme = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
  animationSpeed = 0.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animatedBarsRef = useRef<AnimatedBar[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Label renderer setup
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Process data and create bars
    const maxValue = Math.max(...data.map(item => Number(item[yAxis])));
    const barWidth = 1;
    const spacing = 0.5;
    const totalWidth = (barWidth + spacing) * data.length;
    const startX = -totalWidth / 2;

    animatedBarsRef.current = data.map((item, index) => {
      const value = Number(item[yAxis]);
      const normalizedHeight = (value / maxValue) * 10;
      const x = startX + index * (barWidth + spacing);

      // Create bar mesh
      const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(colorScheme[index % colorScheme.length]),
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, normalizedHeight / 2, 0);
      mesh.scale.y = 0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Create value label
      const valueLabelDiv = document.createElement('div');
      valueLabelDiv.className = 'value-label';
      valueLabelDiv.textContent = value.toString();
      valueLabelDiv.style.color = '#333';
      valueLabelDiv.style.padding = '4px 8px';
      valueLabelDiv.style.background = 'rgba(255, 255, 255, 0.9)';
      valueLabelDiv.style.borderRadius = '4px';
      valueLabelDiv.style.fontSize = '12px';
      valueLabelDiv.style.opacity = '0';
      const valueLabel = new CSS2DObject(valueLabelDiv);
      valueLabel.position.set(x, normalizedHeight + 0.5, 0);
      scene.add(valueLabel);

      // Create category label
      const categoryLabelDiv = document.createElement('div');
      categoryLabelDiv.className = 'category-label';
      categoryLabelDiv.textContent = item[xAxis].toString();
      categoryLabelDiv.style.color = '#333';
      categoryLabelDiv.style.padding = '4px 8px';
      categoryLabelDiv.style.background = 'rgba(255, 255, 255, 0.9)';
      categoryLabelDiv.style.borderRadius = '4px';
      categoryLabelDiv.style.fontSize = '12px';
      const categoryLabel = new CSS2DObject(categoryLabelDiv);
      categoryLabel.position.set(x, -0.5, 0);
      scene.add(categoryLabel);

      return {
        mesh,
        targetScale: normalizedHeight,
        currentScale: 0,
        valueLabel,
        categoryLabel
      };
    });

    // Add axis labels
    const addAxisLabel = (text: string, position: THREE.Vector3) => {
      const div = document.createElement('div');
      div.className = 'axis-label';
      div.textContent = text;
      div.style.color = '#333';
      div.style.padding = '4px 8px';
      div.style.background = 'rgba(255, 255, 255, 0.9)';
      div.style.borderRadius = '4px';
      div.style.fontSize = '14px';
      div.style.fontWeight = 'bold';
      const label = new CSS2DObject(div);
      label.position.copy(position);
      scene.add(label);
      return label;
    };

    addAxisLabel(xAxis, new THREE.Vector3(0, -2, 0));
    addAxisLabel(yAxis, new THREE.Vector3(-totalWidth / 2 - 2, 5, 0));

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !labelRendererRef.current) return;

      requestRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controlsRef.current?.update();

      // Animate bars
      animatedBarsRef.current.forEach(bar => {
        if (bar.currentScale < bar.targetScale) {
          bar.currentScale += bar.targetScale * (animationSpeed * 0.05);
          if (bar.currentScale > bar.targetScale) {
            bar.currentScale = bar.targetScale;
          }
          bar.mesh.scale.y = bar.currentScale;
        }
      });

      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      labelRendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Start animation
    animate();

    // Handle mouse interactions
    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      const y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(
        animatedBarsRef.current.map(bar => bar.mesh)
      );

      // Reset all value labels
      animatedBarsRef.current.forEach(bar => {
        (bar.valueLabel.element as HTMLElement).style.opacity = '0';
      });

      // Show value label for hovered bar
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const hoveredBar = animatedBarsRef.current.find(bar => bar.mesh === hoveredMesh);
        if (hoveredBar) {
          (hoveredBar.valueLabel.element as HTMLElement).style.opacity = '1';
        }
      }
    };

    containerRef.current.addEventListener('mousemove', onMouseMove);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      labelRendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', onMouseMove);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      animatedBarsRef.current.forEach(bar => {
        bar.mesh.geometry.dispose();
        (bar.mesh.material as THREE.Material).dispose();
      });
    };
  }, [data, xAxis, yAxis, colorScheme, animationSpeed]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
};

export default Chart3D;
