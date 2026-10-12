# Catálogo de Fontes de Dados Reais — PITS
**Plataforma Integrada de Territórios Sustentáveis / Inteligência Territorial Socioecológica**

**Data de pesquisa e acesso:** 11/10/2026  
**Finalidade:** Substituição integral dos dados sintéticos (`mockData.ts`, `mapbiomas.ts` e constantes de componentes) por fontes de dados públicas, auditáveis e oficiais para os 10 municípios cearenses do projeto: **Quixadá, Crateús, Iguatu, Sobral, Juazeiro do Norte, Crato, Senador Pompeu, Tauá, Canindé e Cascavel (código IBGE correto: 2303501)**.

---

## 1. Verificações Específicas nos Portais Oficiais

### (a) Estrutura Oficial do PNDBio no gov.br (Substituição dos "Eixos do PlanBio")
* **Marco Legal e Governança:** Estratégia Nacional de Bioeconomia instituída pelo **Decreto Federal nº 12.044, de 5 de junho de 2024**. O planejamento e monitoramento são operacionalizados pelo **Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)**, gerido pela Comissão Nacional de Bioeconomia (CNBio) por meio da **Resolução CNBio nº 7/2025** (missões, ações e indicadores) e **Resolução CNBio nº 8/2026** (metas e salvaguardas).
* **Fontes Oficiais:**
  * Ministério do Meio Ambiente e Mudança do Clima (MMA): `https://www.gov.br/mma/pt-br/assuntos/bioeconomia` (Acessado em: 11/10/2026).
  * Participa Mais Brasil: `https://www.gov.br/participamaisbrasil/plano-nacional-de-desenvolvimento-da-bioeconomia` (Acessado em: 11/10/2026).
* **Estrutura Oficial Vigente (3 Eixos e 8 Missões):**
  * **Eixo 1: Sociobioeconomia e Ativos Ambientais**
    * *Missão 1:* Negócios da Sociobioeconomia
    * *Missão 2:* Territórios e Conservação
    * *Missão 8:* Bioeconomia dos Ecossistemas Terrestres e Aquáticos
  * **Eixo 2: Bioindustrialização Competitiva**
    * *Missão 3:* Saúde e Bem-Estar
    * *Missão 4:* Aproveitamento Integral da Biomassa
    * *Missão 5:* Bioquímica de Renováveis
  * **Eixo 3: Produção Sustentável de Biomassa**
    * *Missão 6:* Produção de Biomassa Sustentável
    * *Missão 7:* Diversificação de Biomassa
* **Mapeamento para os 4 Módulos do PITS:**
  * *Módulo I (Biofísico):* Eixo 1 (Missão 2: Territórios e Conservação; Missão 8: Ecossistemas Terrestres).
  * *Módulo II (Integração Produtiva):* Eixos 2 e 3 (Missão 4: Aproveitamento Integral da Biomassa; Missão 6: Produção Sustentável de Biomassa).
  * *Módulo III (Governança):* Eixo 1 (Missão 1: Negócios da Sociobioeconomia; Sistema de Salvaguardas para Povos Tradicionais e Agricultores Familiares).
  * *Módulo IV (Monitoramento):* Sistema Nacional de Informações e Conhecimento sobre a Bioeconomia (SNICBio) e Indicadores de Monitoramento do PNDBio.

---

### (b) Coleção Mais Recente do MapBiomas (Uso e Cobertura do Solo)
* **Versão mais recente:** **Coleção 11 do MapBiomas Brasil**, lançada em **12 de agosto de 2026**, abrangendo o intervalo histórico de **1985 a 2025**.
* **Fonte Oficial:** MapBiomas Brasil — `https://mapbiomas.org/estatisticas` e `https://plataforma.brasil.mapbiomas.org/` (Acessado em: 11/10/2026).
* **Acesso aos dados municipais:** Planilhas públicas em formato Excel/CSV para download direto contendo a série de área (ha) por classe de cobertura para todos os municípios brasileiros, permitindo extrair classes litorâneas reais para Cascavel (dunas, mangues, restingas) e eliminar discrepâncias de arredondamento.

---

