# Auditoria completa de veracidade — PITS (todas as subpáginas)

**Data:** 11/10/2026 · **Repositório:** `remix-of-pixel-perfect` (commit `316283a`) · **Método:** leitura integral do código de cada página/componente + histórico git + conferência automática com a API do IBGE (Censo 2022) + testes das APIs INMET e MapBiomas Alerta + verificação bibliográfica pontual. Script de verificação: · saída:

---

### Legenda dos vereditos

| Símbolo | Significado |
| :---: | :--- |
| ✅ | **Verificado** — dado real, de fonte identificável e conferida |
| ⚠️ | **Parcial** — fonte real existe, mas há problema de uso, rótulo, atualização ou contexto |
| ❌ | **Fictício / sem fonte** — valor inventado (placeholder do gerador de código), sem nenhuma referência |
| 🧮 | **Erro conceitual ou matemático** — fórmula, unidade, direção ou lógica incorreta |

> [!CAUTION]
> **Errata da minha análise anterior.** No relatório anterior eu afirmei coisas que esta auditoria mostrou serem falsas. Corrijo aqui:
> 
> 1. Eu disse que os dados de cobertura do solo eram "reais, extraídos do MapBiomas Coleção 9". **Isso é falso**: há evidência forte de que o arquivo foi fabricado (ver G2).
> 2. Eu disse que a meta de 70% de Sistemas Integrados estava "alinhada ao PlanBio/ODS". **Não há fonte para isso**; eu presumi.
> 3. Eu disse que Elinor Ostrom ganhou o Nobel "de 1990". O correto: livro *Governing the Commons* é de **1990**; o Nobel de Economia foi em **2009**.
> 4. Eu tratei como "modelagem FUNDECI" valores que, segundo o histórico git, foram criados pelo bot `gpt-engineer-app` no commit `ea9c8a6` ("Add mock data and IPSE logic"). Não há evidência de que venham de pesquisa.
> 
> O relatório anterior (`verificacao_fundamentacao_pits.md`) deve ser desconsiderado.

---

## Parte A — Problemas transversais (afetam várias páginas)

