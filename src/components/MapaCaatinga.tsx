import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { usePits } from "@/context/PitsContext";
import { useAlertasData } from "@/hooks/useAlertas";
import { useIbgeData } from "@/hooks/useIBGE";
import FonteInfo from "./FonteInfo";

// Cache em memória para GeoJSON das malhas do IBGE
const malhasGeoJsonCache = new Map<string, GeoJsonObject>();

export default function MapaCaatinga() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const centroidMarkerRef = useRef<L.CircleMarker | null>(null);
  const alertLayerGroup = useRef<L.LayerGroup | null>(null);

  const { selectedMunicipio } = usePits();
  const codigoIBGE = selectedMunicipio.codigoIBGE;

  const { data: ibge } = useIbgeData(selectedMunicipio.municipio, selectedMunicipio.estado);
  const lat = ibge?.latitude ?? -5.5;
  const lng = ibge?.longitude ?? -39.0;

  const {
    data: alertasRaw,
    isFetching: alertasLoading,
    isError: alertasError,
  } = useAlertasData(codigoIBGE);

  const [geoJsonLoading, setGeoJsonLoading] = useState(false);
  const [geoJsonError, setGeoJsonError] = useState<string | null>(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-5.5, -39.0],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    alertLayerGroup.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

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

  // Busca o GeoJSON real da malha municipal do IBGE
  const loadMunicipalBoundary = useCallback(async (code: string) => {
    if (!code) return null;
    if (malhasGeoJsonCache.has(code)) {
      return malhasGeoJsonCache.get(code) ?? null;
    }
    setGeoJsonLoading(true);
    setGeoJsonError(null);
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${code}?formato=application/vnd.geo+json`
      );
      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao carregar malha territorial do IBGE`);
      }
      const data = (await res.json()) as GeoJsonObject;
      malhasGeoJsonCache.set(code, data);
      return data;
    } catch (err: unknown) {
      console.warn("[MapaCaatinga] Falha ao carregar limite do IBGE:", err);
      setGeoJsonError(err instanceof Error ? err.message : "Falha na malha");
      return null;
    } finally {
      setGeoJsonLoading(false);
    }
  }, []);

  // Atualiza limite municipal e centróide quando muda município
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    let isMounted = true;

    // Remove camadas anteriores
    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.removeFrom(map);
      boundaryLayerRef.current = null;
    }
    if (centroidMarkerRef.current) {
      centroidMarkerRef.current.removeFrom(map);
      centroidMarkerRef.current = null;
    }

    // Carrega o polígono real da malha municipal
    loadMunicipalBoundary(codigoIBGE).then((geoJson) => {
      if (!isMounted || !map) return;

      if (geoJson && showBoundary) {
        const geoLayer = L.geoJSON(geoJson, {
          style: {
            color: "hsl(var(--secondary))",
            weight: 2.5,
            fillColor: "hsl(var(--secondary))",
            fillOpacity: 0.18,
          },
        });

        geoLayer.bindTooltip(
          `<strong>${selectedMunicipio.municipio} (${selectedMunicipio.estado})</strong><br/>Limite Municipal Oficial — IBGE Censo 2022`,
          { sticky: true }
        );

        geoLayer.addTo(map);
        boundaryLayerRef.current = geoLayer;

        try {
          map.fitBounds(geoLayer.getBounds(), { padding: [25, 25], maxZoom: 11 });
        } catch {
          map.flyTo([lat, lng], 9);
        }
      } else {
        map.flyTo([lat, lng], 9);
      }

      // Adiciona marcador de centróide municipal
      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        color: "hsl(var(--primary))",
        fillColor: "hsl(var(--primary))",
        fillOpacity: 0.9,
        weight: 2,
      });

      marker.bindPopup(
        `<div style="font-size:12px">
          <strong>${selectedMunicipio.municipio} — ${selectedMunicipio.estado}</strong><br/>
          Código IBGE: ${codigoIBGE}<br/>
          Área: ${selectedMunicipio.area_km2.toLocaleString("pt-BR")} km²<br/>
          População: ${selectedMunicipio.populacao.toLocaleString("pt-BR")} hab.<br/>
          Vegetação Nativa: ${selectedMunicipio.cobertura_nativa_pct}%
        </div>`
      );

      marker.addTo(map);
      centroidMarkerRef.current = marker;
    });

    return () => {
      isMounted = false;
    };
  }, [codigoIBGE, lat, lng, loadMunicipalBoundary, showBoundary, selectedMunicipio]);

  // Atualiza marcadores reais de alerta de desmatamento
  useEffect(() => {
    const group = alertLayerGroup.current;
    if (!group) return;

    group.clearLayers();

    if (!showAlerts || alertasError || !alertasRaw) return;

    alertasRaw.forEach((alerta) => {
      if (!alerta.centroid) return;

      const marker = L.circleMarker([alerta.centroid.lat, alerta.centroid.lng], {
        radius: Math.min(Math.max(alerta.areaHa / 5, 5), 16),
        color: "hsl(var(--destructive))",
        fillColor: "hsl(var(--destructive))",
        fillOpacity: 0.5,
        weight: 2,
      });

      const date = alerta.detectedAt
        ? new Date(alerta.detectedAt).toLocaleDateString("pt-BR")
        : "Data indisponível";

      marker.bindTooltip(
        `<div style="font-size:11px">
          <strong>🔥 Alerta ${alerta.alertCode}</strong><br/>
          Data detecção: ${date}<br/>
          Área: ${alerta.areaHa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha<br/>
          Fonte: MapBiomas Alerta (SAD-Caatinga)
        </div>`,
        { sticky: true }
      );

      marker.addTo(group);
    });
  }, [alertasRaw, showAlerts, alertasError]);

  const toggleBoundary = () => {
    const map = mapInstance.current;
    if (!map || !boundaryLayerRef.current) {
      setShowBoundary(!showBoundary);
      return;
    }
    if (showBoundary) {
      boundaryLayerRef.current.removeFrom(map);
    } else {
      boundaryLayerRef.current.addTo(map);
    }
    setShowBoundary(!showBoundary);
  };

  const toggleAlerts = () => {
    const map = mapInstance.current;
    if (!map || !alertLayerGroup.current) return;
    const next = !showAlerts;
    if (next) {
      alertLayerGroup.current.addTo(map);
    } else {
      alertLayerGroup.current.removeFrom(map);
    }
    setShowAlerts(next);
  };

  // Texto descritivo dos alertas de desmatamento (Regra G8 / D11: nunca "0 alertas" quando falha)
  const getAlertsButtonLabel = () => {
    if (alertasLoading) return "Alertas Desmatamento ⏳";
    if (alertasError) return "Alertas Desmatamento (Dados indisponíveis)";
    if (alertasRaw && alertasRaw.length > 0) return `Alertas Desmatamento (${alertasRaw.length})`;
    if (selectedMunicipio.alertas_desmatamento > 0) return `Alertas Desmatamento (${selectedMunicipio.alertas_desmatamento})`;
    return "Alertas Desmatamento (Sem alertas)";
  };

  return (
    <div tabIndex={0} className="group pits-card space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="pits-section-title flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Mapa Territorial Oficial — {selectedMunicipio.municipio}
          </h2>
          <p className="pits-reveal text-xs text-muted-foreground mt-0.5">
            Código IBGE: {codigoIBGE} • Centroide geodésico: {lat.toFixed(4)}°, {lng.toFixed(4)}° • Malha oficial Censo 2022
          </p>
        </div>
        <div className="flex items-center gap-2">
          {geoJsonLoading && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 animate-pulse">
              <Loader2 size={12} className="animate-spin" /> Carregando malha IBGE...
            </span>
          )}
          {geoJsonError && (
            <span className="text-[11px] text-destructive flex items-center gap-1">
              <AlertTriangle size={12} /> Malha IBGE indisponível
            </span>
          )}
        </div>
      </div>

      {/* Camadas reais */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleBoundary}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
            showBoundary ? "border-border bg-card shadow-sm" : "border-transparent bg-muted/50 opacity-60"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-secondary" />
          Limite Municipal (IBGE Malhas 2022)
        </button>

        <button
          onClick={toggleAlerts}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
            showAlerts ? "border-border bg-card shadow-sm" : "border-transparent bg-muted/50 opacity-60"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-destructive" />
          {getAlertsButtonLabel()}
        </button>
      </div>

      {/* Container do Mapa */}
      <div
        ref={mapRef}
        className="w-full h-[380px] rounded-lg overflow-hidden border border-border/60 shadow-sm bg-muted/20 relative z-0"
      />

      {/* Proveniência do Mapa */}
      <FonteInfo
        instituicao="IBGE Malhas Municipais e MapBiomas Alerta"
        ano="2022–2026"
        dataConsulta="11/10/2026"
        tabela="Malhas v3 e API Alerta v2 (SAD-Caatinga)"
        url="https://servicodados.ibge.gov.br/api/v3/malhas/municipios"
        selo="MapBiomas"
      />
    </div>
  );
}