### (c) IVS do IPEA (Atlas da Vulnerabilidade Social)
* **Disponibilidade:** O IPEA disponibiliza dados do **Índice de Vulnerabilidade Social (IVS)** desagregados por município para todos os municípios do país.
* **Fonte Oficial:** IPEA — `https://ivs.ipea.gov.br/` e IpeaData `https://www.ipeadata.gov.br/` (Acessado em: 11/10/2026).
* **Estrutura:** O índice varia de **0,000 (muito baixa vulnerabilidade) a 1,000 (muito alta vulnerabilidade)**, composto por 16 indicadores divididos em 3 subdimensões:
  1. *IVS Infraestrutura Urbana* (saneamento, abastecimento de água, coleta de lixo, tempo de deslocamento).
  2. *IVS Capital Humano* (mortalidade infantil, analfabetismo, abandono escolar, mães jovens).
  3. *IVS Renda e Trabalho* (desocupação, renda domiciliar per capita, dependência de idosos).
* **Diretriz Metodológica para o IPSE:** Corrigir a direção no código. Como no IPEA o IVS mede vulnerabilidade (quanto maior, pior), para integrar positivamente a um índice de potencial socioecológico deve-se usar a polaridade invertida: $(1 - \text{IVS})$.

---

### (d) IBGE PEVS para Lenha Extraída
* **Disponibilidade:** Pesquisa da Produção da Extração Vegetal e da Silvicultura (PEVS), integrante do Sistema IBGE de Recuperação Automática (SIDRA).
* **Fonte Oficial:** IBGE SIDRA — `https://sidra.ibge.gov.br/tabela/289` (Acessado em: 11/10/2026 via API).
* **Especificação Técnica:** Tabela 289, Variável 144 (*Quantidade produzida na extração vegetal*), Categoria 3434 (*7.2 - Lenha*), Unidade: Metros cúbicos ($\text{m}^3$).
* **Dados Reais Extraídos ao Vivo da API em 11/10/2026 (Ano-base 2025):**
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

---

### (e) Endpoint e Acesso a Dados de Precipitação do INMET
* **Diagnóstico da API Atual:** A rota `/estacao/diaria/...` de `https://apitempo.inmet.gov.br/` sem autenticação retorna HTTP 404 (a biblioteca comunitária `inmetpy` foi inclusive descontinuada após alterações de segurança e política de acesso na API pública do INMET).
* **Endpoints Ativos:** A rota de consulta de metadados das estações `/estacoes/T` permanece operacional via requisições com User-Agent padrão (estações operantes no Ceará identificadas: Quixadá `A369`, Tauá `A324`, Quixeramobim `A325`, Guaramiranga `A314`, Campos Sales `A347`, Jaguaribe `A358`, Morada Nova `A332`).
* **Solução Oficial e Estável para Precipitação Histórica:**
  * **BDMEP (Banco de Dados Meteorológicos para Ensino e Pesquisa - INMET):** `https://bdmep.inmet.gov.br/` ou download direto dos arquivos anuais consolidados em `https://portal.inmet.gov.br/uploads/dadoshistoricos/{ano}.zip` (Acessado em: 11/10/2026).
  * **Alternativa de Referência Estadual (Ceará):** Plataforma de Monitoramento da **FUNCEME (Fundação Cearense de Meteorologia e Recursos Hídricos)** (`http://www.funceme.br/` e `http://hidro.ce.gov.br/`, Acessado em: 11/10/2026), que mantém rede pluviométrica com cobertura completa em todos os 10 municípios do projeto.

---

### (f) Base Legal do PSA e Disponibilidade de Dados Municipais
* **Marco Legal:** **Lei Federal nº 14.119, de 13 de janeiro de 2021**, que institui a Política Nacional de Pagamento por Serviços Ambientais (PNPSA) e cria o Cadastro Nacional de Pagamento por Serviços Ambientais (CNPSA).
* **Status dos Dados Municipais:** O CNPSA, sob gestão do Ministério do Meio Ambiente e Mudança do Clima (MMA), encontra-se em fase de estruturação e integração com outros sistemas (CAR, SINIMA, SIBBr). **Não existe base pública aberta com dados contábeis de repasses municipais de PSA no Ceará**.
* **Proxy Real Candidata com Base Pública Municipal:** Repasses financeiros do **ICMS Ecológico do Estado do Ceará** (Lei Estadual nº 12.612/1996 e alterações), publicados anualmente pelo **IPECE (Instituto de Pesquisa e Estratégia Econômica do Ceará)** e **SEMA-CE** (`https://www.ipece.ce.gov.br/`, Acessado em: 11/10/2026), que remuneram os municípios pela criação/manutenção de Unidades de Conservação e gestão de resíduos sólidos.

