"use client";

import { useState } from "react";
import NarrativeScroll from "@/components/NarrativeScroll";
import PreloaderIdent from "@/components/PreloaderIdent";

export default function LandingPageClient() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-black relative">
      {!isLoaded && (
        <PreloaderIdent 
          onComplete={() => setIsLoaded(true)} 
          subtitle="An Olfactory Gallery" 
        />
      )}
      <div 
        className="w-full transition-opacity duration-700 ease-out"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <NarrativeScroll />
      </div>
    </main>
  );
}
