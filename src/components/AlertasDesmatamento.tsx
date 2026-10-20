import { usePits } from "@/context/PitsContext";
import { useAlertasData } from "@/hooks/useAlertas";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { Satellite, AlertTriangle, Loader2, TreePine, Flame } from "lucide-react";
import { DESMAT_SEVERITY } from "@/lib/constants";
import FonteInfo from "./FonteInfo";
import Detalhes from "./Detalhes";

export default function AlertasDesmatamento() {
  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.municipio);
  const codigoIBGE = mb?.codigoIBGE || selectedMunicipio.codigoIBGE;
  const { data: alertsList, isFetching: loading, isError, error: apiError } = useAlertasData(codigoIBGE);

  const error = apiError ? apiError.message : null;
  const alerts = alertsList || [];
  const hasLoadedAlerts = !loading && !isError && alertsList !== undefined;

  if (!codigoIBGE) {
    return (
      <div className="pits-card text-center text-muted-foreground py-6">
        Código IBGE não disponível para {selectedMunicipio.municipio}.
      </div>
    );
  }

  const totalHa = alerts.reduce((sum, a) => sum + a.areaHa, 0);
  const recentes30d = alerts.filter((a) => {
    const d = new Date(a.detectedAt);
    const now = new Date();
    return now.getTime() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
  });

  const severidade = (ha: number) => {
    if (ha >= DESMAT_SEVERITY.high) return { label: "Alta", class: "bg-destructive/15 text-destructive border border-destructive/25 font-semibold px-2 py-0.5 rounded text-[10px]" };
    if (ha >= DESMAT_SEVERITY.medium) return { label: "Média", class: "bg-accent/20 text-accent-readable border border-accent/30 font-semibold px-2 py-0.5 rounded text-[10px]" };
    return { label: "Baixa", class: "bg-secondary/15 text-secondary border border-secondary/25 font-semibold px-2 py-0.5 rounded text-[10px]" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pits-card">
        <div className="flex items-center gap-2 mb-4">
          <Satellite size={18} className="text-destructive" />
          <h2 className="pits-section-title">
            Alertas de Desmatamento — MapBiomas Alerta (SAD-Caatinga)
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Consultando API v2 MapBiomas Alerta...</span>
          </div>
        )}

        {/* Error — Regra G8 / D11: exibir "Dados indisponíveis", nunca "0 alertas" */}
        {isError && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/25 text-sm text-destructive space-y-1 my-3">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Falha na consulta ao MapBiomas Alerta — Dados indisponíveis</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Não foi possível obter os alertas em tempo real ({error || "serviço indisponível"}). O sistema não assume zero para evitar falsos negativos.
            </p>
          </div>
        )}

        {/* Summary cards */}
        {hasLoadedAlerts && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-destructive/10 rounded-lg text-center border border-destructive/25">
                <p className="text-[11px] text-muted-foreground font-medium">Total de Alertas</p>
                <p className="text-xl font-extrabold text-destructive mt-0.5">{alerts.length}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center border border-destructive/25">
                <p className="text-[11px] text-muted-foreground font-medium">Área Desmatada</p>
                <p className="text-xl font-extrabold text-destructive mt-0.5">
                  {totalHa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ha
                </p>
              </div>
              <div className="p-3 bg-accent/15 rounded-lg text-center border border-accent/30">
                <p className="text-[11px] text-muted-foreground font-medium">Últimos 30 dias</p>
                <p className="text-xl font-extrabold text-accent-readable mt-0.5">{recentes30d.length}</p>
              </div>
              <div className="p-3 bg-hydro/10 rounded-lg text-center border border-hydro/25">
                <p className="text-[11px] text-muted-foreground font-medium">Bioma</p>
                <p className="text-base font-bold text-hydro mt-0.5">
                  {alerts[0]?.biome ?? "Caatinga"}
                </p>
              </div>
            </div>

            {/* Alert table */}
            {alerts.length > 0 ? (
              <Detalhes titulo={`Ver lista de alertas (${alerts.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Código</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Detecção</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Área (ha)</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Severidade</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Fonte</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((a) => {
                      const sev = severidade(a.areaHa);
                      const detDate = a.detectedAt ? new Date(a.detectedAt) : null;
                      return (
                        <tr key={a.alertCode} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-2 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Flame size={12} className="text-destructive shrink-0" />
                              {a.alertCode}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            {detDate ? detDate.toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td className="py-2 px-2 text-right font-medium">
                            {a.areaHa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2">
                            <span className={sev.class}>
                              {sev.label}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-muted-foreground">{a.source}</td>
                          <td className="py-2 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success">
                              {a.statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </Detalhes>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground bg-muted/20 rounded-lg border border-border/60">
                <TreePine size={18} className="text-secondary" />
                <span className="text-sm">Nenhum alerta de desmatamento validado registrado para este município no período.</span>
              </div>
            )}
          </>
        )}

        <FonteInfo
          variavel="alertas_desmatamento_mapbiomas"
          codigoIBGE={codigoIBGE}
          selo="MapBiomas"
        />
      </div>
    </div>
  );
}
