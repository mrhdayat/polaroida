"use client";

import { useState, useEffect } from "react";
import { Plus, Map, Folder, FileText, BarChart2, User } from "lucide-react";
import PolaroidCard from "@/components/ui/PolaroidCard";
import UploadModal from "@/components/ui/UploadModal";
import { useRouter } from "next/navigation";
import { Photo } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

// New Components
import ViewModeSelector, { ViewMode } from "@/components/feed/ViewModeSelector";
import TimelineView from "@/components/feed/TimelineView";
import EmptyFeedState from "@/components/feed/EmptyFeedState";

export default function FeedPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error("Failed to fetch photos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: ViewMode) => {
    if (mode === 'map') {
      router.push('/map');
    } else {
      setViewMode(mode);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 flex flex-col items-center bg-background/80 backdrop-blur-md border-b border-border/50 transition-all">
        <div className="flex w-full h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/albums')}
              className="text-muted hover:text-accent transition-colors"
            >
              <Folder size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="text-muted hover:text-accent transition-colors"
            >
              <User size={24} strokeWidth={1.5} />
            </button>
          </div>

          <h1 className="text-[18px] font-medium text-foreground tracking-wide">Polaroida</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/export')}
              className="text-muted hover:text-accent transition-colors"
            >
              <FileText size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => router.push('/map')}
              className="text-muted hover:text-accent transition-colors"
            >
              <Map size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        {photos.length > 0 && (
          <ViewModeSelector currentMode={viewMode} onModeChange={handleModeChange} />
        )}
      </header>

      {/* Content Area */}
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
        </div>
      ) : photos.length === 0 ? (
        <EmptyFeedState onUpload={() => setIsUploadOpen(true)} />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mx-auto w-full max-w-lg px-4 pt-6"
            >
              <div className="columns-2 gap-4 space-y-4">
                {photos.map((photo, i) => (
                  <PolaroidCard
                    key={photo.id}
                    photo={photo}
                    index={i}
                    onClick={() => router.push(`/photo/${photo.id}`)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TimelineView photos={photos} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* FAB */}
      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform active:scale-90 hover:scale-105"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onCameraSelect={() => { }}
        onGallerySelect={() => { }}
      />
    </main>
  );
}
