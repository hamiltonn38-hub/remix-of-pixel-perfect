# Catálogo de Fontes de Dados Reais — PITS (Versão 2 — Auditada)
**Plataforma de Inteligência Territorial Socioenergética (PITS)**

**Data de auditoria e revisão:** 11/10/2026  
**Finalidade:** Substituição integral dos dados sintéticos (`mockData.ts`, `mapbiomas.ts` e constantes nos componentes) por fontes de dados públicas, auditáveis e oficiais para os 10 municípios cearenses do projeto: **Quixadá, Crateús, Iguatu, Sobral, Juazeiro do Norte, Crato, Senador Pompeu, Tauá, Canindé e Cascavel (código IBGE correto: 2303501)**.

---

## 1. Verificações e Correções de Auditoria

### (a) Nomenclatura Oficial da Plataforma
* Conforme a Regra 6 de `docs/REGRAS.md`, o nome oficial em toda a documentação, metadados e código é: **"Plataforma de Inteligência Territorial Socioenergética" (PITS)**. O título anterior da v1 foi corrigido.

---

### (b) Correção das Tabelas do IBGE Censo Agropecuário 2017
* **Auditoria da v1:** A versão anterior do catálogo citava a Tabela 6884 como fonte de Sistemas Agroflorestais/biogás e as tabelas 6876/6878 para associativismo e uso da terra.
* **Resultado da consulta direta à API de Agregados do IBGE (`https://servicodados.ibge.gov.br/api/v3/agregados`):**
  * A **Tabela 6884** intitula-se *"Número de estabelecimentos agropecuários com pessoal ocupado..."* e não contém variáveis de sistemas agroflorestais nem de biogás.
  * A tabela correta que contém Sistemas Agroflorestais é a **Tabela 6881** (*Número de estabelecimentos agropecuários com área e Área dos estabelecimentos agropecuários, por tipologia, utilização das terras...*):
    * **Classificação 222 (Utilização das terras):** Categoria `113476` — *"Sistemas agroflorestais - área cultivada com espécies florestais também usada para lavouras e pastoreio por animais"*; Categoria `113472` (*Pastagens naturais*); Categoria `113469` (*Pastagens plantadas*); Categoria `40679`/`40680` (*Matas e florestas naturais*); Categoria `113470`/`113471` (*Lavouras permanentes e temporárias*).
  * A tabela correta que contém Práticas Agrícolas é a **Tabela 6880** (*Número de estabelecimentos e área, por tipo de prática agrícola...*):
    * **Classificação 12568 (Tipo de prática agrícola):** Categoria `41002` (*Manejo florestal*); Categoria `112677` (*Rotação de culturas*); Categoria `112764` (*Pousio ou descanso de solos*); Categoria `112654` (*Plantio em nível*); Categoria `40999` (*Recuperação de mata ciliar*).
  * A tabela correta que contém Associativismo, Cooperativas e Adubação é a **Tabela 6848**:
    * **Classificação 12598 (Associação a cooperativa/entidade):** Categoria `114543` (*É associado*); Categoria `113455` (*Cooperativa*); Categoria `41142` (*Entidade de classe/sindicato*); Categoria `41143` (*Associação de produtores*); Categoria `113457` (*Não é associado*).
    * **Classificação 12522 (Uso de adubação):** Categoria `46548` (*Adubação orgânica*); Categoria `46549` (*Adubação química e orgânica*).
  * A tabela correta de Agricultura Orgânica é a **Tabela 6854**:
    * **Classificação 838:** Categoria `47123` (*Uso de agricultura ou pecuária orgânica - Sim*).
  * A tabela correta de Orientação Técnica é a **Tabela 6879**:
    * **Classificação 12567:** Categoria `113111` (*Recebe orientação técnica*).
  * A tabela correta de Fontes de Energia Gerada no Estabelecimento é a **Tabela 3346**:
    * **Classificação 12558:** Categoria `113135` (*Energia solar*); Categoria `113136` (*Energia eólica*). Não há categoria isolada de biodigestor no Censo Agro 2017.
* **Status:** **CONFIRMADA NA API DO IBGE**.

---

