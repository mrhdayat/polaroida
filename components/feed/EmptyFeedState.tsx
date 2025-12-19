"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyFeedState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="mb-6 h-24 w-24 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center">
          <Plus size={32} className="text-gray-300" />
        </div>
      </div>

      <h2 className="text-2xl font-serif text-[#333] mb-2 font-medium">Your story starts here.</h2>
      <p className="text-[#888888] mb-8 font-light text-sm">Capture a moment. Any moment.</p>

      <button
        onClick={onUpload}
        className="px-8 py-3 bg-black text-white rounded-full text-sm font-medium shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        Take Your First Photo
      </button>
    </div>
  );
}
