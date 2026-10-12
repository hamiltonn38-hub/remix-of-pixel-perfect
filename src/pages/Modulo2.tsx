import { usePits } from "@/context/PitsContext";
import { Recycle, Zap, Flame, TreePine, ExternalLink, BookOpen } from "lucide-react";
import { PitsBarChart } from "@/components/charts/PitsCharts";
import { useState } from "react";

// Experimento de campo em Taperoá/PB (Martins et al., 2013, DOI: 10.1590/S1415-43662013000600002)
const produtividadeData = [
  { sistema: "Tradicional (milho/feijão)", produtividade: 8.2 },
  { sistema: "SAF (lenha + cultivos)", produtividade: 29.5 },
];

const fluxos = [
  { de: "Resíduos agrícolas e palhadas", para: "Compostagem e ciclagem de nutrientes no solo", icon: Recycle, color: "text-secondary" },
  { de: "Dejetos da pecuária", para: "Biodigestores rurais → Biogás para cocção + Biofertilizante", icon: Zap, color: "text-hydro" },
  { de: "Caatinga sob PMFS", para: "Corte seletivo autorizado → Lenha e carvão com DOF/SINAFLOR", icon: Flame, color: "text-primary" },
  { de: "Poda de forrageiras arbóreas", para: "Ensilagem e suporte alimentar para rebanhos na seca", icon: TreePine, color: "text-secondary" },
];

const sistemas = [
  {
    nome: "Sistemas Agroflorestais da Caatinga",
    desc: "Consórcio de culturas agrícolas anuais com árvores nativas (Sabiá) e arbóreas adaptadas (Gliricídia).",
    beneficio: "+260% de biomassa total (lenhosa + alimentar) comprovado em ensaios no Semiárido",
    referencia: "Martins et al. (2013, RBEAA/SciELO)",
  },
  {
    nome: "Integração Lavoura–Pecuária–Floresta (ILPF)",
    desc: "Combinação de faixas florestais nativas, forrageiras (palma forrageira) e pastoreio rotacionado.",
    beneficio: "Conforto térmico animal e resiliência hídrica nos períodos de estiagem",
    referencia: "EMBRAPA Semiárido (2020)",
  },
  {
    nome: "Manejo Florestal Sustentável da Caatinga (PMFS)",
    desc: "Exploração racional em talhões rotativos com ciclo de corte de 15 a 20 anos.",
    beneficio: "Garantia de regeneração dos estoques lenhosos e legalidade fiscal",
    referencia: "Associação Plantas do Nordeste (APNE) / SFB",
  },
  {
    nome: "Biodigestores e Fogões Ecoeficientes",
    desc: "Tecnologias sociais para substituição de fogões rurais tradicionais de alto consumo.",
    beneficio: "Redução de até 50% no consumo domiciliar de lenha e alívio de fuligem",
    referencia: "Rede Biomassa / UFC",
  },
];

export default function Modulo2() {
  const { selectedMunicipio: m } = usePits();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo II — Integração Produtiva</h1>
        <p className="text-sm text-muted-foreground">
          Transição do extrativismo predatório para fluxos circulares de biomassa e agroecologia
        </p>
      </div>

      {/* Indicadores Auditados de Integração Produtiva */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Sistemas Agroflorestais",
            value: `${m.safs_pct}%`,
            sub: "Estabelecimentos no Censo Agro 2017",
          },
          {
            label: "Índice de Infraestrutura (IIE)",
            value: m.IIE.toFixed(2),
            sub: "Práticas agroecológicas e energia",
          },
          {
            label: "Extração de Lenha",
            value: `${(m.lenha_pevs_m3_ano / 1000).toFixed(1)}k m³/ano`,
            sub: "IBGE PEVS 2025",
          },
          {
            label: "Eficiência de Conversão",
            value: `${m.eficiencia_conversao_energetica_pct}%`,
            sub: "Parâmetro térmico (faixa 20–30%)",
          },
        ].map((ind) => (
          <div key={ind.label} className="pits-card text-center">
            <p className="pits-label text-[11px]">{ind.label}</p>
            <p className="pits-metric text-xl mt-1">{ind.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{ind.sub}</p>
          </div>
        ))}
      </div>

      {/* Fluxos Circulares */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Fluxos Circulares de Biomassa na Caatinga</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fluxos.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border/40">
              <f.icon size={22} className={f.color} />
              <div>
                <p className="text-sm font-medium">{f.de}</p>
                <p className="text-xs text-muted-foreground">→ {f.para}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produtividade com Citação Científica Conferida */}
      <div className="pits-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="pits-section-title">Produtividade de Biomassa: SAFs vs Tradicional</h2>
            <p className="text-xs text-muted-foreground">
              Estudo experimental auditado no Semiárido (Taperoá/PB)
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-secondary/15 text-secondary font-medium">
            +260% de biomassa total
          </span>
        </div>

        <PitsBarChart
          data={produtividadeData}
          xKey="sistema"
          height={200}
          layout="vertical"
          yLabelWidth={140}
          bars={[{ key: "produtividade", name: "Biomassa Total (t/ha)", color: "hsl(var(--secondary))" }]}
        />

        <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground mt-3 flex items-start gap-2">
          <BookOpen size={16} className="text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Citação Confirmada:</strong> Martins, J.C.R. et al. (2013). <em>Produtividade de biomassa em sistemas agroflorestais e tradicionais no Cariri Paraibano</em>. Revista Brasileira de Engenharia Agrícola e Ambiental (RBEAA), v. 17, n. 6, p. 581–587. DOI: 10.1590/S1415-43662013000600002. A biomassa lenhosa arbórea (ex.: sabiá e gliricídia) incrementa a produção bioenergética sem suprimir a produção forrageira na seca.
          </p>
        </div>
      </div>

      {/* Estrutura Oficial do PNDBio */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Recycle size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio) — Integração Produtiva</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024) prioriza a transição de cadeias extrativistas primárias para sistemas produtivos integrados e bioindustrialização competitiva.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "Eixo 2 — Bioindustrialização Competitiva (Missão 4)",
              desc: "Aproveitamento integral da biomassa, valorização de subprodutos agrícolas e geração descentralizada de bioenergia.",
            },
            {
              title: "Eixo 3 — Produção Sustentável de Biomassa (Missão 7)",
              desc: "Diversificação das fontes de biomassa em paisagens produtivas sustentáveis no Semiárido.",
            },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio
          </a>
        </div>
      </div>

      {/* Sistemas Produtivos e Tecnologias */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Sistemas de Manejo e Tecnologias Agroenergéticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sistemas.map((s, i) => (
            <div
              key={s.nome}
              className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <h3 className="text-sm font-semibold mb-1">{s.nome}</h3>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{s.desc}</p>
              <div className="text-[11px] text-foreground font-medium bg-background/50 p-2 rounded border border-border/40">
                <span className="text-secondary font-bold">Impacto: </span>{s.beneficio}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 italic">Base: {s.referencia}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
