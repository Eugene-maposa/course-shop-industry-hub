import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
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

const HomeShopMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const { data: shops = [] } = useQuery({
    queryKey: ["home-shops-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select(`*, industries(name, code)`)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (error) throw error;
      return data || [];
    },
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([-19.015, 29.155], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    shops.forEach((shop: any) => {
      if (!shop.latitude || !shop.longitude) return;

      const color = statusColors[shop.status || "pending"] || "#6b7280";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${color};
          width: 24px; height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: transform 0.2s;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      const marker = L.marker([shop.latitude, shop.longitude], { icon });

      // Tooltip on hover with shop details
      const tooltipContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 160px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${shop.name}</div>
          ${shop.industries?.name ? `<div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">🏭 ${shop.industries.name}</div>` : ""}
          ${shop.address ? `<div style="font-size: 12px; margin-bottom: 2px;">📍 ${shop.address}</div>` : ""}
          ${shop.phone ? `<div style="font-size: 12px; margin-bottom: 2px;">📞 ${shop.phone}</div>` : ""}
          ${shop.email ? `<div style="font-size: 12px; margin-bottom: 2px;">✉️ ${shop.email}</div>` : ""}
          <div style="
            display: inline-block; margin-top: 4px; padding: 2px 8px;
            border-radius: 12px; font-size: 11px; color: white;
            background: ${color};
          ">${shop.status || "pending"}</div>
          <div style="font-size: 11px; color: #3b82f6; margin-top: 6px; font-weight: 500;">Click to view shop →</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        sticky: false,
        opacity: 0.95,
        className: "shop-tooltip",
      });

      // Click to navigate to shop
      marker.on("click", () => {
        navigate(`/shops`);
      });

      marker.addTo(markersRef.current!);
    });

    // Fit bounds
    const withCoords = shops.filter((s: any) => s.latitude && s.longitude);
    if (withCoords.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        withCoords.map((s: any) => [s.latitude, s.longitude] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [shops, navigate]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Store className="w-7 h-7 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Registered Shops Map
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore registered shops across Zimbabwe. Hover over a marker to see shop details, or click to view the shop.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Active
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Pending
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Inactive
            </span>
          </div>
        </div>

        {shops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No shops with locations registered yet.</p>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full rounded-xl border shadow-lg overflow-hidden"
          style={{ height: "500px" }}
        />
      </div>

      <style>{`
        .shop-tooltip {
          border-radius: 10px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          border: none !important;
        }
        .shop-tooltip::before {
          border-top-color: white !important;
        }
        .custom-marker:hover div {
          transform: rotate(-45deg) scale(1.2) !important;
        }
      `}</style>
    </section>
  );
};

export default HomeShopMap;
