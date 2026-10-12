import { describe, it, expect } from "vitest";
import {
  calcPEL,
  calcIVS,
  calcIVSStar,
  calcIPSE,
  normalizeMinMax,
  normalizeWeights,
  IVS_PARAMETRIC_FLOOR,
  FAIXA_LITERATURA,
  classifyIVS,
  getIVSBarColor,
} from "../lib/calcPits";

describe("Módulo de Cálculo PITS — calcPits.ts", () => {
  describe("1. Direção e Comportamento do IVS (Eq. 4)", () => {
    it("deve atribuir IVS = 0 quando não há nenhuma carência (atendimento universal)", () => {
      const ivs = calcIVS({ agua: 0, esgoto: 0, lixo: 0, energia: 0 });
      expect(ivs).toBe(0.0);
    });

    it("deve atribuir IVS = 1 quando todas as carências são máximas (100% privados)", () => {
      const ivs = calcIVS({ agua: 1, esgoto: 1, lixo: 1, energia: 1 });
      expect(ivs).toBe(1.0);
    });

    it("DIREÇÃO: IVS alto deve representar MAIOR vulnerabilidade", () => {
      const baixaVulnerabilidade = calcIVS({ agua: 0.1, esgoto: 0.1, lixo: 0.05, energia: 0.01 });
      const altaVulnerabilidade = calcIVS({ agua: 0.7, esgoto: 0.8, lixo: 0.6, energia: 0.1 });

      expect(baixaVulnerabilidade).not.toBeNull();
      expect(altaVulnerabilidade).not.toBeNull();
      expect(altaVulnerabilidade!).toBeGreaterThan(baixaVulnerabilidade!);

      // Semântica de cores: baixa vulnerabilidade é verde, alta é vermelha
      expect(getIVSBarColor(baixaVulnerabilidade!)).toBe("bg-success");
      expect(getIVSBarColor(altaVulnerabilidade!)).toBe("bg-destructive");
      expect(classifyIVS(baixaVulnerabilidade!).variant).toBe("success");
      expect(classifyIVS(altaVulnerabilidade!).variant).toBe("destructive");
    });

    it("deve retornar null se alguma variável do IVS for nula ou indefinida", () => {
      expect(calcIVS(null)).toBeNull();
      expect(calcIVS({ agua: 0.2, esgoto: 0.3, lixo: 0.1, energia: NaN })).toBeNull();
    });
  });

  describe("2. Soma e Normalização dos Pesos", () => {
    it("deve garantir que a soma dos pesos seja sempre exatamente 1.0", () => {
      const pesosDesbalanceados = [30, 25, 25, 20];
      const norm = normalizeWeights(pesosDesbalanceados);
      const soma = norm.reduce((a, b) => a + b, 0);
      expect(soma).toBeCloseTo(1.0, 6);
      expect(norm[0]).toBeCloseTo(0.3, 2);
    });

    it("deve lidar com vetor de pesos zerados dividindo igualmente", () => {
      const norm = normalizeWeights([0, 0, 0, 0]);
      expect(norm).toEqual([0.25, 0.25, 0.25, 0.25]);
    });
  });

  describe("3. Piso Paramétrico do IVS e Penalidade de Seca (Eq. 5)", () => {
    it("deve aplicar o piso paramétrico ε_floor quando IVS ≈ 0 para evitar divisão por zero", () => {
      const ivsZero = 0.0;
      const ivsStar = calcIVSStar(ivsZero);
      expect(ivsStar).toBe(IVS_PARAMETRIC_FLOOR);
      expect(ivsStar).toBe(0.05);

      // Ao calcular IPSE com IVS = 0, IPSE não explode para infinito
      const pel = 1000;
      const ipse = calcIPSE(pel, ivsStar);
      expect(ipse).toBe(20000); // 1000 / 0.05
      expect(isFinite(ipse!)).toBe(true);
    });

    it("deve manter o valor do IVS quando ele for superior ao piso", () => {
      const ivsStar = calcIVSStar(0.25);
      expect(ivsStar).toBe(0.25);
    });

    it("deve aplicar penalidade de seca opcional quando fornecida", () => {
      const ivsBase = 0.30;
      const ivsStarComSeca = calcIVSStar(ivsBase, { droughtPenalty: 0.20 }); // +20%
      expect(ivsStarComSeca).toBe(0.36);
    });
  });

  describe("4. Potencial Energético Local PEL (Eq. 1)", () => {
    it("deve calcular o PEL com a fórmula PEL = A_i · Y_i · PCI · η", () => {
      const areaHa = 10000; // 10.000 ha
      // Usando parâmetros padrão: Y_i=10 t/ha/ano, PCI=16.5 GJ/t, eta=0.25
      // 10000 * 10 * 16.5 * 0.25 = 412.500 GJ/ano
      const pel = calcPEL(areaHa);
      expect(pel).toBe(412500);
    });

    it("deve permitir parâmetros customizados respeitando as faixas da literatura", () => {
      const areaHa = 1000;
      const pelMin = calcPEL(areaHa, {
        Y_i: FAIXA_LITERATURA.Y_i.min, // 8
        PCI: FAIXA_LITERATURA.PCI.min, // 15
        eta: FAIXA_LITERATURA.eta.min, // 0.20
      });
      // 1000 * 8 * 15 * 0.20 = 24.000 GJ/ano
      expect(pelMin).toBe(24000);

      const pelMax = calcPEL(areaHa, {
        Y_i: FAIXA_LITERATURA.Y_i.max, // 15
        PCI: FAIXA_LITERATURA.PCI.max, // 18
        eta: FAIXA_LITERATURA.eta.max, // 0.30
      });
      // 1000 * 15 * 18 * 0.30 = 81.000 GJ/ano
      expect(pelMax).toBe(81000);
    });

    it("deve retornar null para áreas ausentes ou inválidas", () => {
      expect(calcPEL(null)).toBeNull();
      expect(calcPEL(-100)).toBeNull();
    });
  });

  describe("5. Cálculo do IPSE (Eq. 6) e Normalização Min-Max (Eq. 7)", () => {
    it("deve calcular IPSE = PEL / IVS*", () => {
      const pel = 50000;
      const ivsStar = 0.25;
      const ipse = calcIPSE(pel, ivsStar);
      expect(ipse).toBe(200000);
    });

    it("deve normalizar valores min-max estritamente no intervalo [0, 1]", () => {
      const valores = [100, 200, 300, 400, 500];
      const norm = normalizeMinMax(valores);
      expect(norm).toEqual([0.0, 0.25, 0.5, 0.75, 1.0]);
    });

    it("deve manter null para dados indisponíveis na normalização", () => {
      const valores = [100, null, 300, undefined, 500];
      const norm = normalizeMinMax(valores);
      expect(norm).toEqual([0.0, null, 0.5, null, 1.0]);
    });

    it("deve retornar 1.0 se todos os municípios tiverem o mesmo valor", () => {
      const norm = normalizeMinMax([200, 200, 200]);
      expect(norm).toEqual([1.0, 1.0, 1.0]);
    });
  });
});
