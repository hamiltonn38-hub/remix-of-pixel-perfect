import { usePits } from "@/context/PitsContext";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { PitsLineChart } from "@/components/charts/PitsCharts";
import { ArrowUp, ArrowDown, Save, Trash2, Eye, Info, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { calcPEL, calcIVS, calcIVSStar, calcIPSE } from "@/lib/calcPits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FonteInfo from "@/components/FonteInfo";
import Detalhes from "@/components/Detalhes";
import type { MunicipioPits } from "@/data/municipiosData";

interface CenarioVars {
  reflorestamento_ha_ano: number;  // ha/ano de recuperação da Caatinga
  safs_ha_ano: number;            // ha/ano de transição para SAFs
  biodigestores_unidades: number; // unidades de biodigestores rurais
  reducaoLenha_pct: number;       // % de redução na lenha predatória
  psa_recursos_ano: number;       // R$/ano aplicados em PSA
  acordos_pct: number;            // % de comunidades com acordos
}

interface CenarioSalvo {
  nome: string;
  vars: CenarioVars;
  cor: string;
}

const CORES_CENARIOS = ["hsl(var(--secondary))", "hsl(var(--hydro))", "hsl(var(--accent))"];
const NOMES_DEFAULT = ["Cenário A", "Cenário B", "Cenário C"];

/** Meta fixa de referência do IPSE Normalizado (não se move sozinha) */
const META_FIXA_IPSE_NORM = 0.60;

/** Custo de referência de PSA por hectare/ano (Lei 14.119/2021 / premissa) */
const CUSTO_PSA_POR_HA_ANO = 300;

function calcProjecaoSimulada(
  m: MunicipioPits,
  vars: CenarioVars,
  horizonte: number,
  anoInicial: number
) {
  const areaTotalHa = Math.max(1000, m.area_km2 * 100);
  const nEstabRurais = m.populacao ? Math.round(m.populacao * 0.05) : 3000;
  const ipseBaseNorm = m.IPSE_norm ?? 0.35;

  const points = [];

  for (let i = 0; i <= horizonte; i++) {
    const ano = anoInicial + i;

    // 1. Reflorestamento acumulado no ano i (em hectares reais escalados pela área do município)
    const areaReflorestadaAcumuladaHa = vars.reflorestamento_ha_ano * i;

    // 2. Área conservada viabilizada por PSA (Lei 14.119/2021)
    const areaPsaConservadaHa = (vars.psa_recursos_ano / CUSTO_PSA_POR_HA_ANO) * (i / horizonte);

    // 3. Nova área elegível de vegetação nativa no ano i
    const novaAreaNativaHa = Math.min(
      areaTotalHa,
      m.area_nativa_ha + areaReflorestadaAcumuladaHa + areaPsaConservadaHa
    );

    // 4. Incremento de produtividade por SAFs (Martins et al., 2013, DOI: 10.1590/S1415-43662013000600002)
    const areaSafAcumuladaHa = vars.safs_ha_ano * i;
    const fracaoSaf = Math.min(1.0, areaSafAcumuladaHa / Math.max(1, novaAreaNativaHa));
    const yieldBiomassa = 10.0 + fracaoSaf * (15.0 - 10.0); // 10 a 15 t/ha/ano

    // 5. Novo Potencial Energético Local PEL(i)
    const pelSimulado = calcPEL(novaAreaNativaHa, { Y_i: yieldBiomassa }) ?? m.PEL;

    // 6. Impacto dos biodigestores na carência de saneamento e energia do IVS
    const propBiodigestores = Math.min(0.25, (vars.biodigestores_unidades * (i / horizonte)) / Math.max(1, nEstabRurais));
    const carenciasSimuladas = {
      agua: m.carencias?.agua ?? 0.25,
      esgoto: Math.max(0.05, (m.carencias?.esgoto ?? 0.50) - propBiodigestores * 0.5),
      lixo: m.carencias?.lixo ?? 0.20,
      energia: Math.max(0.001, (m.carencias?.energia ?? 0.008) - propBiodigestores * 0.2),
    };

    const ivsSimulado = calcIVS(carenciasSimuladas) ?? m.IVS;
    const ivsStarSimulado = calcIVSStar(ivsSimulado) ?? m.IVS_star;

    // 7. IPSE projetado
    const ipseBrutoSimulado = calcIPSE(pelSimulado, ivsStarSimulado) ?? m.IPSE;
    const fatorCrescimento = m.IPSE > 0 ? ipseBrutoSimulado / m.IPSE : 1.0;
    const ipseNormSimulado = Number(Math.min(1.0, ipseBaseNorm * fatorCrescimento).toFixed(3));

    // Indicadores de Apoio Bounded <= 1.0 (Item S-8)
    const ibEst = Number(Math.min(1.0, novaAreaNativaHa / areaTotalHa).toFixed(2));
    const iieEst = Number(Math.min(1.0, m.IIE + (vars.safs_ha_ano * i) / 5000 + propBiodigestores).toFixed(2));
    const iglEst = Number(Math.min(1.0, m.IGL + (vars.acordos_pct / 100) * 0.2 * (i / horizonte)).toFixed(2));

    points.push({
      ano,
      base: ipseBaseNorm, // Cenário base FIXO (sem melhora automática — Item S-3)
      simulado: ipseNormSimulado,
      meta: META_FIXA_IPSE_NORM, // Meta fixa (não se move sozinha — Item S-4)
      pelBruto: pelSimulado,
      ivsEstimado: ivsSimulado,
      ibEstimado: ibEst,
      iieEstimado: iieEst,
      iglEstimado: iglEst,
    });
  }

  return points;
}

interface ChartPoint {
  ano: number;
  base: number;
  simulado: number;
  meta: number;
  [key: string]: number;
}

export default function Simulador() {
  const { selectedMunicipio: m } = usePits();
  const [horizonte, setHorizonte] = useState(10);
  
  // Ano inicial dinâmico (Item S-7)
  const anoInicial = useMemo(() => new Date().getFullYear(), []);

  // Variáveis com unidades corretas e parâmetros físicos (Itens S-1, S-5, S-6)
  const [vars, setVars] = useState<CenarioVars>({
    reflorestamento_ha_ano: 100,  // 100 hectares por ano (escala municipal)
    safs_ha_ano: 50,              // 50 ha/ano de transição para SAFs
    biodigestores_unidades: 30,   // 30 unidades instaladas
    reducaoLenha_pct: 35,         // 35% de substituição
    psa_recursos_ano: 150000,     // R$ 150.000/ano
    acordos_pct: 50,              // 50% das comunidades
  });

  const [cenariosSalvos, setCenariosSalvos] = useState<CenarioSalvo[]>(() => {
    try {
      const stored = localStorage.getItem("pits_cenariosSalvos");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [comparando, setComparando] = useState(false);

  useEffect(() => {
    localStorage.setItem("pits_cenariosSalvos", JSON.stringify(cenariosSalvos));
  }, [cenariosSalvos]);

  const setVar = (key: keyof CenarioVars, val: number) =>
    setVars((p) => ({ ...p, [key]: val }));

  const projecao = useMemo(
    () => calcProjecaoSimulada(m, vars, horizonte, anoInicial),
    [m, vars, horizonte, anoInicial]
  );

  const chartData = useMemo(() => {
    if (!comparando || cenariosSalvos.length === 0) return projecao;
    const base: ChartPoint[] = projecao.map((p) => ({ ...p }));
    cenariosSalvos.forEach((c, idx) => {
      const proj = calcProjecaoSimulada(m, c.vars, horizonte, anoInicial);
      proj.forEach((p, i) => {
        base[i][`cenario_${idx}`] = p.simulado;
      });
    });
    return base;
  }, [projecao, cenariosSalvos, comparando, horizonte, m, anoInicial]);

  const salvarCenario = useCallback(() => {
    if (cenariosSalvos.length >= 3) {
      toast.error("Máximo de 3 cenários salvos simultâneos");
      return;
    }
    const idx = cenariosSalvos.length;
    setCenariosSalvos((prev) => [
      ...prev,
      {
        nome: NOMES_DEFAULT[idx],
        vars: { ...vars },
        cor: CORES_CENARIOS[idx],
      },
    ]);
    toast.success(`${NOMES_DEFAULT[idx]} salvo!`);
  }, [cenariosSalvos, vars]);

  const removerCenario = (idx: number) => {
    setCenariosSalvos((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Cenário removido");
  };

  const carregarCenario = (c: CenarioSalvo) => {
    setVars({ ...c.vars });
    toast.info(`Carregado: ${c.nome}`);
  };

  const impactoFinal = projecao[projecao.length - 1];
  const deltaPct = Number(
    (((impactoFinal.simulado - impactoFinal.base) / (impactoFinal.base || 0.001)) * 100).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">Simulador Prospectivo de Cenários</h1>
        <p className="text-sm text-muted-foreground">
          Simulação biofísica e socioeconômica — {m.municipio} ({anoInicial} a {anoInicial + horizonte})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="pits-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="pits-section-title">Variáveis de Intervenção</h2>
            <Button size="sm" variant="outline" onClick={salvarCenario} disabled={cenariosSalvos.length >= 3}>
              <Save size={14} className="mr-1" /> Salvar
            </Button>
          </div>

          {/* Reflorestamento (ha/ano) — Item S-5 */}
          <div tabIndex={0} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <div className="flex justify-between text-xs mb-1">
              <span>Recuperação da Caatinga (ha/ano)</span>
              <span className="font-mono font-bold text-secondary">{vars.reflorestamento_ha_ano} ha/ano</span>
            </div>
            <Slider
              value={[vars.reflorestamento_ha_ano]}
              min={0}
              max={500}
              step={10}
              onValueChange={([v]) => setVar("reflorestamento_ha_ano", v)}
            />
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">
              Escala física: {vars.reflorestamento_ha_ano * horizonte} ha acumulados em {horizonte} anos (Sampaio & Silva, 2005)
            </p>
          </div>

          {/* SAFs (ha/ano) — Item S-1 */}
          <div tabIndex={0} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <div className="flex justify-between text-xs mb-1">
              <span>Expansão de SAFs (ha/ano)</span>
              <span className="font-mono font-bold text-secondary">{vars.safs_ha_ano} ha/ano</span>
            </div>
            <Slider
              value={[vars.safs_ha_ano]}
              min={0}
              max={200}
              step={5}
              onValueChange={([v]) => setVar("safs_ha_ano", v)}
            />
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">
              +260% de biomassa lenhosa vs convencional (Martins et al., 2013, SciELO)
            </p>
          </div>

          {/* Biodigestores Rurais (unidades) — Item S-5 */}
          <div tabIndex={0} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <div className="flex justify-between text-xs mb-1">
              <span>Biodigestores Rurais Instalados</span>
              <span className="font-mono font-bold text-foreground">{vars.biodigestores_unidades} unid.</span>
            </div>
            <Slider
              value={[vars.biodigestores_unidades]}
              min={0}
              max={150}
              step={5}
              onValueChange={([v]) => setVar("biodigestores_unidades", v)}
            />
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">
              Premissa do modelo — sem calibração (reduz carência energética no IVS)
            </p>
          </div>

          {/* Recursos PSA (R$/ano) — Item S-6 */}
          <div tabIndex={0} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <div className="flex justify-between text-xs mb-1">
              <span>Fundo de PSA (R$/ano)</span>
              <span className="font-mono font-bold text-primary">
                R$ {(vars.psa_recursos_ano / 1000).toFixed(0)}k/ano
              </span>
            </div>
            <Slider
              value={[vars.psa_recursos_ano]}
              min={0}
              max={500000}
              step={25000}
              onValueChange={([v]) => setVar("psa_recursos_ano", v)}
            />
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">
              Premissa do modelo — sem calibração (custo ref. R$ 300/ha/ano, Lei 14.119/2021)
            </p>
          </div>

          {/* Redução de Lenha sem Manejo (%) */}
          <div tabIndex={0} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <div className="flex justify-between text-xs mb-1">
              <span>Substituição de Lenha Predatória (%)</span>
              <span className="font-mono font-bold text-accent-readable">{vars.reducaoLenha_pct}%</span>
            </div>
            <Slider
              value={[vars.reducaoLenha_pct]}
              min={0}
              max={80}
              step={5}
              onValueChange={([v]) => setVar("reducaoLenha_pct", v)}
            />
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">
              Transição para planos de manejo sustentável (PMFS)
            </p>
          </div>

          {/* Horizonte Temporal — Item S-2 */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-semibold mb-2">Horizonte Temporal da Projeção</p>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonte(h)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    horizonte === h
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {h} anos
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Efeito cumulativo dependente do horizonte ({horizonte} anos de intervenção física acumulada)
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="pits-card lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pits-section-title">Projeção Dinâmica do IPSE Normalizado (0–1)</h2>
              <p className="text-xs text-muted-foreground">
                Cenário Base constante ({anoInicial}) vs Projeção cumulativa das intervenções
              </p>
            </div>
            {cenariosSalvos.length > 0 && (
              <Button size="sm" variant={comparando ? "default" : "outline"} onClick={() => setComparando(!comparando)}>
                <Eye size={14} className="mr-1" /> {comparando ? "Ocultar Cenários" : "Comparar Salvos"}
              </Button>
            )}
          </div>

          <PitsLineChart
            data={chartData}
            xKey="ano"
            height={300}
            yDomain={[0, 1]}
            showLegend
            lines={[
              { key: "base", name: `Cenário Base (${m.municipio})`, color: "hsl(var(--muted-foreground))", strokeWidth: 2 },
              { key: "simulado", name: "Cenário Simulado", color: "hsl(var(--primary))", strokeWidth: 3 },
              { key: "meta", name: "Meta Fixa (Patamar 0.60)", color: "hsl(var(--accent))", strokeWidth: 1.5, strokeDasharray: "4 4" },
              ...(comparando
                ? cenariosSalvos.map((c, idx) => ({
                    key: `cenario_${idx}`,
                    name: c.nome,
                    color: c.cor,
                  }))
                : []),
            ]}
          />

          <Detalhes titulo="Fundamentação metodológica"><div className="pits-block p-3 text-xs text-muted-foreground flex items-start gap-2">
            <BookOpen size={16} className="text-primary shrink-0 mt-0.5" />
            <p>
              <strong>Fundamentação Metodológica:</strong> O simulador calcula o impacto cumulativo das intervenções nas variáveis físicas do modelo oficial: área elegível MapBiomas (Sampaio & Silva, 2005), rendimento agroflorestal (Martins et al., 2013) e alívio de carências rurais (Censo 2022). Coeficientes operacionais sem dados empíricos municipais constituem <em>premissas do modelo — sem calibração</em>.
            </p>
          </div></Detalhes>
        </div>
      </div>

      {/* Cenários Salvos */}
      {cenariosSalvos.length > 0 && (
        <div className="pits-card">
          <h2 className="pits-section-title mb-3">Cenários Salvos em Memória ({cenariosSalvos.length}/3)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cenariosSalvos.map((c, idx) => {
              const proj = calcProjecaoSimulada(m, c.vars, horizonte, anoInicial);
              const fin = proj[proj.length - 1];
              const d = (((fin.simulado - fin.base) / (fin.base || 0.001)) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  tabIndex={0}
                  className="group pits-block p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.cor }} />
                      <span className="font-semibold text-xs text-foreground">{c.nome}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => carregarCenario(c)} className="text-xs text-primary hover:underline font-medium">Carregar</button>
                      <button onClick={() => removerCenario(idx)} className="text-xs text-destructive hover:underline ml-2" aria-label="Remover cenário">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="pits-reveal text-[11px] text-muted-foreground space-y-0.5 mb-2">
                    <p>Reflorestamento: {c.vars.reflorestamento_ha_ano} ha/ano</p>
                    <p>SAFs: {c.vars.safs_ha_ano} ha/ano</p>
                    <p>Biodigestores: {c.vars.biodigestores_unidades} unid.</p>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                    <span>IPSE ({anoInicial + horizonte}):</span>
                    <span className="font-bold font-mono text-primary">
                      {fin.simulado.toFixed(3)} ({d}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact cards com coeficientes unificados (Item S-8) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: `IPSE Projetado (${anoInicial + horizonte})`,
            value: impactoFinal.simulado.toFixed(3),
            delta: `${deltaPct > 0 ? "+" : ""}${deltaPct}%`,
            sub: "Índice normalizado (0–1)",
            isUp: deltaPct >= 0,
          },
          {
            label: "IB Estimado (Biomassa)",
            value: impactoFinal.ibEstimado.toFixed(2),
            delta: `+${((impactoFinal.ibEstimado - m.IB) * 100).toFixed(0)} p.p.`,
            sub: "Cobertura nativa escalada ≤ 1.0",
            isUp: true,
          },
          {
            label: "IVS Estimado (Vulnerabilidade)",
            value: impactoFinal.ivsEstimado.toFixed(4),
            delta: `${((impactoFinal.ivsEstimado - m.IVS) * 100).toFixed(1)} p.p.`,
            sub: "Menor valor = menor carência",
            isUp: impactoFinal.ivsEstimado <= m.IVS,
          },
          {
            label: "IIE Estimado (Práticas Rurais)",
            value: impactoFinal.iieEstimado.toFixed(2),
            delta: `+${((impactoFinal.iieEstimado - m.IIE) * 100).toFixed(0)} p.p.`,
            sub: "Integração energética ≤ 1.0",
            isUp: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            tabIndex={0}
            className="group pits-card text-center flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div>
              <p className="pits-label text-[11px]">{card.label}</p>
              <p className="pits-metric text-xl sm:text-2xl mt-1">{card.value}</p>
              <div className={`flex items-center justify-center gap-1 text-xs font-semibold mt-0.5 ${card.isUp ? "text-success" : "text-destructive"}`}>
                {card.isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{card.delta}</span>
              </div>
              <p className="pits-reveal text-[10px] text-muted-foreground mt-1">{card.sub}</p>
            </div>
            <FonteInfo
              instituicao="Modelo Prospectivo PITS"
              ano={anoInicial + horizonte}
              dataConsulta="11/10/2026"
              tabela="Projeção paramétrica biofísica e socioeconômica"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
