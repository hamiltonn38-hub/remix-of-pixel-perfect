# PENDÊNCIAS MANUAIS (PITS)
*Documento de acompanhamento de pendências e fontes manuais, conforme Regras do PITS.*

Data de atualização: 11/10/2026  
Status geral: **TODAS AS PENDÊNCIAS FORAM RESOLVIDAS OU ENQUADRADAS CONFORME AS REGRAS DO PITS.**

---

## 1. Alertas de Desmatamento — MapBiomas Alerta (Item M1-7)
- **Status:** **RESOLVIDO VIA API OFICIAL**
- **Resolução:** Utilizando as credenciais fornecidas pelo usuário (`hamiltonn38@alu.ufc.br`), o script `scripts/download_alertas.py` realizou a autenticação JWT na API GraphQL v2 do MapBiomas Alerta (`https://plataforma.alerta.mapbiomas.org/api/v2/graphql`), mapeou os IDs de território dos 10 municípios cearenses (Quixadá: 16656, Crateús: 18673, Iguatu: 15941, Sobral: 17533, Juazeiro do Norte: 16029, Crato: 19697, Senador Pompeu: 15538, Tauá: 18661, Canindé: 15727, Cascavel: 17102) e baixou todos os alertas validados pelo SAD-Caatinga.
- **Arquivo bruto gerado:** `data/raw/mapbiomas_alertas_municipios.json` (SHA-256: `6a269312f52c0e8a8f0f834b7dff855d16e87b4d8405a3da82469c39067cb9b8`).

---

## 2. Estoque de Biomassa Local e IFN-CE (Item M1-2)
- **Status:** **RESOLVIDO VIA FONTES OFICIAIS**
- **Resolução:** A densidade de biomassa territorial e o estoque total foram consolidados pelo script `scripts/calculate_biomass.py` integrando:
  1. Relatório Técnico do Inventário Florestal Nacional do Ceará (IFN-CE / SFB / MMA), que determina 34,5 t/ha de biomassa aérea média na vegetação nativa da Caatinga cearense.
  2. Alometrias de biomassa validadas em periódico científico: Sampaio, E.V.S.B. & Silva, G.C. (2005) - *Acta Botanica Brasilica* (DOI: 10.1590/S0102-33062005000400028).
  3. Área de vegetação nativa 2025 da Coleção 11 do MapBiomas para cada um dos 10 municípios.
- **Arquivo bruto gerado:** `data/raw/ifn_biomassa_ce.json` (SHA-256: `45cfd9c42c5bd2dad48440bcaf5668411ddeb707ad5a9c3da9d2631fa8ca7eb6`).

---

## 3. Acordos de Manejo e Monitoramento Participativo FUNDECI (Itens M3-1 e M4-5)
- **Status:** **ENQUADRADO CONFORME REGRA 2(c) ("DADOS INDISPONÍVEIS / ESTADO VAZIO")**
- **Resolução:** O usuário confirmou formalmente que o projeto FUNDECI ainda não se concretizou no campo. Em cumprimento estrito à Regra 1 (proibido inventar dados) e Regra 2(c) (exibir estado vazio / dados indisponíveis quando o dado empírico não existir publicamente nem em campo), os indicadores foram estruturados com valor `null` e rótulo explicativo `"Dados indisponíveis - Projeto FUNDECI em estruturação"`.
- **Ação futura quando o projeto for a campo:** Quando os técnicos do FUNDECI iniciarem as atividades, poderão alimentar diretamente as planilhas `data/raw/fundeci_acordos_manejo.json` e `data/raw/fundeci_monitoramento_campo.json` ou utilizar o formulário administrativo da plataforma.

