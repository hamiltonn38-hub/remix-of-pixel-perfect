import { usePits } from "@/context/PitsContext";
import { calcIPSE } from "@/data/mockData";
import { useState, useMemo } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Slider } from "@/components/ui/slider";
import { gaugeColorForIPSE } from "@/lib/constants";
import { PitsRadarChart } from "@/components/charts/PitsCharts";

export default function IPSEPage() {
  const { selectedMunicipio: m, allMunicipios } = usePits();
  const [weights, setWeights] = useState([0.30, 0.25, 0.25, 0.20]);

  const adjustWeight = (index: number, newVal: number) => {
    const old = weights[index];
    const diff = newVal - old;
    const others = weights.filter((_, i) => i !== index);
    const othersSum = others.reduce((a, b) => a + b, 0);
    const newWeights = weights.map((w, i) => {
      if (i === index) return newVal;
      if (othersSum === 0) return (1 - newVal) / 3;
      return Math.max(0, w - (diff * w) / othersSum);
    });
    setWeights(newWeights);
  };

  const customIPSE = calcIPSE(m.IB, m.IVS, m.IIE, m.IGL, weights);

  const radarData = [
    { sub: "IB", value: m.IB, fullMark: 1 },
    { sub: "IVS", value: m.IVS, fullMark: 1 },
    { sub: "IIE", value: m.IIE, fullMark: 1 },
    { sub: "IGL", value: m.IGL, fullMark: 1 },
  ];

  const labels = ["IB — Biomassa", "IVS — Vulnerabilidade", "IIE — Infraestrutura", "IGL — Governança"];

  const ranking = useMemo(() => {
    return [...allMunicipios].map((mu) => ({
      ...mu,
      ipseCustom: calcIPSE(mu.IB, mu.IVS, mu.IIE, mu.IGL, weights),
    })).sort((a, b) => b.ipseCustom - a.ipseCustom);
  }, [allMunicipios, weights]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">IPSE — Índice de Potencial Socioenergético</h1>
        <p className="text-sm text-muted-foreground">Metodologia transparente e pesos personalizáveis</p>
      </div>

      {/* Formula */}
      <div className="pits-card text-center">
        <p className="text-sm text-muted-foreground mb-2">Fórmula do IPSE</p>
        <p className="text-lg font-mono font-semibold">
          IPSE = w₁·IB + w₂·IVS + w₃·IIE + w₄·IGL
        </p>
        <p className="pits-metric text-3xl mt-3" style={{ color: gaugeColorForIPSE(customIPSE) }}>
          {customIPSE.toFixed(3)}
        </p>
      </div>

      {/* Sliders + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weight sliders */}
        <div className="pits-card space-y-5">
          <h2 className="pits-section-title">Pesos Personalizáveis</h2>
          {weights.map((w, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{labels[i]}</span>
                <span className="font-mono font-medium">{(w * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[w]}
                min={0}
                max={0.6}
                step={0.01}
                onValueChange={([v]) => adjustWeight(i, v)}
                className="w-full"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Soma dos pesos: {(weights.reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
          </p>
        </div>

        {/* Radar */}
        <div className="pits-card">
          <h2 className="pits-section-title mb-4">Gráfico Radar — {m.municipio}</h2>
          <PitsRadarChart
            data={radarData}
            dataKey="value"
            angleKey="sub"
            height={280}
          />
        </div>
      </div>

      {/* Ranking */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Ranking de Municípios</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Município</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">IPSE</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">IB</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">IVS</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">IIE</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">IGL</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((mu, i) => (
              <tr key={mu.municipio} className={`border-b border-border/50 ${mu.municipio === m.municipio ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                <td className="py-2.5 px-3 font-medium">{i + 1}</td>
                <td className="py-2.5 px-3 font-medium">{mu.municipio}</td>
                <td className="py-2.5 px-3 text-right font-semibold">{mu.ipseCustom.toFixed(3)}</td>
                <td className="py-2.5 px-3 text-right">{mu.IB.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right">{mu.IVS.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right">{mu.IIE.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right">{mu.IGL.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
