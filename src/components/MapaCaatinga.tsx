import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { fetchAlertasMunicipio, MapBiomasAlerta } from "@/lib/mapbiomasAlertaApi";

// Approximate polygons for thematic zones around Quixadá region
const layers: {
  id: string;
  label: string;
  color: string;
  positions: [number, number][];
}[] = [
  {
    id: "vegetacao",
    label: "Cobertura vegetal nativa",
    color: "#4A7C59",
    positions: [
      [-5.35, -39.15], [-5.30, -39.05], [-5.38, -38.95],
      [-5.45, -39.00], [-5.42, -39.12],
    ],
  },
  {
    id: "conservacao",
    label: "Conservação prioritária",
    color: "#2d5a3a",
    positions: [
      [-5.50, -39.20], [-5.45, -39.10], [-5.52, -39.02],
      [-5.58, -39.08], [-5.55, -39.18],
    ],
  },
  {
    id: "producao",
    label: "Produção sustentável",
    color: "#D4A843",
    positions: [
      [-5.25, -39.25], [-5.20, -39.15], [-5.28, -39.08],
      [-5.33, -39.15], [-5.30, -39.22],
    ],
  },
  {
    id: "restauracao",
    label: "Restauração biocultural",
    color: "#C0772B",
    positions: [
      [-5.60, -38.90], [-5.55, -38.82], [-5.62, -38.75],
      [-5.68, -38.80], [-5.65, -38.88],
    ],
  },
  {
    id: "recarga",
    label: "Zonas de recarga hídrica",
    color: "#2E6B8A",
    positions: [
      [-5.40, -38.85], [-5.35, -38.78], [-5.42, -38.70],
      [-5.48, -38.75], [-5.45, -38.82],
    ],
  },
];

export default function MapaCaatinga() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerRefs = useRef<Record<string, L.Polygon>>({});
  const alertLayerGroup = useRef<L.LayerGroup | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    { ...Object.fromEntries(layers.map((l) => [l.id, true])), desmatamento: true }
  );
  const [alertas, setAlertas] = useState<MapBiomasAlerta[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);

  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.municipio);

  // Fetch deforestation alerts
  useEffect(() => {
    if (!mb?.codigoIBGE) return;
    let cancelled = false;
    setAlertasLoading(true);

    fetchAlertasMunicipio(mb.codigoIBGE)
      .then((data) => { if (!cancelled) setAlertas(data); })
      .catch(() => { if (!cancelled) setAlertas([]); })
      .finally(() => { if (!cancelled) setAlertasLoading(false); });

    return () => { cancelled = true; };
  }, [mb?.codigoIBGE]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-5.5, -39.0],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    layers.forEach((layer) => {
      const polygon = L.polygon(layer.positions, {
        color: layer.color,
        fillColor: layer.color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map);
      polygon.bindTooltip(layer.label, { sticky: true });
      layerRefs.current[layer.id] = polygon;
    });

    // Create layer group for alert markers
    alertLayerGroup.current = L.layerGroup().addTo(map);

    mapInstance.current = map;

    // Fix tile rendering
    const timers = [100, 300, 800].map((ms) =>
      setTimeout(() => map.invalidateSize(), ms)
    );

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(mapRef.current);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update alert markers when alertas change
  useEffect(() => {
    const group = alertLayerGroup.current;
    if (!group) return;

    group.clearLayers();

    if (!activeLayers.desmatamento) return;

    alertas.forEach((alerta) => {
      if (!alerta.centroid) return;

      const marker = L.circleMarker([alerta.centroid.lat, alerta.centroid.lng], {
        radius: Math.min(Math.max(alerta.areaHa / 5, 5), 18),
        color: "#C0392B",
        fillColor: "#C0392B",
        fillOpacity: 0.5,
        weight: 2,
      });

      const date = new Date(alerta.detectedAt).toLocaleDateString("pt-BR");
      marker.bindTooltip(
        `<div style="font-size:11px">
          <strong>🔥 Alerta ${alerta.alertCode}</strong><br/>
          Data: ${date}<br/>
          Área: ${alerta.areaHa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha<br/>
          Fonte: ${alerta.source}
        </div>`,
        { sticky: true }
      );

      marker.addTo(group);
    });
  }, [alertas, activeLayers.desmatamento]);

  const toggleLayer = (id: string) => {
    const map = mapInstance.current;
    if (!map) return;

    if (id === "desmatamento") {
      const newState = !activeLayers.desmatamento;
      if (newState && alertLayerGroup.current) {
        alertLayerGroup.current.addTo(map);
      } else if (alertLayerGroup.current) {
        alertLayerGroup.current.removeFrom(map);
      }
      setActiveLayers((prev) => ({ ...prev, desmatamento: newState }));
      return;
    }

    const polygon = layerRefs.current[id];
    if (!polygon) return;

    const newState = !activeLayers[id];
    if (newState) {
      polygon.addTo(map);
    } else {
      polygon.removeFrom(map);
    }
    setActiveLayers((prev) => ({ ...prev, [id]: newState }));
  };

  const allLayers = [
    ...layers,
    { id: "desmatamento", label: `Alertas Desmatamento${alertasLoading ? " ⏳" : ` (${alertas.length})`}`, color: "#C0392B" },
  ];

  return (
    <div className="pits-card">
      <h2 className="pits-section-title mb-3 flex items-center gap-2">
        <MapPin size={18} className="text-primary" />
        Mapa Territorial
      </h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {allLayers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeLayers[layer.id]
                ? "border-border bg-card shadow-sm"
                : "border-transparent bg-muted/50 opacity-50"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: layer.color, opacity: activeLayers[layer.id] ? 1 : 0.3 }}
            />
            {layer.label}
          </button>
        ))}
      </div>
      <div ref={mapRef} className="w-full h-[380px] rounded-lg overflow-hidden border border-border" />
    </div>
  );
}
