import { usePits } from "@/context/PitsContext";
import { Database, CheckCircle, BarChart3, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fontes = [
  { nome: "IBGE", desc: "Dados socioeconômicos e territoriais", variaveis: 42, atualizado: "2024-11-15" },
  { nome: "MapBiomas", desc: "Cobertura e uso do solo", variaveis: 28, atualizado: "2024-10-20" },
  { nome: "ANA", desc: "Recursos hídricos", variaveis: 15, atualizado: "2024-12-01" },
  { nome: "INMET", desc: "Dados climatológicos", variaveis: 22, atualizado: "2024-12-10" },
];

const serieData = [
  { ano: 2019, cobertura: 30.1, biomassa: 15.2, precipitacao: 680, ipse: 0.35 },
  { ano: 2020, cobertura: 31.2, biomassa: 16.1, precipitacao: 720, ipse: 0.38 },
  { ano: 2021, cobertura: 32.5, biomassa: 17.0, precipitacao: 690, ipse: 0.42 },
  { ano: 2022, cobertura: 33.1, biomassa: 17.8, precipitacao: 750, ipse: 0.47 },
  { ano: 2023, cobertura: 33.8, biomassa: 18.3, precipitacao: 710, ipse: 0.51 },
  { ano: 2024, cobertura: 34.2, biomassa: 18.7, precipitacao: 730, ipse: 0.54 },
];

const registros = [
  { data: "2024-12-08", comunidade: "Aroeira", indicador: "Cobertura arbórea", valor: "35.1%", status: "Validado" },
  { data: "2024-12-05", comunidade: "Serra Preta", indicador: "Nível hídrico", valor: "2.3m", status: "Validado" },
  { data: "2024-12-01", comunidade: "Vila São José", indicador: "Biomassa", valor: "19.2 t/ha", status: "Pendente" },
];

export default function Modulo4() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo IV — Monitoramento Socioecológico</h1>
        <p className="text-sm text-muted-foreground">Monitoramento contínuo com dados territoriais atualizados</p>
      </div>

      {/* Data sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fontes.map((f) => (
          <div key={f.nome} className="pits-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-hydro" />
                <h3 className="font-semibold text-sm">{f.nome}</h3>
              </div>
              <CheckCircle size={14} className="text-success" />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{f.desc}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{f.variaveis} variáveis</span>
              <span>{f.atualizado}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Time series */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Série Temporal (2019–2024)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={serieData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="cobertura" stroke="hsl(var(--secondary))" strokeWidth={2} name="Cobertura (%)" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="biomassa" stroke="hsl(var(--primary))" strokeWidth={2} name="Biomassa (t/ha)" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ipse" stroke="hsl(var(--accent))" strokeWidth={2} name="IPSE" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Participatory monitoring */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Monitoramento Participativo — Últimos Registros</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Comunidade</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Indicador</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Valor</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2.5 px-3 text-muted-foreground">{r.data}</td>
                <td className="py-2.5 px-3">{r.comunidade}</td>
                <td className="py-2.5 px-3">{r.indicador}</td>
                <td className="py-2.5 px-3 font-medium">{r.valor}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "Validado" ? "bg-success/20 text-success" : "bg-accent/20 text-accent-foreground"}`}>
                    {r.status}
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
