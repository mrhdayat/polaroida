"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PolaroidCard from "@/components/ui/PolaroidCard";
import { Photo, Album } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchAlbumDetails();
  }, []);

  const fetchAlbumDetails = async () => {
    // Fetch Album Info
    const { data: albumData } = await supabase
      .from('albums')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    setAlbum(albumData as Album);

    // Fetch Photos in Album
    if (albumData) {
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', resolvedParams.id)
        .order('taken_at', { ascending: false });

      setPhotos(photosData as Photo[] || []);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 bg-white/80 px-6 py-4 backdrop-blur-md border-b border-gray-100/50">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-foreground transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-bold text-foreground truncate">
          {album?.title || "Album"}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-lg px-4 pt-6">
        {photos.length > 0 ? (
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
        ) : (
          <div className="mt-20 text-center text-gray-400">
            <p>No photos in this album yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
