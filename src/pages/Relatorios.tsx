import { useState, useEffect } from "react";
import { usePits } from "@/context/PitsContext";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRelatorioPDF, exportCSV } from "@/lib/generatePDF";
import { toast } from "sonner";
import { classifyIPSENorm } from "@/lib/calcPits";

interface RelatorioHistorico {
  id: string;
  periodo: string;
  municipio: string;
  gerado: string;
  tipo: string;
}

export default function Relatorios() {
  const { selectedMunicipio: m, allMunicipios } = usePits();

  const [historico, setHistorico] = useState<RelatorioHistorico[]>(() => {
    try {
      const stored = localStorage.getItem("pits_relatorios");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pits_relatorios", JSON.stringify(historico));
  }, [historico]);

  const handleGenerate = () => {
    const loadingId = toast.loading("Gerando PDF com dados oficiais...");
    try {
      generateRelatorioPDF(m);

      const now = new Date();
      const semestre = now.getMonth() < 6 ? "S1" : "S2";
      const newRelatorio: RelatorioHistorico = {
        id: Math.random().toString(36).substring(7),
        periodo: `${now.getFullYear()}-${semestre}`,
        municipio: m.municipio,
        gerado: now.toLocaleDateString("pt-BR"),
        tipo: "Territorial Sintético",
      };
      setHistorico((prev) => [newRelatorio, ...prev]);
      toast.success("PDF gerado com sucesso!", { id: loadingId });
    } catch (err) {
      console.error("[Relatórios] Erro ao gerar PDF:", err);
      toast.error("Erro ao gerar o PDF. Verifique o console.", { id: loadingId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios Territoriais</h1>
        <p className="text-sm text-muted-foreground">
          Geração, exportação e proveniência de dados oficiais do semiárido cearense
        </p>
      </div>

      {/* Generator */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Gerar Relatório — {m.municipio}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gere um documento técnico formal em PDF ou planilha auditável em CSV com base nos dados reais do <strong>IBGE Censo 2022</strong>, <strong>MapBiomas Coleção 11</strong>, <strong>IFN-CE</strong> e <strong>IPECE</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleGenerate}>
            <FileText size={16} className="mr-2" />
            Gerar Relatório Técnico PDF
          </Button>
          <Button variant="outline" onClick={() => { exportCSV(m); toast.success("CSV exportado com proveniência!"); }}>
            <Download size={16} className="mr-2" />
            Exportar Dados Oficiais (CSV)
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="pits-card">
        <h2 className="pits-section-title mb-4">Prévia do Relatório Territorial — {m.municipio}</h2>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">1. Diagnóstico do Índice IPSE</h3>
            <p>
              O município de {m.municipio} ({m.estado}, código IBGE: {m.codigoIBGE}) possui área de {m.area_km2.toLocaleString("pt-BR")} km² e população de {m.populacao.toLocaleString("pt-BR")} habitantes (IBGE Censo 2022). O IPSE Normalizado é de <strong>{m.IPSE_norm.toFixed(3)}</strong> ({classifyIPSENorm(m.IPSE_norm).label}), com IPSE Bruto de <strong>{(m.IPSE / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano</strong> calculado pelo modelo oficial <em>IPSE = PEL / IVS*</em>.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">2. Modelo e Indicadores Setoriais de Apoio</h3>
            <ul className="space-y-1 list-disc list-inside text-muted-foreground text-xs md:text-sm">
              <li><strong>PEL (Potencial Energético Local):</strong> {(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano (MapBiomas Col. 11 + Lit.)</li>
              <li><strong>IVS (Vulnerabilidade Social):</strong> {m.IVS.toFixed(4)} (IBGE Censo 2022; quanto maior, mais vulnerável)</li>
              <li><strong>IB (Biomassa / Veg. Nativa):</strong> {m.IB.toFixed(2)} ({m.cobertura_nativa_pct}% da área territorial)</li>
              <li><strong>IIE (Infraestrutura Rural):</strong> {m.IIE.toFixed(2)} ({m.safs_pct}% estabelecimentos com SAFs)</li>
              <li><strong>IGL (Governança e Resíduos):</strong> {m.IGL.toFixed(2)} (IQM IPECE 2026: {m.iqm_residuos.toFixed(1)})</li>
            </ul>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">3. Recomendações Estratégicas</h3>
            <ul className="space-y-1 list-disc list-inside text-muted-foreground text-xs md:text-sm">
              {m.IVS >= 0.30 && (
                <li>Priorizar políticas de saneamento e infraestrutura social para redução do IVS (situação de carência: {m.IVS.toFixed(2)}).</li>
              )}
              {m.cobertura_nativa_pct < 60 && (
                <li>Ampliar regeneração natural assistida e cumprimento da Reserva Legal da Caatinga (Lei 12.651/2012).</li>
              )}
              {m.safs_pct < 5.0 && (
                <li>Estimular linhas de transição agroflorestal (SAFs) para geração sustentável de biomassa e segurança alimentar.</li>
              )}
              {m.lenha_pevs_m3_ano > 30000 && (
                <li>Apoiar planos de manejo florestal sustentável e substituição de fogões rurais para mitigar corte de lenha.</li>
              )}
              <li>Expandir monitoramento com sensoriamento remoto e alertas validados SAD-Caatinga.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="pits-card overflow-x-auto">
        <h2 className="pits-section-title mb-4">Histórico de Relatórios Emitidos</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 px-3">Período</th>
              <th className="text-left py-2 px-3">Município</th>
              <th className="text-left py-2 px-3">Tipo</th>
              <th className="text-left py-2 px-3">Gerado em</th>
              <th className="text-right py-2 px-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historico.length > 0 ? (
              historico.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3 font-medium">{r.periodo}</td>
                  <td className="py-2.5 px-3">{r.municipio}</td>
                  <td className="py-2.5 px-3">{r.tipo}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{r.gerado}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => {
                        const target = allMunicipios.find((mu) => mu.municipio === r.municipio) || m;
                        generateRelatorioPDF(target);
                        toast.success("PDF baixado!");
                      }}
                    >
                      Baixar Novamente
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                  Nenhum relatório emitido nesta sessão. Clique no botão acima para gerar seu primeiro relatório.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
