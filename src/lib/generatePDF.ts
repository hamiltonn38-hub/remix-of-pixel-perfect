import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import type { Municipio } from "@/data/mockData";

// ─── Cores do tema PITS ───────────────────────────────────────────────────────
const COR_PRIMARIA:  [number, number, number] = [139, 94,  60];   // ocre
const COR_SECUNDARIA:[number, number, number] = [74,  124, 89];   // verde
const COR_TEXTO:     [number, number, number] = [44,  36,  22];   // marrom
const COR_CINZA:     [number, number, number] = [100, 100, 100];

function classificar(v: number, baixo = 0.4, medio = 0.6) {
  return v < baixo ? "Baixo" : v < medio ? "Moderado" : "Bom";
}

export function generateRelatorioPDF(m: Municipio): void {
  try {
    const doc  = new jsPDF();
    const w    = doc.internal.pageSize.getWidth();
    let   y    = 20;

    // ── Cabeçalho ─────────────────────────────────────────────────────────────
    doc.setFontSize(18);
    doc.setTextColor(...COR_PRIMARIA);
    doc.text("PITS — Relatório Territorial", w / 2, y, { align: "center" });

    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);
    doc.text(
      `Projeto FUNDECI/2025.0016 • Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      w / 2, y, { align: "center" }
    );

    y += 10;
    doc.setDrawColor(...COR_PRIMARIA);
    doc.setLineWidth(0.5);
    doc.line(14, y, w - 14, y);
    y += 8;

    // ── Município ─────────────────────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(...COR_TEXTO);
    doc.text(`${m.municipio} — ${m.estado}`, 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);
    doc.text(
      `Área: ${m.area_km2.toLocaleString("pt-BR")} km²  |  População: ${m.populacao.toLocaleString("pt-BR")} hab.`,
      14, y
    );
    y += 10;

    // ── 1. Diagnóstico ────────────────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("1. Diagnóstico Territorial", 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);
    const classificacao = m.IPSE < 0.3 ? "baixo" : m.IPSE < 0.6 ? "moderado" : "alto";
    const diag =
      `O município de ${m.municipio} possui IPSE de ${m.IPSE.toFixed(2)}, classificado como ` +
      `${classificacao}. A cobertura arbórea está em ${m.cobertura_arborea_pct}% (meta: ≥40%) ` +
      `com estoque de biomassa de ${m.estoque_biomassa_t_ha} t/ha.`;
    const linhas = doc.splitTextToSize(diag, w - 28);
    doc.text(linhas, 14, y);
    y += linhas.length * 4.5 + 8;

    // ── 2. Indicadores ────────────────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("2. Indicadores Principais", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Sigla", "Valor", "Classificação"]],
      body: [
        ["Biomassa Disponível",           "IB",  m.IB.toFixed(2),  classificar(m.IB)],
        ["Vulnerabilidade Socioeconômica","IVS", m.IVS.toFixed(2), m.IVS < 0.4 ? "Crítico" : m.IVS < 0.6 ? "Moderado" : "Bom"],
        ["Infraestrutura Energética",     "IIE", m.IIE.toFixed(2), classificar(m.IIE)],
        ["Governança Local",              "IGL", m.IGL.toFixed(2), m.IGL < 0.4 ? "Frágil" : m.IGL < 0.6 ? "Moderado" : "Bom"],
      ],
      theme: "grid",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontSize: 9 },
      styles:     { fontSize: 9 },
      margin:     { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ── 3. Dados operacionais ─────────────────────────────────────────────────
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("3. Dados Operacionais", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor"]],
      body: [
        ["Cobertura arbórea",               `${m.cobertura_arborea_pct}%`],
        ["Estoque biomassa",                `${m.estoque_biomassa_t_ha} t/ha`],
        ["Área em sistemas integrados",     `${m.area_sistemas_integrados_pct}%`],
        ["Acordos de manejo ativos",        m.acordos_manejo_ativos.toString()],
        ["Participação comunitária",        `${m.participacao_comunitaria_pct}%`],
        ["PSA recursos/ano",                `R$ ${m.psa_recursos_ano_reais.toLocaleString("pt-BR")}`],
        ["Biodigestores",                   m.biodigestores.toString()],
        ["Demanda lenha s/ manejo",         `${m.demanda_lenha_sem_manejo_m3_ano.toLocaleString("pt-BR")} m³/ano`],
        ["Taxa de regeneração",             `${m.taxa_regeneracao_pct_ano}%/ano`],
        ["Eficiência conversão energética", `${m.eficiencia_conversao_energetica_pct}%`],
      ],
      theme: "striped",
      headStyles: { fillColor: COR_SECUNDARIA, textColor: 255, fontSize: 9 },
      styles:     { fontSize: 9 },
      margin:     { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ── 4. Recomendações ──────────────────────────────────────────────────────
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("4. Recomendações", 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);

    const recs: string[] = [];
    if (m.cobertura_arborea_pct  < 40)  recs.push("• Ampliar programas de restauração biocultural para atingir meta de 40% de cobertura arbórea");
    if (m.IVS                    < 0.5) recs.push("• Priorizar políticas de redução da vulnerabilidade socioeconômica");
    if (m.acordos_manejo_ativos  < 10)  recs.push("• Fortalecer acordos comunitários de manejo sustentável");
    if (m.eficiencia_conversao_energetica_pct < 40) recs.push("• Investir em biodigestores e fogões eficientes");
    recs.push("• Expandir rede de biodigestores comunitários");
    recs.push("• Ampliar monitoramento por sensoriamento remoto");

    for (const r of recs) {
      const rl = doc.splitTextToSize(r, w - 28);
      doc.text(rl, 14, y);
      y += rl.length * 4.5 + 1.5;
    }

    // ── Rodapé ────────────────────────────────────────────────────────────────
    y += 8;
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setDrawColor(...COR_CINZA);
    doc.setLineWidth(0.3);
    doc.line(14, y, w - 14, y);
    y += 4;
    doc.setFontSize(7);
    doc.setTextColor(...COR_CINZA);
    doc.text("PITS — Plataforma Integrada de Territórios Sustentáveis • Framework HAMILTON", 14, y);
    doc.text("Projeto FUNDECI/2025.0016 — Semiárido Cearense", 14, y + 4);

    // ── Download ──────────────────────────────────────────────────────────────
    const nome = m.municipio.toLowerCase().replace(/\s/g, "_");
    const data = new Date().toISOString().slice(0, 10);
    doc.save(`relatorio_${nome}_${data}.pdf`);
  } catch (err) {
    console.error("[generateRelatorioPDF] Erro:", err);
    throw err;
  }
}

// ─── Exportação visual (screenshot → PDF) ────────────────────────────────────
export async function exportVisualReportPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemento HTML não encontrado para renderização do PDF.");

  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    backgroundColor: "#FAF9F6",
  });

  const imgData   = canvas.toDataURL("image/jpeg", 1.0);
  const pdf       = new jsPDF("p", "mm", "a4");
  const pdfW      = pdf.internal.pageSize.getWidth();
  const pdfH      = pdf.internal.pageSize.getHeight();
  const imgH      = (canvas.height * pdfW) / canvas.width;

  let heightLeft  = imgH;
  let position    = 0;

  pdf.addImage(imgData, "JPEG", 0, position, pdfW, imgH);
  heightLeft -= pdfH;

  while (heightLeft > 0) {
    position -= pdfH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pdfW, imgH);
    heightLeft -= pdfH;
  }

  pdf.save(`${filename}.pdf`);
}

// ─── Exportação CSV ───────────────────────────────────────────────────────────
export function exportCSV(m: Municipio): void {
  const rows = [
    ["Campo", "Valor"],
    ["Município", m.municipio],
    ["Estado", m.estado],
    ["Área (km²)", m.area_km2.toString()],
    ["População", m.populacao.toString()],
    ["IPSE",  m.IPSE.toFixed(4)],
    ["IB",   m.IB.toFixed(4)],
    ["IVS",  m.IVS.toFixed(4)],
    ["IIE",  m.IIE.toFixed(4)],
    ["IGL",  m.IGL.toFixed(4)],
    ["Cobertura Arbórea (%)",      m.cobertura_arborea_pct.toString()],
    ["Estoque Biomassa (t/ha)",    m.estoque_biomassa_t_ha.toString()],
    ["Sistemas Integrados (%)",    m.area_sistemas_integrados_pct.toString()],
    ["Acordos de Manejo",          m.acordos_manejo_ativos.toString()],
    ["Participação Comunitária (%)",m.participacao_comunitaria_pct.toString()],
    ["PSA (R$/ano)",               m.psa_recursos_ano_reais.toString()],
    ["Biodigestores",              m.biodigestores.toString()],
    ["Demanda Lenha (m³/ano)",     m.demanda_lenha_sem_manejo_m3_ano.toString()],
    ["Taxa Regeneração (%/ano)",   m.taxa_regeneracao_pct_ano.toString()],
    ["Eficiência Energética (%)",  m.eficiencia_conversao_energetica_pct.toString()],
  ];
  const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `dados_${m.municipio.toLowerCase().replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
