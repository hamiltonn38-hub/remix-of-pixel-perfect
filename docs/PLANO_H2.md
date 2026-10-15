# PLANO DE IMPLEMENTAÇÃO DO MÓDULO H2 (BIOMASSA → HIDROGÊNIO)
**Plataforma de Inteligência Territorial Socioenergética (PITS)**  
*Documento de execução literal para simulação do potencial de hidrogênio (H2).*

> [!IMPORTANT]
> **DIRETRIZ PARA O EXECUTOR:**
> Você deve executar SOMENTE UM BLOCO POR VEZ. Não faça suposições, não adivinhe valores e não enfraqueça nenhum teste. Caso encontre discrepâncias ou ausência de dados, pare e documente imediatamente em `docs/DUVIDAS_H2.md`.

---

## B0: Pré-requisito — Verificação de Integridade e Ambiente de Parâmetros

### Objetivo
Garantir que a base do repositório passe integralmente no build e que o arquivo de dados auditados `data/literature/h2_parametros.csv` exista e esteja íntegro antes de qualquer codificação.

### Arquivos a criar/alterar
- `docs/DUVIDAS_H2.md` (criar se não existir)
- `data/literature/h2_parametros.csv` (já criado no planejamento, verificar integridade)

### Passos numerados literais
1. Verificar se a branch de trabalho está limpa e sem conflitos.
2. Executar a suíte de testes existente (`npm test`) e o build da aplicação (`npm run build`).
3. Confirmar a existência do arquivo `data/literature/h2_parametros.csv` com codificação UTF-8 e 49 linhas de dados.
4. Se qualquer teste prévio falhar ou o build quebrar, registrar em `docs/DUVIDAS_H2.md` e PARAR.

### Critério de aceite verificável
- `npm test` executa com 100% de sucesso.
- `npm run build` termina com código de saída 0.
- `data/literature/h2_parametros.csv` existe e contém o cabeçalho e as linhas preenchidas sem campos numéricos inventados.

### Comandos de verificação
```powershell
bun test
bun run build
Test-Path data/literature/h2_parametros.csv
```
*Resultado esperado:* Todos os testes passam (17 pass), build Vite bem-sucedido (`built in ...`), e retorno `True` no PowerShell.

### Condição de PARADA
Se o build falhar ou os testes de regressão existentes falharem antes de iniciar o módulo H2, PARAR e registrar em `docs/DUVIDAS_H2.md`.

---

## B1: Módulo de Cálculo H2 e Testes Unitários

### Objetivo
Implementar as funções matemáticas puras de simulação de H2 (Rota A, Rota B, limites estequiométricos, eficiência e demanda de água) e seus testes unitários em `src/lib/calcH2.ts`.

### Arquivos a criar/alterar
- `src/lib/calcH2.ts` (criar)
- `src/test/calcH2.test.ts` (criar)

### Passos numerados literais
1. Criar o arquivo `src/lib/calcH2.ts` contendo as interfaces de entrada e as funções de cálculo exatas descritas abaixo.
2. Implementar `limiteEstequiometricoRotaA(C_pct: number, H_pct: number, O_pct: number): number` que calcula o limite em $\text{kg } H_2\text{/kg biomassa seca}$.
   - Fórmula: $m = (H/1.008) / (C/12.011)$; $n = (O/16.000) / (C/12.011)$;
   - Moles teóricos: $Y_{mol} = 2 - n + m/2$;
   - Massa molar biomassa: $M = 12.011 + 1.008 \cdot m + 16.000 \cdot n$;
   - Retorno: $(Y_{mol} \cdot 2.016) / M$.
3. Implementar `limiteEstequiometricoRotaB(): number` retornando o valor exato $4.0$ ($\text{mol } H_2\text{ / mol } CH_4$, equivalente a $0.5027\text{ kg } H_2\text{ / kg } CH_4$).
4. Implementar a função `calcRotaA(areaHa: number, Y_i: number, f_i: number, u_i: number, y_H2: number): RotaAResult`:
   - $PEL_{H2} = [A_i \cdot Y_i \cdot f_i \cdot 1000 \cdot (1 - u_i) \cdot y_{H2} \cdot 120.0] / 3600$ (em MWh/ano);
   - Massa de H2: $m_{H2} = A_i \cdot Y_i \cdot f_i \cdot 1000 \cdot (1 - u_i) \cdot y_{H2}$ (em kg/ano);
   - Demanda de água estequiométrica: $m_{H2O} = m_{H2} \cdot 8.936$ (em kg/ano ou litros/ano);
   - Eficiência de conversão: $\eta = (y_{H2} \cdot 120.0) / PCI_{biomassa}$.
