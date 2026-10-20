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
import FonteInfo from "@/components/FonteInfo";

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
  const {
    data: alertas,
    isFetching: alertasLoading,
    isError: alertasError,
  } = useAlertasData(m.codigoIBGE);

  const ibgeError = ibgeApiError ? ibgeApiError.message : null;
  const alerts = getAlertasOficiais(m);

  // População e Área auditadas do Censo 2022
  const pop = ibge?.populacao ?? m.populacao;
  const area = ibge?.area_km2 ?? m.area_km2;

  // Série histórica real baseada na série anual da Coleção 11 do MapBiomas (2018–2025)
  const serieHistoricaReal = useMemo(() => {
    if (!mb || !mb.serie_vegetacao_nativa || mb.serie_vegetacao_nativa.length === 0) {
      return [];
    }
    return mb.serie_vegetacao_nativa.map((item) => ({
      ano: item.ano,
      vegetacao_pct: item.pct,
    }));
  }, [mb]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Gerando PDF visual da plataforma...");
    try {
      await exportVisualReportPDF("dashboard-content", `PITS_Dashboard_${m.municipio}`);
      toast.success("PDF visual gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar PDF.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Texto formatado dos alertas (Regra G8 / D11: nunca "0 alertas" quando a consulta falhar)
  const getAlertasDisplay = () => {
    if (alertasLoading) return "Consultando...";
    if (alertasError) return "Dados indisponíveis";
    if (alertas && alertas.length > 0) return `${alertas.length} alertas`;
    if (m.alertas_desmatamento > 0) return `${m.alertas_desmatamento} alertas`;
    return "0 alertas validados";
  };

  return (
    <div id="dashboard-content" className="space-y-6 relative bg-background pb-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard — {m.municipio}</h1>
          <p className="text-sm text-muted-foreground">
            {m.estado}{ibge?.mesorregiao ? ` • ${ibge.mesorregiao}` : ""} • {area.toLocaleString("pt-BR")} km² • {pop.toLocaleString("pt-BR")} hab.
            {ibgeLoading && <span className="ml-2 text-xs text-accent-readable animate-pulse">Consultando IBGE...</span>}
            {ibgeError && <span className="ml-2 text-xs text-destructive">⚠️ Falha na API IBGE ({ibgeError})</span>}
            {!ibgeError && ibge && <span className="ml-2 text-xs text-success font-medium">✓ IBGE Censo 2022</span>}
            {mb && <span className="ml-1 text-xs text-success font-medium">✓ MapBiomas Col. 11</span>}
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
            <p className="text-sm">Você está em uma área sem conexão. Dados em cache local do PWA.</p>
          </div>
        </div>
      )}

      {/* Seção Central: IPSE Oficial (Artigo) + Indicadores de Apoio Setoriais */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Modelo Oficial do Artigo: IPSE = PEL / IVS* • Indicadores de Diagnóstico Setorial
          </h2>
          <span className="text-[11px] text-muted-foreground">
            IVS alto = maior vulnerabilidade
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* IPSE Oficial */}
          <div className="pits-card flex flex-col items-center justify-center lg:col-span-1">
            <IPSEGauge value={m.IPSE_norm} rawIpse={m.IPSE} />
            <FonteInfo
              instituicao="PITS / Modelo Oficial (Artigo)"
              ano={2026}
              dataConsulta="11/10/2026"
              tabela="Eq. 1 (PEL), Eq. 4 (IVS) e Eq. 6 (IPSE)"
              className="mt-1"
            />
          </div>

          {/* 4 Indicadores de Apoio Setoriais */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <SubIndexCard
              label="Biomassa / Veg. Nativa"
              acronym="IB"
              value={m.IB}
              icon={Leaf}
              tooltip="Proporção da área territorial em formações nativas da Caatinga. Fonte: MapBiomas Coleção 11 (2025)."
              variavelManifest="cobertura_vegetal_nativa_2025"
              codigoIBGE={m.codigoIBGE}
            />
            <SubIndexCard
              label="Vulnerabilidade Social"
              acronym="IVS"
              value={m.IVS}
              icon={Users}
              inverted={true}
              tooltip="Média das carências domiciliares em água, esgoto, lixo e energia (Eq. 4). DIREÇÃO: menor valor indica menor vulnerabilidade."
              variavelManifest="ivs_proprio_censo2022"
              codigoIBGE={m.codigoIBGE}
            />
            <SubIndexCard
              label="Infraestrutura Energética"
              acronym="IIE"
              value={m.IIE}
              icon={Zap}
              tooltip="Adoção rural de práticas conservacionistas, SAFs e fontes renováveis descentralizadas."
              variavelManifest="safs_censoagro2017"
              codigoIBGE={m.codigoIBGE}
            />
            <SubIndexCard
              label="Governança Local e Resíduos"
              acronym="IGL"
              value={m.IGL}
              icon={Shield}
              tooltip="Gestão socioambiental municipal medida pela cota-parte do IQM (resíduos sólidos) e associativismo rural."
              variavelManifest="iqm_residuos_solidos"
              codigoIBGE={m.codigoIBGE}
            />
          </div>
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Série Real de Vegetação Nativa */}
        <div tabIndex={0} className="group pits-card lg:col-span-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="pits-section-title">Evolução Histórica da Vegetação Nativa (2018–2025)</h2>
              <p className="pits-reveal text-xs text-muted-foreground">
                Dados anuais auditados da Coleção 11 do MapBiomas Brasil (classes nativas: florestal, savânica e campestre)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-secondary/15 text-secondary border border-secondary/25 rounded-full font-semibold">
              Atual: {m.cobertura_nativa_pct}%
            </span>
          </div>

          {serieHistoricaReal.length > 0 ? (
            <PitsLineChart
              data={serieHistoricaReal}
              xKey="ano"
              height={250}
              yDomain={[0, 100]}
              lines={[{
                key: "vegetacao_pct",
                name: "Vegetação Nativa (%)",
                color: "hsl(var(--secondary))",
                strokeWidth: 3,
                dotRadius: 4,
              }]}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground italic">
              Histórico indisponível
            </div>
          )}

          <FonteInfo
            variavel="cobertura_vegetal_nativa_2025"
            codigoIBGE={m.codigoIBGE}
            selo="MapBiomas"
          />
        </div>

        {/* Alertas e Recomendações */}
        <div className="pits-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="pits-section-title flex items-center gap-2">
                <AlertTriangle size={18} className="text-accent-readable" />
                Alertas e Recomendações
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent-readable border border-accent/30">
                {alerts.length} {alerts.length === 1 ? "item" : "itens"}
              </span>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert, i) => {
                  const dotIdx = alert.indexOf(". ");
                  const headline = dotIdx > 0 ? alert.slice(0, dotIdx + 1) : alert;
                  const detail = dotIdx > 0 ? alert.slice(dotIdx + 2) : "";
                  return (
                    <div
                      key={i}
                      tabIndex={0}
                      className="group flex gap-2 text-sm p-3 bg-accent/10 rounded-lg border border-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <AlertTriangle size={14} className="text-accent-readable shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">{headline}</p>
                        {detail && (
                          <p className="pits-reveal text-xs text-muted-foreground mt-1">{detail}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">Nenhum alerta crítico ativo no momento.</p>
              )}
            </div>
          </div>
          <FonteInfo
            instituicao="PITS / Regras Especializadas"
            ano={2026}
            dataConsulta="11/10/2026"
            tabela="Regras territoriais baseadas em Censo 2022, PEVS e MapBiomas"
          />
        </div>
      </div>

      {/* Mapa do Território Oficial */}
      <MapaCaatinga />

      {/* Dados Territoriais e Operacionais Auditados */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Vegetação Nativa",
            value: `${m.cobertura_nativa_pct}%`,
            sub: `${m.area_nativa_ha.toLocaleString("pt-BR")} ha`,
            variavel: "cobertura_vegetal_nativa_2025",
            color: "text-secondary",
          },
          {
            label: "Densidade de Biomassa",
            value: `${m.estoque_biomassa_t_ha} t/ha`,
            sub: "Média IFN-CE / SFB",
            variavel: "biomassa_densidade_t_ha",
            color: "",
          },
          {
            label: "Lenha Extraída",
            value: `${(m.lenha_pevs_m3_ano / 1000).toFixed(1)}k m³/ano`,
            sub: "Extração Vegetal PEVS",
            variavel: "lenha_extrativismo_vegetal",
            color: "",
          },
          {
            label: "Cota ICMS Resíduos (IQM)",
            value: `IQM ${m.iqm_residuos.toFixed(1)}`,
            sub: "Gestão Resíduos Sólidos",
            variavel: "iqm_residuos_solidos",
            color: "",
          },
          {
            label: "MapBiomas Alerta",
            value: getAlertasDisplay(),
            sub: alertasError ? "Falha na API SAD" : `${m.area_desmatamento_alertas_ha.toFixed(1)} ha validados`,
            variavel: "alertas_desmatamento_mapbiomas",
            color: (m.alertas_desmatamento > 0 && !alertasError) ? "text-destructive" : "",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            tabIndex={0}
            className="group pits-card flex flex-col justify-between text-center last:col-span-2 md:last:col-span-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div>
              <p className="pits-label text-[11px]">{stat.label}</p>
              <p className={`pits-metric text-xl sm:text-2xl mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="pits-reveal text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
            </div>
            <FonteInfo variavel={stat.variavel} codigoIBGE={m.codigoIBGE} />
          </div>
        ))}
      </div>
    </div>
  );
}
