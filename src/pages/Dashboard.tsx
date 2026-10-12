import { usePits } from "@/context/PitsContext";
import { useIbgeData } from "@/hooks/useIBGE";
import { useAlertasData } from "@/hooks/useAlertas";
import { useMemo, useState, useEffect } from "react";
import IPSEGauge from "@/components/IPSEGauge";
import SubIndexCard from "@/components/SubIndexCard";
import MapaCaatinga from "@/components/MapaCaatinga";
import { getAlertasOficiais } from "@/data/municipiosData";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { PitsLineChart } from "@/components/charts/PitsCharts";
import { Leaf, Users, Zap, Shield, AlertTriangle, Download, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportVisualReportPDF } from "@/lib/generatePDF";
import { toast } from "sonner";
import { calcPEL, calcIPSE } from "@/lib/calcPits";

export default function Dashboard() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.codigoIBGE || m.municipio);

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
  const { data: alertas, isFetching: alertasLoading } = useAlertasData(m.codigoIBGE);
  
  const ibgeError = ibgeApiError ? ibgeApiError.message : null;
  const desmatAlerts = alertas || [];

  const alerts = getAlertasOficiais(m);
  const pop = ibge?.populacao ?? m.populacao;
  const area = ibge?.area_km2 ?? m.area_km2;

  const desmatTotalHa = desmatAlerts.reduce((s, a) => s + a.areaHa, 0);

  // Série histórica real baseada na série anual do MapBiomas Coleção 11 (2018–2025)
  const serieHistoricaReal = useMemo(() => {
    if (!mb || !mb.serie_vegetacao_nativa) {
      return [];
    }
    return mb.serie_vegetacao_nativa.map((item) => {
      const areaHaAno = (item.pct / 100) * (area * 100);
      const pelAno = calcPEL(areaHaAno);
      const ipseAno = calcIPSE(pelAno, m.IVS_star);
      // Fator de escala normalizado em relação ao IPSE atual
      const ipseRel = m.IPSE > 0 && ipseAno ? Number(((ipseAno / m.IPSE) * m.IPSE_norm).toFixed(3)) : item.pct / 100;

      return {
        ano: item.ano,
        vegetacao_pct: item.pct,
        ipse_norm: ipseRel,
      };
    });
  }, [mb, area, m.IVS_star, m.IPSE, m.IPSE_norm]);

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
            {ibgeError && <span className="ml-2 text-xs text-destructive">⚠️ Falha na API IBGE ({ibgeError})</span>}
            {!ibgeError && ibge && <span className="ml-2 text-xs text-success">✓ IBGE Censo 2022</span>}
            {mb && <span className="ml-1 text-xs text-success">✓ MapBiomas Col. 11</span>}
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

      {/* Seção Central: IPSE Oficial (Artigo) + Indicadores de Apoio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Modelo Oficial (Artigo): IPSE = PEL / IVS* • Indicadores de Apoio
          </h2>
          <span className="text-[11px] text-muted-foreground">
            IVS alto = maior vulnerabilidade
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* IPSE Oficial */}
          <div className="pits-card flex items-center justify-center lg:col-span-1">
            <IPSEGauge value={m.IPSE_norm} rawIpse={m.IPSE} />
          </div>

          {/* 4 Indicadores de Apoio Setoriais */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <SubIndexCard
              label="Biomassa / Veg. Nativa"
              acronym="IB"
              value={m.IB}
              icon={Leaf}
              tooltip="Proporção da área territorial em formações nativas da Caatinga. Fonte: MapBiomas Coleção 11 (2025)."
              fonte="MapBiomas Col. 11 (2025)"
            />
            <SubIndexCard
              label="Vulnerabilidade Social"
              acronym="IVS"
              value={m.IVS}
              icon={Users}
              inverted={true}
              tooltip="Média das carências domiciliares em água, esgoto, lixo e energia (Eq. 4). DIREÇÃO: menor valor indica menor carência."
              fonte="IBGE Censo Demográfico 2022"
            />
            <SubIndexCard
              label="Infraestrutura Energética"
              acronym="IIE"
              value={m.IIE}
              icon={Zap}
              tooltip="Adoção rural de práticas conservacionistas, SAFs e fontes renováveis descentralizadas."
              fonte="IBGE Censo Agropecuário 2017"
            />
            <SubIndexCard
              label="Governança Local"
              acronym="IGL"
              value={m.IGL}
              icon={Shield}
              tooltip="Gestão socioambiental municipal medida pela cota-parte do IQM (resíduos sólidos) e associativismo."
              fonte="IPECE (IQM 2026) e IBGE"
            />
          </div>
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Série Real */}
        <div className="pits-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="pits-section-title">Evolução Histórica da Vegetação Nativa (2018–2025)</h2>
              <p className="text-xs text-muted-foreground">
                Dados anuais auditados da Coleção 11 do MapBiomas Brasil
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded font-medium">
              MapBiomas Col. 11
            </span>
          </div>

          <PitsLineChart
            data={serieHistoricaReal}
            xKey="ano"
            height={260}
            yDomain={[0, 100]}
            lines={[{
              key: "vegetacao_pct",
              name: "Vegetação Nativa (%)",
              color: "hsl(var(--secondary))",
              strokeWidth: 3,
              dotRadius: 4,
            }]}
          />
        </div>

        {/* Alertas e Recomendações */}
        <div className="pits-card">
          <h2 className="pits-section-title mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" />
            Alertas e Recomendações
          </h2>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={i} className="flex gap-2 text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <AlertTriangle size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="leading-snug">{alert}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Nenhum alerta crítico ativo no momento.</p>
            )}
          </div>
        </div>
      </div>

      {/* Mapa do Território */}
      <MapaCaatinga />

      {/* Dados Operacionais Oficiais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Vegetação Nativa",
            value: `${m.cobertura_nativa_pct}%`,
            sub: `${m.area_nativa_ha.toLocaleString("pt-BR")} ha • MapBiomas 2025`,
            color: "text-secondary",
          },
          {
            label: "Densidade de Biomassa",
            value: `${m.estoque_biomassa_t_ha} t/ha`,
            sub: "Inventário Florestal Nacional (SFB)",
            color: "",
          },
          {
            label: "Lenha Extraída",
            value: `${(m.lenha_pevs_m3_ano / 1000).toFixed(1)}k m³/ano`,
            sub: "IBGE PEVS 2025",
            color: "",
          },
          {
            label: "ICMS Socioambiental",
            value: `IQM ${m.iqm_residuos.toFixed(1)}`,
            sub: "Gestão Resíduos SEMA/IPECE 2026",
            color: "",
          },
          {
            label: "🔥 MapBiomas Alerta",
            value: `${m.alertas_desmatamento} alertas`,
            sub: `${m.area_desmatamento_alertas_ha.toFixed(1)} ha validados (SAD)`,
            color: m.alertas_desmatamento > 0 ? "text-pits-alerta" : "",
          },
        ].map((stat) => (
          <div key={stat.label} className="pits-card text-center">
            <p className="pits-label text-[11px]">{stat.label}</p>
            <p className={`pits-metric text-xl mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
