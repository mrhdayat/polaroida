"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Photo } from "@/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";

export default function ExportPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("taken_at", { ascending: true });

    if (data) {
      setPhotos(data as Photo[]);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!printRef.current) return;
    setExporting(true);

    try {
      const element = printRef.current;
      // Force white background for capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          // Optional: You could manipulate the cloned DOM here if needed
          const el = clonedDoc.getElementById('print-container');
          if (el) el.style.backgroundColor = '#ffffff';
        }
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`polaroida-journal-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Failed to export PDF. Please try using a simpler view or check console.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <main className="min-h-screen bg-background pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-6 py-4 backdrop-blur-md border-b border-border/50">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/20 text-foreground transition-colors hover:bg-muted/30"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">Export Journal</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          <span>PDF</span>
        </button>
      </div>

      <div className="mx-auto max-w-2xl p-8">
        <div
          id="print-container"
          ref={printRef}
          className="shadow-sm min-h-[800px]"
          style={{ width: '100%', backgroundColor: 'var(--polaroid-bg)', padding: '32px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-inter), serif', color: 'var(--foreground)', fontSize: '24px', textAlign: 'center', marginBottom: '32px' }}>
            My Visual Journal
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: 'var(--muted)', marginBottom: '8px', overflow: 'hidden' }}>
                  {/* We use standard img tag for html2canvas compatibility issues with next/image sometimes */}
                  <img
                    src={photo.image_url}
                    alt="Journal"
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous" // Crucial for CORS images in canvas
                  />
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--foreground)', marginBottom: '4px' }}>{photo.caption}</p>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {format(new Date(photo.taken_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Generated by Polaroida
          </div>
        </div>
      </div>
    </main>
  );
}