### (c) IVS-IPEA e Decisão Metodológica (Regra 8)
* **Auditoria:** O IVS 2022 divulgado pelo IPEA cobre apenas o nível nacional e unidades da federação (baseado na PNAD Contínua). O último ano do IVS do Atlas da Vulnerabilidade Social desagregado para todos os municípios brasileiros é **2010** (Censo Demográfico).
* **Decisão padrão adotada (Regra 8 de `docs/REGRAS.md`):**
  1. Construção do **IVS próprio da plataforma PITS** a partir das variáveis oficiais do **Censo Demográfico 2022 do IBGE**:
     * *Água canalizada e rede geral:* Censo 2022, Tabela 6803.
     * *Esgotamento sanitário adequado:* Censo 2022, Tabela 6806.
     * *Coleta sistemática de lixo:* Censo 2022, Tabela 6892.
     * *Acesso à energia elétrica:* Censo 2022, Tabela 9848.
     * *População e área territorial:* Censo 2022, Tabela 4714.
  2. O **IVS-IPEA 2010** é mantido exclusivamente como métrica comparativa histórica de longo prazo, exibindo de forma explícita o ano *"2010"*.
* **Status:** **CONFIRMADA**.

---

### (d) ICMS-CE / IQM (Regra 7)
* **Auditoria:** A componente ambiental de rateio do ICMS no Estado do Ceará não se confunde com PSA nem com conservação estrita de florestas. Trata-se do **IQM (Índice Municipal de Qualidade do Meio Ambiente)**, instituído pelo Decreto Estadual nº 29.306/2008 e alterado pelo Decreto nº 35.051/2022.
* **Escopo Real:** Rateia até **2% do ICMS** aos municípios com base na avaliação anual da SEMA-CE e cálculo pelo IPECE, focando prioritariamente na **gestão integrada de resíduos sólidos**, coleta seletiva e destinação final ambientalmente adequada.
* **Nome Fiel:** Nos cartões e manifestos, o dado é denominado com fidelidade: *"Cota-Parte ICMS Socioambiental / IQM (Gestão de Resíduos Sólidos)"*.
* **Status:** **CONFIRMADA**.

---

### (e) Confirmação da Referência de Taperoá/PB (M2-6)
* **Artigo Localizado e Conferido no SciELO:**
  * **Autores:** Júlio César Rodrigues Martins, Rômulo Simões Cezar Menezes, Everardo Valadares de Sá Barreto Sampaio, Ailton F. dos Santos, Mona A. Nagai.
  * **Título:** *Produtividade de biomassa em sistemas agroflorestais e tradicionais no Cariri Paraibano*.
  * **Periódico:** Revista Brasileira de Engenharia Agrícola e Ambiental (RBEAA), v. 17, n. 6, p. 581–587, 2013.
  * **DOI:** `10.1590/S1415-43662013000600002`.
  * **URL SciELO:** `https://doi.org/10.1590/S1415-43662013000600002` (Acessado em: 11/10/2026).
  * **Achado confirmado:** O estudo confirma que, embora o cultivo tradicional tenha produzido mais biomassa de grãos, a inclusão da biomassa lenhosa das árvores (especialmente da *Gliricidia sepium*) resultou em produtividade total **260% superior** no sistema agroflorestal em comparação com o tradicional.
* **Status:** **CONFIRMADA (ABERTO E CONFERIDO)**.

---

### (f) Confirmação da Referência de Alometria de Biomassa (M1-8)
* **Artigo Localizado e Conferido no SciELO:**
  * **Autores:** Everardo Valadares de Sá Barreto Sampaio, George Chaves Silva.
  * **Título:** *Biomass equations for Brazilian semiarid caatinga plants*.
  * **Periódico:** Acta Botanica Brasilica, v. 19, n. 4, p. 935–943, 2005.
  * **DOI:** `10.1590/S0102-33062005000400028`.
  * **URL SciELO:** `https://doi.org/10.1590/S0102-33062005000400028` (Acessado em: 11/10/2026).
  * **Referência complementar:** Silva, G.C.; Sampaio, E.V.S.B. (2008). *Biomassa de partes aéreas em plantas da Caatinga*. Revista Árvore, v. 32, n. 3, p. 567–575.
* **Status:** **CONFIRMADA (ABERTO E CONFERIDO)**.

---