---

## 2. Tabela de Mapeamento Completo dos Itens da Auditoria

| ID | Variável Auditada | Fonte Real Candidata (Instituição, Base, URL) | Cobertura (Municipal? Ano?) | Como Obter (API / Download / Pedido LAI) | Esforço | Classificação |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **G1** | Toda a base municipal fictícia (`mockData.ts`: 15 variáveis) | Substituição pelas bases oficiais detalhadas nos itens individuais (IBGE Censo 2022/Agro 2017/PEVS, MapBiomas Col. 11, IVS IPEA) e segregação de variáveis de campo FUNDECI. | Municipal (10 municípios do CE); anos consolidados de cada base oficial. | Integração de APIs públicas abertas (SIDRA IBGE) + planilhas consolidadas processadas no build. | Alto | **A** |
| **G2** | Cobertura do solo fabricada em `mapbiomas.ts` | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); 1985–2025. | Download de planilha pública de estatísticas municipais e geração de arquivo de dados limpo. | Baixo | **A** |
| **D2** | Velocímetro IPSE (`m.IPSE`) | Modelo matemático sintético do próprio projeto FUNDECI, recalculado a partir dos 4 subíndices normalizados (0 a 1) com dados reais, seguindo diretrizes do *Handbook on Constructing Composite Indicators* (OCDE/JRC, 2008). | Municipal (10 municípios do CE); ano-base de referência. | Cálculo algorítmico interno a partir dos subindicadores reais (sem valores hardcoded). | Médio | **A** |
| **D3** | 4 cards de subíndices no Dashboard (IB, IVS, IIE, IGL) | **IB:** MapBiomas Col. 11 (% vegetação nativa normalizado);<br>**IVS:** IPEA — Atlas da Vulnerabilidade Social (`https://ivs.ipea.gov.br/`, Acessado em: 11/10/2026);<br>**IIE:** IBGE Censo Agro 2017 (Tabela 6884/6878: estabelecimentos com SAFs/práticas conservacionistas);<br>**IGL (Proxy):** IBGE MUNIC (Módulo Meio Ambiente: conselho ambiental ativo e fundo municipal). | Municipal (10 municípios do CE); bases de 2017 a 2024. | Download de planilhas públicas do IPEA e consultas à API SIDRA do IBGE. | Médio | **A** |
| **D9** | Card "Vegetação Nativa" no Dashboard | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`, Acessado em: 11/10/2026). Classes 3 (Florestal) + 4 (Savânica) + 12 (Campestre). | Municipal (10 municípios do CE); 2024/2025. | Download de planilha de estatísticas municipais. | Baixo | **A** |
| **D10** | Cards "Biomassa t/ha", "Biodigestores", "PSA Distribuído" no Dashboard | **Biomassa:** SFB/MMA — Inventário Florestal Nacional do Ceará (`https://snif.florestal.gov.br/`);<br>**Biodigestores (Proxy real):** IBGE Censo Agropecuário 2017 (Tabela 6884: estabelecimentos com biogás/energia alternativa) ou cadastro de campo FUNDECI;<br>**PSA Distribuído (Proxy real):** IPECE / SEMA-CE — Repasses anuais do ICMS Ecológico do Ceará por município (`https://www.ipece.ce.gov.br/`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); IFN (estadual) e Censo Agro/ICMS Ecológico (municipal anual). | Download de dados do IPECE e API SIDRA para proxies; ou fornecimento de planilha de campo pela equipe do projeto. | Médio | **C** |
| **M1-1** | "Integridade Florestal (IFL)" no Módulo I | **Opção 1 (Proxy direta):** Métrica de fragmentação e proporção de remanescentes contínuos do **MapBiomas Coleção 11**;<br>**Opção 2:** Unificação com o **Índice Biofísico (IB)**, removendo a duplicidade com a sigla científica internacional FLII (*Forest Landscape Integrity Index*, Grantham et al., 2020). | Municipal (10 municípios do CE); 2024/2025. | Processamento da cobertura MapBiomas Col. 11 ou ajuste de rótulo conceitual no componente. | Baixo | **A** |
| **M1-2** | "Estoque de Biomassa" (t/ha) no Módulo I | **Serviço Florestal Brasileiro (SFB/MMA) — Inventário Florestal Nacional (IFN-CE)** (`https://snif.florestal.gov.br/pt-br/inventario-florestal-nacional-ifn`, Acessado em: 11/10/2026) e **MapBiomas Biomassa**. | Estadual / fitofisionomias do Ceará e dados raster zonais. | Download dos relatórios estaduais do IFN-CE pelo autor, definindo a estimativa por fitofisionomia de Caatinga para cada município. | Médio | **B** |
| **M1-3** | "Cobertura Vegetal Nativa" (%) no Módulo I | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`, Acessado em: 11/10/2026). Soma de classes nativas / área municipal Censo 2022. | Municipal (10 municípios do CE); série 1985–2025. | Download da tabela consolidada de cobertura por município. | Baixo | **A** |
| **M1-4** | "Regeneração" (%/ano) no Módulo I | **MapBiomas Brasil — Módulo de Transições e Regeneração da Vegetação** (`https://mapbiomas.org/estatisticas`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); anual (séries 1985–2025). | Download da matriz de transição de uso da terra (colunas de regeneração/vegetação secundária). | Baixo | **A** |
| **M1-5** | "Meta de Cobertura Arbórea (≥ 40%)" no Módulo I | **Código Florestal Brasileiro — Lei Federal nº 12.651/2012, Art. 12, II** (Reserva Legal de 20% para a Caatinga fora da Amazônia Legal) e dados de déficit/excedente do **SICAR/SFB** (`https://www.car.gov.br/`). | Nacional / Bioma Caatinga / Municipal. | Ajuste textual e paramétrico para 20% no código (`COBERTURA_META_PCT = 20`) com citação expressa da Lei 12.651/2012. | Baixo | **A** |
| **M1-6** | Bloco "Cobertura do Solo — MapBiomas Coleção 9 (2023)" no Módulo I | **MapBiomas Brasil — Coleção 11** (`https://mapbiomas.org/estatisticas`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); classes LULC completas de 1985 a 2025. | Download da planilha oficial de estatísticas municipais e substituição direta das classes reais em `mapbiomas.ts`. | Baixo | **A** |
| **M1-7** | "Alertas de Desmatamento — MapBiomas Alerta" no Módulo I | **MapBiomas Alerta — Plataforma de Alertas e Relatório Anual do Desmatamento (RAD)** (`https://alerta.mapbiomas.org/`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); alertas validados 2019–2026. | Configuração da chave de autenticação da API GraphQL no servidor proxy pelo autor, OU download das planilhas anuais públicas do RAD. | Médio | **B** |
| **M1-8** | Gráfico "Biomassa por Faixa de Cobertura Arbórea" (5,2 → 26,5 t/ha) no Módulo I | Literatura científica alométrica para a Caatinga (ex.: Sampaio & Silva, 2005; Menezes et al., 2012; EMBRAPA Caprinos e Ovinos) ou Inventário Florestal Nacional do Ceará (SFB). | Regional (Caatinga do Ceará). | O autor/pesquisador do FUNDECI deve fornecer a referência bibliográfica ou equação alométrica exata adotada na pesquisa. | Médio | **B** |
| **M1-10** | Tabela "Espécies Nativas Monitoradas" no Módulo I | **Jardim Botânico do Rio de Janeiro — Flora e Funga do Brasil** (`https://floradobrasil.jbrj.gov.br/`, Acessado em: 11/10/2026) para atualização taxonômica; dados de manejo e biomassa florestal de publicações técnicas da **EMBRAPA Semiárido / SFB**. | Regional / Bioma Caatinga. | Consulta direta às bases taxonômicas públicas do JBRJ e EMBRAPA para correção dos nomes científicos e parâmetros de manejo. | Baixo | **A** |
| **M2-1** | "Sistemas Integrados 22,4% — Meta: 70%" no Módulo II | **IBGE — Censo Agropecuário 2017**: Tabela 6884 (estabelecimentos e área com Sistemas Agroflorestais - SAFs e Integração Lavoura-Pecuária-Floresta - ILPF, `https://sidra.ibge.gov.br/tabela/6884`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); ano 2017. | Consulta direta via API SIDRA do IBGE. Meta de 70% deve ser rotulada como "Meta Proposta pelo Projeto FUNDECI" ou alinhada às metas do Plano ABC+. | Baixo | **A** |
| **M2-2** | "Circularidade de Biomassa 30%" no Módulo II | Não existe indicador municipal público consolidado. Proposta de **Proxy Real:** Proporção de estabelecimentos que praticam aproveitamento de resíduos/adubação orgânica do **IBGE Censo Agropecuário 2017 (Tabela 6884)**, ou remoção da fórmula arbitrária. | Municipal (10 municípios do CE); ano 2017. | Consulta via API SIDRA do IBGE (Tabela 6884). | Médio | **C** |
| **M2-3** | "Demanda Lenha s/ Manejo 42,3k m³/ano" no Módulo II | **IBGE — PEVS Tabela 289** (Lenha extraída, categoria 3434, em $\text{m}^3$) cruzada com autorizações de Plano de Manejo Florestal Sustentável (PMFS) do **SINAFLOR / IBAMA / SEMACE** (`https://dados.gov.br/dados/conjuntos-dados/sinaflor`). | Municipal (10 municípios do CE); ano 2025 na PEVS. | A extração total é pública e imediata via API SIDRA. O volume autorizado sob manejo requer relatório de autorizações da SEMACE ou dados abertos do SINAFLOR. | Médio | **A** (para extração total PEVS) / **B** (se autor fornecer os saldos de PMFS da SEMACE) |
| **M2-4** | "Eficiência Energética 38% — Conversão" no Módulo II | Não existe medição municipal pública. Proposta de **Proxy Técnica:** Parâmetros de eficiência térmica de fogões e fornos da literatura técnica da Caatinga (Rede Biomassa da Caatinga / APNE / UFC / IPT); ou **Proxy Domiciliar:** proporção de domicílios com uso de lenha/gás no **IBGE Censo 2022**. | Regional (Caatinga) / Municipal (Censo 2022). | Revisão técnica de literatura regional ou download da tabela censitária de domicílios do Censo 2022 via SIDRA. | Médio | **C** |
| **M2-6** | Gráfico "SAFs 29,5 vs Tradicional 8,2 t/ha" e "SAFs superam em 260%" no Módulo II | Experimento de campo em Taperoá/PB (Cariri paraibano, SciELO): *"Produção de biomassa e dinâmica de nutrientes em sistemas agroflorestais no semiárido paraibano"* (Andrade et al. / Bakke et al., SciELO). | Estudo experimental de campo (Semiárido). | Consulta direta na biblioteca digital SciELO (`https://www.scielo.br/`) e inserção da citação bibliográfica completa e ressalva das espécies no card. | Baixo | **A** |
| **M2-8** | "Sistemas Produtivos" com % de adoção (18%, 12%, 8%, 5%) no Módulo II | **IBGE — Censo Agropecuário 2017**: Tabelas 6884 (práticas agropecuárias) e 6878 (utilização das terras: pastagens naturais, pastagens plantadas, matas preservadas, lavouras). | Municipal (10 municípios do CE); ano 2017. | Consulta direta via API SIDRA do IBGE e cálculo das proporções reais de uso do solo produtivo por município. | Baixo | **A** |
| **M3-1** | "Acordos de Manejo: N ativos" no Módulo III | Registros de campo do projeto **FUNDECI/2025.0016** (comunidades reais de atuação) OU cadastro oficial de Planos de Manejo Florestal Sustentável Comunitário (PMFSC) da **SEMACE / SEMA-CE**. | Municipal / Comunitário (Ceará). | O autor/equipe FUNDECI deve fornecer a lista de comunidades reais e acordos de manejo, ou solicitar a relação à SEMACE via Lei de Acesso à Informação (LAI). | Médio | **B** |
| **M3-2** | "Participação Comunitária %" no Módulo III | **Proxy Real Oficial:** Proporção de estabelecimentos cujo produtor é associado a cooperativas ou entidades de classe rural do **IBGE Censo Agropecuário 2017 (Tabela 6876)**; OU percentual de famílias participantes nas oficinas do **FUNDECI/2025.0016**. | Municipal (10 municípios do CE); ano 2017. | Consulta via API SIDRA do IBGE (Tabela 6876) para a proxy de associativismo agropecuário; ou dados de frequência das oficinas pelo autor. | Baixo | **A** (com proxy Censo Agro) |
| **M3-3** | "Recursos PSA R$ ...k anual" no Módulo III | Não existem repasses municipais públicos no CNPSA/MMA (Lei 14.119/2021). Proposta de **Proxy Real Financeira:** Repasses anuais de **ICMS Ecológico do Estado do Ceará** por município (dados da **SEFAZ-CE / IPECE / SEMA-CE**, `https://www.ipece.ce.gov.br/`, Acessado em: 11/10/2026). | Municipal (10 municípios do CE); repasses anuais consolidados. | Download de relatórios anuais de repasse do ICMS Ecológico no portal do IPECE/SEMA-CE. | Médio | **C** |
| **M3-6** | Pizza "PSA — Distribuição por Serviço" (42/25/20/13%) no Módulo III | Tipologia de Serviços Ambientais da **Lei Federal nº 14.119/2021 (Art. 3º e 4º)**: serviços de provisão, regulação, suporte e culturais. Não existem dados contábeis empíricos municipais de divisão percentual. | Conceitual / Normativo (Brasil). | Manter como modelo estrutural com rótulo explícito: *"Estrutura Teórico-Metodológica de Alocação de Serviços Ambientais (Lei 14.119/2021 / Proposta FUNDECI)"*, sem pretensão de medição contábil empírica. | Baixo | **D** |
| **M4-1** | Cards de fontes: IBGE 42 variáveis, MapBiomas 28, ANA 15, INMET 22 no Módulo IV | Metadados reais dos conectores do próprio sistema PITS (contagem real das variáveis de fato integradas: IBGE ~7, MapBiomas ~12, MapBiomas Alerta 2, INMET 3, IPEA 4). | Código e conectores da aplicação PITS. | Ajuste direto do array `fontes` em `Modulo4.tsx` para espelhar a contagem exata das variáveis e status reais das integrações. | Baixo | **A** |
| **M4-2** | Série Temporal 2019–2024 ("Cobertura", "Biomassa", "IPSE") no Módulo IV | **Cobertura:** Série histórica anual real da **Coleção 11 do MapBiomas** (1985–2025);<br>**Precipitação:** Série pluviométrica histórica do **BDMEP/INMET** ou **FUNCEME**;<br>**Biomassa e IPSE:** Recalculados ano a ano com base nas variáveis reais anuais. | Municipal (10 municípios do CE); série anual 2019–2025. | Download da planilha de série histórica do MapBiomas Col. 11 e dados de chuva da FUNCEME/BDMEP. | Médio | **A** |
| **M4-5** | "Monitoramento Participativo — Últimos Registros" no Módulo IV | Cadernos e relatórios de campo do projeto **FUNDECI/2025.0016** (vistorias e oficinas comunitárias reais). | Local / Comunitário (Ceará). | O autor/equipe de pesquisa deve fornecer os registros reais de campo realizados nos municípios do projeto; alternativamente, rotular o card como protótipo interativo para inserção comunitária. | Baixo | **B** |
| **G7** | Seções "Plano Nacional de Bioeconomia" com eixos inventados | **Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)** — Decreto Federal nº 12.044/2024, Resoluções CNBio nº 7/2025 e nº 8/2026 (`https://www.gov.br/mma/pt-br/assuntos/bioeconomia`, Acessado em: 11/10/2026). | Nacional / Federal (2024–2035). | Substituição textual dos 8 falsos eixos pela estrutura oficial de 3 eixos e 8 missões nos Módulos I a IV, com os links institucionais corretos. | Baixo | **A** |

