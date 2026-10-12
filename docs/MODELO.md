# Especificação Metodológica do Modelo IPSE — Plataforma PITS
**Plataforma de Inteligência Territorial Socioenergética (PITS)**  
*Documento de formalização matemática e metodológica para atualização da Seção 3.1 do artigo científico.*

---

## 1. Visão Geral e Princípios do Modelo

O **Índice de Potencial Socioenergético (IPSE)** foi concebido para orientar o planejamento territorial integrado e a transição energética justa no semiárido brasileiro (Bioma Caatinga). O modelo oficial estabelece uma relação estrutural de razão entre a capacidade biofísica de oferta de biomassa energética e a demanda prioritária de superação de vulnerabilidades humanas e de infraestrutura básica:

$$\text{IPSE} = \frac{\text{PEL}}{\text{IVS}^*}$$

> [!IMPORTANT]
> **Decisão Metodológica Fundamental:**  
> Os subíndices setoriais de apoio — **IB** (Índice Biofísico), **IIE** (Índice de Infraestrutura Energética Rural) e **IGL** (Índice de Governança Local) — **não integram a fórmula aditiva do IPSE**. Eles atuam como **indicadores de diagnóstico de apoio setorial** no painel de inteligência territorial, evitando distorções de sinal e dupla contagem de grandezas físicas e socioeconômicas.

---

## 2. Formulação Matemática das Equações do Artigo

### 2.1. Potencial Energético Local da Biomassa (PEL) — Equação (1)

O Potencial Energético Local ($\text{PEL}$) quantifica a energia primária teoricamente recuperável a partir de formações vegetais elegíveis e sistemas manejados de biomassa no território municipal:

$$\text{PEL}_m = A_{i,m} \cdot Y_i \cdot \text{PCI}_i \cdot \eta_i \quad \text{[Eq. 1]}$$

