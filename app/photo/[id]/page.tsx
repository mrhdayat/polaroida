"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Smartphone, CloudSun, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Photo } from "@/types";
import { format } from "date-fns";

import { useToast } from "@/components/providers/ToastProvider";

export default function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { showToast } = useToast();
  const controls = useAnimation();

  useEffect(() => {
    fetchPhoto();
  }, []);

  const fetchPhoto = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (data) {
      setPhoto(data as Photo);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    // Custom confirm UI would be better, but for now we keep native confirm
    // or we could use the Toast for "Undo" functionality later
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', resolvedParams.id);

    if (!error) {
      showToast("Photo deleted", "info");
      router.back();
      router.refresh(); // Refresh feed
    } else {
      showToast("Failed to delete photo", "error");
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Swipe Down -> Close
    if (info.offset.y > 100) {
      router.back();
    }
    // Swipe Right -> Future: Previous Photo (requires list context)
    // Swipe Left -> Future: Next Photo
    else {
      controls.start({ x: 0, y: 0 });
    }
  };

  if (loading) return <div className="min-h-screen bg-white" />;
  if (!photo) return <div className="min-h-screen flex items-center justify-center">Photo not found</div>;

  const takenDate = photo.taken_at ? format(new Date(photo.taken_at), 'd MMM yyyy, HH:mm') : 'Unknown Date';

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-white overflow-hidden"
    >
      {/* Navigation Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between px-6 py-6 pt-12 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-transform active:scale-95 hover:bg-black/30"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleDelete}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur-md transition-transform active:scale-95 hover:bg-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Photo Section with Gestures */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative h-[80vh] w-full bg-[#f0f0f0] cursor-grab active:cursor-grabbing"
      >
        <Image
          src={photo.image_url}
          alt="Photo detail"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay for text visibility if needed */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent opacity-40 pointer-events-none" />

        {/* Hint for interaction */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-xs">Swipe down to close</div>
        </div>
      </motion.div>

      {/* Metadata Panel */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: -32, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        className="relative mx-6 -mt-8 rounded-[12px] bg-white px-6 py-6 shadow-soft z-10"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-foreground">
            <Calendar size={20} className="text-gray-400 shrink-0" />
            <span className="font-sans text-[16px] tracking-wide leading-none">{takenDate}</span>
          </div>

          {photo.location_name && (
            <div className="flex items-center gap-4 text-foreground">
              <MapPin size={20} className="text-gray-400 shrink-0" />
              <span className="font-sans text-[16px] tracking-wide leading-none">{photo.location_name}</span>
            </div>
          )}

          {photo.device_info && (
            <div className="flex items-center gap-4 text-foreground">
              <Smartphone size={20} className="text-gray-400 shrink-0" />
              <span className="font-sans text-[16px] tracking-wide leading-none">{photo.device_info}</span>
            </div>
          )}

          {photo.weather && (
            <div className="flex items-center gap-4 text-foreground">
              <CloudSun size={20} className="text-gray-400 shrink-0" />
              <span className="font-sans text-[16px] tracking-wide leading-none">{photo.weather}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.main>
  );
}