5. Implementar a função `calcRotaB(v_ch4_nm3: number, y_mol: number, loss_psa: number): RotaBResult`:
   - Densidade CH4: $0.657\text{ kg/Nm}^3$ (NIST);
   - Massa CH4: $m_{CH4} = v_ch4_nm3 \cdot 0.657$ (em kg/ano);
   - Massa H2 bruta: $m_{H2,bruto} = m_{CH4} \cdot y_{mol} \cdot (2.016 / 16.043)$;
   - Massa H2 líquida: $m_{H2} = m_{H2,bruto} \cdot (1 - loss_psa)$;
   - $PEL_{H2} = (m_{H2} \cdot 120.0) / 3600$ (em MWh/ano);
   - Demanda de água estequiométrica: $m_{H2O} = m_{H2} \cdot 8.936$ (em kg/ano);
   - Eficiência de conversão: $\eta = (m_{H2} \cdot 120.0) / (m_{CH4} \cdot 50.0)$.
6. Criar `src/test/calcH2.test.ts` com testes cobrindo valores conhecidos, entradas nulas, valores negativos e limite estequiométrico.

### Código-guia e assinaturas
```typescript
export interface ParametrosFaixa {
  min: number;
  tipico: number;
  max: number;
}

export interface RotaAResult {
  pel_h2_mwh_ano: number;
  massa_h2_kg_ano: number;
  demanda_agua_m3_ano: number;
  eficiencia_conversao_pct: number;
}

export interface RotaBResult {
  pel_h2_mwh_ano: number;
  massa_h2_kg_ano: number;
  demanda_agua_m3_ano: number;
  eficiencia_conversao_pct: number;
}

export function limiteEstequiometricoRotaA(C_pct: number, H_pct: number, O_pct: number): number;
export function limiteEstequiometricoRotaB(): number; // 4.0 mol H2/mol CH4
export function calcRotaA(areaHa: number, Y_i: number, f_i: number, u_i: number, y_H2: number, pci_biomassa: number): RotaAResult | null;
export function calcRotaB(volumeCH4_Nm3: number, rendimento_mol: number, perda_psa: number): RotaBResult | null;
```

### Critério de aceite verificável
- Testes unitários cobrem todas as funções com 100% de aprovação.
- Limite estequiométrico para biomassa padrão (C=47%, H=5.8%, O=43%) retorna entre 0.14 e 0.16 kg H2/kg.
- Teste falha intencionalmente se $y_{H2} > limiteEstequiometrico$.

### Comandos de verificação
```powershell
bun test src/test/calcH2.test.ts
```
*Resultado esperado:* Todos os testes passam.

### Condição de PARADA
Se qualquer fórmula divergir do roteiro oficial ou gerar rendimento impossível termodinamicamente sem que o teste pegue, PARAR e registrar em `docs/DUVIDAS_H2.md`.

---

## B2: Carga dos Parâmetros da Literatura e Tipagem Estrita

### Objetivo
Criar o módulo leitor/armazenador de parâmetros `src/data/h2ParametrosData.ts` que parseia ou importa `data/literature/h2_parametros.csv`, garantindo fonte, ano, tipo de estudo e TRL.

### Arquivos a criar/alterar
- `src/data/h2ParametrosData.ts` (criar)
- `src/test/h2ParametrosData.test.ts` (criar)

### Passos numerados literais
1. Criar o leitor estruturado de `data/literature/h2_parametros.csv` em `src/data/h2ParametrosData.ts`.
2. Estruturar tipos TypeScript estritos:
   - `H2ParametroItem`: `parametro`, `tecnologia`, `materia_prima`, `minimo`, `tipico`, `maximo`, `unidade`, `condicoes`, `tipo_estudo` ("EXPERIMENTAL" | "SIMULACAO" | "REVISAO"), `escala`, `referencia`, `doi_url`, `data_acesso`, `status` ("CONFIRMADO" | "SO_RESUMO" | "SEM_FONTE").
3. Exportar dicionários prontos para uso na interface e nas funções de cálculo:
   - `TECNOLOGIAS_H2`: Faixas de rendimento e TRL por tecnologia de gaseificação e reforma;
   - `ESPECIES_H2`: Composição elementar, umidade de colheita e PCI por espécie da Caatinga;
   - `CONSTANTES_FISICO_QUIMICAS`: PCI do H2 (120 MJ/kg), densidade do CH4 (0.657 kg/Nm³), PCI do CH4 (50 MJ/kg), demanda de água teórica (8.936 kg/kg).
4. Implementar teste unitário `src/test/h2ParametrosData.test.ts` que valida a integridade de cada registro.

### Critério de aceite verificável
- Todos os registros com `status === 'CONFIRMADO'` possuem `referencia` preenchida, `doi_url` ou URL válida, `data_acesso` e valores numéricos válidos.
- Nenhum registro com `status === 'SEM_FONTE'` possui números preenchidos.

