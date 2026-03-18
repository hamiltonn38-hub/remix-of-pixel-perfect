import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { Satellite, TrendingDown, TreePine } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

export default function MapBiomasChart() {
  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.municipio);

  if (!mb) {
    return (
      <div className="pits-card text-center text-muted-foreground py-8">
        Dados MapBiomas não disponíveis para {selectedMunicipio.municipio}.
      </div>
    );
  }

  const coberturaOrdenada = [...mb.cobertura].sort((a, b) => b.percentual - a.percentual);

  return (
    <div className="space-y-4">
      {/* Header badges */}
      <div className="pits-card">
        <div className="flex items-center gap-2 mb-3">
          <Satellite size={18} className="text-primary" />
          <h2 className="pits-section-title">
            Cobertura do Solo — MapBiomas Coleção {mb.colecao} ({mb.anoReferencia})
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Vegetação Nativa</p>
            <p className="text-lg font-bold text-secondary">{mb.vegetacao_nativa_pct}%</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Área Total</p>
            <p className="text-lg font-bold">{mb.area_total_ha.toLocaleString("pt-BR")} ha</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Desmatamento 22–23</p>
            <p className="text-lg font-bold text-destructive">{mb.desmatamento_2022_2023_ha} ha</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Fonte</p>
            <p className="text-sm font-semibold">MapBiomas Col. 9</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <TreePine size={14} className="text-secondary" />
              Uso e Cobertura do Solo
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={coberturaOrdenada}
                  dataKey="percentual"
                  nameKey="classe"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={1}
                  label={({ classe, percentual }) =>
                    percentual > 5 ? `${percentual}%` : ""
                  }
                  labelLine={false}
                >
                  {coberturaOrdenada.map((entry, i) => (
                    <Cell key={i} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela de classes */}
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold mb-2">Classes de Cobertura</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Classe</th>
                  <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">Área (ha)</th>
                  <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {coberturaOrdenada.map((c) => (
                  <tr key={c.classeId} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-1.5 px-2 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: c.cor }}
                      />
                      {c.classe}
                    </td>
                    <td className="py-1.5 px-2 text-right">{c.area_ha.toLocaleString("pt-BR")}</td>
                    <td className="py-1.5 px-2 text-right font-medium">{c.percentual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Série temporal de vegetação nativa */}
      <div className="pits-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <TrendingDown size={14} className="text-destructive" />
          Evolução da Vegetação Nativa (2018–2023)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mb.serie_vegetacao_nativa}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Vegetação nativa"]}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="hsl(var(--secondary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--secondary))", r: 4 }}
              name="Vegetação nativa"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Fonte: MapBiomas Brasil — Coleção 9. Dados de sensoriamento remoto (Landsat). mapbiomas.org
        </p>
      </div>
    </div>
  );
}
