import { useState, useEffect } from "react";
import { usePits } from "@/context/PitsContext";
import { FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRelatorioPDF, exportCSV } from "@/lib/generatePDF";
import { toast } from "sonner";
import { classifyIPSENorm } from "@/lib/calcPits";
import FonteInfo from "@/components/FonteInfo";
import Detalhes from "@/components/Detalhes";

interface RelatorioHistorico {
  id: string;
  periodo: string;
  periodoExtenso: string;
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
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pits_relatorios", JSON.stringify(historico));
  }, [historico]);

  const now = new Date();
  const isS1 = now.getMonth() < 6;
  const periodoSemestralCodigo = `${now.getFullYear()}-${isS1 ? "S1" : "S2"}`;
  const periodoSemestralExtenso = isS1
    ? `1º Semestre de ${now.getFullYear()} (01/01 a 30/06)`
    : `2º Semestre de ${now.getFullYear()} (01/07 a 31/12)`;

  const handleGenerate = () => {
    const loadingId = toast.loading("Gerando PDF com dados oficiais auditados...");
    try {
      generateRelatorioPDF(m);

      const newRelatorio: RelatorioHistorico = {
        id: Math.random().toString(36).substring(7),
        periodo: periodoSemestralCodigo,
        periodoExtenso: periodoSemestralExtenso,
        municipio: m.municipio,
        gerado: now.toLocaleDateString("pt-BR"),
        tipo: "Relatório Técnico Semestral",
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
      <div className="pits-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="pits-section-title">Gerar Relatório — {m.municipio}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} className="text-primary" />
              Período de Referência Atual: <strong className="text-foreground">{periodoSemestralExtenso}</strong>
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 font-bold">
            {periodoSemestralCodigo}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Gere um documento técnico formal em PDF ou planilha auditável em CSV com base nos dados reais do <strong>IBGE Censo Demográfico 2022</strong>, <strong>MapBiomas Coleção 11</strong>, <strong>SFB / IFN-CE</strong>, <strong>IBGE PEVS 2025</strong> e <strong>IPECE IQM 2026</strong>.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleGenerate}>
            <FileText size={16} className="mr-2" />
            Gerar Relatório Técnico Semestral (PDF)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              exportCSV(m);
              toast.success("Planilha CSV com proveniência exportada!");
            }}
          >
            <Download size={16} className="mr-2" />
            Exportar Dados Oficiais (CSV)
          </Button>
        </div>

        <FonteInfo
          instituicao="PITS / MANIFEST.json"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Base consolidada de indicadores municipais auditados"
        />
      </div>

      {/* Preview */}
      <div className="pits-card space-y-4">
        <h2 className="pits-section-title">Prévia do Diagnóstico Territorial — {m.municipio}</h2>
        <div className="space-y-4 text-sm">
          <div className="pits-block p-4 space-y-2">
            <h3 className="font-semibold text-foreground">1. Diagnóstico do Índice IPSE (Modelo Oficial)</h3>
            <p className="text-xs md:text-sm text-foreground">
              IPSE Norm <strong className="text-primary">{m.IPSE_norm.toFixed(3)}</strong> ({classifyIPSENorm(m.IPSE_norm).label}) · IPSE Bruto <strong>{(m.IPSE / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano</strong> · Pop. <strong>{m.populacao.toLocaleString("pt-BR")} hab.</strong> · Área <strong>{m.area_km2.toLocaleString("pt-BR")} km²</strong>
            </p>
            <Detalhes titulo="Ver texto completo do diagnóstico">
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                O município de {m.municipio} ({m.estado}, código IBGE: {m.codigoIBGE}) possui área territorial oficial de {m.area_km2.toLocaleString("pt-BR")} km² e população de {m.populacao.toLocaleString("pt-BR")} habitantes (IBGE Censo 2022). O IPSE Normalizado é de <strong>{m.IPSE_norm.toFixed(3)}</strong> ({classifyIPSENorm(m.IPSE_norm).label}), com IPSE Bruto de <strong>{(m.IPSE / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano</strong> calculado pela especificação matemática oficial <em>IPSE = PEL / IVS*</em>.
              </p>
            </Detalhes>
          </div>

          <div className="pits-block p-4 space-y-2">
            <h3 className="font-semibold text-foreground">2. Variáveis do Modelo e Indicadores Setoriais de Apoio</h3>
            <p className="text-xs md:text-sm text-foreground">
              PEL <strong>{(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano</strong> · IVS <strong>{m.IVS.toFixed(4)}</strong> · IB <strong>{m.IB.toFixed(2)}</strong> · IIE <strong>{m.IIE.toFixed(2)}</strong> · IGL <strong>{m.IGL.toFixed(2)}</strong>
            </p>
            <Detalhes titulo="Ver descrição das variáveis">
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground text-xs md:text-sm">
              <li><strong>PEL (Potencial Energético Local):</strong> {(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano (MapBiomas Col. 11 + Lit.)</li>
              <li><strong>IVS (Vulnerabilidade Social):</strong> {m.IVS.toFixed(4)} (IBGE Censo 2022; quanto maior, mais vulnerável)</li>
              <li><strong>IB (Biomassa / Veg. Nativa):</strong> {m.IB.toFixed(2)} ({m.cobertura_nativa_pct}% da área territorial em formações nativas)</li>
              <li><strong>IIE (Infraestrutura Rural):</strong> {m.IIE.toFixed(2)} ({m.safs_pct}% estabelecimentos com SAFs no Censo Agro 2017)</li>
              <li><strong>IGL (Governança e Resíduos):</strong> {m.IGL.toFixed(2)} (Cota ICMS IQM 2026: {m.iqm_residuos.toFixed(1)})</li>
              <li><strong>Lenha Extraída PEVS:</strong> {(m.lenha_pevs_m3_ano / 1000).toFixed(1)}k m³/ano (IBGE PEVS 2025)</li>
            </ul>
            </Detalhes>
          </div>

          <div className="pits-block p-4 space-y-2">
            <h3 className="font-semibold text-foreground">3. Recomendações Estratégicas Baseadas em Evidências</h3>
            <p className="text-xs md:text-sm text-foreground font-medium">
              Diretrizes prioritárias para transição socioenergética e conservação da Caatinga em {m.municipio}
            </p>
            <Detalhes titulo="Ver recomendações detalhadas">
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground text-xs md:text-sm">
              {m.IVS >= 0.30 && (
                <li>Priorizar políticas públicas de saneamento e infraestrutura social básica para redução da vulnerabilidade (IVS: {m.IVS.toFixed(2)}).</li>
              )}
              {m.cobertura_nativa_pct < 60 && (
                <li>Ampliar programas de regeneração natural assistida e cumprimento da Reserva Legal da Caatinga (Lei 12.651/2012, Art. 12, II).</li>
              )}
              {m.safs_pct < 5.0 && (
                <li>Estimular linhas de crédito e assistência técnica para expansão de Sistemas Agroflorestais (SAFs).</li>
              )}
              {m.lenha_pevs_m3_ano > 30000 && (
                <li>Apoiar planos de manejo florestal sustentável e substituição gradual de fogões rurais rudimentares.</li>
              )}
              <li>Consolidar monitoramento contínuo com imagens orbitais (MapBiomas Alerta) e protocolos participativos.</li>
            </ul>
            </Detalhes>
          </div>
        </div>

        <FonteInfo
          instituicao="PITS / Modelo Oficial do Artigo"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Seção 3.1 — Especificação Metodológica do IPSE"
        />
      </div>

      {/* History */}
      <div className="pits-card space-y-3">
        <h2 className="pits-section-title">Histórico de Relatórios Emitidos</h2>
        <p className="text-sm font-bold text-foreground">
          {historico.length > 0 ? `${historico.length} relatório(s) emitido(s) · último: ${historico[0].periodo} (${historico[0].municipio})` : "Nenhum relatório emitido nesta sessão"}
        </p>
        <Detalhes titulo="Ver histórico completo">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 px-3">Código Período</th>
              <th className="text-left py-2 px-3">Período Auditado</th>
              <th className="text-left py-2 px-3">Município</th>
              <th className="text-left py-2 px-3">Tipo de Documento</th>
              <th className="text-left py-2 px-3">Data de Emissão</th>
              <th className="text-right py-2 px-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historico.length > 0 ? (
              historico.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-xs text-primary">{r.periodo}</td>
                  <td className="py-2.5 px-3 text-xs">{r.periodoExtenso || r.periodo}</td>
                  <td className="py-2.5 px-3 font-medium">{r.municipio}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{r.tipo}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{r.gerado}</td>
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
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                  Nenhum relatório emitido nesta sessão. Clique no botão acima para gerar seu primeiro relatório semestral.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        </Detalhes>
      </div>
    </div>
  );
}
