import { usePits } from "@/context/PitsContext";
import { useIbgeData } from "@/hooks/useIBGE";
import { useAlertasData } from "@/hooks/useAlertas";
import { useMemo, useState, useEffect } from "react";
import IPSEGauge from "@/components/IPSEGauge";
import SubIndexCard from "@/components/SubIndexCard";
import MapaCaatinga from "@/components/MapaCaatinga";
import { getAlerts } from "@/data/mockData";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { PitsLineChart } from "@/components/charts/PitsCharts";
import { Leaf, Users, Zap, Shield, AlertTriangle, Satellite, Flame, Download, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportVisualReportPDF } from "@/lib/generatePDF";
import { toast } from "sonner";

export default function Dashboard() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.municipio);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const { data: ibge, isFetching: ibgeLoading, error: ibgeApiError } = useIbgeData(m.municipio, m.estado);
  const { data: alertas, isFetching: alertasLoading } = useAlertasData(mb?.codigoIBGE);
  
  const ibgeError = ibgeApiError ? ibgeApiError.message : null;
  const desmatAlerts = alertas || [];

  const alerts = getAlerts(m);
  const pop = ibge?.populacao ?? m.populacao;
  const area = ibge?.area_km2 ?? m.area_km2;

  const desmatTotalHa = desmatAlerts.reduce((s, a) => s + a.areaHa, 0);

  const dynamicIpseHistorico = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const year = 2020 + i;
      const factor = 1 - (4 - i) * 0.04;
      return {
        ano: year,
        valor: Number((m.IPSE * factor).toFixed(2)),
      };
    });
  }, [m.IPSE]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Gerando PDF visual... Pode levar alguns segundos.");
    try {
      await exportVisualReportPDF("dashboard-content", `PITS_Dashboard_${m.municipio}`);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar PDF.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6 relative bg-background pb-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard — {m.municipio}</h1>
          <p className="text-sm text-muted-foreground">
            {m.estado}{ibge?.mesorregiao ? ` • ${ibge.mesorregiao}` : ""} • {area.toLocaleString("pt-BR")} km² • {pop.toLocaleString("pt-BR")} hab.
            {ibgeLoading && <span className="ml-2 text-xs text-accent animate-pulse">Atualizando IBGE...</span>}
            {ibgeError && <span className="ml-2 text-xs text-destructive">⚠️ Falha no IBGE ({ibgeError})</span>}
            {!ibgeError && ibge && <span className="ml-2 text-xs text-success">✓ IBGE</span>}
            {mb && <span className="ml-1 text-xs text-success">✓ MapBiomas</span>}
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} variant="default" className="w-full sm:w-auto">
          {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
          Exportar Visual
        </Button>
      </div>

      {isOffline && (
        <div className="bg-amber-500/10 border border-amber-500/50 text-amber-700 dark:text-amber-400 p-4 rounded-lg flex items-center mb-6">
          <WifiOff className="mr-3" size={24} />
          <div>
            <h3 className="font-bold">Modo Offline Ativado</h3>
            <p className="text-sm">Você está em uma área sem internet. Mostrando dados do município em cache restrito PWA.</p>
          </div>
        </div>
      )}

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
          <PitsLineChart
            data={dynamicIpseHistorico}
            xKey="ano"
            height={260}
            yDomain={[0, 1]}
            lines={[{
              key: "valor",
              name: "IPSE",
              color: "hsl(var(--primary))",
              strokeWidth: 3,
              dotRadius: 5,
            }]}
          />
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
