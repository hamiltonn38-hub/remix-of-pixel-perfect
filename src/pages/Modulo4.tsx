import { useMemo } from "react";
import { usePits } from "@/context/PitsContext";
import { useIbgeData } from "@/hooks/useIBGE";
import { useInmetData } from "@/hooks/useINMET";
import { Database, CheckCircle, BarChart3, Calendar, Loader2 } from "lucide-react";
import { PitsComposedChart } from "@/components/charts/PitsCharts";

const fontes = [
  { nome: "IBGE", desc: "Dados socioeconômicos e territoriais", variaveis: 42, atualizado: "2024-11-15" },
  { nome: "MapBiomas", desc: "Cobertura e uso do solo", variaveis: 28, atualizado: "2024-10-20" },
  { nome: "ANA", desc: "Recursos hídricos", variaveis: 15, atualizado: "2024-12-01" },
  { nome: "INMET", desc: "Dados climatológicos", variaveis: 22, atualizado: "Real-time" },
];

// mockSerieData has been replaced by dynamic calculation in the component

const registros = [
  { data: "2024-12-08", comunidade: "Aroeira", indicador: "Cobertura arbórea", valor: "35.1%", status: "Validado" },
  { data: "2024-12-05", comunidade: "Serra Preta", indicador: "Nível hídrico", valor: "2.3m", status: "Validado" },
  { data: "2024-12-01", comunidade: "Vila São José", indicador: "Biomassa", valor: "19.2 t/ha", status: "Pendente" },
];

export default function Modulo4() {
  const { selectedMunicipio } = usePits();
  const m = selectedMunicipio;
  const { data: ibge } = useIbgeData(m.municipio, m.estado);
  const { data: inmet, isFetching: inmetLoading } = useInmetData(ibge?.latitude, ibge?.longitude, m.estado);

  // Gerar dados dinamicamente com base no município selecionado
  const serieData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const year = 2019 + i;
      // Fator retroativo (ex: 2024 = 100%, 2019 = 85%) para simulação visual de tendência
      const factor = 1 - (5 - i) * 0.03; 
      
      const inmetAno = inmet?.historico?.find((h) => h.ano === year);
      
      return {
        ano: year,
        cobertura: Number((m.cobertura_arborea_pct * factor).toFixed(1)),
        biomassa: Number((m.estoque_biomassa_t_ha * factor).toFixed(1)),
        ipse: Number((m.IPSE * factor).toFixed(2)),
        precipitacao: inmetAno ? inmetAno.precipitacaoTotal : 680 + (i * 15),
      };
    });
  }, [m, inmet]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo IV — Monitoramento Socioecológico</h1>
        <p className="text-sm text-muted-foreground">Monitoramento contínuo com dados territoriais atualizados</p>
      </div>

      {/* Data sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fontes.map((f) => (
          <div key={f.nome} className="pits-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-hydro" />
                <h3 className="font-semibold text-sm">{f.nome}</h3>
              </div>
              <CheckCircle size={14} className="text-success" />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{f.desc}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{f.variaveis} variáveis</span>
              <span className={f.nome === "INMET" ? "text-hydro font-medium" : ""}>{f.atualizado}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Time series */}
      <div className="pits-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
          <div>
            <h2 className="pits-section-title">Série Temporal (2019–2024)</h2>
            {inmet?.estacao && inmet.historico && inmet.historico.length > 0 ? (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                📍 Dados climáticos extraídos da Estação INMET <strong>{inmet.estacao.DC_NOME}</strong> 
                ({inmet.estacao.CD_ESTACAO}) — a {inmet.estacao.distanciaKm?.toFixed(1)} km
              </p>
            ) : inmet?.estacao && (!inmet.historico || inmet.historico.length === 0) ? (
              <p className="text-xs text-muted-foreground mt-1 flex flex-col gap-1">
                <span>📍 Estação INMET mais próxima: <strong>{inmet.estacao.DC_NOME}</strong> ({inmet.estacao.CD_ESTACAO}) — a {inmet.estacao.distanciaKm?.toFixed(1)} km.</span>
                <span className="text-amber-600 dark:text-amber-400">⚠️ Sem dados de chuva disponíveis na API (usando dados extrapolados).</span>
              </p>
            ) : inmetLoading ? (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Buscando estação climática mais próxima...
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">📍 Dados climáticos extrapolados (sem estação próxima)</p>
            )}
          </div>
        </div>
        <PitsComposedChart
          data={serieData}
          xKey="ano"
          height={300}
          bars={[{ key: "precipitacao", name: "Precipitação INMET (mm)", color: "hsl(var(--hydro))", yAxisId: "right" }]}
          lines={[
            { key: "cobertura", name: "Cobertura (%)",  color: "hsl(var(--secondary))", yAxisId: "left" },
            { key: "biomassa",  name: "Biomassa (t/ha)", color: "hsl(var(--primary))",   yAxisId: "left" },
            { key: "ipse",     name: "IPSE",            color: "hsl(var(--accent))",    yAxisId: "left" },
          ]}
        />
      </div>

      {/* Plano Nacional de Bioeconomia */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={18} className="text-secondary" />
          <h2 className="pits-section-title">Plano Nacional de Bioeconomia</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PlanBio</strong> prevê sistemas integrados de monitoramento e avaliação para acompanhar indicadores de desempenho da bioeconomia nos territórios, com dados abertos e participação social.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Eixo 7 — Monitoramento e Indicadores", desc: "Desenvolvimento de painéis de indicadores socioecológicos para avaliação contínua dos impactos da bioeconomia territorial." },
            { title: "Eixo 8 — Dados Abertos e Transparência", desc: "Integração de bases de dados públicas (IBGE, MapBiomas, ANA) com dados comunitários para tomada de decisão baseada em evidências." },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Alinhamento: o Módulo IV implementa os eixos de monitoramento e transparência do PlanBio, consolidando dados de múltiplas fontes com registros participativos.
        </p>
      </div>

      {/* Participatory monitoring */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Monitoramento Participativo — Últimos Registros</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Comunidade</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Indicador</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Valor</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 text-muted-foreground">{r.data}</td>
                <td className="py-2.5 px-3">{r.comunidade}</td>
                <td className="py-2.5 px-3">{r.indicador}</td>
                <td className="py-2.5 px-3 font-medium">{r.valor}</td>
                <td className="py-2.5 px-3">
                  <span className={`pits-badge ${r.status === "Validado" ? "pits-badge-success" : "pits-badge-warning"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
