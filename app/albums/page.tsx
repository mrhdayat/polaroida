"use client";

import { useState, useEffect } from "react";
import { Plus, Folder, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Album } from "@/types";
import { motion } from "framer-motion";
import { useToast } from "@/components/providers/ToastProvider";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const res = await fetch("/api/albums");
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
    }
  };

  const createAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    const res = await fetch("/api/albums", {
      method: "POST",
      body: JSON.stringify({ title: newAlbumTitle }),
    });

    if (res.ok) {
      setNewAlbumTitle("");
      setIsCreating(false);
      fetchAlbums();
      showToast("Album created", "success");
    } else {
      showToast("Failed to create album", "error");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-24 px-6 pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[24px] font-bold text-foreground">Albums</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {isCreating && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          onSubmit={createAlbum}
          className="mb-8 overflow-hidden rounded-lg bg-white p-4 shadow-sm"
        >
          <input
            type="text"
            placeholder="Album title..."
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            className="w-full border-b border-gray-200 bg-transparent py-2 outline-none placeholder:text-gray-400 text-foreground"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              Create
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => router.push(`/albums/${album.id}`)}
            className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-soft transition-all hover:shadow-card active:scale-95"
          >
            <Folder size={32} className="mb-2 text-accent/80" strokeWidth={1.5} />
            <h3 className="text-center font-medium text-foreground">{album.title}</h3>
            <p className="text-[12px] text-gray-400">
              View
            </p>
          </div>
        ))}

        {albums.length === 0 && !isCreating && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400">
            <Folder size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p>No albums yet</p>
          </div>
        )}
      </div>
    </main>
  );
}
