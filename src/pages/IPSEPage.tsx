import { usePits } from "@/context/PitsContext";
import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import {
  calcPEL,
  calcIVS,
  calcIVSStar,
  calcIPSE,
  normalizeMinMax,
  normalizeWeights,
  FAIXA_LITERATURA,
  IVS_PARAMETRIC_FLOOR,
  classifyIPSENorm,
  LiteraturaParams,
} from "@/lib/calcPits";
import { PitsRadarChart } from "@/components/charts/PitsCharts";
import { Info, Sliders, ShieldAlert, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function IPSEPage() {
  const { selectedMunicipio: m, allMunicipios } = usePits();

  // Parâmetros configuráveis da faixa da literatura para PEL (Eq. 1)
  const [litParams, setLitParams] = useState<LiteraturaParams>({
    Y_i: FAIXA_LITERATURA.Y_i.default,   // 10.0 t/ha/ano
    PCI: FAIXA_LITERATURA.PCI.default,   // 16.5 MJ/kg
    eta: FAIXA_LITERATURA.eta.default,   // 0.25
  });

  // Penalidade de seca opcional δ_seca (Eq. 5)
  const [droughtPenalty, setDroughtPenalty] = useState(0.0);

  // Pesos do IVS (Eq. 4) — Censo Demográfico 2022
  const [ivsWeights, setIvsWeights] = useState<number[]>([0.30, 0.25, 0.25, 0.20]);

  const ivsLabels = [
    { label: "Carência de Água canalizada", desc: "Proporção de domicílios sem ligação à rede geral" },
    { label: "Esgotamento Inadequado", desc: "Domicílios sem rede de esgoto ou fossa séptica" },
    { label: "Lixo Não Coletado", desc: "Domicílios sem coleta direta sistemática" },
    { label: "Carência de Energia Elétrica", desc: "Domicílios sem fornecimento de energia" },
  ];

  const adjustIvsWeight = (index: number, newVal: number) => {
    const old = ivsWeights[index];
    const diff = newVal - old;
    const others = ivsWeights.filter((_, i) => i !== index);
    const othersSum = others.reduce((a, b) => a + b, 0);
    const newWeights = ivsWeights.map((w, i) => {
      if (i === index) return newVal;
      if (othersSum === 0) return (1 - newVal) / 3;
      return Math.max(0, w - (diff * w) / othersSum);
    });
    setIvsWeights(normalizeWeights(newWeights));
  };

  // Cálculo individual para o município selecionado
  const pelSelecionado = calcPEL(m.area_nativa_ha, litParams);
  const ivsSelecionado = calcIVS(m.carencias, ivsWeights);
  const ivsStarSelecionado = calcIVSStar(ivsSelecionado, { droughtPenalty });
  const ipseBrutoSelecionado = calcIPSE(pelSelecionado, ivsStarSelecionado);

  // Cálculo e normalização dinâmica para todos os municípios
  const ranking = useMemo(() => {
    const rawList = allMunicipios.map((mu) => {
      const pel = calcPEL(mu.area_nativa_ha, litParams);
      const ivs = calcIVS(mu.carencias, ivsWeights);
      const ivsStar = calcIVSStar(ivs, { droughtPenalty });
      const ipse = calcIPSE(pel, ivsStar);

      return {
        ...mu,
        pelCalculado: pel,
        ivsCalculado: ivs,
        ivsStarCalculado: ivsStar,
        ipseBruto: ipse,
      };
    });

    const ipses = rawList.map((mu) => mu.ipseBruto);
    const normalizados = normalizeMinMax(ipses);

    return rawList
      .map((mu, i) => ({
        ...mu,
        ipseNorm: normalizados[i],
      }))
      .sort((a, b) => {
        if (a.ipseNorm === null) return 1;
        if (b.ipseNorm === null) return -1;
        return (b.ipseNorm ?? 0) - (a.ipseNorm ?? 0);
      });
  }, [allMunicipios, litParams, droughtPenalty, ivsWeights]);

  const ipseNormSelecionado = ranking.find((r) => r.codigoIBGE === m.codigoIBGE)?.ipseNorm ?? 0;

  const radarData = [
    { metric: "Potencial Biomassa", val: m.IB, fullMark: 1 },
    { metric: "Carência Social (IVS)", val: ivsSelecionado ?? 0.25, fullMark: 1 },
    { metric: "Infraestrutura (IIE)", val: m.IIE, fullMark: 1 },
    { metric: "Governança (IGL)", val: m.IGL, fullMark: 1 },
  ];

  const formatEnergy = (val: number | null) => {
    if (val === null || val === undefined) return "Dados indisponíveis";
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} M GJ/ano`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} k GJ/ano`;
    return `${val.toFixed(0)} GJ/ano`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">IPSE — Índice de Potencial Socioenergético</h1>
        <p className="text-sm text-muted-foreground">
          Modelo oficial do artigo: cálculo matemático transparente, rastreável e auditado
        </p>
      </div>

      {/* Card da Equação Oficial */}
      <div className="pits-card border-primary/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">
              Especificação Matemática Oficial (Seção 3.1)
            </span>
            <div className="p-3 bg-muted/40 rounded-xl font-mono text-base md:text-lg font-bold text-foreground">
              IPSE = PEL / IVS*
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              O IPSE quantifica a disponibilidade energética sustentável de biomassa (PEL) em razão direta da vulnerabilidade socioeconômica municipal (IVS*). Quanto maior a biomassa elegível e menor a vulnerabilidade, maior o índice.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl border border-primary/20 min-w-[200px]">
            <p className="text-xs text-muted-foreground font-medium">IPSE Normalizado (0–1)</p>
            <p className="text-4xl font-extrabold text-primary my-1">
              {ipseNormSelecionado.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Bruto: {formatEnergy(ipseBrutoSelecionado)}
            </p>
            <div className="mt-2 text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {classifyIPSENorm(ipseNormSelecionado).label}
            </div>
          </div>
        </div>

        {/* Fórmulas componentes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50 text-xs">
          <div className="p-2 bg-muted/20 rounded">
            <strong>Eq. 1 — PEL:</strong> A_i · Y_i · PCI · η
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Área elegível (MapBiomas) × Produtividade × Poder Calorífico × Eficiência.
            </p>
          </div>
          <div className="p-2 bg-muted/20 rounded">
            <strong>Eq. 4 — IVS:</strong> 1 − Σ w_k·X_k = Σ w_k·C_k
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Carências em água, esgoto, lixo e energia (Censo 2022). IVS alto = mais vulnerável.
            </p>
          </div>
          <div className="p-2 bg-muted/20 rounded">
            <strong>Eq. 5 — IVS*:</strong> max(IVS · (1 + δ_seca), {IVS_PARAMETRIC_FLOOR})
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Penalidade climática opcional com piso paramétrico ε_floor = {IVS_PARAMETRIC_FLOOR}.
            </p>
          </div>
        </div>
      </div>

      {/* Sliders de Configuração dos Parâmetros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Painel 1: Parâmetros PEL (Faixa da Literatura) */}
        <div className="pits-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="pits-section-title flex items-center gap-1.5">
              <Sliders size={16} className="text-secondary" />
              Parâmetros do PEL (Faixa da Literatura)
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Valores configuráveis baseados nas faixas da literatura citadas no artigo científico. Rotulados como parâmetros de entrada, nunca como resultado.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-xs text-muted-foreground">
            Área elegível de Quixadá: <strong>{m.area_nativa_ha.toLocaleString("pt-BR")} ha</strong> (MapBiomas 2025)
          </p>

          {/* Produtividade Y_i */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{FAIXA_LITERATURA.Y_i.label}</span>
              <span className="font-mono font-bold text-secondary">
                {litParams.Y_i.toFixed(1)} {FAIXA_LITERATURA.Y_i.unit}
              </span>
            </div>
            <Slider
              value={[litParams.Y_i]}
              min={FAIXA_LITERATURA.Y_i.min}
              max={FAIXA_LITERATURA.Y_i.max}
              step={0.5}
              onValueChange={([v]) => setLitParams((p) => ({ ...p, Y_i: v }))}
            />
            <span className="text-[10px] text-muted-foreground">
              Faixa da literatura: {FAIXA_LITERATURA.Y_i.min} a {FAIXA_LITERATURA.Y_i.max} t·ha⁻¹·ano⁻¹
            </span>
          </div>

          {/* PCI */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{FAIXA_LITERATURA.PCI.label}</span>
              <span className="font-mono font-bold text-secondary">
                {litParams.PCI.toFixed(1)} {FAIXA_LITERATURA.PCI.unit}
              </span>
            </div>
            <Slider
              value={[litParams.PCI]}
              min={FAIXA_LITERATURA.PCI.min}
              max={FAIXA_LITERATURA.PCI.max}
              step={0.5}
              onValueChange={([v]) => setLitParams((p) => ({ ...p, PCI: v }))}
            />
            <span className="text-[10px] text-muted-foreground">
              Faixa da literatura: {FAIXA_LITERATURA.PCI.min} a {FAIXA_LITERATURA.PCI.max} MJ·kg⁻¹
            </span>
          </div>

          {/* Eficiência eta */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{FAIXA_LITERATURA.eta.label}</span>
              <span className="font-mono font-bold text-secondary">
                {(litParams.eta * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[litParams.eta]}
              min={FAIXA_LITERATURA.eta.min}
              max={FAIXA_LITERATURA.eta.max}
              step={0.01}
              onValueChange={([v]) => setLitParams((p) => ({ ...p, eta: v }))}
            />
            <span className="text-[10px] text-muted-foreground">
              Faixa da literatura: 20% a 30% (conversão termoquímica)
            </span>
          </div>

          {/* Penalidade de Seca δ_seca */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between text-xs mb-1">
              <span>Penalidade por Seca (δ_seca — Eq. 5)</span>
              <span className="font-mono font-bold text-destructive">
                {(droughtPenalty * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[droughtPenalty]}
              min={0}
              max={0.5}
              step={0.05}
              onValueChange={([v]) => setDroughtPenalty(v)}
            />
            <span className="text-[10px] text-muted-foreground">
              Agravamento da vulnerabilidade social por estresse hídrico
            </span>
          </div>
        </div>

        {/* Painel 2: Pesos do IVS (Eq. 4) */}
        <div className="pits-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="pits-section-title flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-accent" />
              Pesos das Carências do IVS (Censo 2022)
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
              Soma = 100%
            </span>
          </div>

          {/* Aviso Metodológico Conforme Item 5 / I-2 */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            <strong>Nota Metodológica (Item I-2):</strong> Os pesos padrão (30/25/25/20) constituem um <em>padrão ajustável, sem calibração empírica prévia</em>. Sugere-se a aplicação do método <strong>AHP (Analytic Hierarchy Process)</strong> em rodadas futuras com painel de especialistas regionais para calibração formal.
          </div>

          {ivsWeights.map((w, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <div>
                  <span className="font-medium">{ivsLabels[i].label}</span>
                  <p className="text-[10px] text-muted-foreground">{ivsLabels[i].desc}</p>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {(w * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[w]}
                min={0.05}
                max={0.60}
                step={0.01}
                onValueChange={([v]) => adjustIvsWeight(i, v)}
              />
            </div>
          ))}

          <div className="pt-2 text-xs flex justify-between text-muted-foreground border-t border-border/50">
            <span>IVS Resultante ({m.municipio}):</span>
            <span className="font-mono font-bold text-foreground">{ivsSelecionado?.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Radar de Indicadores Territoriais de Apoio */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-2">
          Perfil Multidimensional do Território — {m.municipio}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Comparação entre o potencial energético e os indicadores setoriais de apoio (IB, IIE, IGL).
        </p>
        <PitsRadarChart
          data={radarData}
          dataKey="val"
          angleKey="metric"
          height={260}
        />
      </div>

      {/* Ranking Oficial de Municípios */}
      <div className="pits-card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="pits-section-title flex items-center gap-2">
              <Award size={18} className="text-primary" />
              Ranking Municipal Socioenergético
            </h2>
            <p className="text-xs text-muted-foreground">
              Ordenado pelo IPSE Normalizado (0–1 Min-Max) • Fontes: MapBiomas Col. 11 e IBGE Censo 2022
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2.5 px-3">#</th>
              <th className="text-left py-2.5 px-3">Município</th>
              <th className="text-right py-2.5 px-3">Área Veg. Nativa (ha)</th>
              <th className="text-right py-2.5 px-3">PEL (GJ/ano)</th>
              <th className="text-right py-2.5 px-3">IVS (Censo 2022)</th>
              <th className="text-right py-2.5 px-3">IVS*</th>
              <th className="text-right py-2.5 px-3 font-semibold text-foreground">IPSE Bruto</th>
              <th className="text-right py-2.5 px-3 font-bold text-primary">IPSE Norm (0–1)</th>
              <th className="text-center py-2.5 px-3">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((mu, i) => {
              const isSelected = mu.municipio === m.municipio;
              const hasCalc = mu.ipseNorm !== null;
              return (
                <tr
                  key={mu.codigoIBGE}
                  className={`border-b border-border/40 transition-colors ${
                    isSelected ? "bg-primary/10 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="py-2.5 px-3 text-xs">{i + 1}</td>
                  <td className="py-2.5 px-3 font-medium">
                    {mu.municipio}
                    {isSelected && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-normal">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {mu.area_nativa_ha ? mu.area_nativa_ha.toLocaleString("pt-BR") : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {mu.pelCalculado ? (mu.pelCalculado / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "k" : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {mu.ivsCalculado !== null ? mu.ivsCalculado.toFixed(4) : "Dados indisponíveis"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {mu.ivsStarCalculado !== null ? mu.ivsStarCalculado.toFixed(4) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold">
                    {mu.ipseBruto ? formatEnergy(mu.ipseBruto) : "Não calculável"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm font-bold text-primary">
                    {hasCalc ? mu.ipseNorm!.toFixed(3) : "N/C"}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        !hasCalc
                          ? "bg-muted text-muted-foreground"
                          : mu.ipseNorm! >= 0.6
                          ? "bg-success/20 text-success"
                          : mu.ipseNorm! >= 0.3
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {classifyIPSENorm(mu.ipseNorm).label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
