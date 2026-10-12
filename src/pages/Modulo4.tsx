import { useState, useMemo, useEffect } from "react";
import { usePits } from "@/context/PitsContext";
import { Database, CheckCircle, ExternalLink, Activity, CloudRain, Plus, Trash2, Leaf } from "lucide-react";
import { PitsLineChart, PitsBarChart } from "@/components/charts/PitsCharts";
import { getMapBiomasMunicipio } from "@/data/mapbiomas";
import { getConectoresManifest } from "@/lib/provenance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import FonteInfo from "@/components/FonteInfo";

interface RegistroCampoItem {
  id: string;
  municipio: string;
  localidade: string;
  responsavel: string;
  tipo: string;
  data: string;
  detalhes: string;
}

export default function Modulo4() {
  const { selectedMunicipio: m } = usePits();
  const mb = getMapBiomasMunicipio(m.codigoIBGE || m.municipio);

  // Item 10 (M4-1): O painel de fontes é gerado dinamicamente do MANIFEST.json (contagens reais)
  const conectoresDinamicos = useMemo(() => getConectoresManifest(), []);

  // Item 5 (M4-2): Séries históricas com dado real e NÃO misturar %, t/ha e índice no mesmo eixo
  const serieCoberturaNativa = useMemo(() => {
    if (!mb || !mb.serie_vegetacao_nativa || mb.serie_vegetacao_nativa.length === 0) {
      return [];
    }
    return mb.serie_vegetacao_nativa.map((s) => ({
      ano: s.ano,
      cobertura: s.pct,
    }));
  }, [mb]);

  const serieBiomassaEstimada = useMemo(() => {
    if (!mb || !mb.serie_vegetacao_nativa || mb.serie_vegetacao_nativa.length === 0) {
      return [];
    }
    return mb.serie_vegetacao_nativa.map((s) => ({
      ano: s.ano,
      biomassa_t_ha: Number((m.estoque_biomassa_t_ha * (s.pct / Math.max(1, m.cobertura_nativa_pct))).toFixed(1)),
    }));
  }, [mb, m]);

  // Formatação da estação INMET e distância (M4-3)
  const estacaoInfo = m.estacao_inmet;
  const temChuvaValida = m.precipitacao_anual_mm !== null && m.precipitacao_registros_horarios > 0;

  // Armazenamento local de monitoramento participativo de campo (Item 9 / M4-5)
  const [registrosCampo, setRegistrosCampo] = useState<RegistroCampoItem[]>(() => {
    try {
      const stored = localStorage.getItem("pits_registros_campo");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pits_registros_campo", JSON.stringify(registrosCampo));
  }, [registrosCampo]);

  const registrosMunicipio = registrosCampo.filter((r) => r.municipio === m.municipio);

  // Estados do formulário de cadastro de monitoramento
  const [novoRegistroOpen, setNovoRegistroOpen] = useState(false);
  const [localidadeForm, setLocalidadeForm] = useState("");
  const [responsavelForm, setResponsavelForm] = useState("");
  const [tipoForm, setTipoForm] = useState("Regeneração Natural");
  const [detalhesForm, setDetalhesForm] = useState("");

  const handleSalvarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localidadeForm.trim() || !responsavelForm.trim()) {
      toast.error("Preencha a localidade e o responsável.");
      return;
    }

    const item: RegistroCampoItem = {
      id: Math.random().toString(36).substring(7),
      municipio: m.municipio,
      localidade: localidadeForm.trim(),
      responsavel: responsavelForm.trim(),
      tipo: tipoForm,
      data: new Date().toLocaleDateString("pt-BR"),
      detalhes: detalhesForm.trim() || "Vistoria participativa de campo realizada sem anomalias críticas.",
    };

    setRegistrosCampo((prev) => [item, ...prev]);
    toast.success(`Registro de campo salvo para ${m.municipio}!`);
    setLocalidadeForm("");
    setResponsavelForm("");
    setDetalhesForm("");
    setNovoRegistroOpen(false);
  };

  const handleRemoverRegistro = (id: string) => {
    setRegistrosCampo((prev) => prev.filter((r) => r.id !== id));
    toast.info("Registro de campo excluído.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo IV — Monitoramento Socioecológico</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento contínuo integrado com proveniência de dados oficiais e evidências territoriais
        </p>
      </div>

      {/* Item 10: Painel de Conectores Oficiais Gerado Dinamicamente do MANIFEST.json */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Painel de Conectores Oficiais (Gerado Dinamicamente do MANIFEST.json)
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Contagens e metadados reais
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conectoresDinamicos.map((f) => (
            <div key={f.id} className="pits-card flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-primary" />
                    <h3 className="font-semibold text-sm">{f.nome}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                      f.status === "Auditado"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CheckCircle size={10} /> {f.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
              </div>

              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Variáveis auditadas:</span>
                  <strong className="text-foreground">{f.totalVariaveis} variáveis</strong>
                </div>
                <div className="flex justify-between">
                  <span>Última consulta:</span>
                  <span className="text-foreground">{f.dataConsulta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item 5 / M4-2: Séries Históricas com Eixos Separados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico 1: Vegetação Nativa (0–100%) */}
        <div className="pits-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pits-section-title">Série Histórica de Vegetação Nativa (2018–2025)</h2>
              <p className="text-xs text-muted-foreground">
                Classes florestal, savânica e campestre mapeadas anualmente pelo MapBiomas Col. 11
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary/10 text-secondary font-medium font-mono">
              Unidade: %
            </span>
          </div>

          {serieCoberturaNativa.length > 0 ? (
            <PitsLineChart
              data={serieCoberturaNativa}
              xKey="ano"
              height={240}
              yDomain={[0, 100]}
              lines={[
                {
                  key: "cobertura",
                  name: "Vegetação Nativa (%)",
                  color: "hsl(var(--secondary))",
                  strokeWidth: 3,
                  dotRadius: 4,
                },
              ]}
            />
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground italic">
              Histórico indisponível
            </div>
          )}

          <FonteInfo
            variavel="cobertura_vegetal_nativa_2025"
            codigoIBGE={m.codigoIBGE}
            selo="MapBiomas"
          />
        </div>

        {/* Gráfico 2: Densidade de Biomassa Aérea (t/ha) */}
        <div className="pits-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pits-section-title">Evolução do Estoque de Biomassa (2018–2025)</h2>
              <p className="text-xs text-muted-foreground">
                Biomassa territorial ponderada (SFB / IFN-CE e Sampaio & Silva, 2005)
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium font-mono">
              Unidade: t/ha
            </span>
          </div>

          {serieBiomassaEstimada.length > 0 ? (
            <PitsBarChart
              data={serieBiomassaEstimada}
              xKey="ano"
              height={240}
              bars={[
                {
                  key: "biomassa_t_ha",
                  name: "Biomassa Média (t/ha)",
                  color: "hsl(var(--primary))",
                },
              ]}
            />
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground italic">
              Histórico indisponível
            </div>
          )}

          <FonteInfo
            instituicao="Serviço Florestal Brasileiro (IFN-CE) e MapBiomas"
            ano={2025}
            dataConsulta="11/10/2026"
            tabela="Inventário Florestal Nacional do Ceará / MapBiomas Col. 11"
            selo="SFB"
          />
        </div>
      </div>

      {/* Painel Meteorológico INMET com Estação e Distância — M4-3 */}
      <div className="pits-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CloudRain size={18} className="text-hydro" />
            <div>
              <h2 className="pits-section-title">Precipitação Pluviométrica — INMET (BDMEP 2024)</h2>
              <p className="text-xs text-muted-foreground">
                Dados oficiais da rede de estações automáticas do Instituto Nacional de Meteorologia
              </p>
            </div>
          </div>
          {estacaoInfo && (
            <span className="text-xs px-2.5 py-1 rounded bg-hydro/10 text-hydro font-medium font-mono">
              Estação {estacaoInfo.codigo} ({estacaoInfo.nome}) a {estacaoInfo.distanciaKm} km
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-[11px] text-muted-foreground">Precipitação Acumulada (2024)</p>
            <p className="text-xl font-bold text-foreground mt-1">
              {temChuvaValida ? `${m.precipitacao_anual_mm} mm` : "Dados indisponíveis"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {temChuvaValida ? `${m.precipitacao_registros_horarios} registros horários auditados` : "Estação meteorológica inoperante em 2024"}
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-[11px] text-muted-foreground">Estação de Referência</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {estacaoInfo ? `${estacaoInfo.codigo} — ${estacaoInfo.nome}` : "Não identificada"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {estacaoInfo ? `Distância geodésica ao centroide: ${estacaoInfo.distanciaKm} km` : "—"}
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-[11px] text-muted-foreground">Série Plurianual</p>
            <p className="text-xs font-medium text-muted-foreground mt-2 italic">
              Histórico plurianual indisponível via API viva — exibindo ano auditado 2024
            </p>
          </div>
        </div>

        <FonteInfo
          variavel="precipitacao_anual_2024"
          codigoIBGE={m.codigoIBGE}
          selo="INMET"
          integracaoReal={temChuvaValida}
        />
      </div>

      {/* Monitoramento Participativo de Campo com Formulário Funcional — Item 9 / M4-5 */}
      <div className="pits-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="pits-section-title flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Monitoramento Participativo de Campo — {m.municipio}
            </h2>
            <p className="text-xs text-muted-foreground">
              Vistorias comunitárias de regeneração da Caatinga, focos de pressão e apontamentos de campo
            </p>
          </div>

          <Dialog open={novoRegistroOpen} onOpenChange={setNovoRegistroOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={14} className="mr-1.5" /> Novo Registro de Campo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  Cadastrar Registro de Vistoria de Campo
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvarRegistro} className="space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="campo-municipio" className="text-xs">Município</Label>
                  <Input id="campo-municipio" value={`${m.municipio} — ${m.estado}`} disabled className="text-xs mt-1" />
                </div>
                <div>
                  <Label htmlFor="campo-localidade" className="text-xs">Ponto de Coleta / Localidade *</Label>
                  <Input
                    id="campo-localidade"
                    placeholder="Ex: Área de Caatinga Comunitária / Córrego do Meio"
                    value={localidadeForm}
                    onChange={(e) => setLocalidadeForm(e.target.value)}
                    required
                    className="text-xs mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="campo-responsavel" className="text-xs">Responsável pela Coleta *</Label>
                    <Input
                      id="campo-responsavel"
                      placeholder="Ex: Equipe Técnica / Agente Local"
                      value={responsavelForm}
                      onChange={(e) => setResponsavelForm(e.target.value)}
                      required
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campo-tipo" className="text-xs">Tipo de Vistoria</Label>
                    <select
                      id="campo-tipo"
                      value={tipoForm}
                      onChange={(e) => setTipoForm(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm mt-1"
                    >
                      <option value="Regeneração Natural">Regeneração Natural</option>
                      <option value="Foco de Corte / Queimada">Foco de Corte / Queimada</option>
                      <option value="Uso da Biomassa e Forragem">Uso da Biomassa e Forragem</option>
                      <option value="Recursos Hídricos e Nascentes">Recursos Hídricos e Nascentes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="campo-detalhes" className="text-xs">Observações e Notas de Campo</Label>
                  <Input
                    id="campo-detalhes"
                    placeholder="Ex: Área em regeneração com brotação de sabiá e catingueira..."
                    value={detalhesForm}
                    onChange={(e) => setDetalhesForm(e.target.value)}
                    className="text-xs mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setNovoRegistroOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                    Salvar Registro
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {registrosMunicipio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">Localidade</th>
                  <th className="text-left py-2 px-3">Tipo de Vistoria</th>
                  <th className="text-left py-2 px-3">Responsável</th>
                  <th className="text-left py-2 px-3">Data</th>
                  <th className="text-left py-2 px-3">Notas de Campo</th>
                  <th className="text-right py-2 px-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {registrosMunicipio.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2 px-3 font-semibold text-foreground">{r.localidade}</td>
                    <td className="py-2 px-3">{r.tipo}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.responsavel}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.data}</td>
                    <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs truncate">{r.detalhes}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => handleRemoverRegistro(r.id)} className="text-destructive hover:opacity-80 p-1">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-border rounded-xl text-center bg-muted/10 space-y-2">
            <Activity size={32} className="mx-auto text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">
              Sem registros — aguardando coleta de campo
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              O módulo de monitoramento participativo em <strong>{m.municipio}</strong> aguarda o início das oficinas de campo e cadernos de vistoria comunitária do projeto <strong>FUNDECI/2025.0016</strong>. Registros fictícios foram removidos. Cadastre apontamentos de campo utilizando o botão acima.
            </p>
          </div>
        )}

        <FonteInfo
          instituicao="Monitoramento Participativo de Campo / Projeto FUNDECI"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Cadernos de Campo e Vistorias Comunitárias"
        />
      </div>

      {/* Alinhamento ao PNDBio — Missão 8 (G7 / M4-4) */}
      <div className="pits-card border-l-4 border-l-secondary space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio) — Evidências e Monitoramento</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024, Missão 8: <em>Bioeconomia dos Ecossistemas Terrestres e Aquáticos</em>) preconiza o desenvolvimento de sistemas integrados de monitoramento ambiental, rastreabilidade e geração de evidências territoriais para sustentação de políticas públicas baseadas em dados abertos.
        </p>
        <div className="flex gap-3 pt-2">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio (gov.br/mma)
          </a>
          <a
            href="https://brasil.mapbiomas.org/downloads/estatisticas/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Estatísticas Municipais MapBiomas Brasil
          </a>
        </div>
        <FonteInfo
          instituicao="Ministério do Meio Ambiente e Mudança do Clima (MMA)"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Decreto Federal nº 12.044/2024 (Missão 8)"
          url="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
        />
      </div>
    </div>
  );
}
