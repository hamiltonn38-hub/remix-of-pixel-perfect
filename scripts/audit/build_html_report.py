#!/usr/bin/env python3
"""
Converte docs/relatorio/RELATORIO_AUDITORIA_v2.md em HTML profissional
com suporte a impressão A4, paginação, índice clicável e tabelas estilizadas.
"""

import os
import re
import html

def md_to_html(text):
    # Proteção de blocos de código
    code_blocks = []
    def save_code_block(match):
        lang = match.group(1) or ""
        code = match.group(2)
        idx = len(code_blocks)
        code_blocks.append((lang, code))
        return f"<!--CODE_BLOCK_{idx}-->"
    text = re.sub(r"```([a-zA-Z0-9_\-]*)\n(.*?)```", save_code_block, text, flags=re.DOTALL)

    # Proteção de tabelas
    tables = []
    lines = text.split("\n")
    new_lines = []
    in_table = False
    table_lines = []

    for line in lines:
        if line.strip().startswith("|") and line.strip().endswith("|"):
            in_table = True
            table_lines.append(line.strip())
        else:
            if in_table:
                # Processa tabela acumulada
                idx = len(tables)
                tables.append(table_lines)
                new_lines.append(f"<!--TABLE_{idx}-->")
                in_table = False
                table_lines = []
            new_lines.append(line)
    if in_table:
        idx = len(tables)
        tables.append(table_lines)
        new_lines.append(f"<!--TABLE_{idx}-->")

    text = "\n".join(new_lines)

    # Processa cabeçalhos
    headers_toc = []
    def parse_header(match):
        hashes = match.group(1)
        level = len(hashes)
        title = match.group(2).strip()
        slug = re.sub(r"[^a-zA-Z0-9_\-]", "", title.lower().replace(" ", "-"))
        headers_toc.append((level, title, slug))
        return f"<h{level} id='{slug}'>{title}</h{level}>"
    text = re.sub(r"^(#{1,6})\s+(.+)$", parse_header, text, flags=re.MULTILINE)

    # Processa alertas GitHub (> [!WARNING], > [!NOTE], etc.)
    def parse_alert(match):
        alert_type = match.group(1).upper()
        content = match.group(2).strip()
        css_class = "alert-note"
        icon = "ℹ️"
        if alert_type == "WARNING":
            css_class = "alert-warning"
            icon = "⚠️"
        elif alert_type in ["IMPORTANT", "CAUTION"]:
            css_class = "alert-important"
            icon = "🚨"
        elif alert_type == "TIP":
            css_class = "alert-tip"
            icon = "💡"
        return f"<div class='alert {css_class}'><div class='alert-icon'>{icon} {alert_type}</div><div class='alert-body'>{content}</div></div>"
    text = re.sub(r"^>\s*\[!([A-Z]+)\]\s*\n((?:>.*\n?)+)", lambda m: parse_alert(re.match(r"> \[!([A-Z]+)\]\s*\n((?:>.*\n?)+)", m.group(0))), text, flags=re.MULTILINE)

    # Citações simples (> ...)
    def parse_blockquote(match):
        bq_lines = [l.lstrip("> ").strip() for l in match.group(0).split("\n") if l.strip()]
        return f"<blockquote>{' '.join(bq_lines)}</blockquote>"
    text = re.sub(r"^(?:> [^\n]+\n?)+", parse_blockquote, text, flags=re.MULTILINE)

    # Listas
    def parse_lists(t):
        lines = t.split("\n")
        out = []
        in_ul = False
        in_ol = False
        for l in lines:
            if re.match(r"^\s*-\s+(.+)$", l):
                if not in_ul:
                    out.append("<ul>")
                    in_ul = True
                m = re.match(r"^\s*-\s+(.+)$", l)
                out.append(f"<li>{m.group(1)}</li>")
            elif re.match(r"^\s*\d+\.\s+(.+)$", l):
                if not in_ol:
                    out.append("<ol>")
                    in_ol = True
                m = re.match(r"^\s*\d+\.\s+(.+)$", l)
                out.append(f"<li>{m.group(1)}</li>")
            else:
                if in_ul:
                    out.append("</ul>")
                    in_ul = False
                if in_ol:
                    out.append("</ol>")
                    in_ol = False
                out.append(l)
        if in_ul: out.append("</ul>")
        if in_ol: out.append("</ol>")
        return "\n".join(out)
    text = parse_lists(text)

    # Negrito e Itálico
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)

    # Links
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"<a href='\2' target='_blank' rel='noopener noreferrer'>\1</a>", text)

    # Divisores
    text = re.sub(r"^---+$", r"<hr/>", text, flags=re.MULTILINE)

    # Parágrafos
    paragraphs = text.split("\n\n")
    processed_p = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith(("<h", "<div", "<table", "<ul", "<ol", "<hr", "<!--", "<blockquote")):
            processed_p.append(p)
        else:
            processed_p.append(f"<p>{p.replace(chr(10), '<br/>')}</p>")
    text = "\n\n".join(processed_p)

    # Restaura tabelas
    for idx, t_lines in enumerate(tables):
        if len(t_lines) < 2:
            table_html = "<p>" + "<br/>".join(t_lines) + "</p>"
        else:
            headers = [c.strip() for c in t_lines[0].split("|")[1:-1]]
            rows = []
            for r in t_lines[2:]:
                cells = [c.strip() for c in r.split("|")[1:-1]]
                rows.append(cells)

            th_html = "".join(f"<th>{h}</th>" for h in headers)
            tr_html = []
            for row in rows:
                tds = []
                for cell in row:
                    # Badges automáticos de status
                    if cell in ["VERIFICADO", "CONFIRMADO", "MATCH"]:
                        badge = f"<span class='badge badge-success'>{cell}</span>"
                    elif cell in ["RECALCULADO", "RESOLVIDO"]:
                        badge = f"<span class='badge badge-info'>{cell}</span>"
                    elif cell in ["PROXY", "PARCIAL", "ALTA", "MÉDIA"]:
                        badge = f"<span class='badge badge-warning'>{cell}</span>"
                    elif cell in ["INCORRETO", "CRÍTICA", "NÃO RESOLVIDO"]:
                        badge = f"<span class='badge badge-danger'>{cell}</span>"
                    elif cell in ["NÃO VERIFICADO", "Dados indisponíveis"]:
                        badge = f"<span class='badge badge-muted'>{cell}</span>"
                    else:
                        badge = cell
                    tds.append(f"<td>{badge}</td>")
                tr_html.append("<tr>" + "".join(tds) + "</tr>")

            table_html = f"<div class='table-container'><table><thead><tr>{th_html}</tr></thead><tbody>{''.join(tr_html)}</tbody></table></div>"
        text = text.replace(f"<!--TABLE_{idx}-->", table_html)

    # Restaura blocos de código
    for idx, (lang, code) in enumerate(code_blocks):
        escaped_code = html.escape(code)
        block_html = f"<pre><code class='language-{lang}'>{escaped_code}</code></pre>"
        text = text.replace(f"<!--CODE_BLOCK_{idx}-->", block_html)

    return text, headers_toc

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    md_file = os.path.join(root, "docs", "relatorio", "RELATORIO_AUDITORIA_v2.md")
    html_file = os.path.join(root, "docs", "relatorio", "RELATORIO_AUDITORIA_v2.html")

    with open(md_file, "r", encoding="utf-8") as f:
        md_content = f.read()

    body_html, toc = md_to_html(md_content)

    toc_html = "<div class='toc'><h3>Sumário Executivo da Auditoria</h3><ul>"
    for level, title, slug in toc:
        if level <= 3:
            indent = (level - 1) * 16
            toc_html += f"<li style='margin-left:{indent}px'><a href='#{slug}'>{title}</a></li>"
    toc_html += "</ul></div>"

    html_template = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório de Auditoria e Fundamentação Técnica Completa da PITS (v2)</title>
  <!-- KaTeX para renderização de fórmulas matemáticas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
  <style>
    :root {{
      --primary: #8B5E3C;
      --secondary: #4A7C59;
      --text: #2C2416;
      --bg: #FFFFFF;
      --card-bg: #FAF9F6;
      --border: #E5E0D8;
      --accent: #D4A373;
      --success: #2E7D32;
      --warning: #ED6C02;
      --danger: #D32F2F;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: #F4F1EA;
      margin: 0;
      padding: 0;
    }}
    .document-wrapper {{
      max-width: 980px;
      margin: 30px auto;
      background: var(--bg);
      padding: 50px 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 8px;
    }}
    h1 {{
      font-size: 26px;
      color: var(--primary);
      border-bottom: 2px solid var(--primary);
      padding-bottom: 8px;
      margin-top: 36px;
    }}
    h2 {{
      font-size: 20px;
      color: var(--secondary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 6px;
      margin-top: 28px;
    }}
    h3 {{
      font-size: 16px;
      color: var(--text);
      margin-top: 22px;
    }}
    h4 {{
      font-size: 14px;
      color: var(--primary);
      margin-top: 16px;
    }}
    p, li {{
      font-size: 14px;
      color: #333333;
    }}
    a {{
      color: var(--secondary);
      text-decoration: none;
    }}
    a:hover {{
      text-decoration: underline;
    }}
    .toc {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px 30px;
      margin-bottom: 35px;
    }}
    .toc h3 {{
      margin-top: 0;
      color: var(--primary);
      font-size: 16px;
    }}
    .toc ul {{
      list-style: none;
      padding-left: 0;
      margin: 0;
    }}
    .toc li {{
      margin-bottom: 6px;
      font-size: 13px;
    }}
    .table-container {{
      overflow-x: auto;
      margin: 18px 0;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin: 10px 0;
    }}
    th, td {{
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }}
    th {{
      background-color: #EFEBE4;
      color: var(--text);
      font-weight: 600;
    }}
    tr:nth-child(even) {{
      background-color: #FAF8F5;
    }}
    .badge {{
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
    }}
    .badge-success {{ background: #E8F5E9; color: var(--success); border: 1px solid #C8E6C9; }}
    .badge-info {{ background: #E3F2FD; color: #1565C0; border: 1px solid #BBDEFB; }}
    .badge-warning {{ background: #FFF3E0; color: var(--warning); border: 1px solid #FFE0B2; }}
    .badge-danger {{ background: #FFEBEE; color: var(--danger); border: 1px solid #FFCDD2; }}
    .badge-muted {{ background: #EEEEEE; color: #666666; border: 1px solid #E0E0E0; }}
    .alert {{
      border-radius: 6px;
      padding: 14px 18px;
      margin: 18px 0;
      font-size: 13px;
      border-left: 5px solid;
    }}
    .alert-warning {{ background: #FFF9E6; border-color: #FFB300; color: #8A6D3B; }}
    .alert-note {{ background: #F0F7FF; border-color: #1976D2; color: #1E4620; }}
    .alert-important {{ background: #FBE9E7; border-color: #D84315; color: #BF360C; }}
    .alert-icon {{ font-weight: bold; margin-bottom: 4px; }}
    pre {{
      background: #2D2A2E;
      color: #FCFCFA;
      padding: 14px 18px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 12px;
      font-family: Consolas, Monaco, "Courier New", monospace;
    }}
    code {{
      font-family: Consolas, Monaco, monospace;
      font-size: 12.5px;
      background: rgba(0,0,0,0.05);
      padding: 1px 4px;
      border-radius: 3px;
    }}
    pre code {{
      background: none;
      padding: 0;
    }}
    blockquote {{
      border-left: 4px solid var(--accent);
      margin: 16px 0;
      padding-left: 16px;
      font-style: italic;
      color: #555;
    }}
    @media print {{
      @page {{
        size: A4;
        margin: 20mm 15mm 20mm 15mm;
      }}
      body {{
        background: #FFFFFF;
      }}
      .document-wrapper {{
        box-shadow: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }}
      h1 {{
        page-break-before: always;
      }}
      h1:first-of-type {{
        page-break-before: avoid;
      }}
      tr, pre, blockquote, .alert {{
        page-break-inside: avoid;
      }}
    }}
  </style>
</head>
<body>
  <div class="document-wrapper">
    {toc_html}
    {body_html}
  </div>
</body>
</html>
"""

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_template)

    print(f"HTML diagramado para impressao gerado com sucesso em: {html_file}")

if __name__ == "__main__":
    main()
