# Acompanhamento do Progresso de Implementação — Módulo H2
**Plataforma de Inteligência Territorial Socioenergética (PITS)**

> [!NOTE]
> Marque com `[x]` à medida que cada bloco for concluído pelo executor e todos os seus comandos de verificação passarem integralmente.

- [x] **B0: Pré-requisitos e Integridade de Ambiente**
  - [x] Verificação de branch limpa e build inicial (`npm run build` / `bun run build`)
  - [x] Confirmação da integridade de `data/literature/h2_parametros.csv`
- [x] **B1: Módulo de Cálculo H2 e Testes Matemáticos**
  - [x] Criação de `src/lib/calcH2.ts` com Rota A, Rota B e limites estequiométricos
  - [x] Criação e aprovação de `src/test/calcH2.test.ts`
- [x] **B2: Carga de Parâmetros da Literatura e Tipagem**
  - [x] Criação de `src/data/h2ParametrosData.ts`
  - [x] Criação e aprovação de `src/test/h2ParametrosData.test.ts`
- [x] **B3: Integração com Dados Municipais Reais (Preservando IPSE)**
  - [x] Atualização de `src/data/municipiosData.ts`
  - [x] Teste de isolamento de impacto no IPSE
- [x] **B4: Interface do Usuário (Aba de Simulação no Módulo II)**
  - [x] Criação do componente `src/components/H2SimuladorCard.tsx` com rótulo fixo obrigatório
  - [x] Integração em `src/pages/Modulo2.tsx`
- [x] **B5: Exportação em Relatórios Oficiais (PDF e CSV)**
  - [x] Atualização da geração de PDF em `src/lib/generatePDF.ts`
  - [x] Atualização da exportação CSV com proveniência
- [x] **B6: Documentação Metodológica do Modelo H2**
  - [x] Elaboração completa de `docs/MODELO_H2.md`
- [x] **B7: Testes de Guarda Automatizados (Guardrails)**
  - [x] Implementação de `src/test/guardrailsH2.test.ts` (Guarda a, b, c, d, e)
  - [x] Execução global da suíte de testes com 100% de sucesso