### Comandos de verificação
```powershell
bun test src/test/h2ParametrosData.test.ts
```

### Condição de PARADA
Se houver qualquer parâmetro de rendimento sem referência aberta comprovada, não adivinhar; registrar em `docs/DUVIDAS_H2.md`.

---

## B3: Integração com Dados Reais Municipais (Sem Afetar IPSE)

### Objetivo
Estender a interface `MunicipioPits` em `src/data/municipiosData.ts` para computar a estimativa de H2 (faixa min/tip/max) por município como indicador independente, garantindo que o IPSE permaneça rigorosamente inalterado.

### Arquivos a criar/alterar
- `src/data/municipiosData.ts` (alterar)
- `src/test/calcPits.test.ts` (adicionar teste de não-regressão do IPSE)

### Passos numerados literais
1. Importar as funções de cálculo de `src/lib/calcH2.ts` e parâmetros de `src/data/h2ParametrosData.ts` em `src/data/municipiosData.ts`.
2. Adicionar os campos na interface `MunicipioPits`:
   ```typescript
   h2_potencial: {
     rotaA_gasificacao: {
       min_mwh_ano: number;
       tipico_mwh_ano: number;
       max_mwh_ano: number;
       massa_h2_tipico_t_ano: number;
       demanda_agua_tipico_m3_ano: number;
     };
     rotaB_biogas: {
       min_mwh_ano: number | null;
       tipico_mwh_ano: number | null;
       max_mwh_ano: number | null;
       massa_h2_tipico_t_ano: number | null;
       demanda_agua_tipico_m3_ano: number | null;
     } | null;
   };
   ```
3. Na função `buildMunicipiosList`, calcular o H2 para cada município utilizando a área de vegetação nativa real (`area_nativa_ha`) e a produtividade configurada.
4. Para a Rota B, se o município não tiver dados de biogás/biodigestores reais cadastrados, atribuir `null` (Regra 2c: dados indisponíveis).
5. Adicionar teste específico garantindo que `m.IPSE` e `m.IPSE_norm` calculados são matematicamente idênticos aos valores anteriores.

### Critério de aceite verificável
- `bun test` passa sem erros.
- O teste de guarda (e) confirma que o IPSE não sofre alteração decimal após o acoplamento do H2.

### Comandos de verificação
```powershell
bun test src/test/calcPits.test.ts
```

### Condição de PARADA
Se o valor do IPSE sofrer qualquer variação ou se a Rota B inventar números de biodigestores onde há `null`, PARAR e registrar em `docs/DUVIDAS_H2.md`.

---

## B4: Interface do Usuário — Aba de Simulação H2 no Módulo II

### Objetivo
Adicionar uma sub-aba ou seção dedicada à simulação de H2 no Módulo II (`src/pages/Modulo2.tsx`), com seletor de rotas, faixas paramétricas, maturidade (TRL) e rótulo de conformidade obrigatório.

### Arquivos a criar/alterar
- `src/components/H2SimuladorCard.tsx` (criar)
- `src/pages/Modulo2.tsx` (alterar para incluir o card de simulação)

### Passos numerados literais
1. Criar o componente `src/components/H2SimuladorCard.tsx`.
2. Inserir no topo do card o rótulo fixo obrigatório:
   > *"Potencial teórico-tecnológico. Não é projeto de engenharia nem previsão de produção."*
3. Renderizar controles interativos:
   - Seleção de Rota: Rota A (Gaseificação de biomassa sólida) ou Rota B (Reforma de biogás);
   - Seleção de Tecnologia da Rota A (Vapor / Ar-vapor / Oxigênio-vapor / Pirólise+reforma);
   - Seletor de Espécie (Sabiá, Jurema-preta, Angico, Catingueira, Juazeiro, Palma forrageira);
   - Exibição de TRL com badge de maturidade e fonte da IEA Bioenergy.
4. Exibir resultados SEMPRE em faixas (Conservador / Típico / Otimista) para:
   - Potencial Energético Local em H2 (MWh PCI/ano);
   - Produção em massa de H2 (t/ano);
   - Demanda mínima de água de reação (m³/ano);
   - Eficiência global calculada (%).
5. Integrar o card `H2SimuladorCard` na página `src/pages/Modulo2.tsx`.

### Critério de aceite verificável
- Rótulo obrigatório visível.
- Nenhuma menção a custos, LCOH, ou equivalências de veículos/residências.
- A interface exibe badges de proveniência (`FonteInfo`) com citação e DOI de cada parâmetro selecionado.

### Comandos de verificação
```powershell
bun run build
```

