import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import type { MunicipioPits } from "@/data/municipiosData";

// ─── Cores do tema PITS ───────────────────────────────────────────────────────
const COR_PRIMARIA:   [number, number, number] = [139, 94,  60];   // ocre
const COR_SECUNDARIA: [number, number, number] = [74,  124, 89];   // verde
const COR_TEXTO:      [number, number, number] = [44,  36,  22];   // marrom escuro
const COR_CINZA:      [number, number, number] = [100, 100, 100];

function classificarPadrao(v: number, baixo = 0.3, medio = 0.6) {
  return v < baixo ? "Baixo" : v < medio ? "Moderado" : "Bom";
}

function classificarIVS(ivs: number) {
  if (ivs <= 0.25) return "Baixa (Favorável)";
  if (ivs <= 0.45) return "Moderada";
  return "Alta (Crítica)";
}

export function generateRelatorioPDF(m: MunicipioPits): void {
  try {
    const doc  = new jsPDF();
    const w    = doc.internal.pageSize.getWidth();
    let   y    = 20;

    // ── Cabeçalho ─────────────────────────────────────────────────────────────
    doc.setFontSize(16);
    doc.setTextColor(...COR_PRIMARIA);
    doc.text("PITS — Plataforma de Inteligência Territorial Socioenergética", w / 2, y, { align: "center" });

    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);
    doc.text(
      `Relatório Territorial Sintético • Censo 2022 / MapBiomas Col. 11 • Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      w / 2, y, { align: "center" }
    );

    y += 8;
    doc.setDrawColor(...COR_PRIMARIA);
    doc.setLineWidth(0.5);
    doc.line(14, y, w - 14, y);
    y += 8;

    // ── Município ─────────────────────────────────────────────────────────────
    doc.setFontSize(13);
    doc.setTextColor(...COR_TEXTO);
    doc.text(`${m.municipio} — ${m.estado} (Código IBGE: ${m.codigoIBGE})`, 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(...COR_CINZA);
    doc.text(
      `Área Territorial: ${m.area_km2.toLocaleString("pt-BR")} km²  |  População: ${m.populacao.toLocaleString("pt-BR")} hab. (IBGE Censo 2022)`,
      14, y
    );
    y += 9;

    // ── 1. Diagnóstico do Modelo Oficial ───────────────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("1. Diagnóstico do Índice IPSE (Modelo Oficial do Artigo)", 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(...COR_CINZA);
    const diag =
      `O município de ${m.municipio} apresenta IPSE Normalizado de ${m.IPSE_norm.toFixed(3)} (escala 0–1 Min-Max), ` +
      `com IPSE Bruto de ${(m.IPSE / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano, calculado pela fórmula ` +
      `oficial IPSE = PEL / IVS*. O Potencial Energético Local (PEL) atinge ${(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano ` +
      `sobre ${m.area_nativa_ha.toLocaleString("pt-BR")} ha de formações nativas da Caatinga (MapBiomas 2025). O IVS próprio é de ${m.IVS.toFixed(4)} ` +
      `(Censo 2022; quanto maior, mais vulnerável).`;
    const linhas = doc.splitTextToSize(diag, w - 28);
    doc.text(linhas, 14, y);
    y += linhas.length * 4.5 + 6;

    // ── 2. Tabela do Modelo e Indicadores de Apoio ────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("2. Variáveis do Modelo e Indicadores de Apoio", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Variável / Indicador", "Sigla", "Valor", "Classificação / Unidade", "Fonte Oficial"]],
      body: [
        ["IPSE Normalizado (0–1)",         "IPSE_norm", m.IPSE_norm.toFixed(3), classificarPadrao(m.IPSE_norm), "PITS / Modelo Oficial"],
        ["Potencial Energético Local",     "PEL",       `${(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`, "GJ/ano (Eq. 1)", "MapBiomas Col. 11 + Lit."],
        ["Índice de Vulnerabilidade Social","IVS",      m.IVS.toFixed(4),    classificarIVS(m.IVS),       "IBGE Censo 2022 (Eq. 4)"],
        ["Biomassa / Veg. Nativa (Apoio)", "IB",        m.IB.toFixed(2),     classificarPadrao(m.IB),     "MapBiomas Col. 11 (2025)"],
        ["Infraestrutura Rural (Apoio)",   "IIE",       m.IIE.toFixed(2),    classificarPadrao(m.IIE),    "IBGE Censo Agro 2017"],
        ["Governança e Resíduos (Apoio)",  "IGL",       m.IGL.toFixed(2),    classificarPadrao(m.IGL),    "IPECE IQM 2026 + IBGE"],
      ],
      theme: "grid",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontSize: 8 },
      styles:     { fontSize: 8 },
      margin:     { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    // ── 3. Dados Operacionais Oficiais ────────────────────────────────────────
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("3. Dados Territoriais e Operacionais Auditados", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Indicador Operacional", "Valor", "Fonte"]],
      body: [
        ["Área de Vegetação Nativa (2025)",  `${m.area_nativa_ha.toLocaleString("pt-BR")} ha (${m.cobertura_nativa_pct}%)`, "MapBiomas Brasil Col. 11"],
        ["Estoque Médio de Biomassa",        `${m.estoque_biomassa_t_ha} t/ha`, "SFB / Inventário Florestal Nacional"],
        ["Sistemas Agroflorestais (SAFs)",  `${m.safs_pct}% dos estabelecimentos`, "IBGE Censo Agropecuário 2017"],
        ["Extração de Lenha",               `${m.lenha_pevs_m3_ano.toLocaleString("pt-BR")} m³/ano`, "IBGE PEVS 2025"],
        ["Cota-Parte Ambiental (IQM)",      `IQM ${m.iqm_residuos.toFixed(1)}`, "SEMA-CE / IPECE 2026"],
        ["Alertas de Desmatamento Validados",`${m.alertas_desmatamento} alertas (${m.area_desmatamento_alertas_ha.toFixed(1)} ha)`, "MapBiomas Alerta (SAD-Caatinga)"],
        ["Precipitação Anual Registrada",   `${m.precipitacao_anual_mm} mm`, "INMET BDMEP 2024"],
        ["Acordos de Manejo Formalizados",   "Dados indisponíveis (Projeto em estruturação)", "FUNDECI (Regra 2c)"],
        ["Biodigestores Municipais",         "Dados indisponíveis (Sem levantamento municipal)", "IBGE (Regra 2c)"],
      ],
      theme: "striped",
      headStyles: { fillColor: COR_SECUNDARIA, textColor: 255, fontSize: 8 },
      styles:     { fontSize: 8 },
      margin:     { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    // ── 4. Recomendações ──────────────────────────────────────────────────────
    if (y > 235) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("4. Recomendações Estratégicas", 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(...COR_CINZA);

    const recs: string[] = [];
    if (m.IVS >= 0.30) {
      recs.push(`• Priorizar investimentos em infraestrutura social básica (água canalizada, esgotamento, coleta de resíduos) para redução da vulnerabilidade (IVS: ${m.IVS.toFixed(2)}).`);
    }
    if (m.cobertura_nativa_pct < 60) {
      recs.push(`• Fortalecer programas de regeneração natural assistida e cumprimento da Reserva Legal da Caatinga (Lei 12.651/2012).`);
    }
    if (m.safs_pct < 5.0) {
      recs.push(`• Estimular capacitação técnica e implantação de Sistemas Agroflorestais (SAFs) para geração sustentável de biomassa energética e alimentar.`);
    }
    if (m.lenha_pevs_m3_ano > 30000) {
      recs.push(`• Fomentar planos de manejo florestal sustentável (PMFS) e transição para fornos e fogões eficientes, mitigando a pressão sobre a Caatinga.`);
    }
    recs.push("• Expandir monitoramento por sensoriamento remoto integrado ao SAD-Caatinga e validação comunitária de campo.");

    for (const r of recs) {
      const rl = doc.splitTextToSize(r, w - 28);
      doc.text(rl, 14, y);
      y += rl.length * 4.2 + 1.5;
    }

    // ── Rodapé Oficial (Regras 6 e 9) ─────────────────────────────────────────
    y += 7;
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setDrawColor(...COR_CINZA);
    doc.setLineWidth(0.3);
    doc.line(14, y, w - 14, y);
    y += 4;
    doc.setFontSize(7);
    doc.setTextColor(...COR_CINZA);
    doc.text("PITS — Plataforma de Inteligência Territorial Socioenergética • Framework HAMILTON", 14, y);
    doc.text("Dados auditados em conformidade com REGRAS.md • Projeto FUNDECI/2025.0016", 14, y + 4);

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

// ─── Exportação CSV com proveniência e dados reais ───────────────────────────
export function exportCSV(m: MunicipioPits): void {
  const rows = [
    ["Campo", "Valor", "Unidade", "Fonte Oficial"],
    ["Município", m.municipio, "", "IBGE"],
    ["Código IBGE", m.codigoIBGE, "", "IBGE Localidades"],
    ["Estado", m.estado, "", "IBGE"],
    ["Área Territorial", m.area_km2.toString(), "km²", "IBGE Censo 2022 (Tabela 4714)"],
    ["População Residente", m.populacao.toString(), "habitantes", "IBGE Censo 2022 (Tabela 4714)"],
    ["IPSE Normalizado (0-1)", m.IPSE_norm.toFixed(3), "adimensional", "PITS / Modelo Oficial (Min-Max)"],
    ["IPSE Bruto (PEL / IVS*)", m.IPSE.toFixed(2), "GJ/ano", "PITS / Modelo Oficial (Eq. 6)"],
    ["Potencial Energético Local (PEL)", m.PEL.toFixed(2), "GJ/ano", "MapBiomas Col. 11 + Lit. (Eq. 1)"],
    ["Índice de Vulnerabilidade Social (IVS)", m.IVS.toFixed(4), "índice (0-1)", "IBGE Censo 2022 (Eq. 4)"],
    ["Área Vegetação Nativa (2025)", m.area_nativa_ha.toString(), "ha", "MapBiomas Coleção 11"],
    ["Cobertura Vegetal Nativa", m.cobertura_nativa_pct.toString(), "%", "MapBiomas Coleção 11"],
    ["Densidade de Biomassa Aérea", m.estoque_biomassa_t_ha.toString(), "t/ha", "SFB / Inventário Florestal Nacional"],
    ["Estoque Total de Biomassa", m.estoque_biomassa_total_t.toString(), "t", "SFB / IFN-CE"],
    ["Sistemas Agroflorestais (SAFs)", m.safs_pct.toString(), "% estabelecimentos", "IBGE Censo Agropecuário 2017 (Tabela 6881)"],
    ["Extração de Lenha PEVS", m.lenha_pevs_m3_ano.toString(), "m³/ano", "IBGE PEVS 2025 (Tabela 289)"],
    ["Precipitação Anual Registrada", m.precipitacao_anual_mm.toString(), "mm", "INMET BDMEP 2024"],
    ["Alertas de Desmatamento", m.alertas_desmatamento.toString(), "alertas validados", "MapBiomas Alerta (SAD-Caatinga)"],
    ["Área Desmatada em Alertas", m.area_desmatamento_alertas_ha.toString(), "ha", "MapBiomas Alerta"],
    ["Índice IQM (Resíduos Sólidos)", m.iqm_residuos.toString(), "índice (0-1)", "IPECE / SEMA-CE (IQM 2026)"],
    ["Acordos de Manejo Formalizados", "Dados indisponíveis", "acordos", "Projeto FUNDECI em estruturação (Regra 2c)"],
    ["Monitoramento Participativo", "Dados indisponíveis", "pontos", "Projeto FUNDECI em estruturação (Regra 2c)"],
  ];

  const csv  = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `dados_${m.municipio.toLowerCase().replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
