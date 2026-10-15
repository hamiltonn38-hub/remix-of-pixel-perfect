import { describe, it, expect } from "vitest";
import {
  loadH2Parametros,
  TECNOLOGIAS_H2,
  ESPECIES_H2,
  TODOS_PARAMETROS_H2,
  parseCSVLine,
} from "@/data/h2ParametrosData";

describe("Carga de Parâmetros de Literatura H2 — h2ParametrosData.ts", () => {
  it("deve carregar 49 registros de dados a partir do CSV h2_parametros.csv", () => {
    const params = loadH2Parametros();
    expect(params.length).toBe(49);
    expect(TODOS_PARAMETROS_H2.length).toBe(49);
  });

  it("deve parsear corretamente linhas com aspas e vírgulas internas", () => {
    const line = 'pci_h2,Fisico-quimico,Hidrogenio (H2),,,120.0,MJ/kg,"Poder Calorifico Inferior base massa (120 MJ/kg = 33.33 kWh/kg PCI)",REVISAO,industrial,"NIST Chemistry WebBook; Heywood (1988)",https://webbook.nist.gov/chemistry/,13/10/2026,CONFIRMADO';
    const cols = parseCSVLine(line);
    expect(cols.length).toBe(14);
    expect(cols[0]).toBe("pci_h2");
    expect(cols[5]).toBe("120.0");
    expect(cols[7]).toBe("Poder Calorifico Inferior base massa (120 MJ/kg = 33.33 kWh/kg PCI)");
    expect(cols[10]).toBe("NIST Chemistry WebBook; Heywood (1988)");
  });

  it("todos os registros com status === 'CONFIRMADO' devem ter fonte, referência, URL/DOI e data de acesso preenchidos", () => {
    const confirmados = TODOS_PARAMETROS_H2.filter((p) => p.status === "CONFIRMADO");
    expect(confirmados.length).toBeGreaterThan(40);

    for (const item of confirmados) {
      expect(item.referencia.trim().length).toBeGreaterThan(0);
      expect(item.doi_url.trim().length).toBeGreaterThan(0);
      expect(item.data_acesso.trim().length).toBeGreaterThan(0);
      expect(["EXPERIMENTAL", "SIMULACAO", "REVISAO"]).toContain(item.tipo_estudo);
    }
  });

  it("registros com status === 'SEM_FONTE' não devem possuir números preenchidos (proibição de inventar dados)", () => {
    const semFonte = TODOS_PARAMETROS_H2.filter((p) => p.status === "SEM_FONTE");
    expect(semFonte.length).toBeGreaterThanOrEqual(1);

    for (const item of semFonte) {
      expect(item.minimo).toBeNull();
      expect(item.tipico).toBeNull();
      expect(item.maximo).toBeNull();
    }
  });

  it("o catálogo de tecnologias deve conter as rotas principais com faixas válidas e TRL consistente", () => {
    expect(TECNOLOGIAS_H2.length).toBe(5);

    for (const tec of TECNOLOGIAS_H2) {
      expect(tec.trl.min).toBeGreaterThanOrEqual(1);
      expect(tec.trl.max).toBeLessThanOrEqual(9);
      expect(tec.trl.tipico).toBeGreaterThanOrEqual(tec.trl.min);
      expect(tec.trl.tipico).toBeLessThanOrEqual(tec.trl.max);

      expect(tec.rendimento.min).toBeGreaterThan(0);
      expect(tec.rendimento.tipico).toBeGreaterThanOrEqual(tec.rendimento.min);
      expect(tec.rendimento.max).toBeGreaterThanOrEqual(tec.rendimento.tipico);

      expect(tec.doi_url).toMatch(/^https?:\/\//);
    }
  });

  it("o catálogo de espécies da Caatinga deve conter as 6 espécies com limites estequiométricos válidos", () => {
    expect(ESPECIES_H2.length).toBe(6);

    const ids = ESPECIES_H2.map((e) => e.id);
    expect(ids).toContain("sabia");
    expect(ids).toContain("jurema_preta");
    expect(ids).toContain("angico");
    expect(ids).toContain("catingueira");
    expect(ids).toContain("juazeiro");
    expect(ids).toContain("palma_forrageira");

    for (const esp of ESPECIES_H2) {
      expect(esp.carbono_pct).toBeGreaterThan(30);
      expect(esp.carbono_pct).toBeLessThan(60);
      expect(esp.hidrogenio_pct).toBeGreaterThan(4);
      expect(esp.hidrogenio_pct).toBeLessThan(8);
      expect(esp.limiteEstequiometrico_kg_kg).toBeGreaterThan(0.12);
      expect(esp.limiteEstequiometrico_kg_kg).toBeLessThan(0.20);
      expect(esp.doi_url).toMatch(/^https?:\/\//);
    }
  });
});