### Condição de PARADA
Se qualquer componente incluir textos como "LCOH", "R$/kg" ou "abastece X carros", PARAR imediatamente e registrar em `docs/DUVIDAS_H2.md`.

---

## B5: Exportação em Relatórios (PDF e CSV)

### Objetivo
Incorporar os indicadores de H2 gerados na exportação técnica semestral em PDF e na planilha de auditoria em CSV sem romper o layout existente.

### Arquivos a criar/alterar
- `src/lib/generatePDF.ts` (alterar)
- `src/test/generatePDF.test.ts` (se existir ou criar teste de exportação)

### Passos numerados literais
1. Em `src/lib/generatePDF.ts`:
   - Adicionar uma seção específica no relatório técnico PDF com o título: *"4. Potencial Teórico-Tecnológico de Hidrogênio (H2 de Biomassa)"*;
   - Incluir a ressalva metodológica oficial;
   - Inserir tabela autoTable com as faixas de produção (MWh/ano, t/ano, água m³/ano, TRL e tecnologia).
2. Na função `exportCSV`:
   - Adicionar as linhas com os resultados da simulação municipal de H2 e suas fontes auditadas.

### Critério de aceite verificável
- `bun run build` compila sem erros.
- A exportação CSV contém as linhas de H2 identificadas com unidade e proveniência.

### Comandos de verificação
```powershell
bun run build
```

### Condição de PARADA
Se a geração de PDF falhar ou quebrar tabelas existentes, PARAR e registrar em `docs/DUVIDAS_H2.md`.

---

## B6: Documentação Metodológica do Modelo H2

### Objetivo
Criar `docs/MODELO_H2.md` formalizando a fundamentação matemática, equações físico-químicas, limites estequiométricos e catálogo de fontes para anexar ao artigo científico da PITS.

### Arquivos a criar/alterar
- `docs/MODELO_H2.md` (criar)

### Passos numerados literais
1. Redigir `docs/MODELO_H2.md` com estrutura idêntica à de `docs/MODELO.md`.
2. Incluir a dedução da estequiometria mássica a partir de $\text{CH}_m\text{O}_n$.
3. Detalhar as Equações de Rota A e Rota B.
4. Apresentar a tabela consolidada de espécies da Caatinga, composições elementares e referências indexadas.
5. Registrar a justificativa de exclusão de LCOH e de fermentação escura.

### Critério de aceite verificável
- Arquivo criado e completo, referenciando `data/literature/h2_parametros.csv` e `docs/CATALOGO_H2.md`.

### Comandos de verificação
```powershell
Test-Path docs/MODELO_H2.md
```

### Condição de PARADA
Se houver qualquer contradição entre `docs/MODELO_H2.md` e o código de cálculo, PARAR e registrar em `docs/DUVIDAS_H2.md`.

---

## B7: Testes de Guarda (Guardrails Automatizados)

### Objetivo
Implementar suíte de testes de guarda estritos que reprovam a compilação ou execução do sistema diante de qualquer violação das regras de auditoria e veracidade.

### Arquivos a criar/alterar
- `src/test/guardrailsH2.test.ts` (criar)

### Passos numerados literais
1. Criar o arquivo `src/test/guardrailsH2.test.ts` implementando os 5 testes de guarda obrigatórios descritos na Seção 2 do plano:
   - **Guarda (a):** Varre todos os registros de rendimento em `h2_parametros.csv` e assegura que nenhum valor exceda o limite estequiométrico correspondente;
   - **Guarda (b):** Varre os arquivos em `src/pages/` e `src/components/` buscando expressões regulares de constantes numéricas soltas (hardcoded) de rendimento ou PCI fora de `h2_parametros.csv` / `h2ParametrosData.ts`;
   - **Guarda (c):** Valida que 100% dos registros de parâmetros exibidos possuem campos preenchidos de `referencia`, `tipo_estudo`, `ano` e URL válida;
   - **Guarda (d):** Testa dimensionalmente as unidades das equações ($MWh$, $kg$, $t$, $m^3$), verificando se os fatores de conversão (3600, 1000, etc.) produzem ordens de magnitude coerentes;
   - **Guarda (e):** Executa o cálculo do IPSE para todos os 10 municípios antes e depois de instanciar a simulação de H2, garantindo $\Delta \text{IPSE} = 0$.

### Critério de aceite verificável
- `bun test src/test/guardrailsH2.test.ts` executa e passa com 100% de sucesso.

### Comandos de verificação
```powershell
bun test src/test/guardrailsH2.test.ts
```

### Condição de PARADA
Se qualquer teste de guarda falhar, o executor NÃO DEVE enfraquecer o teste nem tolerar exceções; deve parar e reportar em `docs/DUVIDAS_H2.md`.
