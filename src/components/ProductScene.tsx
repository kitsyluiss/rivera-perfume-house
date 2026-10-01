"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, ContactShadows, useTexture, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Perfume } from "@/lib/types";

import { getAvifUrl } from "@/lib/get-avif";

// The individual product card in 3D space
function ProductCard({ 
  perfume, 
  index, 
  total, 
  radius, 
  onClick,
  isSelected,
  hasSelection,
  dragX
}: { 
  perfume: Perfume; 
  index: number; 
  total: number;
  radius: number;
  onClick: (p: Perfume) => void;
  isSelected: boolean;
  hasSelection: boolean;
  dragX: any;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef1 = useRef<THREE.MeshBasicMaterial>(null);
  const materialRef2 = useRef<THREE.MeshPhysicalMaterial>(null);
  
  const texture = useTexture(getAvifUrl(perfume));
  
  const angle = (index / total) * Math.PI * 2;
  const baseX = Math.sin(angle) * radius;
  const baseZ = Math.cos(angle) * radius;
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Calculate Target Opacity for Carousel Background Fade
      let targetOpacity = 1;
      let targetOpacityGlass = 0.15; // default glass opacity
      
      if (hasSelection) {
        if (isSelected) {
          // Selected bottle stays visible
          targetOpacity = 1;
          targetOpacityGlass = 0.25;
          groupRef.current.visible = true;
          
          groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        } else {
          // Unselected bottles smoothly fade out
          targetOpacity = 0;
          targetOpacityGlass = 0;
          // Hide completely once faded to save render cost
          if (materialRef1.current && materialRef1.current.opacity < 0.01) {
            groupRef.current.visible = false;
          }
        }
      } else {
        // Idle
        groupRef.current.visible = true;
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }

      if (materialRef1.current) {
        materialRef1.current.opacity = THREE.MathUtils.damp(materialRef1.current.opacity, targetOpacity, 4, delta);
      }
      if (materialRef2.current) {
        materialRef2.current.opacity = THREE.MathUtils.damp(materialRef2.current.opacity, targetOpacityGlass, 4, delta);
      }

      // Static circle position (CarouselRig rotates the whole group)
      groupRef.current.position.lerp(new THREE.Vector3(baseX, 0, baseZ), 0.1);
      groupRef.current.rotation.y = angle;
    }
  });

  return (
    <Float 
      speed={isSelected ? 0.8 : 2} 
      rotationIntensity={isSelected ? 0.08 : 0.1} 
      floatIntensity={isSelected ? 0.25 : 0.5} 
    >
      <group ref={groupRef} onClick={(e) => {
        e.stopPropagation();
        if (!hasSelection) onClick(perfume);
      }}>
        <Billboard
          follow={!hasSelection || isSelected} 
          lockX={false} lockY={false} lockZ={false}
        >
          <mesh castShadow receiveShadow>
            <planeGeometry args={[2.5, 3.125]} />
            <meshBasicMaterial ref={materialRef1} map={texture} transparent={true} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[2.5, 3.125]} />
            <meshPhysicalMaterial 
              ref={materialRef2}
              transparent={true} alphaMap={texture} depthWrite={false} opacity={0.15} 
              roughness={0.0} metalness={0.5} transmission={0.9} clearcoat={1.0} side={THREE.FrontSide} 
            />
          </mesh>
        </Billboard>
      </group>
    </Float>
  );
}

// A standalone card for items clicked from the grid that aren't in the carousel
function StandaloneProductCard({ perfume, radius }: { perfume: Perfume, radius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(getAvifUrl(perfume));

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2} position={[-0.6, 0, 5]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <group ref={groupRef} scale={[1.05, 1.05, 1.05]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[2.5, 3.125]} />
            <meshBasicMaterial map={texture} transparent={true} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[2.5, 3.125]} />
            <meshPhysicalMaterial 
              transparent={true} alphaMap={texture} depthWrite={false} opacity={0.15} 
              roughness={0.0} metalness={0.5} transmission={0.9} clearcoat={1.0} side={THREE.FrontSide} 
            />
          </mesh>
        </group>
      </Billboard>
    </Float>
  );
}


