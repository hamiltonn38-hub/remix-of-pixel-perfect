# Especificação Metodológica do Modelo de Hidrogênio ($H_2$) a partir de Biomassa — Plataforma PITS
**Plataforma de Inteligência Territorial Socioenergética (PITS)**  
*Documento de formalização termodinâmica, limites estequiométricos e fundamentação físico-química para expansão da Seção 3.1 do artigo científico.*

---

## 1. Visão Geral e Princípios Metodológicos

A ferramenta de simulação do potencial de conversão de biomassa em hidrogênio ($H_2$) na Plataforma PITS foi concebida para projetar a capacidade teórica e tecnológica de descarbonização do Semiárido brasileiro, sem comprometer os fundamentos do modelo territorial original.

### 1.1. Princípios Invioláveis de Modelagem
1. **Neutralidade em Relação ao IPSE ($\Delta\text{IPSE} = 0$):** O potencial de $H_2$ é um indicador analítico satélite. Ele **não substitui, não integra e não altera** o cálculo do Índice de Potencial Socioenergético ($\text{IPSE} = \text{PEL} / \text{IVS}^*$) oficial da plataforma.
2. **Proibição Absoluta de Dados Fictícios:** Nenhum rendimento, constante ou área é estimado por intuição ou preenchido com dados sintéticos (*mocks*). Todas as entradas derivam de satélite (*MapBiomas Coleção 11*), dados censitários oficiais (*IBGE*) ou artigos com revisão por pares catalogados em [`data/literature/h2_parametros.csv`](file:///c:/Users/Luana/.gemini/antigravity/scratch/remix-of-pixel-perfect/data/literature/h2_parametros.csv).
3. **Barreira Estequiométrica Elementar:** Processos de conversão respeitam a conservação de massa e a primeira lei da termodinâmica. Nenhum rendimento tecnológico pode ultrapassar o teto molecular teórico da biomassa.
4. **Footprint Hídrico Explícito:** Devido à escassez hídrica do Semiárido, o modelo quantifica a demanda estequiométrica mínima de água consumida na reação de deslocamento gás-água (*Water-Gas Shift* - WGS).
5. **Apresentação Obrigatória em Faixas de Incerteza:** Resultados são sempre exibidos em regimes **Conservador**, **Típico** e **Otimista**.
6. **Rótulo Fixo de Transparência:**  
   > *"Potencial teórico-tecnológico. Não é projeto de engenharia nem previsão de produção comercial."*

---

## 2. Dedução Matemática dos Limites Estequiométricos

### 2.1. Limite Estequiométrico da Rota A (Biomassa Lignocelulósica)
A biomassa vegetal seca é caracterizada pela sua análise elementar mássica base seca ($C$, $H$, $O$). Normalizando em relação ao Carbono, obtém-se a fórmula molecular empírica $\text{CH}_m\text{O}_n$, onde:

$$m = \frac{H / M_H}{C / M_C} = \frac{H / 1,008}{C / 12,011}$$

$$n = \frac{O / M_O}{C / M_C} = \frac{O / 16,000}{C / 12,011}$$

Em um processo de gaseificação com vapor d'água onde ocorre a reação global com deslocamento total de monóxido de carbono (*Water-Gas Shift* total: $\text{CO} + \text{H}_2\text{O} \rightarrow \text{CO}_2 + \text{H}_2$):

$$\text{CH}_m\text{O}_n + (2 - n)\text{H}_2\text{O} \longrightarrow \text{CO}_2 + \left(2 - n + \frac{m}{2}\right)\text{H}_2$$

O rendimento molar máximo teórico de hidrogênio por átomo de carbono é:
$$Y_{H2, mol}^{max} = 2 - n + \frac{m}{2} \quad [\text{mol } H_2\text{ / mol C}]$$

A massa molar da unidade empírica da biomassa isenta de cinzas é:
$$M_{biomassa} = M_C + m \cdot M_H + n \cdot M_O = 12,011 + 1,008 \cdot m + 16,000 \cdot n \quad [\text{g/mol C}]$$

Portanto, o limite estequiométrico mássico máximo teórico ($y_{H2, mass}^{max}$) é dado por:

$$y_{H2, mass}^{max} = \frac{Y_{H2, mol}^{max} \cdot M_{H2}}{M_{biomassa}} = \frac{\left(2 - n + \frac{m}{2}\right) \cdot 2,016}{12,011 + 1,008 \cdot m + 16,000 \cdot n} \quad \left[\frac{\text{kg } H_2}{\text{kg biomassa seca}}\right]$$

*Para espécies arbóreas nativas da Caatinga ($C \approx 47,0\%$, $H \approx 5,8\%$, $O \approx 43,0\%$), temos $m \approx 1,47$ e $n \approx 0,687$, resultando em um teto físico entre **$0,145$ e $0,155\text{ kg } H_2\text{/kg biomassa seca}$**.*

### 2.2. Limite Estequiométrico da Rota B (Metano Biogênico)
A reforma a vapor de metano com reação de WGS completa obedece à equação global:

$$\text{CH}_4 + 2\text{H}_2\text{O} \longrightarrow \text{CO}_2 + 4\text{H}_2$$

O rendimento máximo teórico molar é estritamente **$4,0\text{ mol } H_2\text{ / mol } CH_4$**.  
Em base mássica:
$$y_{H2, CH4}^{max} = 4,0 \times \frac{2,016}{16,043} \approx 0,5027 \quad \left[\frac{\text{kg } H_2}{\text{kg } CH_4}\right]$$

---

## 3. Equações Operacionais do Modelo

### 3.1. Rota A — Gaseificação Termoquímica de Biomassa Sólida
A biomassa derivada de manejo florestal sustentável (PMFS) e podas de SAFs é convertida conforme:

$$\text{PEL}_{H2, A} = \frac{A_i \cdot Y_i \cdot f_i \cdot 1000 \cdot (1 - u_i) \cdot y_{H2, i} \cdot \text{PCI}_{H2}}{3600} \quad [\text{MWh PCI/ano}]$$

$$m_{H2, A} = A_i \cdot Y_i \cdot f_i \cdot 1000 \cdot (1 - u_i) \cdot y_{H2, i} \quad [\text{kg } H_2\text{/ano}]$$

Onde:
- $A_i$: Área elegível de vegetação nativa do município ($\text{ha}$), via *MapBiomas Coleção 11*;
- $Y_i$: Produtividade média anual de biomassa seca ($\text{t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$), adotando $10,0\text{ t/ha/ano}$ como referência da Caatinga (faixa 8 a 15);
- $f_i$: Fração sustentável colhível ($0,20$ no corte seletivo em talhões rotativos de 15 a 20 anos);
- $u_i$: Teor de umidade na colheita ($0$ se $Y_i$ já for expressa em matéria seca);
- $y_{H2, i}$: Rendimento tecnológico de hidrogênio ($\text{kg } H_2\text{/kg biomassa seca}$);
- $\text{PCI}_{H2}$: Poder Calorífico Inferior do $H_2$ ($120,0\text{ MJ/kg} = 33,33\text{ kWh/kg}$);
- $3600$: Fator de conversão de $\text{MJ}$ para $\text{MWh}$.

### 3.2. Rota B — Reforma a Vapor de Biogás (BSR) + PSA
Nos municípios onde há registro auditado de dejetos ou biodigestores rurais (quando não houver dados abertos, o indicador é registrado como `null` — "Dados indisponíveis", conforme Regra 2c):

$$m_{CH4} = V_{CH4} \cdot \rho_{CH4} \quad [\text{kg } CH_4\text{/ano}]$$

$$m_{H2, bruto} = m_{CH4} \cdot y_{mol} \cdot \frac{M_{H2}}{M_{CH4}} \quad [\text{kg } H_2\text{/ano}]$$

$$m_{H2, liquido} = m_{H2, bruto} \cdot (1 - \text{loss}_{PSA}) \quad [\text{kg } H_2\text{/ano}]$$

$$\text{PEL}_{H2, B} = \frac{m_{H2, liquido} \cdot \text{PCI}_{H2}}{3600} \quad [\text{MWh PCI/ano}]$$

Onde:
- $V_{CH4}$: Volume anual de metano biogênico ($\text{Nm}^3\text{/ano}$);
- $\rho_{CH4}$: $0,657\text{ kg/Nm}^3$ a $0^\circ\text{C}, 1\text{ atm}$ (*NIST Chemistry WebBook / ISO 6976*);
- $y_{mol}$: Rendimento reacional ($2,40$ a $2,95\text{ mol } H_2\text{/mol } CH_4$);
- $\text{loss}_{PSA}$: Perda mássica no sistema de purificação por adsorção com modulação de pressão ($10\%$ a $25\%$, recuperação de $75\%$ a $90\%$ para pureza $\ge 99,99\%$).

---

## 4. Footprint Hídrico e Eficiência de Conversão Térmica

### 4.1. Demanda Estequiométrica Mínima de Água de Reação
Pela estequiometria elementar da reação de *Water-Gas Shift* ($\text{H}_2\text{O} \rightarrow \text{H}_2$):

$$\text{Razão Mássica } \frac{M_{H2O}}{M_{H2}} = \frac{18,015}{2,016} \approx 8,936 \approx 9,0\text{ kg } H_2O\text{ por kg de } H_2$$

$$\text{Demanda Mínima de Água} = \frac{m_{H2} \cdot 8,936}{1000} \quad [\text{m}^3\text{ de água de reação/ano}]$$

*Nota: Esta métrica representa exclusivamente a água consumida quimicamente na reação, não incluindo perdas de resfriamento ou purificação.*

### 4.2. Eficiência Térmica Global de Conversão ($\eta_{th}$)
$$\eta_{th, A} = \frac{m_{H2} \cdot \text{PCI}_{H2}}{m_{biomassa} \cdot \text{PCI}_{biomassa}} \times 100\% \qquad \eta_{th, B} = \frac{m_{H2, liquido} \cdot \text{PCI}_{H2}}{m_{CH4} \cdot \text{PCI}_{CH4}} \times 100\%$$

---

## 5. Tabela Consolidada de Parâmetros e Espécies da Caatinga

| Espécie / Tecnologia | C (%) | H (%) | O (%) | PCI (MJ/kg) | $y_{H2}^{max}$ (kg/kg) | TRL | Referência Indexada |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Sabiá** (*Mimosa caesalpiniifolia*) | 47,0 | 5,8 | 43,0 | 16,8 | 0,1687 | — | Cavalcante et al. (2021); Paula et al. (2011) |
| **Jurema-preta** (*Mimosa tenuiflora*) | 47,0 | 5,5 | 41,5 | 17,2 | 0,1663 | — | Silva et al. (2017); Oliveira et al. (2020) |
| **Angico** (*Anadenanthera colubrina*) | 47,6 | 5,6 | 42,0 | 16,9 | 0,1663 | — | Santos et al. (2013); Ferreira et al. (2018) |
| **Catingueira** (*Cenostigma pyramidale*) | 47,2 | 5,8 | 43,2 | 16,7 | 0,1681 | — | Silva et al. (2018); Quirino et al. (2005) |
| **Juazeiro** (*Sarcomphalus joazeiro*) | 47,3 | 5,7 | 43,5 | 16,4 | 0,1669 | — | Soares et al. (2020); Quirino et al. (2005) |
| **Palma forrageira** (*Opuntia ficus-indica*) | 38,2 | 5,1 | 48,5 | 14,5 | 0,1542 | — | Cross et al. (2021); Ramos et al. (2022) |
| **Gaseificação a vapor (DFB)** | — | — | — | — | — | 7–8 | Maggio et al. (2024); IEA Task 33 |
| **Gaseificação ar-vapor** | — | — | — | — | — | 6–7 | Campoy et al. (2009) Fuel Proc Tech |
| **Gaseificação $O_2$-vapor** | — | — | — | — | — | 6–7 | Maurer et al. (2016) Biomass Bioen |
| **Pirólise rápida + Reforma** | — | — | — | — | — | 4–5 | Trane et al. (2012) Int J Hydrogen |
| **Reforma de biogás (BSR)** | — | — | — | — | — | 8–9 | Alves et al. (2013); Vita et al. (2018) |

---

## 6. Justificativa de Exclusões Metodológicas

1. **Exclusão de Custos Financeiros e LCOH (*Levelized Cost of Hydrogen*):** O custo nivelado de hidrogênio depende criticamente de taxas de juros, custos de capital de reatores importados (*CAPEX*), logística de transporte criogênico/comprimido e custos de operação (*OPEX*) que inexistem em bancos de dados públicos abertos para os municípios do Semiárido cearense. Exibir um valor monetário (ex.: R$/kg) configuraria especulação não auditável, violando a Regra 1 de REGRAS.md.
2. **Exclusão de Fermentação Escura (*Dark Fermentation*):** Embora seja tema promissor em pesquisa de bancada, a fermentação escura de biomassa lignocelulósica ainda opera em TRL 2–3, com rendimentos molares extremamente dependentes de pré-tratamento enzimático severo e sem repetibilidade industrial comprovada para a flora da Caatinga.
3. **Exclusão de Equivalências Populistas:** Afirmações do tipo "abastece $X$ automóveis a célula a combustível" ou "alimenta $Y$ residências" foram expressamente rejeitadas para não induzir tomadores de decisão a interpretações errôneas sobre a prontidão de infraestrutura local de distribuição de hidrogênio.
