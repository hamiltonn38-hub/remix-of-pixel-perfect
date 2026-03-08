import { usePits } from "@/context/PitsContext";
import { especiesNativas } from "@/data/mockData";
import { Leaf, TreePine, Droplets, Mountain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const biomassaComparacao = [
  { faixa: "0–10%", biomassa: 5.2 },
  { faixa: "10–20%", biomassa: 9.8 },
  { faixa: "20–30%", biomassa: 14.3 },
  { faixa: "30–40%", biomassa: 19.1 },
  { faixa: ">40%", biomassa: 26.5 },
];

export default function Modulo1() {
  const { selectedMunicipio: m } = usePits();
  const metaPct = Math.min((m.cobertura_arborea_pct / 40) * 100, 100);

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
          { label: "Cobertura Arbórea", value: `${m.cobertura_arborea_pct}%`, icon: Mountain },
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
        <h2 className="pits-section-title mb-2">Meta de Cobertura Arbórea (≥ 40%)</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-700"
                style={{ width: `${metaPct}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold">{m.cobertura_arborea_pct}% / 40%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Biomassa por Faixa de Cobertura Arbórea</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={biomassaComparacao}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="faixa" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Bar dataKey="biomassa" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} name="Biomassa (t/ha)" />
          </BarChart>
        </ResponsiveContainer>
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
