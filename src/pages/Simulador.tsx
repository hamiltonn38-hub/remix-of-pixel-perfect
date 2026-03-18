import { usePits } from "@/context/PitsContext";
import { useState, useMemo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowUp, ArrowDown, Save, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CenarioVars {
  agroflorestal: number;
  biodigestores: number;
  psa: number;
  acordos: number;
  reflorestamento: number;
  reducaoLenha: number;
}

interface CenarioSalvo {
  nome: string;
  vars: CenarioVars;
  cor: string;
}

const CORES_CENARIOS = ["hsl(var(--secondary))", "hsl(var(--hydro))", "hsl(var(--accent))"];
const NOMES_DEFAULT = ["Cenário A", "Cenário B", "Cenário C"];

function calcProjecao(ipse: number, vars: CenarioVars, horizonte: number) {
  const years = [];
  for (let i = 0; i <= horizonte; i++) {
    const t = i / horizonte;
    const boost = (vars.agroflorestal / 100 * 0.08 + vars.biodigestores / 50 * 0.05 + vars.acordos / 100 * 0.06 + vars.reflorestamento / 100 * 0.07 + vars.reducaoLenha / 100 * 0.04) * t;
    years.push({
      ano: 2024 + i,
      base: Math.min(1, ipse + i * 0.005),
      simulado: Math.min(1, ipse + boost + i * 0.005),
      meta: Math.min(1, 0.7 + i * 0.002),
    });
  }
  return years;
}

export default function Simulador() {
  const { selectedMunicipio: m } = usePits();
  const [horizonte, setHorizonte] = useState(10);
  const [vars, setVars] = useState<CenarioVars>({
    agroflorestal: 30,
    biodigestores: 20,
    psa: 300000,
    acordos: 60,
    reflorestamento: 50,
    reducaoLenha: 40,
  });
  const [cenariosSalvos, setCenariosSalvos] = useState<CenarioSalvo[]>([]);
  const [comparando, setComparando] = useState(false);

  const setVar = (key: keyof CenarioVars, val: number) => setVars((p) => ({ ...p, [key]: val }));

  const projecao = useMemo(() => calcProjecao(m.IPSE, vars, horizonte), [horizonte, vars, m.IPSE]);

  // Merge saved scenarios into chart data
  const chartData = useMemo(() => {
    if (!comparando || cenariosSalvos.length === 0) return projecao;
    const base = projecao.map((p) => ({ ...p }));
    cenariosSalvos.forEach((c, idx) => {
      const proj = calcProjecao(m.IPSE, c.vars, horizonte);
      proj.forEach((p, i) => {
        (base[i] as any)[`cenario_${idx}`] = p.simulado;
      });
    });
    return base;
  }, [projecao, cenariosSalvos, comparando, horizonte, m.IPSE]);

  const salvarCenario = useCallback(() => {
    if (cenariosSalvos.length >= 3) {
      toast.error("Máximo de 3 cenários salvos");
      return;
    }
    const idx = cenariosSalvos.length;
    setCenariosSalvos((prev) => [...prev, {
      nome: NOMES_DEFAULT[idx],
      vars: { ...vars },
      cor: CORES_CENARIOS[idx],
    }]);
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

  const impacto = projecao[projecao.length - 1];
  const deltaIPSE = ((impacto.simulado - impacto.base) / impacto.base * 100).toFixed(1);

  const sliders = [
    { key: "agroflorestal" as const, label: "Área em SAFs (%)", max: 100, val: vars.agroflorestal },
    { key: "biodigestores" as const, label: "Biodigestores implantados", max: 50, val: vars.biodigestores },
    { key: "acordos" as const, label: "Comunidades com acordos (%)", max: 100, val: vars.acordos },
    { key: "reflorestamento" as const, label: "Área reflorestada (ha/ano)", max: 200, val: vars.reflorestamento },
    { key: "reducaoLenha" as const, label: "Redução lenha s/ manejo (%)", max: 100, val: vars.reducaoLenha },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulador de Cenários</h1>
        <p className="text-sm text-muted-foreground">Simulação prospectiva — {m.municipio}</p>
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
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm mb-1">
                <span>{s.label}</span>
                <span className="font-mono font-medium">{s.val}</span>
              </div>
              <Slider value={[s.val]} min={0} max={s.max} step={1} onValueChange={([v]) => setVar(s.key, v)} />
            </div>
          ))}
          <div>
            <p className="text-sm mb-1">Horizonte temporal</p>
            <div className="flex gap-2">
              {[5, 10, 20].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonte(h)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${horizonte === h ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {h} anos
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="pits-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="pits-section-title">Projeção do IPSE</h2>
            {cenariosSalvos.length > 0 && (
              <Button size="sm" variant={comparando ? "default" : "outline"} onClick={() => setComparando(!comparando)}>
                <Eye size={14} className="mr-1" /> {comparando ? "Comparando" : "Comparar"}
              </Button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="base" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={2} name="Cenário Base" dot={false} />
              <Line type="monotone" dataKey="simulado" stroke="hsl(var(--secondary))" strokeWidth={3} name="Atual" dot={false} />
              <Line type="monotone" dataKey="meta" stroke="hsl(var(--accent))" strokeDasharray="3 3" strokeWidth={2} name="Meta HAMILTON" dot={false} />
              {comparando && cenariosSalvos.map((c, idx) => (
                <Line key={idx} type="monotone" dataKey={`cenario_${idx}`} stroke={c.cor} strokeWidth={2} name={c.nome} dot={false} strokeDasharray={idx === 1 ? "8 4" : idx === 2 ? "2 2" : undefined} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Projeto FUNDECI/2025.0016 — Projeções estimativas para o semiárido cearense</p>
        </div>
      </div>

      {/* Saved scenarios */}
      {cenariosSalvos.length > 0 && (
        <div className="pits-card">
          <h2 className="pits-section-title mb-4">Cenários Salvos ({cenariosSalvos.length}/3)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cenariosSalvos.map((c, idx) => {
              const proj = calcProjecao(m.IPSE, c.vars, horizonte);
              const final_ = proj[proj.length - 1];
              const delta = ((final_.simulado - final_.base) / final_.base * 100).toFixed(1);
              return (
                <div key={idx} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.cor }} />
                      <span className="font-semibold text-sm">{c.nome}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => carregarCenario(c)} className="text-xs text-primary hover:underline">Carregar</button>
                      <button onClick={() => removerCenario(idx)} className="text-xs text-destructive hover:underline ml-2">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>SAFs: {c.vars.agroflorestal}%</span>
                    <span>Biodig.: {c.vars.biodigestores}</span>
                    <span>Acordos: {c.vars.acordos}%</span>
                    <span>Refl.: {c.vars.reflorestamento} ha</span>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-lg font-bold">{final_.simulado.toFixed(3)}</span>
                    <span className={`text-xs ml-2 ${parseFloat(delta) > 0 ? "text-success" : "text-destructive"}`}>
                      {parseFloat(delta) > 0 ? "+" : ""}{delta}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "IPSE Projetado", value: impacto.simulado.toFixed(3), delta: deltaIPSE },
          { label: "IB Estimado", value: (m.IB + vars.reflorestamento / 100 * 0.15).toFixed(2), delta: ((vars.reflorestamento / 100 * 0.15 / m.IB) * 100).toFixed(1) },
          { label: "IIE Estimado", value: (m.IIE + vars.biodigestores / 50 * 0.1).toFixed(2), delta: ((vars.biodigestores / 50 * 0.1 / m.IIE) * 100).toFixed(1) },
          { label: "IGL Estimado", value: (m.IGL + vars.acordos / 100 * 0.12).toFixed(2), delta: ((vars.acordos / 100 * 0.12 / m.IGL) * 100).toFixed(1) },
        ].map((card) => {
          const isUp = parseFloat(card.delta) > 0;
          return (
            <div key={card.label} className="pits-card text-center">
              <p className="pits-label text-[11px]">{card.label}</p>
              <p className="pits-metric text-xl mt-1">{card.value}</p>
              <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${isUp ? "text-success" : "text-destructive"}`}>
                {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{card.delta}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