| # | Problema | Evidência | Veredito |
| :--- | :--- | :--- | :---: |
| **G1** | **Toda a base municipal é fictícia.** IB, IVS, IIE, IGL, IPSE, cobertura arbórea, estoque de biomassa, sistemas integrados, acordos, participação, PSA, biodigestores, lenha s/ manejo, regeneração e eficiência energética vêm de . | Arquivo literalmente chamado `mockData`; criado pelo bot gerador; nenhuma referência; todas as 15 variáveis sobem e descem juntas com o IPSE (padrão típico de dado sintético). | ❌ |
| **G2** | **Dados "MapBiomas Coleção 9" apresentados como reais, mas fabricados.** diz "Dados reais extraídos". | (a) `area_total_ha` = área do mock × 100 em **10 de 10 municípios** — e a área do mock nem bate com o IBGE (Canindé: 3.219 vs **3.032,39 km²**); (b) percentuais "redondos" (11,0 / 21,0 / 36,0...); (c) as mesmas 9 classes para todos — inclusive **Cascavel, litorâneo, sem mangue/restinga/dunas**; (d) Sobral soma **99%**; (e) o "desmatamento 22–23" contradiz a própria série: em Quixadá a série cai 0,5 p.p. = **1.010 ha**, mas o card diz **312 ha** (o mesmo erro, de 2× a 7×, aparece em todos). | ❌ |
| **G3** | **Código IBGE errado de Cascavel:** `2303956` no site; o correto é `2303501`. O código `2303956` é de Chorozinho. | API IBGE localidades. Os alertas de desmatamento de "Cascavel" consultariam outro município. | 🧮 |
| **G4** | **População e área do mock divergem do Censo 2022, e Relatórios/PDF/CSV usam o mock (o Dashboard usa IBGE ao vivo)** — números diferentes para o mesmo município em telas diferentes. | Ex.: Iguatu pop. 102.614 (site) vs **98.064**; Sobral 210.711 vs **203.023**; Senador Pompeu 27.054 vs **24.266**; Sobral área 2.123 vs **2.068,47 km²**. | 🧮 |
| **G5** | **Duas medidas diferentes de vegetação para o mesmo município:** `cobertura_arborea_pct` (mock, ex. Quixadá 34,2%) e `vegetacao_nativa_pct` (ex. 38,4%). Cards mostram uma; alertas, recomendações, série do Módulo IV e PDF usam a outra. Além disso, "cobertura arbórea" ≠ "vegetação nativa" (esta inclui formação campestre). | Código de Dashboard, Módulo I, Módulo IV, `getAlerts`, `generatePDF`. | 🧮 |
| **G6** | **Direção do IVS invertida.** O nome é "Vulnerabilidade Socioeconômica" (quanto maior, pior), mas o sistema o trata como "quanto maior, melhor": soma positivamente no IPSE, barra fica verde quando alto, e o alerta diz "vulnerabilidade elevada" quando IVS < 0,5. No IVS do IPEA, valor alto = mais vulnerável. | Código de cálculo do IPSE, alertas e visualização. | 🧮 |
| **G7** | **Seções "Plano Nacional de Bioeconomia" com eixos inventados.** Os Módulos I–IV citam "Eixo 1" a "Eixo 8" do "PlanBio". O plano oficial é o PNDBio (lançado em abr/2026), estruturado em 3 eixos (Sociobioeconomia e ativos ambientais; Bioindustrialização competitiva; Produção sustentável de biomassa) e 8 missões. Nenhum dos 8 "eixos" do site corresponde. O link aponta para a notícia da consulta pública, não para o plano. | Busca em fontes oficiais/imprensa (MMA, ISA, ClimaInfo). Recomendo confirmar o texto final no gov.br antes de citar. | ❌ |
| **G8** | **"0 alertas" exibido quando a API falha.** O proxy do MapBiomas Alerta precisa de servidor + credenciais (hoje responde HTTP 500). O Dashboard e o mapa usam `alertas` `[]`, então mostram "0 alertas" — afirmação falsa (não houve consulta). | Código de fallback de requisições. | ⚠️ |
| **G9** | **Nome da plataforma inconsistente:** "Plataforma de Inteligência Territorial Socioenergética" (menu, Sobre) vs "Plataforma Integrada de Territórios Sustentáveis" (PDF e manifesto PWA). | `AppSidebar`, `SobreModal`, `generatePDF`, `vite.config.ts`. | ⚠️ |
| **G10** | **Selos "✓ MapBiomas" e "Fonte: MapBiomas Col. 9"** aparecem apenas porque existe uma entrada no arquivo estático — sugerem dado oficial ao vivo. | Dashboard, Módulo I. | ⚠️ |

---

## Parte B — Página por página

