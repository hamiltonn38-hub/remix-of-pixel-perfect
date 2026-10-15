import { describe, it, expect } from "vitest";
import {
  limiteEstequiometricoRotaA,
  limiteEstequiometricoRotaB,
  calcRotaA,
  calcRotaB,
  CONSTANTES_H2,
} from "@/lib/calcH2";

describe("Módulo de Cálculo H2 — calcH2.ts", () => {
  describe("1. Limites Estequiométricos Teóricos", () => {
    it("deve calcular o limite estequiométrico mássico da Rota A para biomassa padrão da Caatinga entre 0.14 e 0.18 kg H2/kg seca", () => {
      // Sabiá (C=47.0%, H=5.8%, O=43.0%)
      const yMax = limiteEstequiometricoRotaA(47.0, 5.8, 43.0);
      expect(yMax).toBeGreaterThanOrEqual(0.14);
      expect(yMax).toBeLessThanOrEqual(0.18);
    });

    it("deve retornar 0 para composições elementares inválidas ou zeradas", () => {
      expect(limiteEstequiometricoRotaA(0, 5.8, 43.0)).toBe(0);
      expect(limiteEstequiometricoRotaA(-10, 5.8, 43.0)).toBe(0);
      expect(limiteEstequiometricoRotaA(NaN, 5.8, 43.0)).toBe(0);
    });

    it("deve retornar exatamente 4.0 mol H2 / mol CH4 para o limite da Rota B", () => {
      expect(limiteEstequiometricoRotaB()).toBe(4.0);
    });
  });

  describe("2. Rota A — Gaseificação de Biomassa Sólida", () => {
    it("deve calcular corretamente a produção de H2, MWh, água e eficiência para valores típicos de literatura", () => {
      // Município com 10.000 ha, produtividade 10 t/ha/ano, fração de manejo 20% (f=0.20), u=0 (base seca)
      // Rendimento típico de gaseificação a vapor: 0.085 kg H2 / kg seca
      // PCI biomassa típica: 16.8 MJ/kg
      const areaHa = 10000;
      const Yi = 10.0;
      const fi = 0.20;
      const ui = 0.0;
      const yH2 = 0.085;
      const pci = 16.8;

      const res = calcRotaA(areaHa, Yi, fi, ui, yH2, pci);
      expect(res).not.toBeNull();

      // Massa biomassa seca disponível = 10000 * 10 * 0.20 * 1000 = 20.000.000 kg
      // Massa H2 = 20.000.000 * 0.085 = 1.700.000 kg
      expect(res?.massa_h2_kg_ano).toBe(1700000);

      // PEL MWh = (1.700.000 * 120.0) / 3600 = 56.666,67 MWh
      expect(res?.pel_h2_mwh_ano).toBe(56666.67);

      // Demanda de água estequiométrica: 1.700.000 * (18.015 / 2.016) / 1000 = 15.191,22 m³
      expect(res?.demanda_agua_m3_ano).toBe(15191.22);

      // Eficiência de conversão: (0.085 * 120.0 / 16.8) * 100 = 60.71%
      expect(res?.eficiencia_conversao_pct).toBe(60.71);
    });

    it("deve retornar null para entradas inválidas (área nula, valores negativos ou NaN)", () => {
      expect(calcRotaA(null, 10, 0.2, 0, 0.085, 16.8)).toBeNull();
      expect(calcRotaA(0, 10, 0.2, 0, 0.085, 16.8)).toBeNull();
      expect(calcRotaA(-500, 10, 0.2, 0, 0.085, 16.8)).toBeNull();
      expect(calcRotaA(1000, -10, 0.2, 0, 0.085, 16.8)).toBeNull();
      expect(calcRotaA(1000, 10, 1.5, 0, 0.085, 16.8)).toBeNull(); // f_i > 1
      expect(calcRotaA(1000, 10, 0.2, 1.2, 0.085, 16.8)).toBeNull(); // u_i >= 1
      expect(calcRotaA(1000, 10, 0.2, 0, -0.05, 16.8)).toBeNull();
    });
  });

  describe("3. Rota B — Reforma a Vapor de Biogás (BSR)", () => {
    it("deve calcular a conversão de metano para H2 com perdas reais de PSA", () => {
      // 100.000 Nm³ de CH4, rendimento típico 2.75 mol H2 / mol CH4, perda PSA 18% (recuperação 82%)
      const volCH4 = 100000;
      const rendMol = 2.75;
      const perdaPsa = 0.18;

      const res = calcRotaB(volCH4, rendMol, perdaPsa);
      expect(res).not.toBeNull();

      // Massa CH4 = 100000 * 0.657 = 65.700 kg
      // Massa H2 bruta = 65700 * 2.75 * (2.016 / 16.043) = 22.704,03 kg
      // Massa H2 líquida = 22704.03 * (1 - 0.18) = 18.617,31 kg ≈ 18617.3 kg
      expect(res?.massa_h2_kg_ano).toBe(18617.3);

      // PEL MWh = (18617.3 * 120.0) / 3600 = 620.58 MWh
      expect(res?.pel_h2_mwh_ano).toBe(620.58);

      // Demanda água = 18617.3 * (18.015 / 2.016) / 1000 ≈ 166.36 m³
      expect(res?.demanda_agua_m3_ano).toBeCloseTo(166.36, 1);

      // Eficiência térmica: (18617.3 * 120) / (65700 * 50) * 100 ≈ 68.0%
      expect(res?.eficiencia_conversao_pct).toBeCloseTo(68.0, 1);
    });

    it("deve retornar null se o rendimento exceder o limite estequiométrico da Rota B (4.0 mol H2/mol CH4)", () => {
      // Rendimento impossível de 4.5 mol H2 / mol CH4
      expect(calcRotaB(100000, 4.5, 0.18)).toBeNull();
    });

    it("deve retornar null para dados de biogás nulos ou inválidos", () => {
      expect(calcRotaB(null, 2.75, 0.18)).toBeNull();
      expect(calcRotaB(0, 2.75, 0.18)).toBeNull();
      expect(calcRotaB(-100, 2.75, 0.18)).toBeNull();
      expect(calcRotaB(100000, 2.75, -0.1)).toBeNull();
      expect(calcRotaB(100000, 2.75, 1.0)).toBeNull();
    });
  });

  describe("4. Constantes Físico-Químicas e Rastreabilidade", () => {
    it("deve possuir valores coerentes com NIST Chemistry WebBook", () => {
      expect(CONSTANTES_H2.PCI_H2).toBe(120.0);
      expect(CONSTANTES_H2.PCI_CH4).toBe(50.0);
      expect(CONSTANTES_H2.DENSIDADE_CH4_NM3).toBe(0.657);
      expect(CONSTANTES_H2.MJ_POR_MWH).toBe(3600);
      expect(CONSTANTES_H2.RAZAO_H2O_H2).toBeCloseTo(8.936, 2);
    });
  });
});
