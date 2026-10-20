import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import MapBiomasChart from "@/components/MapBiomasChart";
import AlertasDesmatamento from "@/components/AlertasDesmatamento";
import { Leaf, TreePine, Droplets, Mountain, ExternalLink } from "lucide-react";
import { PitsBarChart } from "@/components/charts/PitsCharts";
import FonteInfo from "@/components/FonteInfo";
import Detalhes from "@/components/Detalhes";
import { especiesNativasCaatinga } from "@/data/municipiosData";

/** Referência legal da Reserva Legal no Bioma Caatinga por imóvel (Lei 12.651/2012, Art. 12, II) */
const RESERVA_LEGAL_CAATINGA_PCT = 20;

// Biomassa por faixa de cobertura baseada na alometria regional de Sampaio & Silva (2005) - Acta Bot. Bras.
const biomassaComparacao = [
  { faixa: "0–20%", biomassa: 8.5 },
  { faixa: "20–40%", biomassa: 16.2 },
  { faixa: "40–60%", biomassa: 24.8 },
  { faixa: "60–80%", biomassa: 29.5 },
  { faixa: ">80%", biomassa: 34.5 },
];

export default function Modulo1() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.codigoIBGE || m.municipio);
  const coberturaReal = m.cobertura_nativa_pct;
  const metaCumprida = coberturaReal >= RESERVA_LEGAL_CAATINGA_PCT;

  // Formatação da precipitação do INMET com estação e distância (M4-3)
  const estacaoTexto = m.estacao_inmet
    ? `Estação ${m.estacao_inmet.codigo} (${m.estacao_inmet.nome}) a ${m.estacao_inmet.distanciaKm} km`
    : "INMET BDMEP";
  
  const precipDisplay = m.precipitacao_anual_mm !== null
    ? `${m.precipitacao_anual_mm} mm`
    : "Dados indisponíveis";

  const precipSub = m.precipitacao_anual_mm !== null
    ? estacaoTexto
    : "Estação sem registros em 2024";

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
          {
            label: "Índice de Biomassa (IB)",
            value: m.IB.toFixed(2),
            sub: "Vegetação nativa proporcional",
            icon: TreePine,
            variavel: "cobertura_vegetal_nativa_2025",
          },
          {
            label: "Densidade de Biomassa",
            value: `${m.estoque_biomassa_t_ha} t/ha`,
            sub: "Média IFN-CE / SFB",
            icon: Leaf,
            variavel: "biomassa_densidade_t_ha",
          },
          {
            label: "Vegetação Nativa",
            value: `${coberturaReal}%`,
            sub: `${m.area_nativa_ha.toLocaleString("pt-BR")} ha (Col. 11)`,
            icon: Mountain,
            variavel: "cobertura_vegetal_nativa_2025",
          },
          {
            label: "Precipitação Anual",
            value: precipDisplay,
            sub: precipSub,
            icon: Droplets,
            variavel: "precipitacao_anual_2024",
          },
        ].map((ind) => (
          <div
            key={ind.label}
            tabIndex={0}
            className="group pits-card flex flex-col justify-between text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div>
              <ind.icon size={24} className="text-secondary mx-auto mb-2" />
              <p className="pits-label text-[11px]">{ind.label}</p>
              <p className="pits-metric text-xl sm:text-2xl mt-1">{ind.value}</p>
              <p className="pits-reveal text-[10px] text-muted-foreground mt-1">{ind.sub}</p>
            </div>
            <FonteInfo variavel={ind.variavel} codigoIBGE={m.codigoIBGE} />
          </div>
        ))}
      </div>

      {/* Referência Legal da Reserva Legal */}
      <div tabIndex={0} className="group pits-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="pits-section-title">
            Referência Legal: Reserva Legal no Bioma Caatinga por Imóvel (≥ {RESERVA_LEGAL_CAATINGA_PCT}%)
          </h2>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${metaCumprida ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>
            {metaCumprida ? "Excedente de Vegetação Nativa" : "Déficit em Relação ao Patamar Legal"}
          </span>
        </div>
        <p className="pits-reveal text-xs text-muted-foreground mb-3">
          Art. 12, II da Lei Federal nº 12.651/2012 (Código Florestal). O município possui {coberturaReal}% de remanescentes nativos mapeados pelo MapBiomas em 2025.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-700"
                style={{ width: `${Math.min(100, (coberturaReal / 100) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-mono font-extrabold text-secondary">{coberturaReal}% territorial</span>
        </div>
        <FonteInfo
          instituicao="Lei Federal nº 12.651/2012 / MapBiomas"
          ano={2025}
          dataConsulta="11/10/2026"
          tabela="Código Florestal (Art. 12, II) e Coleção 11"
          url="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm"
        />
      </div>

      {/* MapBiomas Coleção 11 */}
      <MapBiomasChart />

      {/* Alertas de Desmatamento — MapBiomas Alerta */}
      <AlertasDesmatamento />

      {/* Gráfico Alometria de Biomassa */}
      <div tabIndex={0} className="group pits-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="pits-section-title">Estoque Médio de Biomassa Aérea por Faixa de Vegetação Nativa</h2>
            <p className="pits-reveal text-xs text-muted-foreground">
              Alometria empírica para formações da Caatinga (Sampaio & Silva, 2005, Acta Bot. Bras. / IFN-CE)
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25 font-mono font-semibold">
            IFN-CE: 34,5 t/ha máx
          </span>
        </div>
        <PitsBarChart
          data={biomassaComparacao}
          xKey="faixa"
          height={240}
          bars={[{ key: "biomassa", name: "Biomassa Média Estimada (t/ha)", color: "hsl(var(--secondary))" }]}
        />
        <FonteInfo
          instituicao="Acta Botanica Brasilica / Serviço Florestal Brasileiro"
          ano={2025}
          dataConsulta="11/10/2026"
          tabela="Sampaio & Silva (2005, DOI: 10.1590/S0102-33062005000400028) / Relatório Técnico IFN-CE"
          url="https://doi.org/10.1590/S0102-33062005000400028"
          selo="SFB"
        />
      </div>

      {/* Estrutura Oficial do PNDBio (Decreto Federal nº 12.044/2024) — G7 / M1-9 */}
      <div className="pits-card border-l-4 border-l-secondary space-y-3">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio) — Conservação e Biomassa</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong>Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)</strong>, instituído pelo Decreto Federal nº 12.044, de 5 de junho de 2024, e regulamentado pelas Resoluções CNBio nº 7/2025 e nº 8/2026, organiza a política federal de bioeconomia em <strong>3 eixos estruturantes e 8 missões estratégicas</strong>.
        </p>
        <Detalhes titulo="Ver eixos, missões e links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              eixo: "Eixo 1 — Sociobioeconomia e Ativos Ambientais",
              missao: "Missão 2 — Territórios e Conservação",
              desc: "Conservação da integridade ecológica dos biomas, restauração florestal da Caatinga e fortalecimento das cadeias da sociobiodiversidade.",
            },
            {
              eixo: "Eixo 3 — Produção Sustentável de Biomassa",
              missao: "Missão 6 — Produção de Biomassa Sustentável",
              desc: "Planos de manejo florestal sustentável (PMFS), certificação de origem lenhosa e transição energética justa em paisagens semiáridas.",
            },
          ].map((item) => (
            <div key={item.missao} className="pits-block p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary">{item.eixo}</span>
              <h4 className="text-xs font-semibold text-foreground">{item.missao}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal da Estratégia Nacional de Bioeconomia (gov.br/mma)
          </a>
          <a
            href="https://brasil.mapbiomas.org/downloads/estatisticas/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Estatísticas Municipais MapBiomas Brasil
          </a>
        </div>
        </Detalhes>
        <FonteInfo
          instituicao="Ministério do Meio Ambiente e Mudança do Clima (MMA)"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Decreto Federal nº 12.044/2024 e Resoluções CNBio nº 7/2025 e 8/2026"
          url="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
        />
      </div>

      {/* Espécies Nativas da Caatinga com Nomenclatura Botânica Aceita — M1-10 */}
      <div className="pits-card overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="pits-section-title">Espécies Nativas da Caatinga para Manejo Florestal Sustentável e Restauração</h2>
            <p className="text-xs text-muted-foreground">
              Nomenclatura taxonômica botânica atualizada conforme Flora e Funga do Brasil (Jardim Botânico do Rio de Janeiro)
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
            Flora do Brasil 2020 / JBRJ
          </span>
        </div>
        <Detalhes titulo={`Ver tabela de espécies (${especiesNativasCaatinga.length})`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-foreground/80">
              <th className="text-left py-2 px-3">Espécie</th>
              <th className="text-left py-2 px-3">Nome Científico Aceito</th>
              <th className="text-left py-2 px-3">Família Botânica</th>
              <th className="text-left py-2 px-3">Origem Ecológica</th>
              <th className="text-left py-2 px-3">Potencial e Uso Regional</th>
            </tr>
          </thead>
          <tbody>
            {especiesNativasCaatinga.map((e) => (
              <tr key={e.especie} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 px-3 font-medium">{e.especie}</td>
                <td className="py-2.5 px-3 italic text-xs text-foreground font-medium">{e.nomeCientifico}</td>
                <td className="py-2.5 px-3 text-xs">{e.familia}</td>
                <td className="py-2.5 px-3 text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success">
                    {e.origem}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{e.uso}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </Detalhes>
        <FonteInfo
          instituicao="Jardim Botânico do Rio de Janeiro (Flora e Funga do Brasil)"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Base Taxonômica Oficial (floradobrasil.jbrj.gov.br)"
          url="https://floradobrasil.jbrj.gov.br/"
        />
      </div>
    </div>
  );
}