### (g) Confirmação do PNDBio no gov.br (G7)
* **Decreto Federal nº 12.044, de 5 de junho de 2024** (Estratégia Nacional de Bioeconomia).
* **Resolução CNBio nº 7/2025 e Resolução CNBio nº 8/2026**:
  * **3 Eixos Estruturantes:** 1. Sociobioeconomia e ativos ambientais; 2. Bioindustrialização competitiva; 3. Produção sustentável de biomassa.
  * **8 Missões Estratégicas:** Negócios da Sociobioeconomia (M1); Territórios e Conservação (M2); Saúde e Bem-Estar (M3); Aproveitamento Integral da Biomassa (M4); Bioquímica de Renováveis (M5); Produção de Biomassa Sustentável (M6); Diversificação de Biomassa (M7); Bioeconomia dos Ecossistemas Terrestres e Aquáticos (M8).
  * **Portal oficial:** `https://www.gov.br/mma/pt-br/assuntos/bioeconomia` (Acessado em: 11/10/2026).
* **Status:** **CONFIRMADA**.

---

### (h) Confirmação do MapBiomas Coleção 11 (G2, M1-3, M1-6)
* Lançada em 12 de agosto de 2026, com cobertura temporal de **1985 a 2025**.
* Planilhas públicas de estatísticas municipais: `https://mapbiomas.org/estatisticas` e plataforma `https://plataforma.brasil.mapbiomas.org/` (Acessado em: 11/10/2026).
* **Status:** **CONFIRMADA**.

---

### (i) Confirmação da Extração de Lenha na PEVS/IBGE (M2-3)
* **Tabela 289 do SIDRA**: Variável 144 (*Quantidade produzida na extração vegetal*), Categoria 3434 (*7.2 - Lenha*, em $\text{m}^3$).
* Dados reextraídos via API em 11/10/2026 para o ano de 2025:
  * Quixadá: $20.251\text{ m}^3$
  * Crateús: $80.565\text{ m}^3$
  * Iguatu: $34.318\text{ m}^3$
  * Sobral: $46.875\text{ m}^3$
  * Juazeiro do Norte: $520\text{ m}^3$
  * Crato: $12.100\text{ m}^3$
  * Senador Pompeu: $4.895\text{ m}^3$
  * Tauá: $74.750\text{ m}^3$
  * Canindé: $207.480\text{ m}^3$
  * Cascavel (código 2303501): $536\text{ m}^3$
* **Status:** **CONFIRMADA NA API DO SIDRA**.

---

## 2. Tabela de Mapeamento dos Itens Auditados

