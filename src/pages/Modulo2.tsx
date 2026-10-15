import { usePits } from "@/context/PitsContext";
import { Recycle, Zap, Flame, TreePine, ExternalLink, BookOpen, AlertTriangle } from "lucide-react";
import { PitsBarChart } from "@/components/charts/PitsCharts";
import FonteInfo from "@/components/FonteInfo";
import H2SimuladorCard from "@/components/H2SimuladorCard";

// Experimento de campo em Taperoá/PB (Martins et al., 2013, DOI: 10.1590/S1415-43662013000600002)
const produtividadeData = [
  { sistema: "Tradicional (milho/feijão)", produtividade: 8.2 },
  { sistema: "SAF (lenha + cultivos)", produtividade: 29.5 },
];

const fluxos = [
  { de: "Resíduos agrícolas e palhadas", para: "Compostagem e ciclagem de matéria orgânica no solo", icon: Recycle, color: "text-secondary" },
  { de: "Dejetos da pecuária", para: "Biodigestores rurais → Biogás para cocção limpa + Biofertilizante", icon: Zap, color: "text-hydro" },
  { de: "Caatinga sob Plano de Manejo (PMFS)", para: "Corte seletivo autorizado com DOF/SINAFLOR → Lenha sustentável", icon: Flame, color: "text-primary" },
  { de: "Poda de forrageiras arbóreas nativas", para: "Ensilagem e suporte forrageiro para rebanhos na estiagem", icon: TreePine, color: "text-secondary" },
];

const sistemasManejo = [
  {
    nome: "Sistemas Agroflorestais da Caatinga (SAFs)",
    desc: "Consórcio de culturas agrícolas anuais com espécies arbóreas nativas (Sabiá - Mimosa caesalpiniifolia).",
    ressalvaBotanica: "Atenção: Gliricídia (Gliricidia sepium) e Leucena (Leucaena leucocephala) são espécies exóticas; a leucena possui forte comportamento invasor na Caatinga e exige controle rigoroso.",
    beneficio: "+260% de biomassa total acumulada (lenha + resíduos) comprovada em ensaios no Semiárido",
    referencia: "Martins et al. (2013, RBEAA/SciELO)",
  },
  {
    nome: "Integração Lavoura–Pecuária–Floresta (ILPF)",
    desc: "Combinação de faixas florestais nativas, forrageiras adaptadas e pastoreio rotacionado.",
    ressalvaBotanica: "Atenção: O capim-buffel (Cenchrus ciliaris) é gramínea exótica com comportamento invasor severo, demandando manejo para não suprimir a regeneração da Caatinga.",
    beneficio: "Conforto térmico animal e resiliência forrageira durante a seca",
    referencia: "EMBRAPA Semiárido (2020)",
  },
  {
    nome: "Manejo Florestal Sustentável da Caatinga (PMFS)",
    desc: "Exploração racional em talhões rotativos com ciclo de corte de 15 a 20 anos e proteção das matrizes.",
    ressalvaBotanica: "Espécies prioritárias exclusivamente nativas: Angico, Jurema-preta, Catingueira e Sabiá.",
    beneficio: "Regeneração garantida dos estoques lenhosos com rastreabilidade legal",
    referencia: "Associação Plantas do Nordeste (APNE) / SFB",
  },
  {
    nome: "Tecnologias Sociais de Cocção Limpa e Biodigestores",
    desc: "Substituição gradual de fogões rurais rudimentares de alto consumo por biodigestores e fogões ecoeficientes.",
    ressalvaBotanica: "Alívio direto da pressão extrativa predatória sobre os remanescentes de mata seca.",
    beneficio: "Redução de até 50% na queima domiciliar de lenha e erradicação da fumaça interna",
    referencia: "Rede Biomassa / UFC",
  },
];

