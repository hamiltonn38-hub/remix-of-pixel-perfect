import { useMemo } from "react";
import { usePits } from "@/context/PitsContext";
import { Database, CheckCircle, ExternalLink, ShieldCheck, Activity } from "lucide-react";
import { PitsComposedChart } from "@/components/charts/PitsCharts";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";

const conectoresOficiais = [
  {
    nome: "IBGE (SIDRA)",
    desc: "Censo Demográfico 2022, Censo Agro 2017 e PEVS 2025",
    variaveis: 10,
    status: "Auditado",
    base: "APIs e Agregados Oficiais",
  },
  {
    nome: "MapBiomas Brasil",
    desc: "Coleção 11 (1985–2025) e Alertas de Desmatamento (SAD)",
    variaveis: 12,
    status: "Auditado",
    base: "Coleção 11 e API Alerta v2",
  },
  {
    nome: "INMET (BDMEP)",
    desc: "Estações meteorológicas automáticas e normais climatológicas",
    variaveis: 3,
    status: "Auditado",
    base: "BDMEP 2024 e Normais",
  },
  {
    nome: "IPECE / SEMA-CE",
    desc: "Índice de Qualidade do Meio Ambiente (IQM) e rateio do ICMS",
    variaveis: 4,
    status: "Auditado",
    base: "Resoluções 2025–2026",
  },
];

export default function Modulo4() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.codigoIBGE || m.municipio);

  // Série temporal real MapBiomas 2018–2025
  const serieData = useMemo(() => {
    if (!mb || !mb.serie_vegetacao_nativa) return [];

    return mb.serie_vegetacao_nativa.map((s) => ({
      ano: s.ano,
      cobertura: s.pct,
      biomassa: Number((m.estoque_biomassa_t_ha * (s.pct / Math.max(1, m.cobertura_nativa_pct))).toFixed(1)),
      precipitacao: s.ano === 2024 ? m.precipitacao_anual_mm : null,
    }));
  }, [mb, m]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo IV — Monitoramento Socioecológico</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento contínuo integrado com proveniência e auditoria de fontes públicas
        </p>
      </div>

      {/* Conectores Oficiais Integrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {conectoresOficiais.map((f) => (
          <div key={f.nome} className="pits-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">{f.nome}</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-success/15 text-success font-medium flex items-center gap-1">
                <CheckCircle size={10} /> {f.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            <div className="pt-2 border-t border-border/40 flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>{f.variaveis} variáveis</span>
              <span className="text-foreground">{f.base}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Série Histórica Real Auditada */}
      <div className="pits-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
          <div>
            <h2 className="pits-section-title">
              Série Histórica Auditada (2018–2025) — {m.municipio}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Cobertura vegetal nativa (MapBiomas Col. 11) e densidade proporcional de biomassa aérea
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-secondary/10 text-secondary font-medium">
            Dados de Satélite Landsat
          </span>
        </div>

        <PitsComposedChart
          data={serieData}
          xKey="ano"
          height={280}
          bars={[]}
          lines={[
            { key: "cobertura", name: "Cobertura Nativa (%)", color: "hsl(var(--secondary))", strokeWidth: 3 },
            { key: "biomassa", name: "Biomassa Média (t/ha)", color: "hsl(var(--primary))", strokeWidth: 2 },
          ]}
        />
      </div>

      {/* Monitoramento Participativo — Estado Vazio Conforme Regra 2c */}
      <div className="pits-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="pits-section-title flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Monitoramento Participativo de Campo
            </h2>
            <p className="text-xs text-muted-foreground">
              Cadernos de campo e vistorias comunitárias de conservação
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-muted text-muted-foreground">
            Status: Dados indisponíveis (Regra 2c)
          </span>
        </div>

        <div className="p-8 border border-dashed border-border rounded-xl text-center bg-muted/10 space-y-2">
          <ShieldCheck size={32} className="mx-auto text-muted-foreground/60" />
          <h3 className="text-sm font-semibold text-foreground">
            Sem registros de campo formalizados nesta fase do projeto
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            O componente de monitoramento comunitário está estruturado como protótipo para receber apontamentos de campo assim que a equipe <strong>FUNDECI/2025.0016</strong> iniciar as oficinas comunitárias em {m.municipio}. Dados simulados foram integralmente removidos.
          </p>
        </div>
      </div>

      {/* Alinhamento ao PNDBio */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Database size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia — Monitoramento e Evidências</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024, Missão 8) determina o desenvolvimento de sistemas integrados de monitoramento, rastreabilidade e métricas de impacto socioecológico para a tomada de decisão baseada em evidências.
        </p>
        <div className="flex gap-3">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio
          </a>
          <a
            href="https://brasil.mapbiomas.org/estatisticas/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Estatísticas Municipais MapBiomas
          </a>
        </div>
      </div>
    </div>
  );
}
