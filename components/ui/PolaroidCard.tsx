"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Photo } from "@/types";
import clsx from "clsx";
import { format } from "date-fns";

interface PolaroidCardProps {
  photo: Photo;
  onClick: () => void;
  index: number;
}

const FRAME_STYLES: Record<string, string> = {
  classic: "bg-[var(--polaroid-bg)]", // Adopts the theme's polaroid color
  mint: "bg-[#e0f7f1] text-[#111]", // Specific overrides stay specific
  blush: "bg-[#fce4ec] text-[#111]",
  sky: "bg-[#e3f2fd] text-[#111]",
  // If user selected 'black' frame style previously, it might clash with dark themes, but let's map it safely
  black: "bg-[#222] text-white",
};

export default function PolaroidCard({ photo, onClick, index }: PolaroidCardProps) {
  // If frame style is weird or missing, default to theme's classic look
  const frameClass = FRAME_STYLES[photo.frame_style] || FRAME_STYLES.classic;
  const takenDate = photo.taken_at ? format(new Date(photo.taken_at), 'd MMM') : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="break-inside-avoid px-2 py-2 mb-6"
    >
      <motion.div
        whileTap={{ scale: 1.02, opacity: 0.95 }}
        onClick={onClick}
        className={clsx(
          "group relative cursor-pointer p-3 shadow-soft transition-shadow hover:shadow-card", // Use theme shadows
          frameClass
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Photo Container */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={photo.image_url}
            alt={photo.caption || "Polaroid Photo"}
            fill
            className={clsx(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              photo.filter_style && photo.filter_style !== 'normal' ? `filter-${photo.filter_style}` : ''
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 2} // Prioritize LCP for first 2 images
          />

          {/* Filter Overlay (Alternative if CSS filters are tricky) */}
          {photo.filter_style && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
              style={{
                backgroundColor: photo.filter_style === 'sepia' ? '#704214' :
                  photo.filter_style === 'vintage' ? '#d4a373' : 'transparent'
              }}
            />
          )}
        </div>

        {/* Caption & Metadata */}
        <div className="pt-4 pb-2">
          {photo.caption && (
            <p className={clsx(
              "mb-2 font-handwriting text-[14px] leading-tight font-sans transition-colors",
              // Adjust text color based on frame style. 
              // If it's a specific color frame (mint/blush), use hardcoded dark text.
              // If it's 'classic' (theme based), use the theme's text-primary/foreground.
              photo.frame_style === 'classic' || !FRAME_STYLES[photo.frame_style] ? "text-foreground" : "text-black/80"
            )}>
              {photo.caption}
            </p>
          )}

          <div className={clsx(
            "flex items-center gap-3 text-[10px] transition-colors",
            photo.frame_style === 'classic' || !FRAME_STYLES[photo.frame_style] ? "text-muted" : "text-gray-500"
          )}>
            {photo.location_name && (
              <div className="flex items-center gap-1">
                <MapPin size={10} />
                <span className="truncate max-w-[80px]">{photo.location_name}</span>
              </div>
            )}
            {takenDate && (
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{takenDate}</span>
              </div>
            )}
            {photo.weather && (
              <div className="flex items-center gap-1">
                <span className="truncate max-w-[60px]">{photo.weather}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