Onde:
- $\text{PEL}_m$: Potencial Energético Local no município $m$, expresso em Gigajoules por ano ($\text{GJ}\cdot\text{ano}^{-1}$). Para conversão em Megawatts-hora por ano ($\text{MWh}\cdot\text{ano}^{-1}$), adota-se o fator $1\text{ MWh} = 3,6\text{ GJ}$.
- $A_{i,m}$: Área elegível de uso da terra e remanescentes nativos da Caatinga no município $m$ (em hectares, $\text{ha}$). **Fonte oficial auditada:** *MapBiomas Brasil — Coleção 11 (2025)*, classes de formações florestais, savânicas e campestres.
- $Y_i$: Produtividade média sustentável de biomassa aérea ($\text{t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$ em matéria seca). Parâmetro configurável com **faixa da literatura:** $8,0 \text{ a } 15,0\text{ t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$ (valor padrão adotado: $10,0\text{ t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$). *Fontes da literatura:* Sampaio & Silva (2005); Martins et al. (2013).
- $\text{PCI}_i$: Poder Calorífico Inferior da biomassa lenhosa da Caatinga ($\text{MJ}\cdot\text{kg}^{-1} = \text{GJ}\cdot\text{t}^{-1}$). Parâmetro configurável com **faixa da literatura:** $15,0 \text{ a } 18,0\text{ MJ}\cdot\text{kg}^{-1}$ (valor padrão adotado: $16,5\text{ MJ}\cdot\text{kg}^{-1}$).
- $\eta_i$: Eficiência global de conversão termoquímica/energética (fração adimensional). Parâmetro configurável com **faixa da literatura:** $0,20 \text{ a } 0,30$ (valor padrão adotado: $0,25$).

> [!NOTE]
> Os parâmetros $Y_i$, $\text{PCI}$ e $\eta$ são expressamente rotulados na plataforma como **"faixa da literatura"**, garantindo que sejam tratados como premissas paramétricas de entrada configuráveis pelo pesquisador, nunca como resultados empíricos derivados.

---

### 2.2. Taxas de Acesso e Carência Domiciliar — Equações (2) e (3)

A vulnerabilidade social é mensurada a partir das taxas de atendimento universal aos serviços públicos essenciais de infraestrutura domiciliar:

$$X_{k,m} \in [0, 1] \quad \text{[Eq. 2 — Taxa de Acesso ao Serviço } k\text{]}$$
$$C_{k,m} = 1 - X_{k,m} \in [0, 1] \quad \text{[Eq. 3 — Taxa de Carência do Serviço } k\text{]}$$

As quatro dimensões $k \in \{1, 2, 3, 4\}$ extraídas integralmente do **IBGE Censo Demográfico 2022** são:
1. $C_{1,m}$ (**Água**): Proporção de domicílios particulares permanentes ocupados sem ligação à rede geral de água canalizada (*Censo 2022, Tabela 6803*).
2. $C_{2,m}$ (**Esgoto**): Proporção de domicílios sem rede coletora de esgoto ou fossa séptica adequada (*Censo 2022, Tabela 6806*).
3. $C_{3,m}$ (**Lixo**): Proporção de domicílios sem coleta direta de resíduos sólidos por serviço de limpeza (*Censo 2022, Tabela 6892*).
4. $C_{4,m}$ (**Energia**): Proporção de domicílios sem acesso regular à rede de energia elétrica (*Censo 2022, Tabela 9848*).

---

### 2.3. Índice de Vulnerabilidade Social Municipal (IVS) — Equação (4)

O Índice de Vulnerabilidade Social próprio ($\text{IVS}$) é calculado pela combinação ponderada das carências domiciliares:

$$\text{IVS}_m = 1 - \sum_{k=1}^{K} w_k \cdot X_{k,m} = \sum_{k=1}^{K} w_k \cdot C_{k,m} \quad \text{[Eq. 4]}$$

Com a restrição de normalização estrita dos pesos:
$$\sum_{k=1}^{K} w_k = 1, \quad w_k \ge 0$$

- **Escala:** $\text{IVS} \in [0, 1]$.
- **DIREÇÃO DO ÍNDICE:** **IVS alto = MAIOR vulnerabilidade social**.
  - $\text{IVS} \to 0$: Ausência de carências domiciliares (universalização dos serviços essenciais — situação favorável).
  - $\text{IVS} \to 1$: Máxima privação socioeconômica e infraestrutural (situação crítica).
- **Pesos padrão do sistema:** $w = [0,30;\ 0,25;\ 0,25;\ 0,20]$ (água, esgoto, lixo, energia).
  - *Rótulo metodológico obrigatório:* **"Padrão ajustável, sem calibração empírica prévia. Sugere-se a aplicação futura do Processo de Hierarquia Analítica (AHP - Analytic Hierarchy Process) com painel de especialistas locais."**

---

### 2.4. IVS Ajustado com Penalidade de Seca e Piso Paramétrico (IVS*) — Equação (5)

Em territórios semiáridos sujeitos à variabilidade pluviométrica extrema, o estresse hídrico agrava a vulnerabilidade social. O modelo contempla a penalidade climática opcional $\delta_{seca}$ e um piso paramétrico de segurança assintótica:

$$\text{IVS}^*_m = \max\left(\text{IVS}_m \cdot (1 + \delta_{seca, m}),\ \epsilon_{floor}\right) \quad \text{[Eq. 5]}$$

Onde:
- $\delta_{seca, m} \ge 0$: Penalidade climática opcional configurável (padrão $0$, ajustável no simulador até $0,50$ ou calculada pelo déficit pluviométrico relativo do INMET).
- $\epsilon_{floor} = 0,05$: **Piso paramétrico documentado**. Evita instabilidade numérica e divisão por zero quando a vulnerabilidade social tende a zero ($\text{IVS} \to 0$), garantindo que o IPSE permaneça finito e matematicamente definido em qualquer cenário.

---

### 2.5. Índice de Potencial Socioenergético (IPSE Bruto) — Equação (6)

O IPSE em escala absoluta (bruto) reflete a densidade energética sustentável por unidade de vulnerabilidade social ajustada:

$$\text{IPSE}_m = \frac{\text{PEL}_m}{\text{IVS}^*_m} \quad \text{[Eq. 6]}$$

- **Unidade:** Gigajoules por ano ($\text{GJ}\cdot\text{ano}^{-1}$) ou $\text{MWh}\cdot\text{ano}^{-1}$.
- **Interpretação:** Municípios com elevada área de vegetação nativa preservada (alto $\text{PEL}$) combinada com infraestrutura domiciliar consolidada (baixo $\text{IVS}^*$) atingem os valores mais expressivos de IPSE. Por outro lado, municípios com severas carências sociais dividem seu potencial bioenergético por um denominador elevado, evidenciando a urgência de políticas de inclusão antes da destinação energética industrial da biomassa.

---

### 2.6. IPSE Normalizado Min-Max para Ranking Intermunicipal — Equação (7)

Para viabilizar a comparação padronizada no painel de controle e a hierarquização no ranking dos municípios cearenses, o IPSE é normalizado no intervalo $[0, 1]$ pelo método Min-Max:

$$\text{IPSE}_{norm, m} = \begin{cases}
\dfrac{\text{IPSE}_m - \min_{j} \text{IPSE}_j}{\max_{j} \text{IPSE}_j - \min_{j} \text{IPSE}_j}, & \text{se } \max_{j} \text{IPSE}_j \neq \min_{j} \text{IPSE}_j \\
1,0, & \text{se } \max_{j} \text{IPSE}_j = \min_{j} \text{IPSE}_j
\end{cases} \quad \text{[Eq. 7]}$$

- **Rótulo obrigatório em todas as telas:** **"IPSE Normalizado (0–1, Min-Max)"**.
- **Classificação por faixas:**
  - $\text{IPSE}_{norm} < 0,30$: **Baixo**
  - $0,30 \le \text{IPSE}_{norm} < 0,60$: **Moderado**
  - $\text{IPSE}_{norm} \ge 0,60$: **Alto**

---

## 3. Tratamento Estrito de Dados Ausentes (Regras 1, 2c e 5)

Em estrita obediência às diretrizes de conformidade ética da plataforma:
1. Caso qualquer variável necessária para o cálculo do $\text{PEL}$ ($A_{i}$) ou do $\text{IVS}$ ($C_{k}$) não esteja disponível em fontes oficiais públicas auditadas, o sistema **não substitui o valor por médias, zeros ou valores sintéticos**.
2. A variável ausente é exibida nas interfaces e relatórios como **"Dados indisponíveis"**.
3. O município correspondente é classificado no ranking como **"Não calculável" (NC)**, ficando posicionado ao final da tabela com status explícito.

---

## 4. Indicadores de Apoio Setoriais (Dashboard)

Os três subíndices de diagnóstico não se somam nem dividem no IPSE:

| Indicador | Sigla | Definição Metodológica | Intervalo | Fonte Oficial Auditada |
| :--- | :---: | :--- | :---: | :--- |
| **Biomassa / Vegetação Nativa** | **IB** | Proporção territorial coberta por formações nativas da Caatinga (florestal, savânica, campestre). | $0 \text{ a } 1$ | MapBiomas Coleção 11 (2025) |
| **Infraestrutura Energética Rural** | **IIE** | Índice composto de adoção de Sistemas Agroflorestais (SAFs), práticas conservacionistas e energia solar rural. | $0 \text{ a } 1$ | IBGE Censo Agropecuário 2017 (Tabelas 6881, 6848, 3346) |
| **Governança Local e Resíduos** | **IGL** | Índice de gestão socioambiental municipal derivado da cota-parte do IQM e do associativismo rural. | $0 \text{ a } 1$ | IPECE / SEMA-CE (IQM 2026) e IBGE Censo Agro 2017 |

---

## 5. Tabela Resumo de Variáveis, Unidades e Proveniência

| Símbolo | Variável | Unidade | Natureza | Fonte / Proveniência |
| :--- | :--- | :---: | :---: | :--- |
| $\text{IPSE}$ | Índice de Potencial Socioenergético Bruto | $\text{GJ}\cdot\text{ano}^{-1}$ | Resultado calculado | Modelo Oficial (Eq. 6) |
| $\text{IPSE}_{norm}$ | Índice de Potencial Socioenergético Normalizado | Adimensional | Normalização $[0, 1]$ | Min-Max intermunicipal (Eq. 7) |
| $\text{PEL}$ | Potencial Energético Local de Biomassa | $\text{GJ}\cdot\text{ano}^{-1}$ | Variável biofísica | MapBiomas Col. 11 + Lit. (Eq. 1) |
| $A_i$ | Área de remanescentes nativos da Caatinga | $\text{ha}$ | Dado real municipal | MapBiomas Brasil Col. 11 (2025) |
| $Y_i$ | Produtividade média sustentável de biomassa | $\text{t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$ | Faixa da literatura | $8 \text{–} 15$ (Sampaio & Silva, 2005) |
| $\text{PCI}$ | Poder Calorífico Inferior | $\text{MJ}\cdot\text{kg}^{-1}$ | Faixa da literatura | $15 \text{–} 18$ (Literatura regional) |
| $\eta$ | Eficiência de conversão energética | Adimensional | Faixa da literatura | $0,20 \text{–} 0,30$ (Conversão térmica) |
| $\text{IVS}$ | Índice de Vulnerabilidade Social Municipal | Adimensional $[0, 1]$ | Variável socioeconômica | IBGE Censo Demográfico 2022 (Eq. 4) |
| $C_1$ | Carência de rede geral de água | Fração $[0, 1]$ | Dado real municipal | IBGE Censo 2022 (Tabela 6803) |
| $C_2$ | Carência de esgotamento adequado | Fração $[0, 1]$ | Dado real municipal | IBGE Censo 2022 (Tabela 6806) |
| $C_3$ | Carência de coleta de lixo | Fração $[0, 1]$ | Dado real municipal | IBGE Censo 2022 (Tabela 6892) |
| $C_4$ | Carência de energia elétrica | Fração $[0, 1]$ | Dado real municipal | IBGE Censo 2022 (Tabela 9848) |
| $\delta_{seca}$ | Penalidade climática por seca | Adimensional $\ge 0$ | Parâmetro opcional | INMET BDMEP 2024 / Configurável |
| $\epsilon_{floor}$ | Piso paramétrico do IVS* | Adimensional | Parâmetro fixo | $0,05$ (Documentado na Eq. 5) |
| $w_k$ | Pesos das carências no IVS | Adimensional | Padrão ajustável | $30/25/25/20$ (AHP sugerido) |
