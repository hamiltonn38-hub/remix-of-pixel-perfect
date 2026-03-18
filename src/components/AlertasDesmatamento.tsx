import { useEffect, useState } from "react";
import { usePits } from "@/context/PitsContext";
import { fetchAlertasMunicipio, MapBiomasAlerta } from "@/lib/mapbiomasAlertaApi";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { Satellite, AlertTriangle, Loader2, TreePine, Flame } from "lucide-react";

export default function AlertasDesmatamento() {
  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.municipio);
  const codigoIBGE = mb?.codigoIBGE;

  const [alerts, setAlerts] = useState<MapBiomasAlerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigoIBGE) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAlertasMunicipio(codigoIBGE)
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [codigoIBGE]);

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
    if (ha >= 50) return { label: "Alta", class: "bg-pits-alerta/20 text-pits-alerta" };
    if (ha >= 10) return { label: "Média", class: "bg-pits-seco/20 text-pits-terra" };
    return { label: "Baixa", class: "bg-pits-caatinga/20 text-pits-caatinga" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pits-card">
        <div className="flex items-center gap-2 mb-4">
          <Satellite size={18} className="text-pits-alerta" />
          <h2 className="pits-section-title">
            Alertas de Desmatamento — MapBiomas Alerta
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Consultando API MapBiomas Alerta...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-pits-alerta/10 rounded-lg border border-pits-alerta/20 text-sm text-pits-alerta">
            <AlertTriangle size={16} className="shrink-0" />
            <div>
              <p className="font-medium">Erro ao consultar MapBiomas Alerta</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-pits-alerta/10 rounded-lg text-center">
                <p className="text-[11px] text-muted-foreground font-medium">Total Alertas</p>
                <p className="text-lg font-bold text-pits-alerta">{alerts.length}</p>
              </div>
              <div className="p-3 bg-pits-alerta/10 rounded-lg text-center">
                <p className="text-[11px] text-muted-foreground font-medium">Área Desmatada</p>
                <p className="text-lg font-bold text-pits-alerta">
                  {totalHa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ha
                </p>
              </div>
              <div className="p-3 bg-pits-seco/10 rounded-lg text-center">
                <p className="text-[11px] text-muted-foreground font-medium">Últimos 30 dias</p>
                <p className="text-lg font-bold text-pits-terra">{recentes30d.length}</p>
              </div>
              <div className="p-3 bg-pits-agua/10 rounded-lg text-center">
                <p className="text-[11px] text-muted-foreground font-medium">Bioma</p>
                <p className="text-sm font-semibold text-pits-agua">
                  {alerts[0]?.biome ?? "Caatinga"}
                </p>
              </div>
            </div>

            {/* Alert table */}
            {alerts.length > 0 ? (
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
                      const detDate = new Date(a.detectedAt);
                      return (
                        <tr key={a.alertCode} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-2 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Flame size={12} className="text-pits-alerta shrink-0" />
                              {a.alertCode}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            {detDate.toLocaleDateString("pt-BR")}
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
                            <span className="pits-badge pits-badge-success">
                              {a.statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <TreePine size={18} />
                <span className="text-sm">Nenhum alerta de desmatamento registrado para este município.</span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-3 italic">
              Fonte: MapBiomas Alerta — plataforma.alerta.mapbiomas.org. Dados atualizados via API GraphQL v2.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
