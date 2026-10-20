import { usePits } from "@/context/PitsContext";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { Satellite, TrendingDown, TreePine } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import FonteInfo from "./FonteInfo";
import Detalhes from "./Detalhes";

export default function MapBiomasChart() {
  const { selectedMunicipio } = usePits();
  const mb = getMapBiomasMunicipio(selectedMunicipio.codigoIBGE || selectedMunicipio.municipio);

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
            Cobertura e Uso da Terra — MapBiomas Coleção {mb.colecao} ({mb.anoReferencia})
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div tabIndex={0} className="group pits-block p-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-[11px] text-muted-foreground font-medium">Vegetação Nativa</p>
            <p className="text-xl font-extrabold text-secondary mt-0.5">{mb.vegetacao_nativa_pct}%</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">Remanescentes florestais e savânicos</p>
          </div>
          <div tabIndex={0} className="group pits-block p-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-[11px] text-muted-foreground font-medium">Área Mapeada</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{mb.area_total_ha.toLocaleString("pt-BR")} ha</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">Superfície territorial auditada</p>
          </div>
          <div tabIndex={0} className="group pits-block p-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-[11px] text-muted-foreground font-medium">Alertas Validados (SAD)</p>
            <p className="text-xl font-extrabold text-destructive mt-0.5">
              {mb.desmatamento_2022_2023_ha > 0 ? `${mb.desmatamento_2022_2023_ha} ha` : "Sem alertas"}
            </p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">Supressão detectada por satélite</p>
          </div>
          <div tabIndex={0} className="group pits-block p-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="text-[11px] text-muted-foreground font-medium">Fonte Auditada</p>
            <p className="text-base font-bold text-secondary mt-0.5">MapBiomas Col. {mb.colecao}</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">Ano base {mb.anoReferencia}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <TreePine size={14} className="text-secondary" />
              Uso e Cobertura do Solo ({mb.anoReferencia})
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
                  label={({ percentual }) =>
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
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela de classes */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Classes de Cobertura da Terra</h3>
            <p className="text-xs text-foreground">
              Predominante: <strong>{coberturaOrdenada[0].classe}</strong> — {coberturaOrdenada[0].percentual}% ({coberturaOrdenada[0].area_ha.toLocaleString("pt-BR")} ha)
            </p>
            <Detalhes titulo="Ver todas as classes">
            <div className="overflow-x-auto">
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
            </Detalhes>
          </div>
        </div>

        <FonteInfo
          variavel="cobertura_vegetal_nativa_2025"
          codigoIBGE={mb.codigoIBGE}
          selo="MapBiomas"
        />
      </div>

      {/* Série temporal real de vegetação nativa */}
      <div tabIndex={0} className="group pits-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingDown size={14} className="text-secondary" />
              Evolução Histórica da Vegetação Nativa (2018–2025)
            </h3>
            <p className="pits-reveal text-xs text-muted-foreground mt-0.5">
              Série histórica auditada de cobertura vegetal nativa (MapBiomas Coleção {mb.colecao})
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25 font-semibold font-mono">
            {mb.anoReferencia}: {mb.vegetacao_nativa_pct}%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mb.serie_vegetacao_nativa}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Vegetação Nativa"]}
              contentStyle={{
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="hsl(var(--secondary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--secondary))", r: 4 }}
              name="Vegetação Nativa"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <FonteInfo
          instituicao="MapBiomas Brasil"
          ano={2025}
          dataConsulta="11/10/2026"
          tabela="Coleção 11 (Série Anual de Cobertura e Transições 1985–2025)"
          url="https://brasil.mapbiomas.org/downloads/estatisticas/"
          selo="MapBiomas"
        />
      </div>
    </div>
  );
}
