"""
Script de commit via Dulwich (Git para Python)
Realiza stage e commit de todas as fontes reais, scripts, documentação e manifesto do PITS.
"""

import os
from dulwich import porcelain
from dulwich.repo import Repo

REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def main():
    print(f"=== REALIZANDO COMMIT GIT EM {REPO_DIR} ===")
    repo = Repo(REPO_DIR)
    
    # 1. Verificar status antes
    status_before = porcelain.status(repo)
    print("Arquivos não rastreados / pendentes:", len(status_before.untracked))
    
    # 2. Adicionar arquivos (respeitando .gitignore)
    # Adicionando arquivos individualmente ou recursivamente
    porcelain.add(repo, paths=[
        ".gitignore",
        "AUDITORIA.md",
        "docs",
        "scripts",
        "data"
    ])
    
    status_after_add = porcelain.status(repo)
    staged_adds = len(status_after_add.staged.get('add', []))
    staged_mods = len(status_after_add.staged.get('modify', []))
    print(f"Staged com sucesso: {staged_adds} adições, {staged_mods} modificações.")
    
    # Garantir que .env NUNCA seja commitado
    all_staged = status_after_add.staged.get('add', []) + status_after_add.staged.get('modify', [])
    for path_bytes in all_staged:
        path_str = path_bytes.decode('utf-8')
        if '.env' in path_str:
            raise RuntimeError(f"ERRO DE SEGURANÇA: Arquivo sensível {path_str} detectado no stage!")
    
    print("[OK] Verificação de segurança: nenhum arquivo sensível (.env) no stage.")
    
    # 3. Mensagem de commit
    commit_msg = (
        "feat(data): integracao de dados reais e auditados para os 10 municipios (PITS)\n\n"
        "- Substituicao de placeholders/mockData por fontes reais confirmadas\n"
        "- IBGE Censo 2022 (Populacao, Area, IVS proprio via carências domiciliares)\n"
        "- IBGE PEVS 2025 (Lenha extraida da silvicultura)\n"
        "- IBGE Censo Agro 2017 (SAFs, adubacao organica, solar, associativismo, ATER)\n"
        "- MapBiomas Colecao 11 (Cobertura vegetal nativa 1985-2025)\n"
        "- MapBiomas Alerta v2 (Alertas validados e area desmatada via API GraphQL)\n"
        "- SFB / IFN-CE e Sampaio & Silva (2005) (Estoque e densidade de biomassa)\n"
        "- INMET (Pluviometria BDMEP 2024 e Normais Climatologicas 1991-2020)\n"
        "- IPECE (IQM 2026 e rateio do ICMS Socioambiental)\n"
        "- Flora e Funga do Brasil / GBIF (Nomenclatura taxonomica oficial)\n"
        "- Manifesto de proveniencia em data/MANIFEST.json com hashes SHA-256\n"
        "- Auditoria de conformidade em docs/VERIFICACAO.md (100% MATCH em 53 testes vivos)"
    )
    
    author = b"Hamilton <hamiltonn38-hub@users.noreply.github.com>"
    
    commit_sha = porcelain.commit(
        repo,
        message=commit_msg.encode('utf-8'),
        author=author,
        committer=author
    )
    
    commit_hash_str = commit_sha.decode('utf-8') if isinstance(commit_sha, bytes) else commit_sha
    print(f"\n[SUCESSO] Commit realizado com sucesso!")
    print(f"Hash do Commit: {commit_hash_str}")
    
    # 4. Status final
    status_final = porcelain.status(repo)
    print("Staged restante:", status_final.staged)
    print("Unstaged restante:", status_final.unstaged)

if __name__ == "__main__":
    main()