### 1. Dashboard

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **D1** | Município, UF, mesorregião, área (km²), população | API IBGE ao vivo (localidades, malhas, tabela 6579 de estimativas) | ✅ / ⚠️ | Correto quando a API responde. Se falhar, cai silenciosamente no mock (G4) sem avisar que o número não é do IBGE. |
| **D2** | Velocímetro IPSE (ex. 0,54 "Moderado") | `m.IPSE` do mock | ❌ 🧮 | Valor sem fonte (G1). O valor armazenado difere da própria fórmula em até 0,006 (arredondado à mão). Faixas Baixo <0,3 / Moderado <0,6 / Alto são arbitrárias, sem referência. Herdado o erro do IVS (G6). |
| **D3** | 4 cards IB, IVS, IIE, IGL | mock | ❌ 🧮 | Sem fonte e sem método de cálculo documentado; IVS com direção invertida (G6). |
| **D4** | Gráfico "Evolução do IPSE (2020–2024)" | Calculado: `IPSE atual × (1 - (4-i)×0,04)` | ❌ | **Série histórica inventada:** todo município aparece crescendo exatamente ~4%/ano até o valor atual. Não é histórico de nada. |
| **D5** | "Alertas e Recomendações" | Regras em `getAlerts` sobre o mock | ⚠️ 🧮 | A lógica de regras é legítima, mas usa valores fictícios, a meta de 40% sem fonte (ver M1-5) e a regra do IVS invertida. |
| **D6** | Mapa: fundo OpenStreetMap | OSM | ✅ | — |
| **D7** | Mapa: polígonos "Cobertura vegetal nativa", "Conservação prioritária", "Produção sustentável", "Restauração biocultural", "Zonas de recarga hídrica" | pentágonos desenhados com deslocamentos fixos (±0,05° a 0,30°) a partir do centro do município | ❌ | **Grave. São formas geométricas idênticas para todos os municípios**, desenhadas sobre um mapa real — parecem zoneamento oficial, mas não representam nenhum território. |
| **D8** | Mapa: marcadores de alertas de desmatamento | MapBiomas Alerta (via proxy) | ⚠️ | Real quando o proxy funciona; hoje falha e o rótulo mostra "(0)" (G8). Cascavel consulta o município errado (G3). |
| **D9** | Card "Vegetação Nativa" | `mapbiomas.ts` (ou mock) | ❌ | Ver G2 e G5. |
| **D10** | Cards "Biomassa t/ha", "Biodigestores", "PSA Distribuído" | mock | ❌ | Sem fonte. |
| **D11** | Card "🪵 Desmatamento: N alertas" | MapBiomas Alerta | ⚠️ 🧮 | Mostra "0 alertas" mesmo quando a consulta falhou (G8). |

---

### 2. Módulo I — Biofísico-Ecológico

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **M1-1** | "Integridade Florestal (IFL)" | É o próprio `m.IB` (Biomassa Disponível) com outro nome | ❌ 🧮 | Troca de rótulo: o mesmo número é "Biomassa Disponível" no Dashboard e "Integridade Florestal" aqui. "IFL/FLII" é um indicador científico específico (*Forest Landscape Integrity Index*, Grantham et al., 2020, escala 0–10) — não tem relação com esse valor. |
| **M1-2** | "Estoque de Biomassa" (t/ha) | mock | ❌ | Sem fonte; não diz se é biomassa aérea, total, seca, nem o método. |
| **M1-3** | "Cobertura Vegetal Nativa" (%) | `mapbiomas.ts` | ❌ | G2. |
| **M1-4** | "Regeneração" (%/ano) | mock | ❌ | Sem fonte e sem definição (regeneração de área? de biomassa?). |
| **M1-5** | "Meta de Cobertura Arbórea (≥ 40%)" | constante `COBERTURA_META_PCT = 40` | ❌ 🧮 | Nenhuma fonte encontrada para 40%. A referência legal existente é a **Reserva Legal de 20% para Caatinga** fora da Amazônia Legal (Lei 12.651/2012, art. 12, II). Além disso, compara "vegetação nativa" com uma meta de "cobertura arbórea" (G5). |
| **M1-6** | Bloco "Cobertura do Solo — MapBiomas Coleção 9 (2023)": pizza, tabela de classes, área total, "Desmatamento 22–23", série 2018–2023 | `mapbiomas.ts` | ❌ | G2 — todas as inconsistências listadas lá aparecem aqui. Obs.: na série estática a vegetação cai todo ano, enquanto o Módulo IV mostra a cobertura subindo (contradição entre páginas). |
| **M1-7** | "Alertas de Desmatamento — MapBiomas Alerta" | API GraphQL real via proxy | ⚠️ | Fonte legítima. Problemas: depende do proxy (hoje erro 500); código errado de Cascavel (G3); severidade "Alta ≥ 50 ha / Média ≥ 10 ha" é arbitrária, sem referência. |
| **M1-8** | Gráfico "Biomassa por Faixa de Cobertura Arbórea" (5,2 → 26,5 t/ha) | constante no código | ❌ | Sem fonte; igual para todos os municípios. |
| **M1-9** | Seção "Plano Nacional de Bioeconomia" (Eixos 1 e 2) | texto fixo | ❌ | G7. |
| **M1-10** | Tabela "Espécies Nativas Monitoradas" | constante `especiesNativas` | ⚠️ ❌ | **Nomes:** Sabiá (*Mimosa caesalpiniifolia*) ✅, Angico (*Anadenanthera colubrina*) ✅, Jurema-preta (*Mimosa tenuiflora*) ✅; Catingueira como *Poincianella pyramidalis* ⚠️ — nome aceito atual é *Cenostigma pyramidale*; Juazeiro como *Ziziphus joazeiro* ⚠️ — nome aceito atual é *Sarcomphalus joazeiro* (Flora e Funga do Brasil). **"Biomassa (t/ha)" por espécie e "Status" (Manejada/Monitorada/Conservada) ❌ inventados**, iguais para todos os municípios, e "biomassa por hectare de uma espécie" não está definido. "Monitoradas" não corresponde a nenhum monitoramento real. |