// The interactive carousel rig
function CarouselRig({ 
  perfumes, 
  radius,
  onSelect,
  selectedId,
  dragX
}: { 
  perfumes: Perfume[];
  radius: number;
  onSelect: (p: Perfume) => void;
  selectedId?: string;
  dragX?: any;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const randomInitialRotation = useMemo(() => Math.random() * Math.PI * 2, []);
  const dragOffsetRef = useRef(randomInitialRotation);
  const wasSelectedRef = useRef(false);
  
  const selectedIndex = selectedId ? perfumes.findIndex(p => p.id === selectedId) : -1;
  const targetAngle = selectedIndex !== -1 ? -((selectedIndex / perfumes.length) * Math.PI * 2) : null;
  
  // Update internal offset when dragged
  useEffect(() => {
    if (!dragX) return;
    return dragX.onChange((v: number) => {
      if (!selectedId) {
        dragOffsetRef.current = randomInitialRotation + (v / 1000) * Math.PI * 2;
      }
    });
  }, [dragX, selectedId, randomInitialRotation]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (targetAngle !== null) {
        wasSelectedRef.current = true;
        // Move the entire carousel to center-left and bring it closer for the floating avif view
        // Align dynamically with the 60vw left focal area of the radial gradient
        const isMobile = window.innerWidth < 768;
        const targetZ = isMobile ? (3.5 - radius) : (5.2 - radius);
        const bottleWorldZ = targetZ + radius;
        
        // Exact viewport dimensions at bottle depth
        const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, bottleWorldZ]);
        const targetX = isMobile ? 0 : -vp.width * 0.20;
        const targetY = isMobile ? vp.height * 0.10 : -vp.height * 0.16;
        
        groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 5, delta);
        groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 5, delta);
        groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 5, delta);

        // Smoothly rotate the rig to show the selected bottle facing front
        const TWO_PI = Math.PI * 2;
        const currentRot = groupRef.current.rotation.y;
        const currentNorm = ((currentRot % TWO_PI) + TWO_PI) % TWO_PI;
        const targetNorm = ((targetAngle % TWO_PI) + TWO_PI) % TWO_PI;
        
        let diff = targetNorm - currentNorm;
        if (diff > Math.PI) diff -= TWO_PI;
        if (diff < -Math.PI) diff += TWO_PI;
        
        const finalTarget = currentRot + diff;
        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, finalTarget, 6, delta);
        
      } else {
        // Normal idle state
        groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, 0, 6, delta);
        groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, 0, 6, delta);
        groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, 0, 6, delta);
        
        const autoSpin = state.clock.elapsedTime * 0.15;
        
        // Prevent rotation snapping when exiting the product view
        if (wasSelectedRef.current) {
          dragOffsetRef.current = groupRef.current.rotation.y - autoSpin;
          // Only sync Framer Motion's visual representation if dragX exists
          if (dragX) {
            dragX.set(dragOffsetRef.current * 1000 / (Math.PI * 2));
          }
          wasSelectedRef.current = false;
        }

        const desiredRot = dragOffsetRef.current + autoSpin;
        
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          desiredRot,
          8,
          delta
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {perfumes.map((perfume, index) => (
        <ProductCard 
          key={perfume.id} 
          perfume={perfume} 
          index={index} 
          total={perfumes.length} 
          radius={radius}
          onClick={onSelect}
          isSelected={perfume.id === selectedId}
          hasSelection={!!selectedId}
          dragX={dragX}
        />
      ))}
    </group>
  );
}

export default function ProductScene({ 
  perfumes,
  onSelect,
  selectedPerfume,
  dragX,
  selectionSource
}: { 
  perfumes: Perfume[];
  onSelect: (p: Perfume) => void;
  selectedPerfume?: Perfume | null;
  dragX?: any;
  selectionSource?: "grid" | "carousel" | null;
}) {
  // If no perfumes, render nothing
  if (!perfumes || perfumes.length === 0) return null;

  // Determine radius based on number of items (prevent overlap)
  const radius = Math.max(3.5, perfumes.length * 0.8);

  const isSelectedInCarousel = selectedPerfume ? perfumes.some(p => p.id === selectedPerfume.id) : false;

  return (
    <Canvas 
      camera={{ position: [0, 0, radius + 5], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={2.5} />
      {/* Gold rim light */}
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.2} 
        penumbra={1} 
        intensity={8} 
        color="#d6b36d" 
        castShadow
      />
      {/* Fill light */}
      <spotLight 
        position={[-10, 0, -10]} 
        intensity={3} 
        color="#ffffff" 
      />
      {/* Front light for absolute clarity */}
      <directionalLight position={[0, 0, 10]} intensity={2} />
      
      <Suspense fallback={null}>
        <CarouselRig 
          perfumes={perfumes} 
          radius={radius} 
          onSelect={onSelect}
          selectedId={selectionSource === "carousel" ? selectedPerfume?.id : undefined}
          dragX={dragX}
        />
      </Suspense>
      
      <Environment preset="city" />
      
      {/* Ground plane for shadows */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
        color="#d6b36d"
      />
    </Canvas>
  );
}
