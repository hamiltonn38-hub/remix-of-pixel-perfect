import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { useAlertasData } from "@/hooks/useAlertas";
import { useIbgeData } from "@/hooks/useIBGE";

function generateThematicLayers(centerLat: number, centerLng: number) {
  return [
    {
      id: "vegetacao",
      label: "Cobertura vegetal nativa",
      color: "#4A7C59",
      positions: [
        [centerLat + 0.15, centerLng - 0.15],
        [centerLat + 0.20, centerLng - 0.05],
        [centerLat + 0.12, centerLng + 0.05],
        [centerLat + 0.05, centerLng + 0.00],
        [centerLat + 0.08, centerLng - 0.12],
      ] as [number, number][],
    },
    {
      id: "conservacao",
      label: "Conservação prioritária",
      color: "#2d5a3a",
      positions: [
        [centerLat + 0.00, centerLng - 0.20],
        [centerLat + 0.05, centerLng - 0.10],
        [centerLat - 0.02, centerLng - 0.02],
        [centerLat - 0.08, centerLng - 0.08],
        [centerLat - 0.05, centerLng - 0.18],
      ] as [number, number][],
    },
    {
      id: "producao",
      label: "Produção sustentável",
      color: "#D4A843",
      positions: [
        [centerLat + 0.25, centerLng + 0.25],
        [centerLat + 0.30, centerLng + 0.15],
        [centerLat + 0.22, centerLng + 0.08],
        [centerLat + 0.17, centerLng + 0.15],
        [centerLat + 0.20, centerLng + 0.22],
      ] as [number, number][],
    },
    {
      id: "restauracao",
      label: "Restauração biocultural",
      color: "#C0772B",
      positions: [
        [centerLat - 0.10, centerLng + 0.10],
        [centerLat - 0.05, centerLng + 0.18],
        [centerLat - 0.12, centerLng + 0.25],
        [centerLat - 0.18, centerLng + 0.20],
        [centerLat - 0.15, centerLng + 0.12],
      ] as [number, number][],
    },
    {
      id: "recarga",
      label: "Zonas de recarga hídrica",
      color: "#2E6B8A",
      positions: [
        [centerLat + 0.10, centerLng + 0.15],
        [centerLat + 0.15, centerLng + 0.22],
        [centerLat + 0.08, centerLng + 0.30],
        [centerLat + 0.02, centerLng + 0.25],
        [centerLat + 0.05, centerLng + 0.18],
      ] as [number, number][],
    },
  ];
}

export default function MapaCaatinga() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerRefs = useRef<Record<string, L.Polygon>>({});
  const alertLayerGroup = useRef<L.LayerGroup | null>(null);
  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.municipio);
  
  const { data: ibge } = useIbgeData(selectedMunicipio.municipio, selectedMunicipio.estado);
  const lat = ibge?.latitude ?? -5.5;
  const lng = ibge?.longitude ?? -39.0;
  
  const currentLayers = useMemo(() => generateThematicLayers(lat, lng), [lat, lng]);

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    { ...Object.fromEntries(currentLayers.map((l) => [l.id, true])), desmatamento: true }
  );

  const { data: alertasRaw, isFetching: alertasLoading } = useAlertasData(mb?.codigoIBGE);
  const alertas = alertasRaw || [];

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

    // Polygons will be added by the effect below that watches coordinates
    
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

  // Sync map center and thematic layers with municipality
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    
    // Pan smoothly to new center
    map.flyTo([lat, lng], 9, { duration: 1 });

    // Remove old polygons
    Object.values(layerRefs.current).forEach(p => p.removeFrom(map));
    layerRefs.current = {};

    // Restore polygons with new coordinates
    currentLayers.forEach((layer) => {
      const polygon = L.polygon(layer.positions, {
        color: layer.color,
        fillColor: layer.color,
        fillOpacity: 0.3,
        weight: 2,
      });
      polygon.bindTooltip(layer.label, { sticky: true });
      layerRefs.current[layer.id] = polygon;
      
      if (activeLayers[layer.id] !== false) {
        polygon.addTo(map);
      }
    });
  }, [lat, lng, currentLayers, activeLayers]);

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
    ...currentLayers,
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