| ID | Variável Auditada | Fonte Real Candidata (Instituição, Base, URL) | Cobertura (Municipal? Ano?) | Como Obter (API / Download / Pedido LAI) | Esforço | Classificação | Status de Verificação |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **G1** | Toda a base municipal fictícia (`mockData.ts`) | Substituição pelas bases oficiais auditadas (IBGE Censo 2022, Censo Agro 2017, PEVS, MapBiomas Col. 11, FUNCEME/INMET). | Municipal (10 municípios do CE); anos consolidados. | APIs abertas (SIDRA IBGE) + scripts reprodutíveis. | Alto | **A** | **CONFIRMADA** |
| **G2** | Cobertura do solo fabricada em `mapbiomas.ts` | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`). | Municipal (10 municípios do CE); 1985–2025. | Download de estatísticas municipais da Coleção 11. | Baixo | **A** | **CONFIRMADA** |
| **D2** | Velocímetro IPSE (`m.IPSE`) | Modelo matemático sintético composto recalculado sobre os subíndices reais normalizados (0–1), seguindo o *Handbook on Constructing Composite Indicators* (OCDE/JRC, 2008). | Municipal (10 municípios do CE); ano-base de referência. | Cálculo algorítmico interno sem valores hardcoded. | Médio | **A** | **CONFIRMADA** |
| **D3** | 4 cards de subíndices no Dashboard (IB, IVS, IIE, IGL) | **IB:** MapBiomas Col. 11 (% vegetação nativa);<br>**IVS:** IVS Próprio Censo 2022 (Eq. 4: água, esgoto, lixo, energia; Tabelas 6803, 6806, 6892, 9848) e IVS-IPEA 2010 para comparação;<br>**IIE:** IBGE Censo Agro 2017 (Tabela 6881: SAFs Cat 113476; Tabela 6880: manejo florestal e rotação; Tabela 6848: adubação orgânica);<br>**IGL (Proxy):** IBGE MUNIC (Módulo Meio Ambiente: conselho ativo e fundo municipal). | Municipal (10 municípios do CE); 2017 a 2024. | API SIDRA do IBGE e download de planilhas públicas. | Médio | **A** | **CONFIRMADA** |
| **D9** | Card "Vegetação Nativa" no Dashboard | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`). Classes 3 (Florestal) + 4 (Savânica) + 12 (Campestre). | Municipal (10 municípios do CE); 2024/2025. | Download de estatísticas municipais. | Baixo | **A** | **CONFIRMADA** |
| **D10** | Cards "Biomassa", "Biodigestores", "PSA" no Dashboard | **Biomassa:** Inventário Florestal Nacional do Ceará (SFB/MMA - IFN-CE) e MapBiomas Biomassa;<br>**Biodigestores (Proxy fiel):** Censo Agro 2017 Tabela 3346 (estabelecimentos com energia gerada no estabelecimento: solar/alternativa) ou dado de campo FUNDECI;<br>**PSA (Proxy fiel):** Repasses anuais do IQM / ICMS Socioambiental do Ceará (IPECE / SEMA-CE, `https://www.ipece.ce.gov.br/cota-parte-do-icms/`). | Municipal (10 municípios do CE); anos consolidados. | API SIDRA para Censo Agro e download IPECE para IQM; ou planilha de campo do autor. | Médio | **C** | **CONFIRMADA COM RESSALVA (PROXY)** |
| **M1-1** | "Integridade Florestal (IFL)" | Proxy de fragmentação via remanescentes contínuos da **Coleção 11 do MapBiomas** OU unificação com o **Índice Biofísico (IB)**, desvinculando do FLII internacional (Grantham et al., 2020). | Municipal (10 municípios do CE); 2024/2025. | Processamento de classes MapBiomas ou ajuste de rótulo no componente. | Baixo | **A** | **CONFIRMADA** |
| **M1-2** | "Estoque de Biomassa" (t/ha) | **Serviço Florestal Brasileiro (SFB/MMA) — IFN-CE** (`https://snif.florestal.gov.br/`) e **MapBiomas Biomassa**. | Estadual (fitofisionomias do CE) e dados zonais. | Autor define a estimativa fitofisionômica do IFN-CE por município ou fornece o raster zonal. | Médio | **B** | **CONFIRMADA** |
| **M1-3** | "Cobertura Vegetal Nativa" (%) | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`). Classes nativas / área territorial Censo 2022. | Municipal (10 municípios do CE); 1985–2025. | Download de estatísticas municipais. | Baixo | **A** | **CONFIRMADA** |
| **M1-4** | "Regeneração" (%/ano) | **MapBiomas Brasil — Matriz de Transições e Regeneração** (`https://mapbiomas.org/estatisticas`). | Municipal (10 municípios do CE); anual 1985–2025. | Download de matrizes de transição de uso da terra. | Baixo | **A** | **CONFIRMADA** |
| **M1-5** | "Meta de Cobertura Arbórea (≥ 40%)" | **Código Florestal — Lei Federal nº 12.651/2012, Art. 12, II** (Reserva Legal de 20% no bioma Caatinga por imóvel) e dados de déficit/excedente do **SICAR/SFB** (`https://www.car.gov.br/`). | Nacional / Bioma Caatinga / Municipal. | Ajuste do parâmetro para 20% no código com citação legal expressa. | Baixo | **A** | **CONFIRMADA** |
| **M1-6** | Bloco "Cobertura do Solo MapBiomas Col. 9" | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`). | Municipal (10 municípios do CE); classes LULC 1985–2025. | Download da planilha oficial de estatísticas municipais da Coleção 11. | Baixo | **A** | **CONFIRMADA** |
| **M1-7** | "Alertas de Desmatamento — MapBiomas Alerta" | **MapBiomas Alerta — Plataforma de Alertas e Relatório Anual do Desmatamento (RAD)** (`https://alerta.mapbiomas.org/`). | Municipal (10 municípios do CE); 2019–2026. | Configuração de credencial de API no proxy OU download de planilhas consolidadas públicas do RAD. | Médio | **B** | **CONFIRMADA** |
| **M1-8** | Gráfico "Biomassa por Cobertura Arbórea" | Sampaio, E.V.S.B.; Silva, G.C. (2005). *Biomass equations for Brazilian semiarid caatinga plants*. Acta Botanica Brasilica, v. 19, n. 4, p. 935–943. DOI: 10.1590/S0102-33062005000400028. | Regional (Caatinga do Ceará). | Inserção da equação alométrica e citação bibliográfica confirmada no SciELO. | Médio | **B** | **CONFIRMADA (ABERTO E CONFERIDO)** |
| **M1-10** | Tabela "Espécies Nativas Monitoradas" | **Flora e Funga do Brasil — Jardim Botânico do Rio de Janeiro** (`https://floradobrasil.jbrj.gov.br/`) e dados de manejo da **EMBRAPA Semiárido / SFB**. | Regional / Bioma Caatinga. | Nomes aceitos conferidos: *Cenostigma pyramidale*, *Sarcomphalus joazeiro*, *Mimosa caesalpiniifolia*, *Anadenanthera colubrina*, *Mimosa tenuiflora*. | Baixo | **A** | **CONFIRMADA** |
| **M2-1** | "Sistemas Integrados % — Meta: 70%" | **IBGE Censo Agropecuário 2017 — Tabela 6881** (Cat 113476 "Sistemas agroflorestais", `https://sidra.ibge.gov.br/tabela/6881`). Meta: Plano ABC+ ou meta do projeto FUNDECI. | Municipal (10 municípios do CE); ano 2017. | Consulta direta via API SIDRA do IBGE. | Baixo | **A** | **CONFIRMADA NA API DO SIDRA** |
| **M2-2** | "Circularidade de Biomassa 30%" | **Proxy Fiel:** Proporção de estabelecimentos rurais com adubação orgânica (**IBGE Censo Agro 2017, Tabela 6848, Cat 46548 e 46549**) e agricultura orgânica (**Tabela 6854, Cat 47123**). | Municipal (10 municípios do CE); ano 2017. | Consulta via API SIDRA do IBGE (Tabelas 6848 e 6854). | Médio | **C** | **CONFIRMADA COM RESSALVA (PROXY)** |
| **M2-3** | "Demanda Lenha s/ Manejo 42,3k m³/ano" | **IBGE PEVS Tabela 289** (Variável 144, Categoria 3434 "7.2 - Lenha", em $\text{m}^3$). Cruzamento com autorizações de corte do **SINAFLOR / IBAMA / SEMACE**. | Municipal (10 municípios do CE); ano 2025. | A extração total é pública via API SIDRA. Volume sob manejo requer relatório de PMFS da SEMACE ou dados abertos do SINAFLOR. | Médio | **A** (PEVS) / **B** (PMFS SEMACE) | **CONFIRMADA NA API DO SIDRA** |
| **M2-4** | "Eficiência Energética 38% — Conversão" | **Proxy Técnica:** Literatura técnica regional de fogões e fornos da Caatinga (Rede Biomassa / APNE / UFC); e proporção de domicílios com uso de lenha/gás no Censo Demográfico. | Regional (Caatinga) / Municipal. | Parâmetros técnicos documentados de literatura e tabelas censitárias. | Médio | **C** | **CONFIRMADA COM RESSALVA (PROXY / LITERATURA)** |
| **M2-6** | Gráfico "SAFs 29,5 vs Tradicional 8,2 t/ha" | Martins, J.C.R. et al. (2013). *Produtividade de biomassa em sistemas agroflorestais e tradicionais no Cariri Paraibano*. Rev. Bras. Eng. Agríc. Ambiental, v. 17, n. 6, p. 581–587. DOI: 10.1590/S1415-43662013000600002. | Experimental de campo (Semiárido). | Citação bibliográfica completa incluída no card com contextualização das espécies. | Baixo | **A** | **CONFIRMADA (ABERTO E CONFERIDO)** |
| **M2-8** | "Sistemas Produtivos" com % de adoção | **IBGE Censo Agropecuário 2017 — Tabela 6881** (Cat 113476 SAFs, Cat 113472 Pastagens naturais, Cat 113469 Pastagens plantadas, Cat 40679/40680 Matas, Cat 113470/113471 Lavouras). | Municipal (10 municípios do CE); ano 2017. | Consulta direta via API SIDRA do IBGE. | Baixo | **A** | **CONFIRMADA NA API DO SIDRA** |
| **M3-1** | "Acordos de Manejo: N ativos" | Comunidades reais atendidas pelo projeto **FUNDECI/2025.0016** OU cadastro de PMFS Comunitários da **SEMACE / SEMA-CE**. | Municipal / Comunitário (Ceará). | Autor/equipe FUNDECI fornece a lista verídica de comunidades e acordos de manejo, ou pedido LAI à SEMACE. | Médio | **B** | **NÃO CONFIRMADA NA BASE PÚBLICA** |
| **M3-2** | "Participação Comunitária %" | **Proxy Real Oficial:** Proporção de estabelecimentos associados a cooperativas ou sindicatos rurais (**IBGE Censo Agro 2017, Tabela 6848, Classificação 12598, Cat 114543**); ou frequência nas oficinas FUNDECI. | Municipal (10 municípios do CE); ano 2017. | Consulta via API SIDRA do IBGE (Tabela 6848). | Baixo | **A** (com proxy Censo Agro) | **CONFIRMADA NA API DO SIDRA** |
| **M3-3** | "Recursos PSA R$ ...k anual" | Não existem dados no CNPSA/MMA (Lei 14.119/2021). **Proxy Financeira Fiel:** Repasses anuais da cota-parte do **ICMS Socioambiental / IQM (Gestão de Resíduos Sólidos)** por município (**SEFAZ-CE / IPECE / SEMA-CE**, `https://www.ipece.ce.gov.br/cota-parte-do-icms/`). | Municipal (10 municípios do CE); repasses anuais consolidados. | Download de relatórios de rateio do ICMS no portal do IPECE/SEMA-CE. | Médio | **C** | **CONFIRMADA COM RESSALVA (PROXY)** |
| **M3-6** | Pizza "PSA — Distribuição por Serviço" | Tipologia de Serviços Ambientais da **Lei Federal nº 14.119/2021 (Art. 3º e 4º)**. Não existem repasses contábeis empíricos municipais de divisão percentual. | Conceitual / Normativo (Brasil). | Manter como modelo estrutural qualitativo rotulado como: *"Estrutura Teórico-Metodológica de Alocação de Serviços Ambientais (Lei 14.119/2021 / Proposta FUNDECI)"*. | Baixo | **D** | **CONFIRMADA COMO CONCEITO NORMATIVO** |
| **M4-1** | Cards de fontes: IBGE, MapBiomas, ANA, INMET | Metadados reais dos conectores do sistema PITS (contagem real de variáveis: IBGE ~10, MapBiomas ~12, MapBiomas Alerta 2, INMET/FUNCEME 3, IPEA 4). | Código e conectores da aplicação PITS. | Ajuste do array `fontes` em `Modulo4.tsx` para espelhar a contagem exata das variáveis e status reais. | Baixo | **A** | **CONFIRMADA** |
| **M4-2** | Série Temporal 2019–2024 ("Cobertura", "Biomassa", "IPSE") | **Cobertura:** Série histórica anual real da **Coleção 11 do MapBiomas** (1985–2025);<br>**Precipitação:** Série pluviométrica histórica da **FUNCEME** ou **BDMEP/INMET**;<br>**Biomassa e IPSE:** Recalculados anualmente sobre os dados reais. | Municipal (10 municípios do CE); série 2019–2025. | Download da série histórica municipal do MapBiomas Col. 11 e dados de chuva da FUNCEME/BDMEP. | Médio | **A** | **CONFIRMADA** |
| **M4-5** | "Monitoramento Participativo — Últimos Registros" | Registros e cadernos de campo da pesquisa **FUNDECI/2025.0016** (oficinas e vistorias comunitárias reais). | Local / Comunitário (Ceará). | Autor/equipe fornece os registros de campo reais; ou rotulagem como protótipo interativo para submissão comunitária. | Baixo | **B** | **NÃO CONFIRMADA NA BASE PÚBLICA** |
| **G7** | Seções "Plano Nacional de Bioeconomia" | **Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)** — Decreto Federal nº 12.044/2024 e Resoluções CNBio nº 7/2025 e nº 8/2026 (`https://www.gov.br/mma/pt-br/assuntos/bioeconomia`). | Nacional / Federal (2024–2035). | Substituição textual dos 8 falsos eixos pela estrutura oficial de 3 eixos e 8 missões nos Módulos I a IV, com links governamentais corretos. | Baixo | **A** | **CONFIRMADA** |