---

### 3. Módulo II — Integração Produtiva

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **M2-1** | "Sistemas Integrados 22,4% — Meta: 70%" | mock + texto fixo | ❌ | Valor sem fonte; não define o denominador (% de qual área?). **Meta de 70% sem nenhuma fonte.** |
| **M2-2** | "Circularidade de Biomassa 30%" | `eficiência × 0,8` | ❌ 🧮 | **Fórmula inventada pelo gerador de código:** mistura uma grandeza termodinâmica (eficiência de conversão) com uma de balanço de massa (circularidade). O 0,8 não tem origem. |
| **M2-3** | "Demanda Lenha s/ Manejo 42,3k m³/ano" | mock | ❌ | O conceito é válido e relevante, mas o número é inventado. Fontes reais possíveis: IBGE/PEVS (lenha extraída, m³) e SINAFLOR/DOF (volumes autorizados); a diferença seria uma *estimativa*, e precisa ser declarada assim. |
| **M2-4** | "Eficiência Energética 38% — Conversão" | mock | ❌ | Sem fonte e sem definição (eficiência de quê? fogões? fornos? toda a matriz?). |
| **M2-5** | "Fluxo Circular de Biomassa" (4 fluxos qualitativos) | texto fixo | ✅ | Conceitualmente correto (resíduos → compostagem; dejetos → biodigestor; Caatinga manejada → lenha/carvão; forragem arbórea → alimentação na seca). |
| **M2-6** | Gráfico "SAFs 29,5 vs Tradicional 8,2 t/ha" e "SAFs superam em 260%" | constante | ⚠️ | **O "260%" tem base:** experimento em Taperoá, Cariri paraibano (2006–2009, publicado na SciELO), sobre **biomassa total** (folhas, galhos e lenha das árvores). A conta bate: `(29,5 - 8,2)/8,2 = 259,8%`. **Mas:** a fonte não é citada, os valores absolutos 29,5/8,2 precisam ser conferidos no artigo, e omite-se que, no mesmo estudo, o sistema tradicional produziu mais biomassa de cultivos anuais (milho e feijão). Além disso, as árvores do estudo (gliricídia, maniçoba) não são as espécies listadas na página. |
| **M2-7** | Seção PlanBio (Eixos 3 e 4) | texto fixo | ❌ | G7. |
| **M2-8** | "Sistemas Produtivos" com % de adoção (18%, 12%, 8%, 5%) | constante | ❌ 🧮 | Iguais para todos os municípios e incoerentes com o card M2-1 (18% + 12% de SAF+ILPF = 30% ≠ 22,4%). |
| **M2-9** | SAFs "com espécies florestais nativas da Caatinga: Sabiá, Gliricídia, Leucena, Mandioca" | texto fixo | 🧮 | **Gliricídia e Leucena são exóticas** (a leucena é considerada invasora); mandioca é cultivo agrícola. Só o sabiá é nativo. |
| **M2-10** | ILPF com "Capim-buffel, Palma, Sabiá" | texto fixo | ⚠️ | Combinação usada na prática, mas o capim-buffel é exótico com comportamento invasor — merece ressalva num site sobre conservação. |
| **M2-11** | "Redução de 60% na demanda de lenha sem manejo" (Circuitos Fechados) | texto fixo | ❌ | Sem fonte. |

