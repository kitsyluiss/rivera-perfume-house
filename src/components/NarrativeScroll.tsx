"use client";

import { useRef, Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture, Billboard } from "@react-three/drei";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import * as THREE from "three";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag, Truck, Users } from "lucide-react";
import Link from "next/link";

// Celestial Stardust Field - Micro-particles drifting across space
function CelestialDust() {
  const points = useRef<THREE.Points>(null);
  const count = 300;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = -(Math.random() * 25 + 3);
      const isGold = Math.random() < 0.65;
      col[i * 3] = isGold ? 0.95 : 0.9;
      col[i * 3 + 1] = isGold ? 0.82 : 0.95;
      col[i * 3 + 2] = isGold ? 0.45 : 1.0;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.01;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.04;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

// Zero Gravity Scatter Component - Starfield Volumetric Constellation
function ZeroGravityScatter({ scrollYProgress, isMobile }: { scrollYProgress: MotionValue<number>; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const baseTextures = useTexture([
    "/perfumes/liquid_brun.avif",
    "/perfumes/pacific_aloha.avif",
    "/perfumes/club_de_nuit_intense_man.avif",
    "/perfumes/delilahblanc.avif",
    "/perfumes/shiyaaka_snow.avif",
    "/perfumes/rayhaan_elixir.avif",
    "/perfumes/hawas_black.avif",
    "/perfumes/varakh_silver.avif",
  ]);

  // User requested to keep 32 bottles but make them more random
  const textures = useMemo(() => {
    const arr = [...baseTextures, ...baseTextures, ...baseTextures, ...baseTextures];
    // Fisher-Yates shuffle for maximum randomness
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [baseTextures]);

  const bottles = useRef(textures.map((t) => {
    const randTier = Math.random();
    let z: number;
    let scale: number;
    let baseOpacity: number;
    let speed: number;

    if (randTier < 0.20) {
      z = Math.random() * 3.5 - 1.0;
      scale = 1.05 + Math.random() * 0.35;
      baseOpacity = 0.90 + Math.random() * 0.10;
      speed = 1.35 + Math.random() * 0.35;
    } else if (randTier < 0.65) {
      z = -(4.5 + Math.random() * 5.5);
      scale = 0.55 + Math.random() * 0.30;
      baseOpacity = 0.58 + Math.random() * 0.22;
      speed = 0.85 + Math.random() * 0.25;
    } else {
      z = -(11.0 + Math.random() * 6.0);
      scale = 0.28 + Math.random() * 0.16;
      baseOpacity = 0.22 + Math.random() * 0.20;
      speed = 0.45 + Math.random() * 0.20;
    }

    const x = (Math.random() - 0.5) * 44;
    const offsetY = (Math.random() - 0.5) * 32;
    
    return {
      texture: t,
      x,
      offsetY,
      z,
      scale,
      speed,
      baseOpacity,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.6 + Math.random() * 1.2,
      hoverSpeed: 0.4 + Math.random() * 0.5,
    };
  }));

  useFrame((state) => {
    const progress = scrollYProgress.get();

    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const b = bottles.current[i];
        const parallaxY = (progress - 0.5) * 36 * b.speed + b.offsetY;
        const time = state.clock.elapsedTime * b.hoverSpeed;
        const hoverY = Math.sin(time + b.phase) * 0.35;
        const hoverX = Math.cos(time * 0.8 + b.phase) * 0.25;
        const hoverRotZ = Math.sin(time * 0.6 + b.phase) * 0.08;
        const hoverRotY = Math.cos(time * 0.5 + b.phase) * 0.12;

        child.position.set(b.x + hoverX, parallaxY + hoverY, b.z);
        child.rotation.set(0, hoverRotY, hoverRotZ);

        const mesh = child.children[0] as THREE.Mesh;
        if (mesh && mesh.material) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const twinkle = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * b.twinkleSpeed + b.phase);
          mat.opacity = b.baseOpacity * twinkle;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {bottles.current.map((b, i) => (
        <Billboard key={i} follow={true} lockX={false} lockY={false} lockZ={false}>
          <mesh scale={[b.scale, b.scale, b.scale]}>
            <planeGeometry args={[2.2, 2.75]} />
            <meshBasicMaterial 
              map={b.texture} 
              transparent 
              opacity={b.baseOpacity}
              depthWrite={false}
              side={THREE.DoubleSide} 
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}

export default function NarrativeScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const row1ScrollX = useTransform(scrollYProgress, [0.15, 0.75], ["0%", "-15%"]);
  const row2ScrollX = useTransform(scrollYProgress, [0.15, 0.75], ["-15%", "0%"]);
  const row3ScrollX = useTransform(scrollYProgress, [0.15, 0.75], ["0%", "-18%"]);
  
  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {/* Fixed 3D Canvas Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, #141414 0%, #000000 90%)" }}
      >
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={isMobile ? 1 : [1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2.2} color="#f6e3a1" />
          <directionalLight position={[-10, -5, -5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[0, 0, 8]} intensity={1.5} color="#e5c158" />
          
          <Suspense fallback={null}>
            <CelestialDust />
            <ZeroGravityScatter scrollYProgress={scrollYProgress} isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </div>

      <div className="w-full pointer-events-none relative z-10">
        
        {/* ========================================================================= */}
        {/* Section 1: Hero — Immediate Clarity for Personal Buyers & Resellers       */}
        {/* ========================================================================= */}
        <section className="min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-4xl mx-auto will-change-transform"
          >


            {/* Brand Title */}
            <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#f9d976] to-[#bd9135] font-light tracking-widest mb-4">
              RIVERA
            </h1>

            {/* Clear Subtitle & Plain-English Description */}
            <h2 className="font-body text-base sm:text-xl md:text-2xl font-light text-white tracking-wide mb-4">
              100% Authentic Fragrances at Honest Prices
            </h2>
            <p className="text-white/75 font-body text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10">
              Your trusted family source for genuine Middle Eastern and designer perfumes in the Philippines. Guaranteed original sealed boxes, direct supplier rates, and flexible bulk orders for resellers.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
              <Link 
                href="/catalog"
                className="group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white px-8 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#e1b854] hover:scale-105 active:scale-95 shadow-xl shadow-black/50"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Browse Fragrances (₱)</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link 
                href="/catalog"
                className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-md px-8 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-[#e1b854]/50"
              >
                <Users className="h-4 w-4 text-[#e1b854]" />
                <span>Wholesale &amp; Reseller Rates</span>
              </Link>
            </div>

            {/* Quick Trust Signals Bar */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/60 font-body">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#e1b854]" /> 100% Original Sealed Bottles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#e1b854]" /> Personal &amp; Bulk Orders
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#e1b854]" /> Fast Courier Delivery Nationwide
              </span>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* Section 2: Why Choose Us — Generous Spacing & Family Values               */}
        {/* ========================================================================= */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="py-28 sm:py-36 px-6 max-w-5xl mx-auto text-center relative z-10"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#e1b854] mb-3 block">
            The Rivera Difference
          </span>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white font-light leading-tight">
            Original Fragrances. <span className="italic text-[#e1b854]">Zero Counterfeits.</span>
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed font-body text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            We are a family-run fragrance business dedicated to honest pricing. Instead of paying inflated department store markups or risking fake bottles online, we bring you genuine imported perfumes with verifiable batch codes and dependable customer service.
          </p>

          {/* 3 Core Value Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left pointer-events-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
              <ShieldCheck className="h-8 w-8 text-[#e1b854] mb-4" />
              <h3 className="font-display text-xl sm:text-2xl text-white font-light mb-2">100% Genuine Guaranteed</h3>
              <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
                Every bottle arrives factory-sealed with verifiable batch codes. We stake our family name on zero counterfeit products.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
              <Users className="h-8 w-8 text-[#e1b854] mb-4" />
              <h3 className="font-display text-xl sm:text-2xl text-white font-light mb-2">Personal &amp; Wholesale</h3>
              <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
                Whether you want a single bottle for daily wear or multiple boxes for your fragrance resale business, we offer fair prices for everyone.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
              <Truck className="h-8 w-8 text-[#e1b854] mb-4" />
              <h3 className="font-display text-xl sm:text-2xl text-white font-light mb-2">Fast, Safe Packaging</h3>
              <p className="text-xs sm:text-sm text-white/60 font-body leading-relaxed">
                Wrapped securely in thick bubble wrap to prevent breakage. Shipped fast across Metro Manila and nationwide across the Philippines.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* Section 3: Three Stacked Kinetic Marquees (Customer-Friendly Tickers)     */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 my-8 overflow-hidden flex flex-col gap-4 sm:gap-7 select-none border-y border-white/10 bg-black/60 backdrop-blur-md pointer-events-auto">
          
          {/* Row 1: Sliding Left */}
          <div className="flex whitespace-nowrap overflow-hidden">
            <motion.div style={{ x: row1ScrollX }} className="flex whitespace-nowrap will-change-transform">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 32, ease: "linear", repeat: Infinity }}
                className="flex whitespace-nowrap"
              >
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white/90 font-light tracking-tight px-6 uppercase flex items-center">
                    100% ORIGINAL GUARANTEED <span className="mx-6 text-[#e1b854] text-xl sm:text-2xl">&diams;</span> DIRECT WHOLESALE &amp; RETAIL <span className="mx-6 text-[#e1b854] text-xl sm:text-2xl">&diams;</span> HONEST FAMILY PRICING <span className="mx-6 text-[#e1b854] text-xl sm:text-2xl">&diams;</span> FAST NATIONWIDE DELIVERY <span className="mx-6 text-[#e1b854] text-xl sm:text-2xl">&diams;</span>
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Row 2: Sliding Right (Opposite Direction) */}
          <div className="flex whitespace-nowrap overflow-hidden">
            <motion.div style={{ x: row2ScrollX }} className="flex whitespace-nowrap will-change-transform">
              <motion.div
                animate={{ x: ["-50%", "0%"] }}
                transition={{ duration: 38, ease: "linear", repeat: Infinity }}
                className="flex whitespace-nowrap"
              >
                {[...Array(4)].map((_, i) => (
                  <span 
                    key={i} 
                    className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-transparent font-normal tracking-tight px-6 uppercase italic flex items-center"
                    style={{ WebkitTextStroke: "1px rgba(225, 184, 84, 0.5)" }}
                  >
                    VERIFIED BATCH CODES <span className="mx-6 text-white/30 text-xl sm:text-2xl">&bull;</span> NO FAKES EVER <span className="mx-6 text-white/30 text-xl sm:text-2xl">&bull;</span> POPULAR MIDDLE EASTERN GEMS <span className="mx-6 text-white/30 text-xl sm:text-2xl">&bull;</span> BEST DESIGNER FAVORITES <span className="mx-6 text-white/30 text-xl sm:text-2xl">&bull;</span>
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Row 3: Sliding Left */}
          <div className="flex whitespace-nowrap overflow-hidden">
            <motion.div style={{ x: row3ScrollX }} className="flex whitespace-nowrap will-change-transform">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                className="flex whitespace-nowrap"
              >
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white/40 font-light tracking-widest px-6 uppercase flex items-center">
                    METRO MANILA &amp; NATIONWIDE <span className="mx-6 text-[#e1b854]/60 text-xl sm:text-2xl">&times;</span> SAFE BUBBLE WRAP <span className="mx-6 text-[#e1b854]/60 text-xl sm:text-2xl">&times;</span> SINGLE BOTTLES &amp; BULK BOXES <span className="mx-6 text-[#e1b854]/60 text-xl sm:text-2xl">&times;</span> HONEST LOCAL VALUES <span className="mx-6 text-[#e1b854]/60 text-xl sm:text-2xl">&times;</span>
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* Section 5: The Direct Catalog & Wholesale Portal                          */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 pointer-events-auto max-w-4xl mx-auto text-center relative z-10">
          <div className="rounded-3xl border border-white/15 bg-white/[0.02] p-8 sm:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,184,84,0.08)_0%,transparent_70%)]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#e1b854] mb-4">
                Full Collection &bull; Ready to Ship
              </span>

              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white font-light leading-tight">
                Explore Our Fragrance <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6e3a1] to-[#e1b854]">Catalog.</span>
              </h2>

              <p className="mt-4 text-white/70 font-body text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Browse our complete list of genuine Middle Eastern and designer perfumes. See live prices in Philippine Pesos (₱), check stock availability, and place orders directly.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/catalog"
                  className="group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white px-9 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#e1b854] hover:scale-105 active:scale-95 shadow-xl shadow-black/40"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop Catalog &amp; Prices (₱)</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link 
                  href="/collections"
                  className="inline-flex h-13 w-full sm:w-auto items-center justify-center rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-md px-8 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-[#e1b854]/40"
                >
                  Browse by Brand &bull; Season
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center w-full">
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-white font-light">100%</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 font-mono">Original Sealed</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-[#e1b854] font-light">₱1,499+</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 font-mono">Fair Direct Rates</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-white font-light">Wholesale</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 font-mono">Reseller Friendly</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-[#e1b854] font-light">Nationwide</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 font-mono">Fast Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Section 6: Local Trust Footer — Honest Family Promises                    */}
        {/* ========================================================================= */}
        <footer className="w-full mt-24 border-t border-white/10 bg-black/80 backdrop-blur-2xl py-20 px-4 sm:px-6 pointer-events-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg text-[#e1b854] tracking-widest uppercase">Contact &amp; Orders</h3>
              <div className="flex flex-col gap-2 font-body text-xs text-white/70 leading-relaxed">
                <p>Have questions about a scent or wholesale order?</p>
                <p className="text-white font-mono font-medium">orders@riverafragrance.com</p>
                <p>Located in Metro Manila, Philippines</p>
                <p className="text-[#e1b854] text-[11px] font-mono mt-1">Accepting GCash, Maya, Bank Transfer &amp; Cards</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg text-[#e1b854] tracking-widest uppercase">Shipping &amp; Delivery</h3>
              <div className="flex flex-col gap-2 font-body text-xs text-white/70 leading-relaxed">
                <p><strong className="text-white font-medium">Metro Manila:</strong> 1–2 days delivery via local express courier.</p>
                <p><strong className="text-white font-medium">Provincial:</strong> 3–5 business days via trusted couriers (LBC / J&amp;T).</p>
                <p>Every bottle is wrapped with multi-layer bubble wrap to guarantee safe arrival.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg text-[#e1b854] tracking-widest uppercase">Our Family Guarantee</h3>
              <div className="flex flex-col gap-2 font-body text-xs text-white/70 leading-relaxed">
                <p>We are a local family dedicated to bringing authentic perfumes at honest prices.</p>
                <p>Every bottle is 100% genuine with real batch codes. No imitations, no watered-down decants, and no fake promises.</p>
              </div>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-white/5 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono uppercase tracking-[0.15em] text-white/60">
              <Link href="/catalog" className="hover:text-[#e1b854] transition-colors">Live Catalog (₱)</Link>
              <Link href="/collections" className="hover:text-[#e1b854] transition-colors">Collections</Link>
              <Link href="/about" className="hover:text-[#e1b854] transition-colors">About Us</Link>
              <Link href="/atelier" className="hover:text-[#e1b854] transition-colors">The Atelier</Link>
              <Link href="/journal" className="hover:text-[#e1b854] transition-colors">Fragrance Journal</Link>
            </div>
            <p className="font-display text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#f9d976] to-[#bd9135] font-light tracking-[0.25em]">
              RIVERA
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/50">
              &copy; {new Date().getFullYear()} Rivera Fragrance House. All Rights Reserved. Malabon, Metro Manila, Philippines.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
