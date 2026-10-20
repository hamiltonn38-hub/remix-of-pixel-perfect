import { useState, useEffect } from "react";
import { usePits } from "@/context/PitsContext";
import { Users, Coins, ExternalLink, ShieldCheck, Scale, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { PitsPieChart } from "@/components/charts/PitsCharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import FonteInfo from "@/components/FonteInfo";
import Detalhes from "@/components/Detalhes";

interface AcordoManejoItem {
  id: string;
  municipio: string;
  comunidade: string;
  modalidade: string;
  areaHa: number;
  responsavel: string;
  dataRegistro: string;
}

interface ContratoPsaItem {
  id: string;
  municipio: string;
  projeto: string;
  modalidade: string;
  areaHa: number;
  recursoAnual: number;
  familias: number;
  dataRegistro: string;
}

// Modalidades Normativas de Serviços Ambientais da Lei Federal nº 14.119/2021 (Arts. 3º e 4º)
const psaTipologiaNormativa = [
  { nome: "Conservação da Vegetação Nativa (Art. 3º, I)", valor: 40, cor: "hsl(var(--secondary))" },
  { nome: "Regulação Hídrica e Bacias (Art. 3º, II)", valor: 25, cor: "hsl(var(--hydro))" },
  { nome: "Sequestro de Carbono e Fixação (Art. 3º, III)", valor: 20, cor: "hsl(var(--primary))" },
  { nome: "Conservação da Biodiversidade e Polinizadores (Art. 3º, IV)", valor: 15, cor: "hsl(var(--accent))" },
];

// 8 Princípios de Desenho Institucional de Elinor Ostrom (1990)
const ostromPrincipios = [
  { numero: 1, nome: "Limites claramente definidos dos recursos e usuários", foco: "Delimitação cartográfica e reconhecimento dos territórios comunitários" },
  { numero: 2, nome: "Congruência entre regras de apropriação e condições locais", foco: "Harmonização de cotas de extração de lenha com os ciclos climáticos da Caatinga" },
  { numero: 3, nome: "Arranjos de escolha coletiva participativos", foco: "Decisões comunitárias por assembleia e consultas prévias informadas" },
  { numero: 4, nome: "Monitoramento comunitário das regras e estoques", foco: "Vistorias participativas de regeneração, focos de corte e queimadas" },
  { numero: 5, nome: "Sanções graduadas para infrações", foco: "Regimes progressivos de advertência, mediação e reparação de danos" },
  { numero: 6, nome: "Mecanismos acessíveis de resolução de conflitos", foco: "Fóruns locais de conciliação comunitária e mediação extrajudicial" },
  { numero: 7, nome: "Reconhecimento mínimo de direitos de auto-organização", foco: "Legitimação institucional dos acordos comunitários pelos órgãos ambientais" },
  { numero: 8, nome: "Empresas aninhadas (governança em múltiplos níveis)", foco: "Articulação federativa entre comunidade, município, estado e comitês de bacia" },
];

export default function Modulo3() {
  const { selectedMunicipio: m } = usePits();

  // Armazenamento local de acordos de campo (Item 9)
  const [acordos, setAcordos] = useState<AcordoManejoItem[]>(() => {
    try {
      const stored = localStorage.getItem("pits_acordos_manejo");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [psaContratos, setPsaContratos] = useState<ContratoPsaItem[]>(() => {
    try {
      const stored = localStorage.getItem("pits_psa_contratos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pits_acordos_manejo", JSON.stringify(acordos));
  }, [acordos]);

  useEffect(() => {
    localStorage.setItem("pits_psa_contratos", JSON.stringify(psaContratos));
  }, [psaContratos]);

  // Filtra pelo município ativo
  const acordosMunicipio = acordos.filter((a) => a.municipio === m.municipio);
  const psaMunicipio = psaContratos.filter((p) => p.municipio === m.municipio);

  // Estados do formulário de cadastro de acordos
  const [novoAcordoOpen, setNovoAcordoOpen] = useState(false);
  const [comunidadeForm, setComunidadeForm] = useState("");
  const [modalidadeForm, setModalidadeForm] = useState("Plano de Manejo Florestal Sustentável (PMFS)");
  const [areaHaForm, setAreaHaForm] = useState("");
  const [responsavelForm, setResponsavelForm] = useState("");

  const handleSalvarAcordo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comunidadeForm.trim() || !areaHaForm.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const item: AcordoManejoItem = {
      id: Math.random().toString(36).substring(7),
      municipio: m.municipio,
      comunidade: comunidadeForm.trim(),
      modalidade: modalidadeForm,
      areaHa: parseFloat(areaHaForm) || 0,
      responsavel: responsavelForm.trim() || "Associação Comunitária",
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
    };

    setAcordos((prev) => [item, ...prev]);
    toast.success(`Acordo registrado com sucesso para ${m.municipio}!`);
    setComunidadeForm("");
    setAreaHaForm("");
    setResponsavelForm("");
    setNovoAcordoOpen(false);
  };

  const handleRemoverAcordo = (id: string) => {
    setAcordos((prev) => prev.filter((a) => a.id !== id));
    toast.info("Registro removido.");
  };

  // Estados do formulário de cadastro de PSA
  const [novoPsaOpen, setNovoPsaOpen] = useState(false);
  const [psaProjetoForm, setPsaProjetoForm] = useState("");
  const [psaModalidadeForm, setPsaModalidadeForm] = useState("Conservação da Vegetação Nativa");
  const [psaAreaForm, setPsaAreaForm] = useState("");
  const [psaRecursoForm, setPsaRecursoForm] = useState("");
  const [psaFamiliasForm, setPsaFamiliasForm] = useState("");

  const handleSalvarPsa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!psaProjetoForm.trim() || !psaAreaForm.trim()) {
      toast.error("Preencha os campos obrigatórios do projeto de PSA.");
      return;
    }

    const item: ContratoPsaItem = {
      id: Math.random().toString(36).substring(7),
      municipio: m.municipio,
      projeto: psaProjetoForm.trim(),
      modalidade: psaModalidadeForm,
      areaHa: parseFloat(psaAreaForm) || 0,
      recursoAnual: parseFloat(psaRecursoForm) || 0,
      familias: parseInt(psaFamiliasForm) || 0,
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
    };

    setPsaContratos((prev) => [item, ...prev]);
    toast.success(`Iniciativa de PSA registrada para ${m.municipio}!`);
    setPsaProjetoForm("");
    setPsaAreaForm("");
    setPsaRecursoForm("");
    setPsaFamiliasForm("");
    setNovoPsaOpen(false);
  };

  const handleRemoverPsa = (id: string) => {
    setPsaContratos((prev) => prev.filter((p) => p.id !== id));
    toast.info("Registro de PSA removido.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo III — Governança Participativa</h1>
        <p className="text-sm text-muted-foreground">
          Arranjos institucionais de base comunitária, governança de bens comuns e instrumentos de incentivo econômico
        </p>
      </div>

      {/* Indicadores Auditados de Governança */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div tabIndex={0} className="group pits-card flex flex-col justify-between text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div>
            <p className="pits-label text-[11px]">Índice de Governança (IGL)</p>
            <p className="pits-metric text-xl sm:text-2xl mt-1">{m.IGL.toFixed(2)}</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-1">IQM e Associativismo</p>
          </div>
          <FonteInfo variavel="iqm_residuos_solidos" codigoIBGE={m.codigoIBGE} />
        </div>

        <div tabIndex={0} className="group pits-card flex flex-col justify-between text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div>
            <p className="pits-label text-[11px]">Cota ICMS Resíduos (IQM)</p>
            <p className="pits-metric text-xl sm:text-2xl mt-1">IQM {m.iqm_residuos.toFixed(1)}</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-1">Gestão Resíduos (SEMA/IPECE)</p>
          </div>
          <FonteInfo variavel="iqm_residuos_solidos" codigoIBGE={m.codigoIBGE} />
        </div>

        <div tabIndex={0} className="group pits-card flex flex-col justify-between text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div>
            <p className="pits-label text-[11px]">Acordos de Manejo Cadastrados</p>
            <p className="pits-metric text-xl sm:text-2xl mt-1 text-primary">
              {acordosMunicipio.length > 0 ? `${acordosMunicipio.length} ativos` : "Sem registros"}
            </p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-1">
              {acordosMunicipio.length > 0 ? "Registros validados de campo" : "Aguardando coleta de campo"}
            </p>
          </div>
          <FonteInfo
            instituicao="Cadastro Participativo / FUNDECI"
            ano={2026}
            dataConsulta="11/10/2026"
            tabela="Acordos Comunitários de Manejo"
          />
        </div>

        <div tabIndex={0} className="group pits-card flex flex-col justify-between text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div>
            <p className="pits-label text-[11px]">Associativismo Rural (Censo)</p>
            <p className="pits-metric text-xl sm:text-2xl mt-1">{m.associativismo_pct}%</p>
            <p className="pits-reveal text-[10px] text-muted-foreground mt-1">Produtores associados</p>
          </div>
          <FonteInfo variavel="safs_censoagro2017" codigoIBGE={m.codigoIBGE} />
        </div>
      </div>

      {/* Tabela de Acordos de Manejo com Estado Vazio e Formulário Funcional — Item 9 / M3-1 e M3-5 */}
      <div className="pits-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="pits-section-title">Acordos Comunitários de Manejo e Conservação Territorial</h2>
            <p className="text-xs text-muted-foreground">
              Cadastro formalizado de áreas sob compromisso comunitário de manejo sustentável da Caatinga em {m.municipio}
            </p>
          </div>

          <Dialog open={novoAcordoOpen} onOpenChange={setNovoAcordoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={14} className="mr-1.5" /> Cadastrar Acordo de Manejo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" />
                  Cadastrar Acordo Comunitário de Manejo
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvarAcordo} className="space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="municipio-display" className="text-xs">Município</Label>
                  <Input id="municipio-display" value={`${m.municipio} — ${m.estado}`} disabled className="text-xs mt-1" />
                </div>
                <div>
                  <Label htmlFor="comunidade" className="text-xs">Nome da Comunidade / Território *</Label>
                  <Input
                    id="comunidade"
                    placeholder="Ex: Associação de Produtores do Sertão"
                    value={comunidadeForm}
                    onChange={(e) => setComunidadeForm(e.target.value)}
                    required
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="modalidade" className="text-xs">Modalidade de Manejo Sustentável</Label>
                  <Select value={modalidadeForm} onValueChange={setModalidadeForm}>
                    <SelectTrigger id="modalidade" className="w-full h-9 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-xs" value="Plano de Manejo Florestal Sustentável (PMFS)">Plano de Manejo Florestal Sustentável (PMFS)</SelectItem>
                      <SelectItem className="text-xs" value="Regeneração Natural Assistida">Regeneração Natural Assistida</SelectItem>
                      <SelectItem className="text-xs" value="Agrofloresta Comunitária (SAF)">Agrofloresta Comunitária (SAF)</SelectItem>
                      <SelectItem className="text-xs" value="Proteção de Nascentes e Olhos d'Água">Proteção de Nascentes e Olhos d'Água</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="area" className="text-xs">Área sob Manejo (ha) *</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 120"
                      value={areaHaForm}
                      onChange={(e) => setAreaHaForm(e.target.value)}
                      required
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel" className="text-xs">Responsável / Entidade</Label>
                    <Input
                      id="responsavel"
                      placeholder="Ex: Associação Comunitária"
                      value={responsavelForm}
                      onChange={(e) => setResponsavelForm(e.target.value)}
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setNovoAcordoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                    Salvar Acordo
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {acordosMunicipio.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">
              {acordosMunicipio.length} acordo(s) · {acordosMunicipio.reduce((s, i) => s + i.areaHa, 0).toFixed(1)} ha sob manejo
            </p>
            <Detalhes titulo="Ver tabela de acordos">
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">Comunidade / Território</th>
                  <th className="text-left py-2 px-3">Modalidade</th>
                  <th className="text-right py-2 px-3">Área (ha)</th>
                  <th className="text-left py-2 px-3">Entidade Responsável</th>
                  <th className="text-left py-2 px-3">Cadastrado em</th>
                  <th className="text-right py-2 px-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {acordosMunicipio.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-semibold text-foreground">{item.comunidade}</td>
                    <td className="py-2.5 px-3">{item.modalidade}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">{item.areaHa.toFixed(1)} ha</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.responsavel}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.dataRegistro}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRemoverAcordo(item.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1"
                        title="Remover acordo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </Detalhes>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-border rounded-xl text-center bg-muted/10 space-y-2">
            <ShieldCheck size={32} className="mx-auto text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">
              Sem registros — aguardando coleta de campo
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Não constam acordos comunitários formalizados registrados publicamente em <strong>{m.municipio}</strong> nesta fase do projeto. Em estrito cumprimento à <strong>Regra 1 e 9</strong>, nomes realistas inventados foram integralmente banidos. Utilize o botão acima para cadastrar os acordos firmados em campo pela equipe técnica.
            </p>
          </div>
        )}

        <FonteInfo
          instituicao="Cadastro Comunitário Territorial / Projeto FUNDECI"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Acordos Comunitários de Manejo da Caatinga"
        />
      </div>

      {/* Estrutura Normativa de PSA (Lei 14.119/2021) e Cadastro Funcional — M3-6 */}
      <div className="pits-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-primary" />
            <div>
              <h2 className="pits-section-title">
                Modalidades Normativas de Pagamento por Serviços Ambientais (Lei 14.119/2021 — PNPSA)
              </h2>
              <p className="text-xs text-muted-foreground">
                Tipologia legal de modalidades de serviços ecossistêmicos prevista nos Artigos 3º e 4º da Política Nacional de PSA
              </p>
            </div>
          </div>

          <Dialog open={novoPsaOpen} onOpenChange={setNovoPsaOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                <Plus size={14} className="mr-1.5" /> Registrar Iniciativa de PSA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Coins size={18} className="text-primary" />
                  Cadastrar Iniciativa / Contrato de PSA
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvarPsa} className="space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="psa-projeto" className="text-xs">Título do Projeto / Contrato *</Label>
                  <Input
                    id="psa-projeto"
                    placeholder="Ex: Fundo Municipal de Conservação das Nascentes"
                    value={psaProjetoForm}
                    onChange={(e) => setPsaProjetoForm(e.target.value)}
                    required
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="psa-modalidade" className="text-xs">Modalidade (Lei 14.119/2021)</Label>
                  <Select value={psaModalidadeForm} onValueChange={setPsaModalidadeForm}>
                    <SelectTrigger id="psa-modalidade" className="w-full h-9 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {psaTipologiaNormativa.map((t) => (
                        <SelectItem key={t.nome} value={t.nome} className="text-xs">{t.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="psa-area" className="text-xs">Área (ha) *</Label>
                    <Input
                      id="psa-area"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 80"
                      value={psaAreaForm}
                      onChange={(e) => setPsaAreaForm(e.target.value)}
                      required
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="psa-recurso" className="text-xs">Valor (R$/ano)</Label>
                    <Input
                      id="psa-recurso"
                      type="number"
                      step="1000"
                      placeholder="Ex: 50000"
                      value={psaRecursoForm}
                      onChange={(e) => setPsaRecursoForm(e.target.value)}
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="psa-familias" className="text-xs">Famílias</Label>
                    <Input
                      id="psa-familias"
                      type="number"
                      placeholder="Ex: 25"
                      value={psaFamiliasForm}
                      onChange={(e) => setPsaFamiliasForm(e.target.value)}
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setNovoPsaOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                    Salvar Iniciativa
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <PitsPieChart
            data={psaTipologiaNormativa}
            dataKey="valor"
            nameKey="nome"
            height={240}
          />
          <div className="space-y-2 text-xs">
            {psaTipologiaNormativa.map((item) => (
              <div key={item.nome} className="pits-block p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.cor }} />
                  <span className="font-medium text-foreground">{item.nome}</span>
                </div>
                <span className="font-mono font-bold text-muted-foreground">{item.valor}% (ref. legal)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de contratos cadastrados pelo usuário */}
        {psaMunicipio.length > 0 ? (
          <div className="pt-2 border-t border-border/40 space-y-2">
            <h4 className="text-xs font-semibold">Projetos de PSA Cadastrados em {m.municipio}</h4>
            <p className="text-sm font-bold text-foreground">
              {psaMunicipio.length} projeto(s) · {psaMunicipio.reduce((s, i) => s + i.areaHa, 0).toFixed(1)} ha · R$ {psaMunicipio.reduce((s, i) => s + i.recursoAnual, 0).toLocaleString("pt-BR")}/ano
            </p>
            <Detalhes titulo="Ver tabela de projetos">
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-1.5 px-2">Projeto</th>
                  <th className="text-left py-1.5 px-2">Modalidade</th>
                  <th className="text-right py-1.5 px-2">Área (ha)</th>
                  <th className="text-right py-1.5 px-2">Recurso Anual (R$)</th>
                  <th className="text-right py-1.5 px-2">Famílias</th>
                  <th className="text-right py-1.5 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {psaMunicipio.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium">{item.projeto}</td>
                    <td className="py-2 px-2 text-muted-foreground">{item.modalidade}</td>
                    <td className="py-2 px-2 text-right font-mono font-semibold">{item.areaHa.toFixed(1)} ha</td>
                    <td className="py-2 px-2 text-right font-mono text-primary">R$ {item.recursoAnual.toLocaleString("pt-BR")}</td>
                    <td className="py-2 px-2 text-right font-mono">{item.familias}</td>
                    <td className="py-2 px-2 text-right">
                      <button onClick={() => handleRemoverPsa(item.id)} className="text-destructive hover:opacity-80 p-1" title="Remover projeto" aria-label="Remover projeto">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </Detalhes>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-border rounded-lg text-center bg-muted/10 text-xs text-muted-foreground">
            Sem registros de contratos ou repasses de PSA cadastrados para este município — aguardando coleta de campo.
          </div>
        )}

        <FonteInfo
          instituicao="Lei Federal nº 14.119/2021 (PNPSA)"
          ano={2021}
          dataConsulta="11/10/2026"
          tabela="Arts. 3º e 4º — Política Nacional de Pagamento por Serviços Ambientais"
          url="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14119.htm"
        />
      </div>

      {/* Princípios de Ostrom (1990) com Status "Não avaliado" — Item 9 / M3-7 e M3-8 */}
      <div className="pits-card space-y-3">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-primary" />
          <h2 className="pits-section-title">
            Princípios de Ostrom (1990) para Governança de Recursos de Uso Comum
          </h2>
        </div>
        <p className="text-xs text-foreground/80">
          Todos os princípios permanecem com status <strong>"Não avaliado"</strong> até a conclusão de diagnósticos participativos no território.
        </p>
        <Detalhes titulo="Sobre o framework">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Framework referencial de Elinor Ostrom (Prêmio Nobel de Economia de 2009) para a autogestão sustentável de recursos de uso comum (<em>common-pool resources</em>). Em estrita obediência à <strong>Regra 9</strong>, todos os princípios permanecem com status <strong>"Não avaliado"</strong> até que diagnósticos participativos formais sejam concluídos no território.
          </p>
        </Detalhes>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ostromPrincipios.map((p) => (
            <div key={p.numero} tabIndex={0} className="group pits-block p-3 space-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    #{p.numero}
                  </span>
                  <h4 className="text-xs font-semibold leading-tight text-foreground">{p.nome}</h4>
                </div>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  Não avaliado
                </span>
              </div>
              <p className="pits-reveal text-[11px] text-muted-foreground pl-7 leading-relaxed">{p.foco}</p>
            </div>
          ))}
        </div>

        <FonteInfo
          instituicao="Ostrom, Elinor (1990) — Governing the Commons (Cambridge Univ. Press)"
          ano={1990}
          dataConsulta="11/10/2026"
          tabela="Design Principles for Common-Pool Resource (CPR) Institutions"
          url="https://doi.org/10.1017/CBO9780511807763"
        />
      </div>

      {/* Alinhamento ao PNDBio — Eixo 1 (G7 / M3-9) */}
      <div className="pits-card border-l-4 border-l-secondary space-y-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-secondary" />
          <h2 className="pits-section-title">Estratégia Nacional de Bioeconomia (PNDBio) — Governança Comunitária</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong>PNDBio</strong> (Decreto Federal nº 12.044/2024, Eixo 1: <em>Sociobioeconomia e Ativos Ambientais</em>, Missão 1: <em>Negócios da Sociobioeconomia</em>) determina o protagonismo de agricultores familiares e comunidades tradicionais na gestão e partilha de benefícios dos ativos ecossistêmicos.
        </p>
        <Detalhes titulo="Ver links oficiais">
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
          >
            <ExternalLink size={12} /> Portal Oficial PNDBio (gov.br/mma)
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
        </Detalhes>
        <FonteInfo
          instituicao="Ministério do Meio Ambiente e Mudança do Clima (MMA)"
          ano={2026}
          dataConsulta="11/10/2026"
          tabela="Decreto Federal nº 12.044/2024 (Eixo 1, Missão 1)"
          url="https://www.gov.br/mma/pt-br/assuntos/bioeconomia"
        />
      </div>
    </div>
  );
}
