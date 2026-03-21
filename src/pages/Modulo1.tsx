import { usePits } from "@/context/PitsContext";
import { especiesNativas } from "@/data/mockData";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import MapBiomasChart from "@/components/MapBiomasChart";
import AlertasDesmatamento from "@/components/AlertasDesmatamento";
import { Leaf, TreePine, Droplets, Mountain, ExternalLink } from "lucide-react";
import { COBERTURA_META_PCT } from "@/lib/constants";
import { PitsBarChart } from "@/components/charts/PitsCharts";

const biomassaComparacao = [
  { faixa: "0–10%", biomassa: 5.2 },
  { faixa: "10–20%", biomassa: 9.8 },
  { faixa: "20–30%", biomassa: 14.3 },
  { faixa: "30–40%", biomassa: 19.1 },
  { faixa: ">40%", biomassa: 26.5 },
];

export default function Modulo1() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.municipio);
  const coberturaReal = mb?.vegetacao_nativa_pct ?? m.cobertura_arborea_pct;
  const metaPct = Math.min((coberturaReal / COBERTURA_META_PCT) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo I — Biofísico-Ecológico</h1>
        <p className="text-sm text-muted-foreground">Planejamento de paisagens multifuncionais e integridade florestal</p>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Integridade Florestal (IFL)", value: m.IB.toFixed(2), icon: TreePine },
          { label: "Estoque de Biomassa", value: `${m.estoque_biomassa_t_ha} t/ha`, icon: Leaf },
          { label: "Cobertura Vegetal Nativa", value: `${coberturaReal}%`, icon: Mountain },
          { label: "Regeneração", value: `${m.taxa_regeneracao_pct_ano}%/ano`, icon: Droplets },
        ].map((ind) => (
          <div key={ind.label} className="pits-card text-center">
            <ind.icon size={24} className="text-secondary mx-auto mb-2" />
            <p className="pits-label text-[11px]">{ind.label}</p>
            <p className="pits-metric text-xl mt-1">{ind.value}</p>
          </div>
        ))}
      </div>

      {/* Meta de cobertura */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-2">Meta de Cobertura Arbórea (≥ {COBERTURA_META_PCT}%)</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-700"
                style={{ width: `${metaPct}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold">{coberturaReal}% / {COBERTURA_META_PCT}%</span>
        </div>
      </div>

      {/* MapBiomas data */}
      <MapBiomasChart />

      {/* Alertas de Desmatamento — MapBiomas Alerta */}
      <AlertasDesmatamento />

      {/* Chart */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Biomassa por Faixa de Cobertura Arbórea</h2>
        <PitsBarChart
          data={biomassaComparacao}
          xKey="faixa"
          height={250}
          bars={[{ key: "biomassa", name: "Biomassa (t/ha)", color: "hsl(var(--secondary))" }]}
        />
      </div>

      {/* Plano Nacional de Bioeconomia */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={18} className="text-secondary" />
          <h2 className="pits-section-title">Plano Nacional de Bioeconomia</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>Plano Nacional de Bioeconomia (PlanBio)</strong> estabelece diretrizes estratégicas para a conservação e o uso sustentável da biodiversidade nos biomas brasileiros, incluindo a Caatinga.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Eixo 1 — Conservação da Biodiversidade", desc: "Promoção de áreas protegidas, restauração ecológica e manutenção da integridade florestal em biomas ameaçados." },
            { title: "Eixo 2 — Mapeamento de Ativos Biológicos", desc: "Inventário e monitoramento de estoques de biomassa, espécies nativas e serviços ecossistêmicos da Caatinga." },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Alinhamento: o Módulo I operacionaliza os eixos de conservação e mapeamento do PlanBio através do zoneamento territorial e monitoramento da integridade florestal.
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <a href="https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias/2024/07/plano-nacional-de-bioeconomia-planbio" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
            <ExternalLink size={12} /> PlanBio — Portal MCTI
          </a>
          <a href="https://www.gov.br/mcti/pt-br/composicao/secretarias/secretaria-de-politicas-e-programas-estrategicos/bioeconomia" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
            <ExternalLink size={12} /> Bioeconomia — MCTI
          </a>
          <a href="https://plataforma.brasil.mapbiomas.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
            <ExternalLink size={12} /> MapBiomas
          </a>
        </div>
      </div>

      {/* Species table */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Espécies Nativas Monitoradas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Espécie</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Nome Científico</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Biomassa (t/ha)</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {especiesNativas.map((e) => (
              <tr key={e.especie} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 px-3 font-medium">{e.especie}</td>
                <td className="py-2.5 px-3 italic text-muted-foreground">{e.nomeCientifico}</td>
                <td className="py-2.5 px-3 text-right">{e.biomassa}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    e.status === "Manejada" ? "bg-secondary/20 text-secondary" :
                    e.status === "Conservada" ? "bg-success/20 text-success" :
                    "bg-accent/20 text-accent-foreground"
                  }`}>
                    {e.status}
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