---

### 4. Módulo III — Governança Participativa

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **M3-1** | "Acordos de Manejo: N ativos" | mock | ❌ | Sem fonte. |
| **M3-2** | "Participação Comunitária %" | mock | ❌ | Sem fonte; denominador não definido (% de famílias? de comunidades?). |
| **M3-3** | "Recursos PSA R$ ...k anual" | mock | ❌ | Sem fonte. |
| **M3-4** | "Plano Territorial: Em execução" | texto fixo | ❌ | Mesmo status para todos os municípios. |
| **M3-5** | Tabela "Acordos Locais de Manejo" (Assentamento Aroeira, Quilombo Serra Preta, Vila São José, Distrito Cedro, Sítio Boa Vista) | constante | ❌ 🧮 | **Comunidades fictícias, as mesmas em todos os municípios.** Contradiz o card (Quixadá: card diz 7 ativos; tabela lista 5, sendo 4 ativos). Usar nomes realistas (ex.: "Quilombo") para entidades inexistentes é especialmente arriscado. |
| **M3-6** | Pizza "PSA — Distribuição por Serviço" (42/25/20/13%) | constante | ❌ | Igual para todos os municípios, sem fonte. |
| **M3-7** | Lista dos 8 "Princípios de Ostrom" | constante | ✅ | A lista corresponde aos 8 princípios de desenho de Ostrom (1990), *Governing the Commons*. |
| **M3-8** | Status de cada princípio (cumprido/parcial/não) | constante | ❌ | Nenhuma avaliação foi feita; mesmo resultado em todos os municípios. |
| **M3-9** | Seção PlanBio (Eixos 5 e 6) | texto fixo | ❌ | G7. O link de PSA (MMA) é legítimo; a base legal é a Lei 14.119/2021 (PNPSA) — pode ser citada. |

---

### 5. Módulo IV — Monitoramento

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **M4-1** | Cards de fontes: IBGE 42 variáveis, MapBiomas 28, ANA 15, INMET 22, datas de atualização, selo ✓ | constante | ❌ | **Números e datas inventados. A ANA não está integrada** (só existe um arquivo de teste). O MapBiomas cobertura não é consultado (é o arquivo estático). Não existem 42 variáveis do IBGE — são 3 (população, área, centroide). |
| **M4-2** | Série "Cobertura (%)", "Biomassa (t/ha)", "IPSE" 2019–2024 | `valor_atual × (1 - (5-i)×0,03)` — o próprio comentário do código diz "simulação visual de tendência" | ❌ 🧮 | **Inventado: tudo cresce 3%/ano até o valor atual.** Contradiz o Módulo I (onde a vegetação cai de 2019 a 2023). Ainda mistura %, t/ha e índice 0–1 no mesmo eixo (o IPSE vira uma linha encostada no zero). |
| **M4-3** | Barras "Precipitação INMET (mm)" | API INMET; se falhar: `680 + 15×i` | ❌ 🧮 | O endpoint usado (`/estacao/diaria/...`) responde **HTTP 404 → o site sempre mostra os valores inventados** (680, 695, 710...), mas a legenda continua dizendo "Precipitação INMET". Mesmo se funcionasse: soma dias sem checar falhas de registro (subestima) e inclui o ano corrente incompleto. A busca da estação mais próxima (`/estacoes/T`, Haversine) funciona ✅. |
| **M4-4** | Seção PlanBio (Eixos 7 e 8) | texto fixo | ❌ | G7. |
| **M4-5** | "Monitoramento Participativo — Últimos Registros" | constante | ❌ | 3 registros fictícios (dez/2024), iguais para todos os municípios. |

