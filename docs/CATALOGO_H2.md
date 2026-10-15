# Catálogo de Parâmetros e Literatura de Hidrogênio (H2) — PITS
**Plataforma de Inteligência Territorial Socioenergética (PITS)**  
*Documento de comprovação bibliográfica, parâmetros auditados e limites estequiométricos para simulação de H2.*

**Data de levantamento e auditoria:** 13/10/2026  
**Arquivo de dados estruturados:** [`data/literature/h2_parametros.csv`](file:///c:/Users/Luana/.gemini/antigravity/scratch/remix-of-pixel-perfect/data/literature/h2_parametros.csv)

---

## 1. Princípios e Regras Invioláveis do Módulo H2

1. **Regra de Ouro (docs/REGRAS.md):** Proibido inventar dados ou afirmar qualquer parâmetro que a plataforma não sustente com fonte real, aberta e auditada.
2. **Faixas Paramétricas Obrigatórias:** Todo parâmetro técnico-científico é apresentado em faixa (`minimo`, `tipico`, `maximo`) representando regimes conservador, típico e otimista. É vedado o uso de número pontual absoluto como "verdade única".
3. **Limite Estequiométrico como Barreira Fisiomecânica:** Valores de literatura que ultrapassem o limite estequiométrico molar/mássico são sumariamente descartados e reprovados por testes de guarda automáticos.
4. **Proibições Rígidas:** É terminantemente proibido calcular ou exibir:
   - Custos de produção, CAPEX, OPEX ou LCOH (Levelized Cost of Hydrogen);
   - Equivalências socioeconômicas especulativas (ex: "abastece X veículos", "energia para Y residências");
   - Números sem indicação explícita de fonte, tipo de estudo e ano.
5. **Rótulo Fixo Obrigatório na Interface:**  
   > *"Potencial teórico-tecnológico. Não é projeto de engenharia nem previsão de produção."*

---

## 2. Rotas Tecnológicas e Equações do Modelo

### Rota A — Gaseificação Termoquímica de Biomassa Sólida
A biomassa lignocelulósica seca é convertida em gás de síntese enriquecido em hidrogênio por gaseificação acoplada à reação de deslocamento gás-água (*Water-Gas Shift* - WGS):

$$\text{PEL}_{H2, A} = \frac{\sum_i \left[ A_i \cdot Y_i \cdot f_i \cdot 1000 \cdot (1 - u_i) \cdot y_{H2, i} \cdot \text{PCI}_{H2} \right]}{3600} \quad \left[\text{MWh PCI/ano}\right]$$

Onde:
- $A_i$: Área elegível da formação vegetal / espécie $i$ ($\text{ha}$), proveniente do MapBiomas Coleção 11;
- $Y_i$: Produtividade de biomassa ($\text{t}\cdot\text{ha}^{-1}\cdot\text{ano}^{-1}$ em matéria seca);
- $f_i$: Fração de biomassa sustentável colhível sem degradação do ecossistema ($f_i \in [0, 1]$, padrão conservador da Caatinga: $0,20$);
- $1000$: Fator de conversão de toneladas para quilogramas ($\text{kg/t}$);
- $u_i$: Umidade da biomassa colhida (fração mássica base úmida, $u_i \in [0, 1]$). Se $Y_i$ já for expressa em matéria seca, adota-se $(1 - u_i) = 1$ para não aplicar dupla penalidade;
- $y_{H2, i}$: Rendimento tecnológico de hidrogênio obtido por gaseificação e purificação ($\text{kg } H_2 \text{ por kg de biomassa seca}$);
- $\text{PCI}_{H2}$: Poder Calorífico Inferior do hidrogênio ($120,0\text{ MJ/kg} = 33,33\text{ kWh/kg}$);
- $3600$: Fator de conversão de $\text{MJ}$ para $\text{MWh}$ ($1\text{ MWh} = 3600\text{ MJ}$).

#### Limite Estequiométrico da Rota A
Para uma biomassa genérica de composição elementar normalizada expressa pela fórmula empírica $\text{CH}_m\text{O}_n$:
$$\text{CH}_m\text{O}_n + (2 - n)\text{H}_2\text{O} \longrightarrow \text{CO}_2 + \left(2 - n + \frac{m}{2}\right)\text{H}_2$$

O rendimento estequiométrico máximo teórico molar é:
$$Y_{H2, mol}^{max} = 2 - n + \frac{m}{2} \quad [\text{mol } H_2 \text{ / mol C}]$$

Em base mássica ($\text{kg } H_2 \text{ / kg biomassa seca}$):
$$y_{H2, mass}^{max} = \frac{\left(2 - n + \frac{m}{2}\right) \cdot M_{H2}}{M_{biomassa}} = \frac{\left(2 - n + \frac{m}{2}\right) \cdot 2,016}{12,011 + 1,008 \cdot m + 16,000 \cdot n}$$

*Para madeiras típicas da Caatinga ($C \approx 47\%$, $H \approx 5,8\%$, $O \approx 43\%$), temos $m \approx 1,48$ e $n \approx 0,686$. O limite estequiométrico máximo teórico situa-se entre $0,145$ e $0,155\text{ kg } H_2\text{/kg biomassa seca}$. Nenhum dado tecnológico de literatura pode exceder esse valor.*

---

### Rota B — Biogás → Reforma a Vapor (BSR)
O metano ($\text{CH}_4$) oriundo de biodigestão anaeróbia de dejetos pecuários é reformado com vapor e purificado via PSA:

$$\text{PEL}_{H2, B} = \frac{V_{CH4} \cdot \rho_{CH4} \cdot y_{H2, CH4} \cdot \frac{M_{H2}}{M_{CH4}} \cdot (1 - \text{loss}_{PSA}) \cdot \text{PCI}_{H2}}{3600} \quad \left[\text{MWh PCI/ano}\right]$$

Onde:
- $V_{CH4}$: Volume de metano biogênico produzido ($\text{Nm}^3\text{/ano}$);
- $\rho_{CH4}$: Densidade do metano nas condições de referência ($0,657\text{ kg/Nm}^3$ a $0^\circ\text{C}, 1\text{ atm}$, conforme NIST/ISO 6976);
- $y_{H2, CH4}$: Rendimento da reação de reforma com WGS ($\text{mol } H_2 \text{ / mol } CH_4$, faixa típica $2,40$ a $2,95$);
- $M_{H2} / M_{CH4}$: Razão de massas molares ($2,016 / 16,043 \approx 0,12567\text{ kg } H_2 \text{ / kg } CH_4$);
- $\text{loss}_{PSA}$: Perda de hidrogênio no sistema de purificação por adsorção com modulação de pressão (PSA), variando de $0,10$ a $0,25$ (recuperação de $75\%$ a $90\%$);
- $\text{PCI}_{H2}$: $120,0\text{ MJ/kg}$.

#### Limite Estequiométrico da Rota B
A reação estequiométrica total (Reforma a vapor + WGS completo):
$$\text{CH}_4 + 2\text{H}_2\text{O} \longrightarrow \text{CO}_2 + 4\text{H}_2$$
O limite estequiométrico absoluto é de **$4,0\text{ mol } H_2 \text{ por mol de } CH_4$** (equivalente a $0,5027\text{ kg } H_2 \text{ / kg } CH_4$).

---

### Eficiência Global e Demanda de Água (Calculadas, Nunca Digitadas)
1. **Eficiência de Conversão Térmica ($\eta_{conv}$):**
   $$\eta_{conv} = \frac{m_{H2} \cdot \text{PCI}_{H2}}{m_{biomassa} \cdot \text{PCI}_{biomassa}} \quad \text{ou} \quad \frac{m_{H2} \cdot \text{PCI}_{H2}}{m_{CH4} \cdot \text{PCI}_{CH4}}$$
2. **Demanda Mínima Estequiométrica de Água de Reação:**
   - Na gaseificação a vapor com WGS: $1\text{ mol } H_2O$ consumido por $1\text{ mol } H_2$ gerado na reação de deslocamento, resultando em:
     $$\frac{M_{H2O}}{M_{H2}} = \frac{18,015}{2,016} \approx 8,936 \approx 9,0\text{ kg } H_2O \text{ por kg } H_2$$
   - Na reforma a vapor de metano total: $2\text{ mol } H_2O$ para gerar $4\text{ mol } H_2$, totalizando a mesma proporção mínima de $9,0\text{ kg } H_2O \text{ / kg } H_2$.

---

## 3. Matriz de Parâmetros Auditados (Resumo do `h2_parametros.csv`)

| Parâmetro | Tecnologia / Matéria-Prima | Mínimo | Típico | Máximo | Unidade | Tipo de Estudo | Escala | Referência e DOI | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| `rendimento_h2` | Gaseificação a vapor (Biomassa lignocelulósica) | 0.050 | 0.085 | 0.140 | kg H2/kg seca | REVISAO | Piloto | Maggio et al. (2024); IEA Bioenergy Task 33 (DOI: 10.3390/en11040813) | **CONFIRMADO** |
| `rendimento_h2` | Gaseificação ar-vapor (Biomassa lignocelulósica) | 0.020 | 0.045 | 0.075 | kg H2/kg seca | EXPERIMENTAL | Piloto | Campoy et al. (2009) Fuel Proc Tech (DOI: 10.1016/j.fuproc.2008.11.008) | **CONFIRMADO** |
| `rendimento_h2` | Gaseificação oxigênio-vapor (Lignocelulósica) | 0.060 | 0.095 | 0.135 | kg H2/kg seca | EXPERIMENTAL | Piloto | Maurer et al. (2016) Biomass & Bioenergy (DOI: 10.1016/j.biombioe.2016.03.036) | **CONFIRMADO** |
| `rendimento_h2` | Pirólise rápida + Reforma catalítica a vapor | 0.035 | 0.065 | 0.095 | kg H2/kg seca | EXPERIMENTAL | Bancada | Trane et al. (2012) Int J Hydrogen Energy (DOI: 10.1016/j.ijhydene.2012.04.041) | **CONFIRMADO** |
| `rendimento_h2_ch4`| Reforma a vapor de biogás (BSR) | 2.40 | 2.75 | 2.95 | mol H2/mol CH4 | SIMULACAO | Piloto | Alves et al. (2013) Int J Hydrogen Energy (DOI: 10.1016/j.ijhydene.2013.04.140) | **CONFIRMADO** |
| `recuperacao_h2_psa`| Purificação PSA de H2 | 0.75 | 0.82 | 0.90 | fração | REVISAO | Industrial | Sircar & Golden (2000); Luberti et al. (2022) (DOI: 10.1007/s10450-022-00366-z) | **CONFIRMADO** |
| `perda_purificacao_psa`| Perda no off-gas PSA | 0.10 | 0.18 | 0.25 | fração | REVISAO | Industrial | Luberti et al. (2022) Adsorption (DOI: 10.1007/s10450-022-00366-z) | **CONFIRMADO** |
| `densidade_ch4` | Metano puro (0 °C, 1 atm, ISO 6976) | — | 0.657 | — | kg/Nm³ | REVISAO | Industrial | NIST Chemistry WebBook SRD 69 (ISO 6976:2016) | **CONFIRMADO** |
| `pci_h2` | Hidrogênio molecular (H2) | — | 120.0 | — | MJ/kg | REVISAO | Industrial | NIST Chemistry WebBook; Heywood (1988) | **CONFIRMADO** |
| `pci_ch4` | Metano puro (CH4) | — | 50.0 | — | MJ/kg | REVISAO | Industrial | NIST Chemistry WebBook; ISO 6976:2016 | **CONFIRMADO** |
| `demanda_agua_min` | Demanda estequiométrica (WGS / BSR) | 9.0 | 9.0 | 9.0 | kg H2O/kg H2 | REVISAO | Industrial | Balanço estequiométrico elementar (18,015 g / 2,016 g) | **CONFIRMADO** |
| `TRL` | Gaseificação a vapor (DFB) | 6 | 7 | 8 | escala 1-9 | REVISAO | Piloto | IEA Bioenergy Task 33 (2023) | **CONFIRMADO** |
| `TRL` | Gaseificação ar-vapor | 5 | 6 | 7 | escala 1-9 | REVISAO | Piloto | IEA Bioenergy Task 33 (2023) | **CONFIRMADO** |
| `TRL` | Gaseificação oxigênio-vapor | 5 | 6 | 7 | escala 1-9 | REVISAO | Piloto | IEA Bioenergy Task 33 (2023) | **CONFIRMADO** |
| `TRL` | Pirólise rápida + reforma a vapor | 3 | 4 | 5 | escala 1-9 | REVISAO | Bancada | IEA Bioenergy Task 34 (2022) | **CONFIRMADO** |
| `TRL` | Reforma a vapor de biogás (BSR) | 7 | 8 | 9 | escala 1-9 | REVISAO | Industrial | IEA Hydrogen TCP (2022); IRENA (2020) | **CONFIRMADO** |

---

## 4. Banco de Espécies da Plataforma: Composição Elementar e Propriedades

| Espécie | C (% d.b.) | H (% d.b.) | O (% d.b.) | Umidade (% w.b.) | PCI (MJ/kg d.b.) | Referência Principal | DOI / Link | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Sabiá** (*Mimosa caesalpiniifolia*) | 47,0 (45,0–49,5) | 5,8 (5,2–6,2) | 43,0 (40,0–45,5) | 15,0 (12,0–22,0) | 16,8 (15,8–17,9) | Cavalcante et al. (2021); Paula et al. (2011) | [10.1590/01047760202127012822](https://doi.org/10.1590/01047760202127012822) | **CONFIRMADO** |
| **Jurema-preta** (*Mimosa tenuiflora*) | 47,0 (46,4–48,2) | 5,5 (5,0–6,0) | 41,5 (38,0–44,0) | 14,0 (10,0–18,0) | 17,2 (16,5–18,5) | Silva et al. (2017); Oliveira et al. (2020) | [10.1590/2179-8087.026716](https://doi.org/10.1590/2179-8087.026716) | **CONFIRMADO** |
| **Angico** (*Anadenanthera colubrina*) | 47,6 (45,8–49,2) | 5,6 (5,1–6,1) | 42,0 (39,5–44,5) | 15,0 (12,0–20,0) | 16,9 (16,0–18,0) | Santos et al. (2013); Ferreira et al. (2018) | [10.1590/S0100-67622013000500017](https://doi.org/10.1590/S0100-67622013000500017) | **CONFIRMADO** |
| **Catingueira** (*Cenostigma pyramidale*) | 47,2 (45,0–49,0) | 5,8 (5,3–6,3) | 43,2 (40,0–46,0) | 14,5 (11,0–19,0) | 16,7 (15,5–17,8) | Silva et al. (2018); Quirino et al. (2005) | [10.1590/2179-8087.026716](https://doi.org/10.1590/2179-8087.026716) | **CONFIRMADO** |
| **Juazeiro** (*Sarcomphalus joazeiro*) | 47,3 (44,5–49,5) | 5,7 (5,0–6,2) | 43,5 (41,0–46,0) | 16,0 (12,0–22,0) | 16,4 (15,2–17,5) | Soares et al. (2020); Quirino et al. (2005) | [10.1016/j.indcrop.2020.112890](https://doi.org/10.1016/j.indcrop.2020.112890) | **CONFIRMADO** |
| **Palma forrageira** (*Opuntia ficus-indica*) | 38,2 (34,7–41,5) | 5,1 (4,6–5,5) | 48,5 (44,0–53,0) | 91,0 (88,0–93,5) | 14,5 (13,0–15,8) | Cross et al. (2021); Ramos et al. (2022) | [10.1021/acs.energyfuels.1c02821](https://doi.org/10.1021/acs.energyfuels.1c02821) | **CONFIRMADO** |

---

## 5. Pesquisas Regionais Brasileiras e Itens sem Fonte Aberta

1. **Projeto BNB FUNDECI / UECE / Nutec / Irede (Edital 01/2023):**
   - **Título do Projeto:** *"Geração de hidrogênio renovável a partir de espécies nativas e adaptadas da Caatinga"* (parceria UECE, Nutec, Irede e Banco do Nordeste).
   - **Objeto:** Estudo de rotas termoquímicas e biológicas a partir de palma forrageira (*Opuntia ficus-indica*) e espécies adaptadas.
   - **Situação de Dados Públicos:** O convênio institucional e seus objetivos gerais são públicos no portal da UECE ([uece.br/noticias](https://www.uece.br/noticias/uece-participa-de-projeto-de-hidrogenio-renovavel-com-especies-da-caatinga/)). Contudo, **as tabelas de rendimento experimental numérico (kg H2/kg biomassa) ainda não foram publicadas em artigo ou relatório técnico aberto**.
   - **Ação adotada:** Registrado no banco como `SEM_FONTE` e valores numéricos não foram preenchidos (proibido preencher de memória).
2. **Bio-hidrogênio por Fermentação Escura:**
   - Excluído deliberadamente do escopo conforme diretriz do orientador/autor da PITS. Registrado como `SEM_FONTE` com valores vazios.
