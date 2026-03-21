import { usePits } from "@/context/PitsContext";
import { Recycle, Zap, Flame, TreePine, ExternalLink } from "lucide-react";
import { PitsBarChart } from "@/components/charts/PitsCharts";
import { useState } from "react";

const produtividadeData = [
  { sistema: "Tradicional", produtividade: 8.2 },
  { sistema: "SAFs", produtividade: 29.5 },
];

const fluxos = [
  { de: "Resíduos agrícolas", para: "Compostagem → Fertilização", icon: Recycle, color: "text-secondary" },
  { de: "Dejetos animais", para: "Biodigestores → Biogás + Biofertilizante", icon: Zap, color: "text-hydro" },
  { de: "Caatinga manejada", para: "Lenha controlada + Carvão sustentável", icon: Flame, color: "text-primary" },
  { de: "Forragem arbórea", para: "Alimentação animal na seca", icon: TreePine, color: "text-secondary" },
];

const sistemas = [
  { nome: "Sistemas Agroflorestais Bioculturais", desc: "Combinação de culturas agrícolas com espécies florestais nativas da Caatinga.", beneficio: "Aumento de 260% na produtividade de biomassa", adocao: 18, especies: "Sabiá, Gliricídia, Leucena, Mandioca" },
  { nome: "Integração Lavoura–Pecuária–Floresta (ILPF)", desc: "Sistema que integra atividades agrícolas, pecuárias e florestais.", beneficio: "Diversificação de renda e resiliência climática", adocao: 12, especies: "Capim-buffel, Palma, Sabiá" },
  { nome: "Circuitos Fechados de Biomassa", desc: "Aproveitamento integral da biomassa em ciclos de nutrientes fechados.", beneficio: "Redução de 60% na demanda de lenha sem manejo", adocao: 8, especies: "Jurema-preta, Catingueira" },
  { nome: "Biodigestores Comunitários", desc: "Tecnologia de conversão de dejetos em biogás e biofertilizante.", beneficio: "Geração de energia limpa para cocção", adocao: 5, especies: "N/A — tecnologia baseada em dejetos animais" },
];

export default function Modulo2() {
  const { selectedMunicipio: m } = usePits();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo II — Integração Produtiva</h1>
        <p className="text-sm text-muted-foreground">Transição para fluxos circulares de biomassa</p>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sistemas Integrados", value: `${m.area_sistemas_integrados_pct}%`, sub: "Meta: 70%" },
          { label: "Circularidade de Biomassa", value: `${Math.round(m.eficiencia_conversao_energetica_pct * 0.8)}%`, sub: "Taxa" },
          { label: "Demanda Lenha s/ Manejo", value: `${(m.demanda_lenha_sem_manejo_m3_ano / 1000).toFixed(1)}k m³/ano`, sub: "Anual" },
          { label: "Eficiência Energética", value: `${m.eficiencia_conversao_energetica_pct}%`, sub: "Conversão" },
        ].map((ind) => (
          <div key={ind.label} className="pits-card text-center">
            <p className="pits-label text-[11px]">{ind.label}</p>
            <p className="pits-metric text-xl mt-1">{ind.value}</p>
            <p className="text-xs text-muted-foreground">{ind.sub}</p>
          </div>
        ))}
      </div>

      {/* Biomass flow */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Fluxo Circular de Biomassa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fluxos.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <f.icon size={24} className={f.color} />
              <div>
                <p className="text-sm font-medium">{f.de}</p>
                <p className="text-xs text-muted-foreground">→ {f.para}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity chart */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Produtividade: SAFs vs Tradicional</h2>
        <PitsBarChart
          data={produtividadeData}
          xKey="sistema"
          height={200}
          layout="vertical"
          yLabelWidth={90}
          bars={[{ key: "produtividade", name: "t/ha", color: "hsl(var(--secondary))" }]}
        />
        <p className="text-xs text-muted-foreground mt-2">Fonte: Dados do Cariri paraibano — SAFs superam em 260% os sistemas tradicionais</p>
      </div>

      {/* Plano Nacional de Bioeconomia */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Recycle size={18} className="text-secondary" />
          <h2 className="pits-section-title">Plano Nacional de Bioeconomia</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PlanBio</strong> prioriza a transição de cadeias extrativistas lineares para modelos produtivos circulares baseados em bioeconomia, com ênfase em produtos florestais não-madeireiros e energia renovável.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Eixo 3 — Cadeias Produtivas da Bioeconomia", desc: "Estruturação de cadeias de valor baseadas em biomassa sustentável, SAFs e produtos da sociobiodiversidade." },
            { title: "Eixo 4 — Inovação e Tecnologia", desc: "Fomento à biorrefinarias, biodigestores comunitários e tecnologias de conversão energética para comunidades rurais." },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Alinhamento: o Módulo II implementa os eixos de cadeias produtivas e inovação do PlanBio através dos circuitos fechados de biomassa e sistemas agroflorestais.
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <a href="https://www.gov.br/mma/pt-br/noticias/governo-federal-abre-consulta-publica-sobre-o-plano-nacional-de-desenvolvimento-da-bioeconomia" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
            <ExternalLink size={12} /> PlanBio — MMA
          </a>
          <a href="https://www.embrapa.br/tema-integracao-lavoura-pecuaria-floresta-ilpf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
            <ExternalLink size={12} /> ILPF — Embrapa
          </a>
        </div>
      </div>

      {/* Production systems */}
      <div className="space-y-3">
        <h2 className="pits-section-title">Sistemas Produtivos</h2>
        {sistemas.map((s, i) => (
          <div key={i} className="pits-card cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">{s.nome}</h3>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">{s.adocao}% adoção</span>
            </div>
            {expanded === i && (
              <div className="mt-3 pt-3 border-t border-border/50 text-sm space-y-1">
                <p>{s.desc}</p>
                <p className="text-secondary font-medium">{s.beneficio}</p>
                <p className="text-muted-foreground text-xs">Espécies/tecnologias: {s.especies}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
