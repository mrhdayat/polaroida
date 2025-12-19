"use client";

import { useMemo } from "react";
import { Photo } from "@/types";
import PolaroidCard from "@/components/ui/PolaroidCard";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export default function TimelineView({ photos }: { photos: Photo[] }) {
  const router = useRouter();

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach(photo => {
      const dateKey = photo.taken_at
        ? format(parseISO(photo.taken_at), "d MMMM yyyy")
        : "Unknown Date";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(photo);
    });
    return groups;
  }, [photos]);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-6 space-y-12">
      {Object.entries(groupedPhotos).map(([date, group]) => (
        <section key={date} className="relative border-l border-dashed border-gray-200 pl-8 ml-2">
          {/* Timeline Dot */}
          <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-[#FAFAFA]" />

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">{date}</h2>

          <div className="flex flex-col gap-8">
            {group.map((photo, i) => (
              <div key={photo.id} className="w-full transform transition-transform hover:scale-[1.01]">
                <PolaroidCard
                  photo={photo}
                  index={i}
                  onClick={() => router.push(`/photo/${photo.id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
