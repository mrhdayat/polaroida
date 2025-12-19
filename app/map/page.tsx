"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamic import for Leaflet (No SSR)
const InteractiveMap = dynamic(() => import("@/components/ui/map/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-400">Loading Map...</div>,
});

export default function MapPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#FAFAFA]">
      {/* Header / Nav */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-4 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-foreground shadow-soft backdrop-blur-md transition-transform active:scale-95 hover:bg-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="rounded-full bg-white/80 px-4 py-2 shadow-soft backdrop-blur-md">
          <h1 className="text-sm font-medium text-foreground">Photo Map</h1>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <InteractiveMap />
    </main>
  );
}