---

### 6. IPSE

| # | O que aparece | De onde vem | Veredito | O que significa / problema |
| :--- | :--- | :--- | :---: | :--- |
| **I-1** | Fórmula IPSE = $w_1 \cdot \text{IB} + w_2 \cdot \text{IVS} + w_3 \cdot \text{IIE} + w_4 \cdot \text{IGL}$ | código | ✅ / 🧮 | Estrutura de índice composto por média ponderada é padrão (OCDE/JRC, *Handbook on Constructing Composite Indicators*, 2008). **Mas:** falta documentar como cada subíndice é normalizado (0–1); IVS entra com sinal errado (G6). |
| **I-2** | Pesos padrão 30/25/25/20 | código | ⚠️ | Sem justificativa (nem consulta a especialistas, nem análise estatística). |
| **I-3** | Sliders de pesos (soma = 100%) | `adjustWeight` | ✅ | Conferi a matemática: com máximo de 0,6 por peso, a redistribuição proporcional mantém a soma = 1 sem gerar pesos negativos. |
| **I-4** | Radar e Ranking dos 10 municípios | mock | ❌ | Funcionamento correto, mas sobre valores fictícios (G1). |

---

### 7. Simulador de Cenários

**Modelo atual:** $\text{IPSE}(\text{ano } i) = \text{IPSE}_{\text{atual}} + \text{impulso} \times (i / H) + 0,005 \times i$

| # | O que aparece | Veredito | Problema |
| :--- | :--- | :---: | :--- |
| **S-1** | Coeficientes de impacto (SAF 0,08; biodigestor 0,05; acordos 0,06; reflorestamento 0,07; lenha 0,04) | ❌ | Sem fonte (). |
| **S-2** | Horizonte 5/10/20 anos | 🧮 | **O impulso total é atingido no último ano, qualquer que seja o horizonte:** as mesmas intervenções dão o mesmo efeito em 5 ou em 20 anos. Não faz sentido físico. |
| **S-3** | "Cenário Base" sobe 0,005/ano | ❌ | Supõe melhora automática sem intervenção, sem justificativa. |
| **S-4** | "Meta HAMILTON" = 0,70 + 0,002/ano | ❌ | Sem fonte; e uma meta que se move sozinha. |
| **S-5** | "Área reflorestada (ha/ano)" de 0 a 200 | 🧮 | A fórmula divide por 100, como se fosse %. 200 ha viram "200%". E o efeito é igual para municípios de 25 mil ha (Juazeiro) e 400 mil ha (Tauá). O mesmo vale para "Biodigestores" (número absoluto ÷ 50). |
| **S-6** | Variável PSA (R$ 300.000) | 🧮 | Existe no estado, mas não tem controle na tela e não afeta nada. |
| **S-7** | Ano inicial fixo 2024 | ⚠️ | Estamos em 2026. |
| **S-8** | Cards "IB/IIE/IGL Estimado" | 🧮 | Usam coeficientes (0,15; 0,10; 0,12) diferentes dos da projeção do IPSE; podem passar de 1,0; ignoram o IVS. |

---

### 8. Relatórios

| # | O que aparece | Veredito | Problema |
| :--- | :--- | :---: | :--- |
| **R-1** | "Diagnóstico Territorial" (área, população) | 🧮 | Usa o mock e não o IBGE → contradiz o Dashboard (G4). Ex.: Canindé 3.219 km² no relatório vs 3.032 km² no Dashboard. |
| **R-2** | Indicadores e classificação do IPSE | ❌ | Mock (G1). |
| **R-3** | Recomendações | ⚠️ | A lógica de regras é válida, mas se baseia em valores fictícios, na meta de 40% sem fonte e na regra invertida do IVS; "Expandir biodigestores" aparece sempre. |
| **R-4** | "Relatório semestral" | ⚠️ | É gerado na hora; o "S1/S2" sai só da data atual. |
| **R-5** | PDF e CSV | ⚠️ | Exportam o mock como se fossem dados oficiais; o rodapé usa outro nome da plataforma (G9). |
| **R-6** | Histórico (`localStorage`) | ✅ | Funcional. |

