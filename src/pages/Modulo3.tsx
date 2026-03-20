import { usePits } from "@/context/PitsContext";
import { Users, FileCheck, Coins, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { PitsPieChart } from "@/components/charts/PitsCharts";

const acordos = [
  { comunidade: "Assentamento Aroeira", tipo: "Manejo florestal", data: "2024-03-15", status: "Ativo", area: 320 },
  { comunidade: "Quilombo Serra Preta", tipo: "Conservação hídrica", data: "2024-01-20", status: "Ativo", area: 185 },
  { comunidade: "Vila São José", tipo: "Extrativismo sustentável", data: "2023-11-10", status: "Ativo", area: 450 },
  { comunidade: "Distrito Cedro", tipo: "Reflorestamento", data: "2024-06-01", status: "Em revisão", area: 210 },
  { comunidade: "Sítio Boa Vista", tipo: "PSA Carbono", data: "2023-08-22", status: "Ativo", area: 145 },
];

const psaDistribuicao = [
  { nome: "Conservação florestal", valor: 42, cor: "hsl(var(--secondary))" },
  { nome: "Recarga hídrica", valor: 25, cor: "hsl(var(--hydro))" },
  { nome: "Sequestro de carbono", valor: 20, cor: "hsl(var(--primary))" },
  { nome: "Biodiversidade", valor: 13, cor: "hsl(var(--accent))" },
];

const ostromPrincipios = [
  { nome: "Limites claramente definidos", status: "cumprido" },
  { nome: "Regras de uso adaptadas", status: "cumprido" },
  { nome: "Arranjos de escolha coletiva", status: "parcial" },
  { nome: "Monitoramento efetivo", status: "parcial" },
  { nome: "Sanções graduais", status: "cumprido" },
  { nome: "Mecanismos de resolução de conflitos", status: "parcial" },
  { nome: "Reconhecimento mínimo de direitos", status: "cumprido" },
  { nome: "Governança em múltiplas camadas", status: "nao" },
];

export default function Modulo3() {
  const { selectedMunicipio: m } = usePits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo III — Governança Participativa</h1>
        <p className="text-sm text-muted-foreground">Instrumentos de governança multiescalar — Princípios de Ostrom</p>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Acordos de Manejo</p>
          <p className="pits-metric text-xl mt-1">{m.acordos_manejo_ativos}</p>
          <p className="text-xs text-muted-foreground">ativos</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Participação Comunitária</p>
          <p className="pits-metric text-xl mt-1">{m.participacao_comunitaria_pct}%</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Recursos PSA</p>
          <p className="pits-metric text-xl mt-1">R$ {(m.psa_recursos_ano_reais / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">anual</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Plano Territorial</p>
          <span className="inline-block mt-2 px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full">Em execução</span>
        </div>
      </div>

      {/* Agreements table */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Acordos Locais de Manejo</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Comunidade</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Área (ha)</th>
            </tr>
          </thead>
          <tbody>
            {acordos.map((a, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-2.5 px-3 font-medium">{a.comunidade}</td>
                <td className="py-2.5 px-3">{a.tipo}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{a.data}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "Ativo" ? "bg-success/20 text-success" : "bg-accent/20 text-accent-foreground"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">{a.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Plano Nacional de Bioeconomia */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Users size={18} className="text-secondary" />
          <h2 className="pits-section-title">Plano Nacional de Bioeconomia</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PlanBio</strong> reconhece a governança comunitária como pilar essencial para a bioeconomia sustentável, valorizando o protagonismo de povos e comunidades tradicionais na gestão dos recursos naturais.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Eixo 5 — Governança e Marco Regulatório", desc: "Fortalecimento de arranjos institucionais multiescalares, conselhos territoriais e marcos regulatórios para repartição de benefícios." },
            { title: "Eixo 6 — Inclusão Social e Repartição de Benefícios", desc: "PSA comunitário, acesso a mercados de carbono e mecanismos de compensação para comunidades tradicionais." },
          ].map((eixo) => (
            <div key={eixo.title} className="p-3 bg-muted/40 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{eixo.title}</h4>
              <p className="text-xs text-muted-foreground">{eixo.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Alinhamento: o Módulo III materializa os eixos de governança e inclusão do PlanBio, integrando os princípios de Ostrom aos mecanismos de PSA e acordos de manejo.
        </p>
      </div>

      {/* PSA + Ostrom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PSA Pie */}
        <div className="pits-card">
          <h2 className="pits-section-title mb-4">PSA — Distribuição por Serviço</h2>
          <PitsPieChart data={psaDistribuicao} height={220} />
        </div>

        {/* Ostrom */}
        <div className="pits-card">
          <h2 className="pits-section-title mb-4">Princípios de Ostrom</h2>
          <div className="grid grid-cols-1 gap-2">
            {ostromPrincipios.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm">
                {p.status === "cumprido" && <CheckCircle size={16} className="text-success shrink-0" />}
                {p.status === "parcial" && <AlertCircle size={16} className="text-accent shrink-0" />}
                {p.status === "nao" && <XCircle size={16} className="text-destructive shrink-0" />}
                <span>{p.nome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
