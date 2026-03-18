import jsPDF from "jspdf";
import "jspdf-autotable";
import type { Municipio } from "@/data/mockData";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generateRelatorioPDF(m: Municipio) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(139, 94, 60); // primary ocre
  doc.text("PITS — Relatório Territorial", w / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Projeto FUNDECI/2025.0016 • Gerado em ${new Date().toLocaleDateString("pt-BR")}`, w / 2, y, { align: "center" });
  y += 12;

  // Município info
  doc.setFontSize(14);
  doc.setTextColor(44, 36, 22);
  doc.text(`${m.municipio} — ${m.estado}`, 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Área: ${m.area_km2.toLocaleString("pt-BR")} km² | População: ${m.populacao.toLocaleString("pt-BR")} hab.`, 14, y);
  y += 12;

  // IPSE
  doc.setFontSize(12);
  doc.setTextColor(44, 36, 22);
  doc.text("1. Diagnóstico Territorial", 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(60);
  const classificacao = m.IPSE < 0.3 ? "baixo" : m.IPSE < 0.6 ? "moderado" : "alto";
  const diagText = `O município de ${m.municipio} possui IPSE de ${m.IPSE.toFixed(2)}, classificado como ${classificacao}. A cobertura arbórea está em ${m.cobertura_arborea_pct}% (meta: ≥40%) com estoque de biomassa de ${m.estoque_biomassa_t_ha} t/ha.`;
  const lines = doc.splitTextToSize(diagText, w - 28);
  doc.text(lines, 14, y);
  y += lines.length * 5 + 8;

  // Indicadores table
  doc.setFontSize(12);
  doc.setTextColor(44, 36, 22);
  doc.text("2. Indicadores Principais", 14, y);
  y += 4;

  doc.autoTable({
    startY: y,
    head: [["Indicador", "Sigla", "Valor", "Classificação"]],
    body: [
      ["Biomassa Disponível", "IB", m.IB.toFixed(2), m.IB < 0.4 ? "Baixo" : m.IB < 0.6 ? "Moderado" : "Bom"],
      ["Vulnerabilidade Socioeconômica", "IVS", m.IVS.toFixed(2), m.IVS < 0.4 ? "Crítico" : m.IVS < 0.6 ? "Moderado" : "Bom"],
      ["Infraestrutura Energética", "IIE", m.IIE.toFixed(2), m.IIE < 0.4 ? "Baixo" : m.IIE < 0.6 ? "Moderado" : "Bom"],
      ["Governança Local", "IGL", m.IGL.toFixed(2), m.IGL < 0.4 ? "Frágil" : m.IGL < 0.6 ? "Moderado" : "Bom"],
    ],
    theme: "grid",
    headStyles: { fillColor: [139, 94, 60], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Dados operacionais
  doc.setFontSize(12);
  doc.setTextColor(44, 36, 22);
  doc.text("3. Dados Operacionais", 14, y);
  y += 4;

  doc.autoTable({
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Cobertura arbórea", `${m.cobertura_arborea_pct}%`],
      ["Estoque biomassa", `${m.estoque_biomassa_t_ha} t/ha`],
      ["Área em sistemas integrados", `${m.area_sistemas_integrados_pct}%`],
      ["Acordos de manejo ativos", m.acordos_manejo_ativos.toString()],
      ["Participação comunitária", `${m.participacao_comunitaria_pct}%`],
      ["PSA recursos/ano", `R$ ${m.psa_recursos_ano_reais.toLocaleString("pt-BR")}`],
      ["Biodigestores", m.biodigestores.toString()],
      ["Demanda lenha s/ manejo", `${m.demanda_lenha_sem_manejo_m3_ano.toLocaleString("pt-BR")} m³/ano`],
      ["Taxa de regeneração", `${m.taxa_regeneracao_pct_ano}%/ano`],
      ["Eficiência conversão energética", `${m.eficiencia_conversao_energetica_pct}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [74, 124, 89] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Recomendações
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setTextColor(44, 36, 22);
  doc.text("4. Recomendações", 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(60);

  const recs: string[] = [];
  if (m.cobertura_arborea_pct < 40) recs.push("• Ampliar programas de restauração biocultural para atingir meta de 40% de cobertura arbórea");
  if (m.IVS < 0.5) recs.push("• Priorizar políticas de redução da vulnerabilidade socioeconômica");
  if (m.acordos_manejo_ativos < 10) recs.push("• Fortalecer acordos comunitários de manejo sustentável");
  if (m.eficiencia_conversao_energetica_pct < 40) recs.push("• Investir em biodigestores e fogões eficientes");
  recs.push("• Expandir rede de biodigestores comunitários");
  recs.push("• Ampliar monitoramento por sensoriamento remoto");

  recs.forEach((r) => {
    const rl = doc.splitTextToSize(r, w - 28);
    doc.text(rl, 14, y);
    y += rl.length * 4.5 + 2;
  });

  // Footer
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("PITS — Plataforma Integrada de Territórios Sustentáveis • Framework HAMILTON", 14, y);
  doc.text("Projeto FUNDECI/2025.0016 — Semiárido Cearense", 14, y + 4);

  doc.save(`relatorio_${m.municipio.toLowerCase().replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportCSV(m: Municipio) {
  const rows = [
    ["Campo", "Valor"],
    ["Município", m.municipio],
    ["Estado", m.estado],
    ["Área (km²)", m.area_km2.toString()],
    ["População", m.populacao.toString()],
    ["IPSE", m.IPSE.toFixed(4)],
    ["IB", m.IB.toFixed(4)],
    ["IVS", m.IVS.toFixed(4)],
    ["IIE", m.IIE.toFixed(4)],
    ["IGL", m.IGL.toFixed(4)],
    ["Cobertura Arbórea (%)", m.cobertura_arborea_pct.toString()],
    ["Estoque Biomassa (t/ha)", m.estoque_biomassa_t_ha.toString()],
    ["Sistemas Integrados (%)", m.area_sistemas_integrados_pct.toString()],
    ["Acordos de Manejo", m.acordos_manejo_ativos.toString()],
    ["Participação Comunitária (%)", m.participacao_comunitaria_pct.toString()],
    ["PSA (R$/ano)", m.psa_recursos_ano_reais.toString()],
    ["Biodigestores", m.biodigestores.toString()],
    ["Demanda Lenha (m³/ano)", m.demanda_lenha_sem_manejo_m3_ano.toString()],
    ["Taxa Regeneração (%/ano)", m.taxa_regeneracao_pct_ano.toString()],
    ["Eficiência Energética (%)", m.eficiencia_conversao_energetica_pct.toString()],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dados_${m.municipio.toLowerCase().replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
