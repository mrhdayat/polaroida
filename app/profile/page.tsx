"use client";

import { useProfile } from "@/components/providers/ProfileProvider";
import { ThemeStyle } from "@/types";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const THEMES: { id: ThemeStyle; name: string; desc: string; previewBg: string; previewText: string }[] = [
  { id: 'classic', name: 'Classic White', desc: 'Clean, timeless', previewBg: '#FAFAFA', previewText: '#111' },
  { id: 'vintage', name: 'Vintage Film', desc: 'Warm nostalgic tones', previewBg: '#F8F3E6', previewText: '#3C3630' },
  { id: 'minimal', name: 'Minimal Black', desc: 'Bold, gallery style', previewBg: '#0F0F0F', previewText: '#FFF' },
  { id: 'pastel', name: 'Pastel Dream', desc: 'Soft & dreamy', previewBg: '#FFF9F2', previewText: '#5A5245' },
  { id: 'darkroom', name: 'Darkroom Red', desc: 'Safe-light aesthetic', previewBg: '#0A0A0A', previewText: '#FFD1D1' },
  { id: 'monochrome', name: 'Monochrome', desc: 'B&W Contrast', previewBg: '#F0F0F0', previewText: '#202020' },
];

export default function ProfilePage() {
  const { profile, updateThemeStyle, loading } = useProfile();
  const router = useRouter();

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;

  return (
    <main className="min-h-screen bg-background pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 bg-background/80 px-6 py-4 backdrop-blur-md border-b border-border/50">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/20 text-foreground transition-colors hover:bg-muted/30"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">Customization</h1>
      </div>

      <div className="mx-auto max-w-lg p-6 space-y-8">

        {/* Visual Style Theme */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-gray-500" />
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Visual Style</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => updateThemeStyle(theme.id)}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                  profile?.ui_theme_style === theme.id
                    ? "border-accent bg-background shadow-md"
                    : "border-transparent bg-white/50 hover:bg-white/80 dark:bg-white/5"
                )}
                style={{
                  // Fallback visual for unselected items if variables aren't applying correctly to transparent bg
                  backgroundColor: profile?.ui_theme_style === theme.id ? 'var(--background)' : undefined
                }}
              >
                {/* Mini Preview Card */}
                <div
                  className="h-16 w-16 rounded-lg shadow-sm border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.previewBg, borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  <div className="h-10 w-8 bg-white shadow-sm rotate-[-6deg] flex flex-col p-1">
                    <div className="bg-gray-200 flex-1 mb-1"></div>
                    <div className="h-1 bg-gray-300 w-1/2 rounded-full"></div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-foreground transition-colors" style={{ color: profile?.ui_theme_style === theme.id ? 'var(--foreground)' : undefined }}>
                    {theme.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{theme.desc}</p>
                </div>

                {profile?.ui_theme_style === theme.id && (
                  <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