---

## 3. Resumo Quantitativo por Classificação

| Classificação | Significado Operacional | Quantidade de Itens |
| :---: | :--- | :---: |
| **A** | Consigo obter e integrar agora (APIs abertas, planilhas públicas ou ajustes normativos diretos) | **19** |
| **B** | Existe, mas preciso que o autor baixe/forneça algo específico (credenciais restritas, dados de campo do FUNDECI ou recorte de relatórios) | **5** |
| **C** | Não existe dado municipal público consolidado (necessário indicador-proxy real fundamentado ou coleta de campo) | **4** |
| **D** | Conceito sem dado empírico municipal possível (manutenção com rótulo ilustrativo ou alinhamento teórico sem sugerir dado contábil) | **1** |
| **Total** | Total de itens auditados | **29** |

---

## 4. Guia de Ação para o Autor (Itens B e C)

### Itens B — O que o autor precisa fornecer ou providenciar:
1. **M1-2 (Estoque de Biomassa t/ha):**
   * *O que fornecer:* Definir se o projeto adotará a média fitofisionômica de biomassa aérea da Caatinga cearense extraída do Relatório do Inventário Florestal Nacional do Ceará (SFB/MMA - IFN-CE), ou se fornecerá o recorte raster zonal da coleção de biomassa do MapBiomas para os 10 municípios.
