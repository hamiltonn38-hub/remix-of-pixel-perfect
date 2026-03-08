import { usePits } from "@/context/PitsContext";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const historico = [
  { id: 1, periodo: "2024-S2", municipio: "Quixadá", gerado: "2024-12-15", tipo: "Semestral" },
  { id: 2, periodo: "2024-S1", municipio: "Quixadá", gerado: "2024-06-20", tipo: "Semestral" },
  { id: 3, periodo: "2023-S2", municipio: "Quixadá", gerado: "2023-12-18", tipo: "Semestral" },
  { id: 4, periodo: "2024-S2", municipio: "Sobral", gerado: "2024-12-10", tipo: "Semestral" },
];

export default function Relatorios() {
  const { selectedMunicipio: m } = usePits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Geração e histórico de relatórios territoriais</p>
      </div>

      {/* Generator */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Gerar Relatório Territorial</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gere um relatório semestral completo para <strong>{m.municipio}</strong> com diagnóstico, indicadores, recomendações e próximas ações.
        </p>
        <div className="flex gap-3">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <FileText size={16} className="mr-2" />
            Gerar Relatório PDF
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Prévia do Relatório — {m.municipio}</h2>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">1. Diagnóstico Territorial</h3>
            <p>O município de {m.municipio} ({m.estado}) possui área de {m.area_km2.toLocaleString("pt-BR")} km² e população estimada de {m.populacao.toLocaleString("pt-BR")} habitantes. O IPSE atual é de <strong>{m.IPSE.toFixed(2)}</strong>, classificado como {m.IPSE < 0.3 ? "baixo" : m.IPSE < 0.6 ? "moderado" : "alto"}.</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">2. Indicadores Principais</h3>
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>IB (Biomassa): {m.IB.toFixed(2)}</li>
              <li>IVS (Vulnerabilidade): {m.IVS.toFixed(2)}</li>
              <li>IIE (Infraestrutura): {m.IIE.toFixed(2)}</li>
              <li>IGL (Governança): {m.IGL.toFixed(2)}</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">3. Recomendações</h3>
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              {m.cobertura_arborea_pct < 40 && <li>Ampliar programas de restauração biocultural para atingir meta de 40% de cobertura arbórea</li>}
              {m.IVS < 0.5 && <li>Priorizar políticas de redução da vulnerabilidade socioeconômica</li>}
              {m.acordos_manejo_ativos < 10 && <li>Fortalecer acordos comunitários de manejo sustentável</li>}
              <li>Expandir rede de biodigestores comunitários</li>
            </ul>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Histórico de Relatórios</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Período</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Município</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Gerado em</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-2.5 px-3 font-medium">{r.periodo}</td>
                <td className="py-2.5 px-3">{r.municipio}</td>
                <td className="py-2.5 px-3">{r.tipo}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{r.gerado}</td>
                <td className="py-2.5 px-3 text-right">
                  <button className="text-xs text-primary hover:underline">Baixar PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
