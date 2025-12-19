"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { FILTER_STYLES, FILTER_NAMES, getFilterStyle } from "@/lib/filters";
import clsx from "clsx";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCameraSelect: () => void;
  onGallerySelect: () => void;
}

export default function UploadModal({
  isOpen,
  onClose,
}: UploadModalProps) {
  // State
  const [step, setStep] = useState<'select' | 'filter' | 'uploading'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [albums, setAlbums] = useState<{ id: string, title: string }[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");

  // Style Config
  const [styleConfig, setStyleConfig] = useState({
    filter: 'normal',
    brightness: 0,
    contrast: 0,
    warmth: 0,
    vignette: 0,
    grain: false
  });

  // Inputs
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");

  // Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);


  // Hooks
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setTags("");
      setStyleConfig({ filter: 'normal', brightness: 0, contrast: 0, warmth: 0, vignette: 0, grain: false });

      fetch("/api/albums").then(res => res.json()).then(data => {
        if (Array.isArray(data)) setAlbums(data);
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-caption (simplified without geocoding for speed, can be improved)
      if (!caption) {
        setCaption(`${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} • My Journal`);
      }

      setStep('filter');
    }
    // Reset input value to allow selecting the same file again
    if (e.target) e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setStep('uploading');
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("filter", styleConfig.filter); // Legacy compat
      formData.append("style_config", JSON.stringify(styleConfig));
      if (selectedAlbumId) formData.append("album_id", selectedAlbumId);
      if (caption) formData.append("caption", caption);
      if (tags) formData.append("tags", tags);

      // Client-side EXIF
      try {
        const exifr = (await import('exifr')).default;
        const metadata = await exifr.parse(selectedFile);
        if (metadata) {
          if (metadata.latitude) formData.append("lat", metadata.latitude.toString());
          if (metadata.longitude) formData.append("lng", metadata.longitude.toString());
          if (metadata.DateTimeOriginal) formData.append("taken_at", metadata.DateTimeOriginal.toISOString());
          if (metadata.Make || metadata.Model) formData.append("device", `${metadata.Make || ''} ${metadata.Model || ''}`);
        }
      } catch (e) {
        console.warn("Client-side EXIF failed:", e);
      }

      // Simulate developing time if grain/filter is heavy for UX
      if (styleConfig.filter !== 'normal') await new Promise(r => setTimeout(r, 1500));

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      showToast("Photo added to your journal", "success");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Failed to upload photo", "error");
    }
  };

  // Helper for dynamic style
  const getPreviewStyle = () => {
    const filterCSS = getFilterStyle(styleConfig);
    return {
      filter: filterCSS,
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Hidden Inputs */}
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileSelect} />
          <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileSelect} />

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[95vh] rounded-t-[24px] bg-[#111] text-white p-0 shadow-modal overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button onClick={step === 'select' ? onClose : () => setStep('select')} className="text-gray-400">
                {step === 'select' ? <X /> : "Back"}
              </button>
              <h3 className="font-medium text-sm uppercase tracking-widest text-gray-300">
                {step === 'uploading' ? "Developing..." : step === 'filter' ? "Darkroom" : "Add Photo"}
              </h3>
              {step === 'filter' && (
                <button onClick={handleUpload} className="text-accent font-bold">
                  Save
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
              {step === 'select' ? (
                <div className="flex flex-col gap-4 mt-20 px-6">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-4 rounded-2xl bg-gray-900 border border-gray-800 p-8 transition-transform active:scale-95"
                  >
                    <div className="h-16 w-16 rounded-full bg-black border border-gray-700 flex items-center justify-center">
                      <Camera size={32} className="text-white" />
                    </div>
                    <span className="text-xl font-medium">Take Photo</span>
                  </button>

                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center gap-4 rounded-2xl bg-gray-900 border border-gray-800 p-8 transition-transform active:scale-95"
                  >
                    <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                      <ImageIcon size={32} />
                    </div>
                    <span className="text-xl font-medium">Upload from Gallery</span>
                  </button>
                </div>
              ) : step === 'uploading' ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  {/* Developing Animation */}
                  <motion.div
                    initial={{ filter: "brightness(0) blur(10px)" }}
                    animate={{ filter: "brightness(1) blur(0px)" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="relative w-64 aspect-[3/4] bg-white p-3 shadow-2xl skew-y-1"
                  >
                    <div className="w-full h-full bg-gray-200 overflow-hidden relative">
                      {previewUrl && (
                        <img src={previewUrl} className="w-full h-full object-cover" style={getPreviewStyle()} />
                      )}
                    </div>
                  </motion.div>
                  <p className="text-gray-400 animate-pulse font-mono uppercase text-xs">Developing...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8 pb-10">
                  {/* Preview Area */}
                  <div className="relative w-full aspect-[3/4] bg-[#050505] rounded-lg overflow-hidden shadow-2xl mx-auto max-w-sm group">
                    {previewUrl && (
                      <>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-full w-full object-cover transition-all duration-300"
                          style={getPreviewStyle()}
                        />
                        {/* Film Grain Overlay */}
                        {styleConfig.grain && (
                          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                            style={{ backgroundImage: `url('/noise.png')`, filter: 'none' }} // Assuming usage of noise texture or simple CSS noise if available
                          >
                            {/* Fallback Noise using CSS gradients if no image */}
                            <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50"></div>
                          </div>
                        )}
                        {/* Vignette Overlay */}
                        {styleConfig.vignette > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${styleConfig.vignette / 100}) 100%)`
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="space-y-6">
                    {/* Filters */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 mb-3">Film Stock</h4>
                      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {FILTER_NAMES.map(f => (
                          <button
                            key={f.id}
                            onClick={() => setStyleConfig({ ...styleConfig, filter: f.id })}
                            className={clsx(
                              "flex-shrink-0 flex flex-col items-center gap-2",
                              styleConfig.filter === f.id ? "opacity-100" : "opacity-40 hover:opacity-70"
                            )}
                          >
                            <div className={clsx(
                              "w-16 h-16 rounded-md bg-gray-800 border-2 overflow-hidden",
                              styleConfig.filter === f.id ? "border-accent" : "border-transparent"
                            )}>
                              <div className="w-full h-full" style={{ filter: FILTER_STYLES[f.id] || '' }}>
                                {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" />}
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-medium">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-2 gap-4 px-1">
                      {[
                        { label: 'Brightness', key: 'brightness', min: -50, max: 50 },
                        { label: 'Contrast', key: 'contrast', min: -30, max: 30 },
                        { label: 'Warmth', key: 'warmth', min: -50, max: 50 },
                        { label: 'Vignette', key: 'vignette', min: 0, max: 80 },
                      ].map((control) => (
                        <div key={control.key} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                          <div className="flex justify-between mb-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">{control.label}</label>
                            <span className="text-[10px] text-accent font-mono">
                              {(styleConfig as any)[control.key]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            value={(styleConfig as any)[control.key]}
                            onChange={(e) => setStyleConfig({ ...styleConfig, [control.key]: parseInt(e.target.value) })}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Grain Toggle */}
                    <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800 mx-1">
                      <span className="text-xs font-bold uppercase text-gray-300">Film Grain</span>
                      <button
                        onClick={() => setStyleConfig({ ...styleConfig, grain: !styleConfig.grain })}
                        className={clsx(
                          "w-12 h-6 rounded-full relative transition-colors",
                          styleConfig.grain ? "bg-accent" : "bg-gray-700"
                        )}
                      >
                        <div className={clsx(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          styleConfig.grain ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4 mx-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Caption</label>
                        <textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:border-accent outline-none"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tags</label>
                        <input
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:border-accent outline-none"
                          placeholder="#polaroid"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