export default function Modulo2() {
  const { selectedMunicipio: m } = usePits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo II — Integração Produtiva</h1>
        <p className="text-sm text-muted-foreground">
          Transição do extrativismo predatório para sistemas agroflorestais sustentáveis e biomassa circular
        </p>
      </div>

      {/* Indicadores Auditados de Integração Produtiva (Regra 7: sem 'eficiência' nem 'circularidade' inventadas) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Sistemas Agroflorestais (SAFs)",
            value: `${m.safs_pct}%`,
            sub: "Estabelecimentos agropecuários",
            variavel: "safs_censoagro2017",
          },
          {
            label: "Estabelecimentos c/ Adubação Orgânica",
            value: `${m.adubacao_organica_pct}%`,
            sub: "Práticas conservacionistas de solo",
            variavel: "safs_censoagro2017",
          },
          {
            label: "Extração Vegetal de Lenha",
            value: `${(m.lenha_pevs_m3_ano / 1000).toFixed(1)}k m³/ano`,
            sub: "Volume anual extraído (PEVS)",
            variavel: "lenha_extrativismo_vegetal",
          },
          {
            label: "Conversão Térmica (Literatura)",
            value: `${m.eficiencia_conversao_energetica_pct}%`,
            sub: "Premissa da literatura (η = 0,25)",
            customFonte: "Literatura Técnica (Sampaio & Silva, 2005)",
            ano: 2026,
          },
        ].map((ind) => (
          <div key={ind.label} className="pits-card flex flex-col justify-between text-center">
            <div>
              <p className="pits-label text-[11px]">{ind.label}</p>
              <p className="pits-metric text-xl mt-1">{ind.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ind.sub}</p>
            </div>
            {ind.variavel ? (
              <FonteInfo variavel={ind.variavel} codigoIBGE={m.codigoIBGE} />
            ) : (
              <FonteInfo instituicao={ind.customFonte!} ano={ind.ano!} dataConsulta="11/10/2026" />
            )}
          </div>
        ))}
      </div>

      {/* Fluxos Circulares Qualitativos da Biomassa */}
      <div className="pits-card space-y-3">
        <h2 className="pits-section-title">Fluxos Circulares de Biomassa no Território Semiárido</h2>
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
        <FonteInfo
          instituicao="Framework HAMILTON / Conceitual"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Fluxos de biomassa e agroecologia no Semiárido"
        />
      </div>

      {/* Produtividade com Citação Científica Conferida e Ressalvas — Item 8 / M2-6 */}
      <div className="pits-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="pits-section-title">Produtividade de Biomassa: SAFs vs Tradicional (Ensaio em Taperoá/PB)</h2>
            <p className="text-xs text-muted-foreground">
              Estudo experimental auditado no Semiárido (Cariri Paraibano) — Martins et al. (2013)
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
          bars={[{ key: "produtividade", name: "Biomassa Total Acumulada (t/ha)", color: "hsl(var(--secondary))" }]}
        />

        {/* Ressalvas Metodológicas Obrigatórias do Estudo — M2-6 */}
        <div className="p-3.5 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-2 border border-border/40">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <BookOpen size={16} className="text-primary shrink-0" />
            <span>Referência Confirmada e Ressalvas Metodológicas Obrigatórias (M2-6)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Citação Oficial:</strong> Martins, J.C.R., Menezes, R.S.C., Sampaio, E.V.S.B., Santos, A.F., Nagai, M.A. (2013). <em>Produtividade de biomassa em sistemas agroflorestais e tradicionais no Cariri Paraibano</em>. Revista Brasileira de Engenharia Agrícola e Ambiental (RBEAA), v. 17, n. 6, p. 581–587. DOI: 10.1590/S1415-43662013000600002.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-2 bg-background/50 rounded border border-border/30">
              <strong>1. Biomassa Total:</strong> O incremento de 260% refere-se à biomassa total aérea (folhas, galhos e lenha podada de árvores somadas aos resíduos agrícolas).
            </div>
            <div className="p-2 bg-background/50 rounded border border-border/30">
              <strong>2. Cultivos Anuais:</strong> O sistema tradicional produziu maior volume de biomassa de grãos de milho e feijão do que o SAF durante o período monitorado.
            </div>
            <div className="p-2 bg-background/50 rounded border border-border/30">
              <strong>3. Espécies Utilizadas:</strong> O ensaio avaliou gliricídia (exótica) e maniçoba, que diferem das espécies arbóreas nativas prioritárias da Caatinga cearense.
            </div>
          </div>
        </div>

        <FonteInfo
          instituicao="Revista Brasileira de Engenharia Agrícola e Ambiental (SciELO)"
          ano={2013}
          dataConsulta="11/10/2026"
          tabela="Martins et al. (2013, DOI: 10.1590/S1415-43662013000600002)"
          url="https://doi.org/10.1590/S1415-43662013000600002"
        />
      </div>

      {/* Simulação de Potencial de Hidrogênio (H2 de Biomassa) */}
      <H2SimuladorCard />

      {/* Estrutura Oficial do PNDBio — Eixos 2 e 3 (G7 / M2-7) */}
      <div className="pits-card border-l-4 border-l-secondary space-y-3">
        <div className="flex items-center gap-2">
          <Recycle size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio) — Integração Produtiva</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024) prioriza a transição do extrativismo linear para cadeias agroindustriais de biomassa sustentável e bioinsumos:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              eixo: "Eixo 2 — Bioindustrialização Competitiva",
              missao: "Missão 4 — Aproveitamento Integral da Biomassa",
              desc: "Valorização de resíduos da agropecuária, biocombustíveis sólidos e geração descentralizada de bioenergia.",
            },
            {
              eixo: "Eixo 3 — Produção Sustentável de Biomassa",
              missao: "Missão 7 — Diversificação de Fontes de Biomassa",
              desc: "Diversificação das fontes de biomassa renovável no Semiárido com manejo sustentável e rotação de culturas.",
            },
          ].map((item) => (
            <div key={item.missao} className="p-3 bg-muted/40 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary">{item.eixo}</span>
              <h4 className="text-xs font-semibold text-foreground">{item.missao}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio (gov.br/mma)
          </a>
        </div>
        <FonteInfo
          instituicao="Ministério do Meio Ambiente e Mudança do Clima (MMA)"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Decreto Federal nº 12.044/2024 (Eixos 2 e 3)"
          url="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
        />
      </div>

      {/* Sistemas de Manejo e Ressalvas Botânicas (M2-9 e M2-10) */}
      <div className="pits-card space-y-3">
        <h2 className="pits-section-title">Sistemas Produtivos e Tecnologias com Ressalvas Ecológicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sistemasManejo.map((s) => (
            <div
              key={s.nome}
              className="p-3.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
            >
              <h3 className="text-sm font-semibold">{s.nome}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              
              {/* Alerta de espécies exóticas / invasoras (M2-9 / M2-10) */}
              <div className="flex items-start gap-1.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-900 dark:text-amber-300">
                <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                <span>{s.ressalvaBotanica}</span>
              </div>

              <div className="text-[11px] font-medium bg-background/60 p-2 rounded border border-border/40">
                <span className="text-secondary font-bold">Impacto Estimado: </span>{s.beneficio}
              </div>
              <p className="text-[10px] text-muted-foreground italic">Base: {s.referencia}</p>
            </div>
          ))}
        </div>
        <FonteInfo
          instituicao="EMBRAPA Semiárido e Flora e Funga do Brasil"
          ano={2025}
          dataConsulta="11/10/2026"
          tabela="Diretrizes de manejo agroecológico e controle de espécies exóticas invasoras"
        />
      </div>
    </div>
  );
}
