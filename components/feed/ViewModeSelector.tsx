"use client";

import { motion } from "framer-motion";
import { Grid, Calendar, Map as MapIcon } from "lucide-react";
import clsx from "clsx";

export type ViewMode = "grid" | "timeline" | "map";

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  const modes = [
    { id: "grid", icon: Grid, label: "All moments" },
    { id: "timeline", icon: Calendar, label: "Chronological" },
    { id: "map", icon: MapIcon, label: "Photo map" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      {/* Visual Toggle */}
      <div className="flex items-center gap-6">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id as ViewMode)}
              className="relative flex flex-col items-center justify-center p-2 outline-none transition-colors"
            >
              <mode.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={clsx(
                  "transition-colors duration-300",
                  isActive ? "text-accent" : "text-gray-400 hover:text-gray-500"
                )}
              />

              {isActive && (
                <motion.div
                  layoutId="active-mode-dot"
                  className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Label */}
      <motion.p
        key={currentMode}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[12px] font-medium text-gray-400 tracking-wide uppercase"
      >
        {modes.find((m) => m.id === currentMode)?.label}
      </motion.p>
    </div>
  );
}
