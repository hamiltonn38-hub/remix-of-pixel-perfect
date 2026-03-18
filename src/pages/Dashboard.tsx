import { useEffect, useState } from "react";
import { usePits } from "@/context/PitsContext";
import IPSEGauge from "@/components/IPSEGauge";
import SubIndexCard from "@/components/SubIndexCard";
import MapaCaatinga from "@/components/MapaCaatinga";
import { ipseHistorico, getAlerts } from "@/data/mockData";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { fetchAlertasMunicipio, MapBiomasAlerta } from "@/lib/mapbiomasAlertaApi";
import { Leaf, Users, Zap, Shield, AlertTriangle, Satellite, Flame } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { selectedMunicipio: m, ibgeData, ibgeLoading } = usePits();
  const alerts = getAlerts(m);
  const ibge = ibgeData[m.municipio];
  const mb = getMapBiomasMunicipio(m.municipio);
  const pop = ibge?.populacao ?? m.populacao;
  const area = ibge?.area_km2 ?? m.area_km2;

  // MapBiomas Alerta real data
  const [desmatAlerts, setDesmatAlerts] = useState<MapBiomasAlerta[]>([]);
  useEffect(() => {
    if (!mb?.codigoIBGE) return;
    let cancelled = false;
    fetchAlertasMunicipio(mb.codigoIBGE)
      .then((data) => { if (!cancelled) setDesmatAlerts(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [mb?.codigoIBGE]);
  const desmatTotalHa = desmatAlerts.reduce((s, a) => s + a.areaHa, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard — {m.municipio}</h1>
        <p className="text-sm text-muted-foreground">
          {m.estado}{ibge?.mesorregiao ? ` • ${ibge.mesorregiao}` : ""} • {area.toLocaleString("pt-BR")} km² • {pop.toLocaleString("pt-BR")} hab.
          {ibgeLoading && <span className="ml-2 text-xs text-accent animate-pulse">Atualizando IBGE...</span>}
          {ibge && <span className="ml-2 text-xs text-success">✓ IBGE</span>}
          {mb && <span className="ml-1 text-xs text-success">✓ MapBiomas</span>}
        </p>
      </div>

      {/* IPSE Gauge + Sub-indices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="pits-card flex items-center justify-center lg:col-span-1">
          <IPSEGauge value={m.IPSE} />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SubIndexCard label="Biomassa Disponível" acronym="IB" value={m.IB} icon={Leaf} />
          <SubIndexCard label="Vulnerabilidade Socioeconômica" acronym="IVS" value={m.IVS} icon={Users} />
          <SubIndexCard label="Infraestrutura Energética" acronym="IIE" value={m.IIE} icon={Zap} />
          <SubIndexCard label="Governança Local" acronym="IGL" value={m.IGL} icon={Shield} />
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* IPSE Evolution */}
        <div className="pits-card lg:col-span-2">
          <h2 className="pits-section-title mb-4">Evolução do IPSE (2020–2024)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ipseHistorico}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
                name="IPSE"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="pits-card">
          <h2 className="pits-section-title mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" />
            Alertas e Recomendações
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex gap-2 text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                <AlertTriangle size={14} className="text-accent shrink-0 mt-0.5" />
                <p>{alert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <MapaCaatinga />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Vegetação Nativa", value: `${mb?.vegetacao_nativa_pct ?? m.cobertura_arborea_pct}%`, sub: mb ? "MapBiomas Col. 9" : "Meta: ≥40%", color: "" },
          { label: "Biomassa", value: `${m.estoque_biomassa_t_ha} t/ha`, sub: "Estoque atual", color: "" },
          { label: "Biodigestores", value: m.biodigestores.toString(), sub: "Unidades instaladas", color: "" },
          { label: "PSA Distribuído", value: `R$ ${(m.psa_recursos_ano_reais / 1000).toFixed(0)}k`, sub: "Anual", color: "" },
          { label: "🔥 Desmatamento", value: `${desmatAlerts.length} alertas`, sub: desmatAlerts.length > 0 ? `${desmatTotalHa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ha • MapBiomas` : "MapBiomas Alerta", color: "text-pits-alerta" },
        ].map((stat) => (
          <div key={stat.label} className="pits-card text-center">
            <p className="pits-label text-[11px]">{stat.label}</p>
            <p className={`pits-metric text-xl mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
