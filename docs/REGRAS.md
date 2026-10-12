# REGRAS DE AUTOMAÇÃO (PITS)
1. Proibido inventar número, fonte, citação, autor, nome ou código. Todo valor exibido vem de arquivo/API com fonte, tabela/variável, ano e data de consulta. Valor de memória não vale.
2. Hierarquia para cada item: (a) dado real; (b) dado real alternativo ou proxy, com nome que diga exatamente o que mede; (c) "Dados indisponíveis" / estado vazio; (d) rótulo "Ilustrativo" só para conceito qualitativo; (e) remover só se o item não for central (central = IPSE, ranking, mapa, dashboard, simulador, relatórios).
3. Autonomia: tente você mesmo todas as rotas (API, download por script, SIDRA/agregados do IBGE, busca na web, navegador). Registre cada tentativa. Só depois de 2 rotas DIFERENTES falharem, registre o item em docs/PENDENCIAS_MANUAIS.md com passo a passo exato (URL, onde clicar, nome do arquivo, pasta de destino) e CONTINUE com o resto. Nunca bloqueie.
4. Proveniência: data/MANIFEST.json com, para cada variável/município: valor, unidade, ano, instituição, tabela/variável, URL, data de consulta e hash do arquivo bruto.
5. Falha de API = "Dados indisponíveis", nunca zero nem fallback silencioso para mock.
6. Nome da plataforma: "Plataforma de Inteligência Territorial Socioenergética" (PITS), em tudo.
7. Nomes fiéis ao que o dado mede (ex.: o IQM do ICMS-CE mede gestão de resíduos sólidos; não é PSA nem conservação).
8. Decisões padrão: IVS próprio (Eq. 4 do artigo) a partir de variáveis reais do Censo 2022 (água, esgoto, energia, renda); IVS-IPEA só como comparação, com o ano exibido, se houver dado municipal. Meta de 20% = referência legal da Reserva Legal por imóvel (Lei 12.651/2012, art. 12, II), não meta municipal. Cobertura arbórea ≠ vegetação nativa: usar uma só métrica por card, nomeada corretamente.
9. Cada fase termina com build e testes, e resposta curta: IDs resolvidos / pendentes (com motivo) / arquivos alterados.
