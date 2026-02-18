import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

const LocationPicker = ({ latitude, longitude, onLocationChange }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = latitude ? parseFloat(latitude) : null;
  const parsedLng = longitude ? parseFloat(longitude) : null;
  const hasCoords = parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center: [number, number] = hasCoords ? [parsedLat!, parsedLng!] : [-19.015, 29.155];
    const zoom = hasCoords ? 14 : 6;

    const map = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add initial marker if coords exist
    if (hasCoords) {
      markerRef.current = L.marker([parsedLat!, parsedLng!], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        onLocationChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
      });
    }

    // Click to place/move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onLocationChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when manual input changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([parsedLat!, parsedLng!]);
      } else {
        markerRef.current = L.marker([parsedLat!, parsedLng!], { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onLocationChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">Shop Location *</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Click on the map to set your shop's location, or drag the marker to adjust. You can also type coordinates manually below.
      </p>
      <div
        ref={mapRef}
        className="w-full rounded-lg border overflow-hidden"
        style={{ height: "320px" }}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLocationChange(e.target.value, longitude)}
            placeholder="e.g. -17.8252"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLocationChange(latitude, e.target.value)}
            placeholder="e.g. 31.0335"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