---

### 9. Sobre a Plataforma

| # | O que aparece | Veredito | Observação |
| :--- | :--- | :---: | :--- |
| **A-1** | Descrição do framework HAMILTON e dos 4 módulos | ⚠️ | É uma proposta do projeto; não há como verificá-la externamente. Deve citar o documento/artigo de origem, se houver. |
| **A-2** | "Ostrom (1990)" | ✅ | Correto. |
| **A-3** | Projeto "FUNDECI/2025.0016" | ⚠️ | O FUNDECI (Banco do Nordeste) existe; o número do projeto precisa ser confirmado pela equipe. |
| **A-4** | Fórmula do IPSE e "pesos personalizáveis" | ✅ / 🧮 | Ver I-1 e G6. |

---

## Parte C — Placar resumido

| Página | ✅ | ⚠️ | ❌ | 🧮 |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | 2 | 3 | 7 | 4 |
| **Módulo I** | 0 | 2 | 8 | 2 |
| **Módulo II** | 1 | 2 | 7 | 3 |
| **Módulo III** | 1 | 0 | 7 | 1 |
| **Módulo IV** | 0 | 0 | 5 | 2 |
| **IPSE** | 2 | 1 | 1 | 1 |
| **Simulador** | 0 | 1 | 3 | 4 |
| **Relatórios** | 1 | 3 | 1 | 1 |

> [!IMPORTANT]
> **Conclusão:** O que é real hoje: (1) os dados do IBGE ao vivo no cabeçalho do Dashboard; (2) a consulta ao MapBiomas Alerta (quando o proxy estiver configurado); (3) a busca da estação INMET mais próxima; (4) os conceitos qualitativos (fluxos circulares, princípios de Ostrom, estrutura de índice composto). **Todo o resto dos números é fictício**, e parte deles é apresentada como se fosse oficial (MapBiomas Col. 9, "Precipitação INMET", polígonos no mapa, eixos do PlanBio).

---

## Parte D — Proposta de correção (para combinarmos antes de executar)

### Fase 1 — Honestidade imediata (sem depender de dados novos)

- **Corrigir erros objetivos:** código IBGE de Cascavel, direção do IVS, "0 alertas" em caso de erro, legenda da precipitação, nome único da plataforma, unificar a métrica de vegetação.
- **Remover ou rotular claramente como "Ilustrativo — não é dado real":** polígonos do mapa, séries históricas inventadas, tabelas de acordos/registros/PSA/Ostrom, cards de fontes do Módulo IV, eixos do PlanBio.
- **Substituir "Circularidade = eficiência × 0,8"** por indicador definido ou retirar.
- **Corrigir nomes científicos** e o texto "espécies nativas" dos SAFs; citar o artigo do Cariri paraibano.

### Fase 2 — Trocar dados fictícios por dados públicos reais

- **População/área:** IBGE Censo 2022 (em todas as telas, inclusive PDF/CSV).
- **Cobertura do solo e série:** estatísticas municipais oficiais do MapBiomas.
- **Precipitação:** endpoint correto do INMET (ou BDMEP), com controle de dias faltantes.
- **Lenha:** IBGE/PEVS; sistemas agroflorestais: Censo Agropecuário 2017; vulnerabilidade: IVS/IPEA; seção de bioeconomia: texto oficial do PNDBio.

### Fase 3 — Metodologia defensável

- **Nota metodológica do IPSE** (normalização, direção de cada subíndice, justificativa dos pesos).
- **Refazer o Simulador** com coeficientes documentados e unidades coerentes, ou rotulá-lo explicitamente como exercício ilustrativo.
