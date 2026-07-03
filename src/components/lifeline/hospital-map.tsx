import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const heart = (color: string) => L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;background:${color};border-radius:9999px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
  iconAnchor: [11, 11],
});
const me = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#1565C0;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 6px rgba(21,101,192,0.25)"></div>`,
  iconAnchor: [8, 8],
});

function Recenter({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView([center.lat, center.lng], 11); }, [center, map]);
  return null;
}

export default function HospitalMap({ items, center }: { items: Array<{ id: string; name: string; lat: number; lng: number; city: string; has_emergency: boolean; available_beds: number }>; center: { lat: number; lng: number } | null }) {
  const c = center ?? { lat: -17.8252, lng: 31.0335 };
  return (
    <MapContainer center={[c.lat, c.lng]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter center={center} />
      {center && <Marker position={[center.lat, center.lng]} icon={me}><Popup>You are here</Popup></Marker>}
      {items.map((h) => (
        <Marker key={h.id} position={[h.lat, h.lng]} icon={heart(h.has_emergency ? "#E11D48" : "#10B981")}>
          <Popup>
            <div style={{ fontFamily: "inherit", minWidth: 160 }}>
              <strong>{h.name}</strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{h.city}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{h.available_beds} beds available{h.has_emergency ? " · ER" : ""}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}