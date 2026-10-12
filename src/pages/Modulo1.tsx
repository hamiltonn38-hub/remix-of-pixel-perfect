import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import MapBiomasChart from "@/components/MapBiomasChart";
import AlertasDesmatamento from "@/components/AlertasDesmatamento";
import { Leaf, TreePine, Droplets, Mountain, ExternalLink } from "lucide-react";
import { PitsBarChart } from "@/components/charts/PitsCharts";

/** Referência legal da Reserva Legal no Bioma Caatinga (Lei 12.651/2012, Art. 12, II) */
const RESERVA_LEGAL_CAATINGA_PCT = 20;

// Biomassa por faixa de cobertura baseada em Sampaio & Silva (2005) - Acta Botanica Brasilica
const biomassaComparacao = [
  { faixa: "0–20%", biomassa: 8.5 },
  { faixa: "20–40%", biomassa: 16.2 },
  { faixa: "40–60%", biomassa: 24.8 },
  { faixa: "60–80%", biomassa: 29.5 },
  { faixa: ">80%", biomassa: 34.5 },
];

export const especiesNativasCaatinga = [
  { especie: "Sabiá", nomeCientifico: "Mimosa caesalpiniifolia", familia: "Fabaceae", uso: "Manejo florestal e forragem" },
  { especie: "Catingueira", nomeCientifico: "Cenostigma pyramidale", familia: "Fabaceae", uso: "Regeneração e lenha sob manejo" },
  { especie: "Juazeiro", nomeCientifico: "Sarcomphalus joazeiro", familia: "Rhamnaceae", uso: "Sombra, forragem perene na seca" },
  { especie: "Angico", nomeCientifico: "Anadenanthera colubrina", familia: "Fabaceae", uso: "Manejo florestal e tanino" },
  { especie: "Jurema-preta", nomeCientifico: "Mimosa tenuiflora", familia: "Fabaceae", uso: "Biomassa energética e proteção de solo" },
];

export default function Modulo1() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.codigoIBGE || m.municipio);
  const coberturaReal = m.cobertura_nativa_pct;
  const metaCumprida = coberturaReal >= RESERVA_LEGAL_CAATINGA_PCT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo I — Biofísico-Ecológico</h1>
        <p className="text-sm text-muted-foreground">
          Planejamento de paisagens multifuncionais, integridade ecológica e conservação da Caatinga
        </p>
      </div>

      {/* Indicadores Biofísicos Auditados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Índice de Biomassa (IB)", value: m.IB.toFixed(2), sub: "Cobertura nativa relativa", icon: TreePine },
          { label: "Estoque de Biomassa", value: `${m.estoque_biomassa_t_ha} t/ha`, sub: "Média IFN-CE / SFB", icon: Leaf },
          { label: "Vegetação Nativa", value: `${coberturaReal}%`, sub: `${m.area_nativa_ha.toLocaleString("pt-BR")} ha (Col. 11)`, icon: Mountain },
          { label: "Precipitação Anual", value: `${m.precipitacao_anual_mm} mm`, sub: "INMET BDMEP 2024", icon: Droplets },
        ].map((ind) => (
          <div key={ind.label} className="pits-card text-center">
            <ind.icon size={24} className="text-secondary mx-auto mb-2" />
            <p className="pits-label text-[11px]">{ind.label}</p>
            <p className="pits-metric text-xl mt-1">{ind.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{ind.sub}</p>
          </div>
        ))}
      </div>

      {/* Meta Legal de Reserva Legal */}
      <div className="pits-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="pits-section-title">
            Referência Legal: Reserva Legal no Bioma Caatinga (≥ {RESERVA_LEGAL_CAATINGA_PCT}%)
          </h2>
          <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${metaCumprida ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
            {metaCumprida ? "Excedente de Vegetação Nativa" : "Déficit de Reserva Legal"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Art. 12, II da Lei Federal nº 12.651/2012 (Código Florestal). O município possui {coberturaReal}% de remanescentes nativos mapeados pelo MapBiomas em 2025.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-700"
                style={{ width: `${Math.min(100, (coberturaReal / 100) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-semibold">{coberturaReal}% territorial</span>
        </div>
      </div>

      {/* MapBiomas Coleção 11 */}
      <MapBiomasChart />

      {/* Alertas de Desmatamento — MapBiomas Alerta */}
      <AlertasDesmatamento />

      {/* Gráfico Alometria de Biomassa */}
      <div className="pits-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="pits-section-title">Estoque Médio de Biomassa Aérea por Cobertura</h2>
            <p className="text-xs text-muted-foreground">
              Relação empírica documentada para a Caatinga (Sampaio & Silva, 2005, Acta Bot. Bras. / IFN-CE)
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">IFN-CE: 34,5 t/ha máx</span>
        </div>
        <PitsBarChart
          data={biomassaComparacao}
          xKey="faixa"
          height={240}
          bars={[{ key: "biomassa", name: "Biomassa (t/ha)", color: "hsl(var(--secondary))" }]}
        />
      </div>

      {/* Estrutura Oficial do PNDBio (Decreto 12.044/2024) */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)</strong>, instituído pelo Decreto Federal nº 12.044/2024 e pelas Resoluções CNBio nº 7/2025 e nº 8/2026, estrutura as ações federais para a sociobioeconomia e produção sustentável de biomassa.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "Eixo 1 — Sociobioeconomia e Ativos Ambientais (Missão 2)",
              desc: "Conservação dos territórios, restauração ecológica da Caatinga e valorização dos serviços ecossistêmicos.",
            },
            {
              title: "Eixo 3 — Produção Sustentável de Biomassa (Missão 6)",
              desc: "Manejo florestal sustentável, certificação de cadeias da biomassa e transição energética justa.",
            },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal da Bioeconomia (gov.br/mma)
          </a>
          <a
            href="https://plataforma.brasil.mapbiomas.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> MapBiomas Brasil
          </a>
        </div>
      </div>

      {/* Espécies Nativas da Caatinga com Nomenclatura Botânica Aceita */}
      <div className="pits-card overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="pits-section-title">Espécies Nativas da Caatinga para Manejo e Restauração</h2>
            <p className="text-xs text-muted-foreground">
              Nomenclatura taxonômica validada pelo Jardim Botânico do Rio de Janeiro (Flora e Funga do Brasil)
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Flora do Brasil 2020
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 px-3">Espécie</th>
              <th className="text-left py-2 px-3">Nome Científico Aceito</th>
              <th className="text-left py-2 px-3">Família</th>
              <th className="text-left py-2 px-3">Potencial e Uso Regional</th>
            </tr>
          </thead>
          <tbody>
            {especiesNativasCaatinga.map((e) => (
              <tr key={e.especie} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 px-3 font-medium">{e.especie}</td>
                <td className="py-2.5 px-3 italic font-mono text-xs text-muted-foreground">{e.nomeCientifico}</td>
                <td className="py-2.5 px-3 text-xs">{e.familia}</td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{e.uso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