2. **M1-7 (Alertas de Desmatamento — MapBiomas Alerta):**
   * *O que fornecer:* Chave/credenciais de API para o proxy do MapBiomas Alerta (`https://alerta.mapbiomas.org/`), ou autorização para utilizar o arquivo CSV estático consolidado do Relatório Anual do Desmatamento (RAD).
3. **M1-8 (Gráfico de Biomassa por Cobertura Arbórea):**
   * *O que fornecer:* A referência bibliográfica ou a equação alométrica exata que a equipe da pesquisa FUNDECI utiliza para estimar biomassa (t/ha) a partir da cobertura vegetal nativa na Caatinga.
4. **M3-1 (Acordos Locais de Manejo):**
   * *O que fornecer:* A relação real das comunidades rurais/assentamentos atendidos pelo projeto FUNDECI/2025.0016 com seus respectivos status de acordos comunitários, substituindo as entidades genéricas fictícias ("Assentamento Aroeira", "Quilombo Serra Preta"); ou protocolo de pedido LAI à SEMACE para relação de PMFS comunitários.
5. **M4-5 (Monitoramento Participativo — Registros de Campo):**
   * *O que fornecer:* Três ou mais relatos/registros verídicos de atividades de campo realizadas pelo projeto FUNDECI nos municípios para compor o feed de monitoramento comunitário; ou autorização para rotular o componente com aviso de "Protótipo demonstrativo para submissão comunitária".

