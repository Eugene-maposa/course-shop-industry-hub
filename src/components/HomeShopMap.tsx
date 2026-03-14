import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
      const { data, error } = await (supabase as any).rpc("get_public_shops");
      if (error) throw error;
      return ((data || []) as any[])
        .map((shop) => ({
          ...shop,
          industries: {
            name: shop.industry_name,
            code: shop.industry_code,
          },
        }))
        .filter((shop) => shop.latitude && shop.longitude);
    },
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([-20.2325, 28.6929], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, []);

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
          width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([shop.latitude, shop.longitude], { icon });

      const tooltipContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #111;">${shop.name}</div>
          ${shop.industries?.name ? `<div style="color: #6b7280; font-size: 12px; margin-bottom: 3px;">🏭 ${shop.industries.name}</div>` : ""}
          ${shop.address ? `<div style="font-size: 12px; margin-bottom: 3px; color: #374151;">📍 ${shop.address}</div>` : ""}
          ${shop.phone ? `<div style="font-size: 12px; margin-bottom: 3px; color: #374151;">📞 ${shop.phone}</div>` : ""}
          ${shop.email ? `<div style="font-size: 12px; margin-bottom: 3px; color: #374151;">✉️ ${shop.email}</div>` : ""}
          <div style="display:inline-block; margin-top:6px; padding:2px 10px; border-radius:99px; font-size:11px; color:white; background:${color}; font-weight:600;">${shop.status || "pending"}</div>
          <div style="font-size:11px; color: hsl(210,100%,40%); margin-top:8px; font-weight:600;">Click to view shop →</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        sticky: false,
        opacity: 0.97,
        className: "shop-tooltip",
      });

      marker.on("click", () => navigate(`/shops`));
      marker.addTo(markersRef.current!);
    });

    const withCoords = shops.filter((s: any) => s.latitude && s.longitude);
    if (withCoords.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        withCoords.map((s: any) => [s.latitude, s.longitude] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [shops, navigate]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Store className="w-4 h-4" />
            Interactive Map
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Registered Shops Map
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Explore registered shops across Zimbabwe. Hover to preview details or click to visit.
          </p>
          <div className="flex items-center justify-center gap-5 mt-5">
            {[
              { color: "bg-green-500", label: "Active" },
              { color: "bg-yellow-500", label: "Pending" },
              { color: "bg-red-500", label: "Inactive" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {shops.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No shops with locations registered yet.</p>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full rounded-2xl border border-border shadow-lg overflow-hidden"
          style={{ height: "520px" }}
        />
      </div>

      <style>{`
        .shop-tooltip {
          border-radius: 12px !important;
          padding: 12px 16px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
        }
        .shop-tooltip::before {
          border-top-color: white !important;
        }
        .custom-marker:hover div {
          transform: rotate(-45deg) scale(1.25) !important;
        }
      `}</style>
    </section>
  );
};

export default HomeShopMap;
