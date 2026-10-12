import { usePits } from "@/context/PitsContext";
import { Users, Coins, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Scale } from "lucide-react";
import { PitsPieChart } from "@/components/charts/PitsCharts";

const psaDistribuicaoTipologia = [
  { nome: "Conservação da Vegetação Nativa", valor: 40, cor: "hsl(var(--secondary))" },
  { nome: "Proteção de Recursos Hídricos", valor: 25, cor: "hsl(var(--hydro))" },
  { nome: "Sequestro de Carbono e Manejo", valor: 20, cor: "hsl(var(--primary))" },
  { nome: "Biodiversidade e Polinizadores", valor: 15, cor: "hsl(var(--accent))" },
];

const ostromPrincipios = [
  { numero: 1, nome: "Limites claramente definidos dos recursos e usuários", foco: "Delimitação dos territórios comunitários" },
  { numero: 2, nome: "Congruência entre regras de apropriação e condições locais", foco: "Respeito aos ciclos de estiagem da Caatinga" },
  { numero: 3, nome: "Arranjos de escolha coletiva participativos", foco: "Assembleias e consultas prévias" },
  { numero: 4, nome: "Monitoramento comunitário das regras e estoques", foco: "Fiscalização participativa de queimadas e corte" },
  { numero: 5, nome: "Sanções graduadas para infrações", foco: "Advertências e mediação comunitária" },
  { numero: 6, nome: "Mecanismos acessíveis de resolução de conflitos", foco: "Comitês locais e mediação de vizinhança" },
  { numero: 7, nome: "Reconhecimento mínimo de direitos de auto-organização", foco: "Validação institucional pelo poder público" },
  { numero: 8, nome: "Empresas aninhadas (governança em múltiplos níveis)", foco: "Articulação município-estado-comunidade" },
];

export default function Modulo3() {
  const { selectedMunicipio: m } = usePits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo III — Governança Participativa</h1>
        <p className="text-sm text-muted-foreground">
          Instrumentos de governança territorial multiescalar e arranjos institucionais — Ostrom (1990)
        </p>
      </div>

      {/* Indicadores Auditados de Governança */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Índice de Governança (IGL)</p>
          <p className="pits-metric text-xl mt-1">{m.IGL.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">IQM e Associativismo</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">ICMS Socioambiental (IQM)</p>
          <p className="pits-metric text-xl mt-1">{m.iqm_residuos.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Gestão Resíduos (SEMA 2026)</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Acordos de Manejo FUNDECI</p>
          <p className="text-sm font-semibold text-muted-foreground mt-2 italic">Dados indisponíveis</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Em estruturação (Regra 2c)</p>
        </div>
        <div className="pits-card text-center">
          <p className="pits-label text-[11px]">Plano Municipal Socioambiental</p>
          <span className="inline-block mt-2 px-3 py-1 bg-secondary/15 text-secondary text-xs font-medium rounded-full">
            Em estruturação
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Framework HAMILTON</p>
        </div>
      </div>

      {/* Tabela de Acordos de Manejo — Estado Vazio Conforme Regra 2c */}
      <div className="pits-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="pits-section-title">Acordos Comunitários de Manejo e Conservação</h2>
            <p className="text-xs text-muted-foreground">
              Cadastro de áreas sob compromisso formal de manejo sustentável da Caatinga
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-muted text-muted-foreground">
            Status: Dados indisponíveis (Regra 2c)
          </span>
        </div>

        <div className="p-8 border border-dashed border-border rounded-xl text-center bg-muted/10 space-y-2">
          <ShieldCheck size={32} className="mx-auto text-muted-foreground/60" />
          <h3 className="text-sm font-semibold text-foreground">
            Nenhum acordo formalizado registrado em base pública no momento
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Conforme documentado em <code>docs/PENDENCIAS_MANUAIS.md</code> e <code>REGRAS.md</code>, o projeto <strong>FUNDECI/2025.0016</strong> encontra-se em fase de estruturação metodológica no território de {m.municipio}. Para preservar a estrita veracidade dos dados, não são exibidas comunidades fictícias.
          </p>
        </div>
      </div>

      {/* Estrutura Metodológica de Alocação de PSA (Lei 14.119/2021) */}
      <div className="pits-card">
        <div className="flex items-center gap-2 mb-2">
          <Coins size={18} className="text-primary" />
          <h2 className="pits-section-title">
            Estrutura Teórico-Metodológica de Alocação de Serviços Ambientais
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Tipologia conceitual de modalidades de Serviços Ambientais prevista nos Arts. 3º e 4º da <strong>Lei Federal nº 14.119/2021 (Política Nacional de Pagamento por Serviços Ambientais - PNPSA)</strong> para orientar fundos territoriais na Caatinga.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <PitsPieChart
            data={psaDistribuicaoTipologia}
            dataKey="valor"
            nameKey="nome"
            height={240}
          />
          <div className="space-y-2 text-xs">
            {psaDistribuicaoTipologia.map((item) => (
              <div key={item.nome} className="p-2.5 bg-muted/30 rounded-lg flex items-center justify-between border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.cor }} />
                  <span className="font-medium">{item.nome}</span>
                </div>
                <span className="font-mono font-bold">{item.valor}% sugerido</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Princípios de Ostrom para Gestão dos Bens Comuns */}
      <div className="pits-card">
        <div className="flex items-center gap-2 mb-2">
          <Scale size={18} className="text-primary" />
          <h2 className="pits-section-title">
            Princípios de Ostrom (1990) para Governança de Recursos Comuns
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Framework referencial de Elinor Ostrom (Prêmio Nobel de Economia de 2009) para a autogestão sustentável de recursos de uso comum (<em>common-pool resources</em>) no semiárido.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ostromPrincipios.map((p) => (
            <div key={p.numero} className="p-3 bg-muted/30 rounded-lg border border-border/40 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  #{p.numero}
                </span>
                <h4 className="text-xs font-semibold leading-tight">{p.nome}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground pl-7">{p.foco}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alinhamento ao PNDBio */}
      <div className="pits-card border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Users size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia — Governança</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024, Eixo 1) fomenta a governança compartilhada e o protagonismo de povos e comunidades tradicionais e agricultores familiares na gestão dos ativos da sociobiodiversidade.
        </p>
        <div className="flex gap-3">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio
          </a>
          <a
            href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14119.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Lei Federal nº 14.119/2021 (PNPSA)
          </a>
        </div>
      </div>
    </div>
  );
}
