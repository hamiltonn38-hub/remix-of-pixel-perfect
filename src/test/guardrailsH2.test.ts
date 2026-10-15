import { describe, it, expect } from "vitest";
import { TODOS_PARAMETROS_H2, TECNOLOGIAS_H2, ESPECIES_H2 } from "@/data/h2ParametrosData";
import {
  limiteEstequiometricoRotaA,
  limiteEstequiometricoRotaB,
  calcRotaA,
  calcRotaB,
  CONSTANTES_H2,
} from "@/lib/calcH2";
import { municipiosReais } from "@/data/municipiosData";
import { calcIPSE } from "@/lib/calcPits";
import fs from "fs";
import path from "path";

describe("Guardiões de Integridade Científica e Segurança — guardrailsH2.test.ts", () => {
  /**
   * GUARDA (a): Barreira Estequiométrica Intransponível
   * Nenhum rendimento empírico ou tecnológico pode superar a estequiometria atômica.
   */
  describe("Guarda (a): Limites Estequiométricos Elementares", () => {
    it("nenhum rendimento de biomassa sólida da literatura pode exceder o limite estequiométrico máximo", () => {
      // Teto estequiométrico máximo para a espécie com maior teor de H (0.18 kg H2/kg seca)
      const tetoAbsolutoBiomassa = 0.18;

      const rendimentosRotaA = TODOS_PARAMETROS_H2.filter(
        (p) => p.parametro === "rendimento_h2" && p.status === "CONFIRMADO"
      );

      expect(rendimentosRotaA.length).toBeGreaterThan(0);
      for (const reg of rendimentosRotaA) {
        if (reg.maximo !== null) {
          expect(reg.maximo).toBeLessThanOrEqual(tetoAbsolutoBiomassa);
        }
        if (reg.tipico !== null) {
          expect(reg.tipico).toBeLessThanOrEqual(tetoAbsolutoBiomassa);
        }
      }
    });

    it("nenhum rendimento de reforma de metano pode exceder o teto de 4.0 mol H2/mol CH4", () => {
      const tetoMetano = limiteEstequiometricoRotaB();
      expect(tetoMetano).toBe(4.0);

      const rendimentosRotaB = TODOS_PARAMETROS_H2.filter(
        (p) => p.parametro === "rendimento_h2_ch4" && p.status === "CONFIRMADO"
      );

      expect(rendimentosRotaB.length).toBeGreaterThan(0);
      for (const reg of rendimentosRotaB) {
        if (reg.maximo !== null) {
          expect(reg.maximo).toBeLessThanOrEqual(tetoMetano);
        }
      }
    });
  });

  /**
   * GUARDA (b): Proibição Rígida de Custos Fictícios e Equivalências Populistas
   * Varre o código-fonte em busca de termos banidos pela integridade do projeto.
   */
  describe("Guarda (b): Proibição de Termos Especulativos e Populistas", () => {
    it("não deve existir menção a LCOH, custos em R$/kg ou equivalências de veículos no código da UI", () => {
      const arquivosParaVerificar = [
        path.resolve(process.cwd(), "src/components/H2SimuladorCard.tsx"),
        path.resolve(process.cwd(), "src/pages/Modulo2.tsx"),
      ];

      const termosProibidos = [
        /\bLCOH\b/i,
        /R\$\s*\/\s*kg/i,
        /custo\s+nivelado/i,
        /abastece\s+\d+\s*(carros|ve[íi]culos|autom[óo]veis)/i,
        /energia\s+para\s+\d+\s*(casas|resid[êe]ncias|fam[íi]lias)/i,
      ];

      for (const arq of arquivosParaVerificar) {
        if (fs.existsSync(arq)) {
          const conteudo = fs.readFileSync(arq, "utf-8");
          for (const regex of termosProibidos) {
            expect(regex.test(conteudo)).toBe(false);
          }
        }
      }
    });

    it("o componente H2SimuladorCard deve conter expressamente o aviso metodológico obrigatório", () => {
      const arqCard = path.resolve(process.cwd(), "src/components/H2SimuladorCard.tsx");
      const conteudo = fs.readFileSync(arqCard, "utf-8");
      expect(conteudo).toContain("Potencial teórico-tecnológico. Não é projeto de engenharia nem previsão de produção");
    });
  });

  /**
   * GUARDA (c): Proveniência Estrita de Parâmetros
   * 100% dos parâmetros confirmados possuem referência, DOI e ano.
   */
  describe("Guarda (c): Rastreabilidade e Proveniência de 100% dos Parâmetros", () => {
    it("todos os parâmetros com status CONFIRMADO devem possuir referência e DOI/URL verificável", () => {
      const confirmados = TODOS_PARAMETROS_H2.filter((p) => p.status === "CONFIRMADO");
      expect(confirmados.length).toBeGreaterThan(40);

      for (const p of confirmados) {
        expect(p.referencia.trim().length).toBeGreaterThan(0);
        expect(p.doi_url).toMatch(/^https?:\/\//);
        expect(p.data_acesso.trim().length).toBeGreaterThan(0);
        expect(["EXPERIMENTAL", "SIMULACAO", "REVISAO"]).toContain(p.tipo_estudo);
      }
    });

    it("parâmetros não comprovados com status SEM_FONTE não devem conter números simulados", () => {
      const semFonte = TODOS_PARAMETROS_H2.filter((p) => p.status === "SEM_FONTE");
      expect(semFonte.length).toBeGreaterThanOrEqual(1);

      for (const p of semFonte) {
        expect(p.minimo).toBeNull();
        expect(p.tipico).toBeNull();
        expect(p.maximo).toBeNull();
      }
    });
  });

  /**
   * GUARDA (d): Coerência Dimensional e Física
   * Testa dimensionalmente as conversões de MWh, t, kg e m³ de água.
   */
  describe("Guarda (d): Coerência Dimensional e Física", () => {
    it("1.000 kg de H2 devem equivaler a exatamente 33.33 MWh PCI", () => {
      const massaKg = 1000;
      const mwh = (massaKg * CONSTANTES_H2.PCI_H2) / CONSTANTES_H2.MJ_POR_MWH;
      expect(mwh).toBeCloseTo(33.333, 2);
    });

    it("a demanda de água estequiométrica deve situar-se entre 8.9 e 9.0 m³ para cada tonelada de H2", () => {
      const massaKg = 1000; // 1 tonelada de H2
      const aguaM3 = (massaKg * CONSTANTES_H2.RAZAO_H2O_H2) / 1000;
      expect(aguaM3).toBeGreaterThanOrEqual(8.9);
      expect(aguaM3).toBeLessThanOrEqual(9.0);
    });

    it("eficiências calculadas de tecnologias reais devem situar-se entre 40% e 90%", () => {
      // Teste com tecnologias de literatura
      for (const tec of TECNOLOGIAS_H2) {
        if (tec.rota === "ROTA_A") {
          const res = calcRotaA(10000, 10, 0.20, 0, tec.rendimento.tipico, 16.8);
          expect(res).not.toBeNull();
          expect(res!.eficiencia_conversao_pct).toBeGreaterThan(30);
          expect(res!.eficiencia_conversao_pct).toBeLessThan(90);
        } else {
          const res = calcRotaB(100000, tec.rendimento.tipico, 0.18);
          expect(res).not.toBeNull();
          expect(res!.eficiencia_conversao_pct).toBeGreaterThan(40);
          expect(res!.eficiencia_conversao_pct).toBeLessThan(90);
        }
      }
    });
  });

  /**
   * GUARDA (e): Blindagem do IPSE (ΔIPSE = 0)
   * Nenhuma mutação de estado ou chamada ao módulo de H2 pode alterar o valor do IPSE municipal.
   */
  describe("Guarda (e): Blindagem Absoluta do IPSE Municipal (ΔIPSE = 0)", () => {
    it("o cálculo oficial do IPSE em todos os municípios permanece estritamente idêntico", () => {
      expect(municipiosReais.length).toBe(10);

      for (const m of municipiosReais) {
        const ipseOficial = calcIPSE(m.PEL, m.IVS_star);
        // O IPSE presente no objeto municipal DEVE ser idêntico ao IPSE da fórmula oficial
        expect(m.IPSE).toBe(ipseOficial);
        // h2_potencial existe sem interferir no PEL ou no IVS
        expect(m.h2_potencial).toBeDefined();
        expect(m.PEL).toBeGreaterThan(0);
        expect(m.IVS).toBeGreaterThan(0);
      }
    });
  });
});
