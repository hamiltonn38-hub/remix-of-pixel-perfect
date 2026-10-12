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

    const now = new Date();
    const isS1 = now.getMonth() < 6;
    const periodoSemestre = isS1
      ? `1º Semestre de ${now.getFullYear()} (01/01/${now.getFullYear()} a 30/06/${now.getFullYear()})`
      : `2º Semestre de ${now.getFullYear()} (01/07/${now.getFullYear()} a 31/12/${now.getFullYear()})`;

    // ── Cabeçalho Oficial (G9) ─────────────────────────────────────────────────
    doc.setFontSize(15);
    doc.setTextColor(...COR_PRIMARIA);
    doc.text("Plataforma de Inteligência Territorial Socioenergética (PITS)", w / 2, y, { align: "center" });

    y += 7;
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_CINZA);
    doc.text(
      `Relatório Técnico Semestral — ${periodoSemestre} • Gerado em ${now.toLocaleDateString("pt-BR")}`,
      w / 2, y, { align: "center" }
    );

    y += 8;
    doc.setDrawColor(...COR_PRIMARIA);
    doc.setLineWidth(0.5);
    doc.line(14, y, w - 14, y);
    y += 8;

    // ── Município (G3 e G4) ────────────────────────────────────────────────────
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
    doc.text("1. Diagnóstico do Índice IPSE (Modelo Oficial: IPSE = PEL / IVS*)", 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(...COR_CINZA);
    const diag =
      `O município de ${m.municipio} apresenta IPSE Normalizado de ${m.IPSE_norm.toFixed(3)} (escala 0–1 Min-Max), ` +
      `com IPSE Bruto de ${(m.IPSE / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano, calculado pela fórmula ` +
      `oficial IPSE = PEL / IVS*. O Potencial Energético Local (PEL) atinge ${(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k GJ/ano ` +
      `sobre ${m.area_nativa_ha.toLocaleString("pt-BR")} ha de formações nativas da Caatinga (MapBiomas Coleção 11, 2025). O IVS próprio é de ${m.IVS.toFixed(4)} ` +
      `(Censo Demográfico 2022; DIREÇÃO: menor valor indica menor carência domiciliar).`;
    const linhas = doc.splitTextToSize(diag, w - 28);
    doc.text(linhas, 14, y);
    y += linhas.length * 4.5 + 6;

    // ── 2. Tabela do Modelo e Indicadores de Apoio ────────────────────────────
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("2. Variáveis do Modelo e Indicadores de Apoio Setorial", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Variável / Indicador", "Sigla", "Valor", "Classificação / Unidade", "Fonte Oficial (MANIFEST)"]],
      body: [
        ["IPSE Normalizado (0–1)",          "IPSE_norm", m.IPSE_norm.toFixed(3), classificarPadrao(m.IPSE_norm), "PITS / Modelo Oficial (Min-Max)"],
        ["Potencial Energético Local",      "PEL",       `${(m.PEL / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`, "GJ/ano (Eq. 1)", "MapBiomas Col. 11 + Lit."],
        ["Índice de Vulnerabilidade Social", "IVS",       m.IVS.toFixed(4),    classificarIVS(m.IVS),        "IBGE Censo 2022 (Eq. 4)"],
        ["Biomassa / Veg. Nativa (Apoio)",  "IB",        m.IB.toFixed(2),     classificarPadrao(m.IB),      "MapBiomas Col. 11 (2025)"],
        ["Infraestrutura Rural (Apoio)",    "IIE",       m.IIE.toFixed(2),    classificarPadrao(m.IIE),     "IBGE Censo Agro 2017 (Tabela 6881)"],
        ["Governança e Resíduos (Apoio)",   "IGL",       m.IGL.toFixed(2),    classificarPadrao(m.IGL),     "IPECE IQM 2026 + Censo Agro 2017"],
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

    const precipStr = m.precipitacao_anual_mm !== null
      ? `${m.precipitacao_anual_mm} mm (${m.estacao_inmet ? `Estação ${m.estacao_inmet.codigo} a ${m.estacao_inmet.distanciaKm} km` : "INMET"})`
      : "Dados indisponíveis (estação sem registros no ano)";

    autoTable(doc, {
      startY: y,
      head: [["Indicador Operacional", "Valor", "Fonte Oficial (MANIFEST)"]],
      body: [
        ["Área de Vegetação Nativa (2025)",  `${m.area_nativa_ha.toLocaleString("pt-BR")} ha (${m.cobertura_nativa_pct}%)`, "MapBiomas Brasil Col. 11 (2025)"],
        ["Estoque Médio de Biomassa",        `${m.estoque_biomassa_t_ha} t/ha`, "SFB / Inventário Florestal Nacional (IFN-CE)"],
        ["Sistemas Agroflorestais (SAFs)",   `${m.safs_pct}% dos estabelecimentos`, "IBGE Censo Agropecuário 2017 (Tabela 6881)"],
        ["Extração Vegetal de Lenha",        `${m.lenha_pevs_m3_ano.toLocaleString("pt-BR")} m³/ano`, "IBGE PEVS 2025 (Tabela 289)"],
        ["Cota-Parte ICMS Resíduos (IQM)",   `IQM ${m.iqm_residuos.toFixed(1)}`, "SEMA-CE / IPECE 2026"],
        ["Alertas de Desmatamento",          `${m.alertas_desmatamento} alertas (${m.area_desmatamento_alertas_ha.toFixed(1)} ha)`, "MapBiomas Alerta (SAD-Caatinga)"],
        ["Precipitação Anual Registrada",    precipStr, "INMET BDMEP 2024"],
        ["Acordos Comunitários de Manejo",   "Sem registros — aguardando coleta de campo", "Projeto FUNDECI (Regra 2c)"],
        ["Monitoramento Participativo",      "Sem registros — aguardando coleta de campo", "Projeto FUNDECI (Regra 2c)"],
      ],
      theme: "striped",
      headStyles: { fillColor: COR_SECUNDARIA, textColor: 255, fontSize: 8 },
      styles:     { fontSize: 8 },
      margin:     { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    // ── 4. Recomendações Estratégicas ─────────────────────────────────────────
    if (y > 235) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text("4. Recomendações Estratégicas Baseadas em Evidências", 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(...COR_CINZA);

    const recs: string[] = [];
    if (m.IVS >= 0.30) {
      recs.push(`• Priorizar investimentos em infraestrutura social básica (água canalizada, esgotamento, coleta de resíduos) para redução da vulnerabilidade domiciliar (IVS: ${m.IVS.toFixed(2)}).`);
    }
    if (m.cobertura_nativa_pct < 60) {
      recs.push(`• Fortalecer programas de regeneração natural assistida e cumprimento da Reserva Legal da Caatinga (Lei Federal nº 12.651/2012, Art. 12, II).`);
    }
    if (m.safs_pct < 5.0) {
      recs.push(`• Estimular capacitação técnica e implantação de Sistemas Agroflorestais (SAFs) para geração sustentável de biomassa e segurança alimentar.`);
    }
    if (m.lenha_pevs_m3_ano > 30000) {
      recs.push(`• Fomentar planos de manejo florestal sustentável (PMFS) e transição para tecnologias de cocção ecoeficientes, mitigando o corte predatório de lenha.`);
    }
    recs.push("• Expandir o monitoramento contínuo por sensoriamento remoto (MapBiomas Alerta) e protocolos participativos comunitários.");

    for (const r of recs) {
      const rl = doc.splitTextToSize(r, w - 28);
      doc.text(rl, 14, y);
      y += rl.length * 4.2 + 1.5;
    }

    // ── Rodapé Oficial (Regra 6 e G9) ─────────────────────────────────────────
    y += 7;
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setDrawColor(...COR_CINZA);
    doc.setLineWidth(0.3);
    doc.line(14, y, w - 14, y);
    y += 4;
    doc.setFontSize(7);
    doc.setTextColor(...COR_CINZA);
    doc.text("Plataforma de Inteligência Territorial Socioenergética (PITS) • Framework HAMILTON", 14, y);
    doc.text("Dados auditados em conformidade com REGRAS.md • Projeto FUNDECI/2025.0016", 14, y + 4);

    // ── Download ──────────────────────────────────────────────────────────────
    const nome = m.municipio.toLowerCase().replace(/\s/g, "_");
    const data = now.toISOString().slice(0, 10);
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
  const precipValor = m.precipitacao_anual_mm !== null
    ? m.precipitacao_anual_mm.toString()
    : "Dados indisponíveis";

  const rows = [
    ["Campo", "Valor", "Unidade", "Fonte Oficial (MANIFEST)"],
    ["Município", m.municipio, "", "IBGE Localidades"],
    ["Código IBGE", m.codigoIBGE, "", "IBGE Censo 2022"],
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
    ["Estabelecimentos c/ Adubação Orgânica", m.adubacao_organica_pct.toString(), "% estabelecimentos", "IBGE Censo Agro 2017 (Tabela 6848)"],
    ["Extração Vegetal de Lenha", m.lenha_pevs_m3_ano.toString(), "m³/ano", "IBGE PEVS 2025 (Tabela 289)"],
    ["Precipitação Anual Registrada", precipValor, "mm", "INMET BDMEP 2024"],
    ["Alertas de Desmatamento", m.alertas_desmatamento.toString(), "alertas validados", "MapBiomas Alerta (SAD-Caatinga)"],
    ["Área Desmatada em Alertas", m.area_desmatamento_alertas_ha.toString(), "ha", "MapBiomas Alerta"],
    ["Cota-Parte ICMS Resíduos (IQM)", m.iqm_residuos.toString(), "pontuação (0-1)", "IPECE / SEMA-CE (IQM 2026)"],
    ["Acordos de Manejo Formalizados", "Sem registros — aguardando coleta de campo", "acordos", "Projeto FUNDECI em estruturação (Regra 2c)"],
    ["Monitoramento Participativo", "Sem registros — aguardando coleta de campo", "pontos", "Projeto FUNDECI em estruturação (Regra 2c)"],
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
