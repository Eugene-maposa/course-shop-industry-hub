import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Shop {
  id: string;
  name: string;
  address?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  industries?: { name: string; code: string } | null;
  email?: string;
  phone?: string;
}

interface ShopMapProps {
  shops: Shop[];
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const statusColors: Record<string, string> = {
  active: "#22c55e",
  pending: "#eab308",
  inactive: "#ef4444",
};

const ShopMap = ({ shops }: ShopMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const shopsWithCoords = shops.filter(s => s.latitude && s.longitude);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-19.015, 29.155], 6); // Zimbabwe center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update markers when shops change
  useEffect(() => {
    if (!mapReady || !markersRef.current) return;

    markersRef.current.clearLayers();

    shopsWithCoords.forEach(shop => {
      const color = statusColors[shop.status || "pending"] || "#6b7280";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${color};
          width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([shop.latitude!, shop.longitude!], { icon });

      marker.bindPopup(`
        <div style="min-width:180px">
          <strong style="font-size:14px">${shop.name}</strong><br/>
          ${shop.industries?.name ? `<span style="color:#6b7280;font-size:12px">${shop.industries.name}</span><br/>` : ""}
          ${shop.address ? `<span style="font-size:12px">📍 ${shop.address}</span><br/>` : ""}
          ${shop.phone ? `<span style="font-size:12px">📞 ${shop.phone}</span><br/>` : ""}
          ${shop.email ? `<span style="font-size:12px">✉️ ${shop.email}</span><br/>` : ""}
          <span style="
            display:inline-block;margin-top:4px;padding:2px 8px;border-radius:12px;font-size:11px;color:white;
            background:${color}
          ">${shop.status || "pending"}</span>
        </div>
      `);

      marker.addTo(markersRef.current!);
    });

    // Fit bounds if we have markers
    if (shopsWithCoords.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        shopsWithCoords.map(s => [s.latitude!, s.longitude!] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [shopsWithCoords, mapReady]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-semibold">
            {shopsWithCoords.length} of {shops.length} shops mapped
          </span>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500 text-white">Active</Badge>
          <Badge className="bg-yellow-500 text-white">Pending</Badge>
          <Badge className="bg-red-500 text-white">Inactive</Badge>
        </div>
      </div>

      {shops.length > 0 && shopsWithCoords.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No shops have coordinates set yet. Shop owners need to provide their location during registration.
          </CardContent>
        </Card>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-lg border overflow-hidden"
        style={{ height: "500px" }}
      />
    </div>
  );
};

export default ShopMap;
