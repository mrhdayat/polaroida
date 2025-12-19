"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Photo } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Fix for Leaflet default icon issues in Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Component to handle map bounds
function MapBounds({ photos }: { photos: Photo[] }) {
  const map = useMap();

  useEffect(() => {
    if (photos.length > 0) {
      const bounds = L.latLngBounds(photos.map(p => [p.location_lat!, p.location_lng!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [photos, map]);

  return null;
}

export default function InteractiveMap() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fix leaflet marker icons
    // We need to manually set these because webpack/nextjs messes up leaflet asset imports
    // For now, let's use a simple CDN fallback if local assets fail or just standard divIcon
    // L.Marker.prototype.options.icon = DefaultIcon; 

    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const res = await fetch("/api/photos");
    if (res.ok) {
      const data: Photo[] = await res.json();
      // Filter only photos with location data
      const mapped = data.filter(p => p.location_lat && p.location_lng);
      setPhotos(mapped);
    }
  };

  // Custom DivIcon for Polaroid Markers
  const createPolaroidIcon = (imageUrl: string) => {
    return L.divIcon({
      className: "custom-pin",
      html: `<div style="
        background: white; 
        padding: 2px; 
        border-radius: 2px; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        width: 40px;
        height: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          width: 36px; 
          height: 36px; 
          background-image: url('${imageUrl}'); 
          background-size: cover;
          background-position: center;
          background-color: #eee;
        "></div>
      </div>`,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
    });
  };

  // If no photos with location, fallback center (Indonesia)
  const center = [-2.5489, 118.0149] as [number, number];

  return (
    <div className="h-[calc(100vh-64px)] w-full z-0">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Minimalist Light Map
        />

        {photos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.location_lat!, photo.location_lng!]}
            icon={createPolaroidIcon(photo.image_url)}
            eventHandlers={{
              click: () => {
                // router.push(`/photo/${photo.id}`); // Optional: navigate on click
              },
            }}
          >
            <Popup className="polaroid-popup">
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => router.push(`/photo/${photo.id}`)}
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-sm bg-gray-100">
                  <Image
                    src={photo.image_url}
                    alt="Map Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-gray-700">{photo.location_name || "Unknown"}</p>
                <p className="text-[10px] text-gray-500">{new Date(photo.taken_at).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBounds photos={photos} />
      </MapContainer>
    </div>
  );
}