### Itens C — Proxies reais propostas para validação pelo autor:
1. **D10 (Cards agregados: Biomassa, Biodigestores e PSA no Dashboard):**
   * *Ação requerida:* Validar a adoção da proxy do IBGE Censo Agropecuário 2017 (Tabela 6884: estabelecimentos com biogás/energia alternativa) para os biodigestores, e do ICMS Ecológico do Ceará (IPECE) para recursos de conservação municipal.
2. **M2-2 (Circularidade de Biomassa):**
   * *Ação requerida:* Validar a substituição da fórmula arbitrária pelo indicador-proxy do Censo Agropecuário 2017 (Tabela 6884: proporção de estabelecimentos rurais com práticas de reciclagem de nutrientes, adubação orgânica e biofertilizantes).
3. **M2-4 (Eficiência Energética de Conversão da Biomassa):**
   * *Ação requerida:* Validar a adoção de parâmetros de eficiência térmica documentados na literatura técnica regional de fogões e fornos da Caatinga (Rede Biomassa / APNE / UFC), ou a proxy censitária de dependência de lenha nos domicílios (Censo Demográfico 2022).
4. **M3-3 (Recursos Anuais de PSA R$/ano):**
   * *Ação requerida:* Validar o uso do **ICMS Ecológico do Ceará** (dados anuais abertos IPECE/SEMA-CE) como proxy econômica de remuneração pública por serviços de conservação ambiental nos 10 municípios, ou rotular expressamente como simulação/proposta orçamentária do fundo piloto FUNDECI.
