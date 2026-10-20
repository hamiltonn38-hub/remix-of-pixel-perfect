import React, { useState, useMemo } from "react";
import { usePits } from "@/context/PitsContext";
import {
  calcRotaA,
  calcRotaB,
  limiteEstequiometricoRotaA,
  limiteEstequiometricoRotaB,
  CONSTANTES_H2,
  RotaAResult,
  RotaBResult,
} from "@/lib/calcH2";
import {
  TECNOLOGIAS_H2,
  ESPECIES_H2,
  TecnologiaH2Info,
  EspecieH2Info,
} from "@/data/h2ParametrosData";
import {
  Atom,
  Flame,
  Droplets,
  Zap,
  Info,
  ExternalLink,
  AlertTriangle,
  Layers,
  Activity,
  Gauge,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import FonteInfo from "@/components/FonteInfo";
import Detalhes from "@/components/Detalhes";

export default function H2SimuladorCard() {
  const { selectedMunicipio: m } = usePits();

  // Estado dos controles
  const [rota, setRota] = useState<"ROTA_A" | "ROTA_B">("ROTA_A");
  const [tecnologiaId, setTecnologiaId] = useState<string>("gasificacao_vapor");
  const [especieId, setEspecieId] = useState<string>("sabia");
  const [fracaoManejo, setFracaoManejo] = useState<number>(0.20);
  const [volumeCH4Simulado, setVolumeCH4Simulado] = useState<number>(100000);

  // Tecnologias filtradas
  const tecnologiasRotaA = useMemo(
    () => TECNOLOGIAS_H2.filter((t) => t.rota === "ROTA_A"),
    []
  );
  const tecnologiaAtual = useMemo(
    () => TECNOLOGIAS_H2.find((t) => t.id === tecnologiaId) || TECNOLOGIAS_H2[0],
    [tecnologiaId]
  );
  const especieAtual = useMemo(
    () => ESPECIES_H2.find((e) => e.id === especieId) || ESPECIES_H2[0],
    [especieId]
  );

  // Cálculos Rota A
  const resultadosRotaA = useMemo(() => {
    const areaHa = m.area_nativa_ha;
    const Yi = 10.0; // t/ha/ano base seca (valor de referência da literatura)
    const pci = especieAtual.pci_mj_kg.tipico;

    const min = calcRotaA(areaHa, Yi, fracaoManejo, 0, tecnologiaAtual.rendimento.min, pci);
    const tipico = calcRotaA(areaHa, Yi, fracaoManejo, 0, tecnologiaAtual.rendimento.tipico, pci);
    const max = calcRotaA(areaHa, Yi, fracaoManejo, 0, tecnologiaAtual.rendimento.max, pci);

    return { min, tipico, max };
  }, [m.area_nativa_ha, fracaoManejo, tecnologiaAtual, especieAtual]);

  // Cálculos Rota B
  const resultadosRotaB = useMemo(() => {
    const tecBiogas = TECNOLOGIAS_H2.find((t) => t.id === "reforma_biogas")!;
    // Conservador: menor rendimento (2.40), maior perda PSA (0.25)
    const min = calcRotaB(volumeCH4Simulado, tecBiogas.rendimento.min, 0.25);
    // Típico: rendimento típico (2.75), perda PSA típica (0.18)
    const tipico = calcRotaB(volumeCH4Simulado, tecBiogas.rendimento.tipico, 0.18);
    // Otimista: maior rendimento (2.95), menor perda PSA (0.10)
    const max = calcRotaB(volumeCH4Simulado, tecBiogas.rendimento.max, 0.10);

    return { min, tipico, max };
  }, [volumeCH4Simulado]);

  return (
    <div className="pits-card space-y-5 border-primary/20 shadow-sm">
      {/* 1. Cabeçalho com Rótulo Fixo Obrigatório (Diretriz Inviolável) */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-hydro/10 text-hydro">
              <Atom size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Simulação de Potencial de Hidrogênio Renovável (H₂ de Biomassa)
              </h2>
              <p className="text-xs text-muted-foreground">
                Modelagem estequiométrica e termoquímica baseada em dados reais municipais
              </p>
            </div>
          </div>

        </div>

        {/* Banner Fixo Obrigatório */}
        <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>Aviso Metodológico Obrigatório:</strong> Potencial teórico-tecnológico. Não é projeto de engenharia nem previsão de produção comercial.
          </span>
        </div>
      </div>

      {/* 2. Seleção de Rota Tecnológica */}
      <Tabs
        value={rota}
        onValueChange={(v) => {
          setRota(v as "ROTA_A" | "ROTA_B");
          if (v === "ROTA_B") {
            setTecnologiaId("reforma_biogas");
          } else {
            setTecnologiaId("gasificacao_vapor");
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ROTA_A" className="flex items-center gap-2">
            <Flame size={16} />
            Rota A: Biomassa Sólida (Gaseificação)
          </TabsTrigger>
          <TabsTrigger value="ROTA_B" className="flex items-center gap-2">
            <Zap size={16} />
            Rota B: Biogás (Reforma a Vapor / BSR)
          </TabsTrigger>
        </TabsList>

        {/* -------------------- CONTEÚDO ROTA A -------------------- */}
        <TabsContent value="ROTA_A" className="space-y-4 mt-4">
          {/* Controles de Entrada */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-muted/30 rounded-lg border border-border/60">
            {/* Seletor de Tecnologia */}
            <div tabIndex={0} className="group space-y-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Tecnologia de Conversão</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono">
                  TRL {tecnologiaAtual.trl.tipico} (IEA)
                </span>
              </label>
              <Select value={tecnologiaId} onValueChange={setTecnologiaId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a tecnologia" />
                </SelectTrigger>
                <SelectContent>
                  {tecnologiasRotaA.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="pits-reveal text-[10px] text-muted-foreground line-clamp-1">
                {tecnologiaAtual.condicoes}
              </p>
            </div>

            {/* Seletor de Espécie Florestal / Resíduo */}
            <div tabIndex={0} className="group space-y-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Espécie / Matéria-Prima</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  PCI: {especieAtual.pci_mj_kg.tipico} MJ/kg
                </span>
              </label>
              <Select value={especieId} onValueChange={setEspecieId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIES_H2.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-xs">
                      {e.nomePopular} ({e.nomeCientifico})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="pits-reveal text-[10px] text-muted-foreground">
                Base seca: C {especieAtual.carbono_pct}%, H {especieAtual.hidrogenio_pct}%, O {especieAtual.oxigenio_pct}%
              </p>
            </div>

            {/* Slider de Fração Sustentável de Manejo (f_i) */}
            <div tabIndex={0} className="group space-y-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span>Fração sob Manejo Sustentável (fᵢ)</span>
                <span className="text-primary font-mono">{(fracaoManejo * 100).toFixed(0)}% da área</span>
              </div>
              <Slider
                value={[fracaoManejo * 100]}
                min={5}
                max={30}
                step={5}
                onValueChange={(val) => setFracaoManejo(val[0] / 100)}
                className="mt-2"
              />
              <p className="pits-reveal text-[10px] text-muted-foreground">
                Padrão Caatinga: 20% (corte seletivo rotativo em talhões)
              </p>
            </div>
          </div>

          {/* Dados Territoriais Aplicados */}
          <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/25 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Vegetação Nativa Elegível (MapBiomas Col. 11): </span>
              <strong className="text-foreground">{m.area_nativa_ha.toLocaleString("pt-BR")} ha</strong>
              <span className="text-muted-foreground"> ({m.cobertura_nativa_pct}% do território de {m.municipio})</span>
            </div>
            <div>
              <span className="text-muted-foreground">Teto Estequiométrico Mássico: </span>
              <strong className="font-mono text-secondary">{especieAtual.limiteEstequiometrico_kg_kg} kg H₂/kg biomassa</strong>
            </div>
          </div>

          {/* Tabela de Resultados em Faixas */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resultados da Simulação por Regime Tecnológico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  regime: "Conservador",
                  sub: `Rendimento: ${tecnologiaAtual.rendimento.min} kg H₂/kg`,
                  data: resultadosRotaA.min,
                  destaque: false,
                },
                {
                  regime: "Típico (Referência)",
                  sub: `Rendimento: ${tecnologiaAtual.rendimento.tipico} kg H₂/kg`,
                  data: resultadosRotaA.tipico,
                  destaque: true,
                },
                {
                  regime: "Otimista",
                  sub: `Rendimento: ${tecnologiaAtual.rendimento.max} kg H₂/kg`,
                  data: resultadosRotaA.max,
                  destaque: false,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  tabIndex={0}
                  className={`group p-3.5 rounded-lg border flex flex-col justify-between space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    card.destaque
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{card.regime}</span>
                      {card.destaque && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Potencial Energético (MWh PCI/ano)</p>
                      <p className="text-xl font-extrabold text-primary">
                        {card.data ? card.data.pel_h2_mwh_ano.toLocaleString("pt-BR") : "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Produção H₂</p>
                        <p className="font-bold text-foreground">
                          {card.data ? (card.data.massa_h2_kg_ano / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"} t/ano
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Eficiência Térmica</p>
                        <p className="font-bold text-foreground">
                          {card.data ? `${card.data.eficiencia_conversao_pct}%` : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="pits-reveal pt-1 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Droplets size={12} className="text-hydro shrink-0" />
                        Demanda Mín. Água Reação
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        {card.data ? card.data.demanda_agua_m3_ano.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"} m³/ano
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proveniência e Fontes */}
          <Detalhes titulo="Ver fontes e referências">
          <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Fonte do Rendimento:</span>
              <a
                href={tecnologiaAtual.doi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                {tecnologiaAtual.referencia}
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Fonte Botânica:</span>
              <a
                href={especieAtual.doi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                {especieAtual.referencia}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          </Detalhes>
        </TabsContent>

        {/* -------------------- CONTEÚDO ROTA B -------------------- */}
        <TabsContent value="ROTA_B" className="space-y-4 mt-4">
          {/* Informação sobre Disponibilidade Real de Dados */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
              <Info size={16} />
              <span>Status dos Dados Oficiais de Biogás em {m.municipio}</span>
            </div>
            <Detalhes titulo="Ver explicação">
            <p className="text-muted-foreground leading-relaxed">
              Conforme a <strong>Regra 2c da Plataforma PITS</strong>, não havendo dados abertos auditados de biodigestores instalados ou volume de biogás no Censo Agropecuário para este município, o indicador municipal oficial é registrado como <em>"Dados indisponíveis"</em>.
            </p>
            </Detalhes>
            <p className="text-foreground font-medium">
              Abaixo disponibilizamos uma simulação paramétrica interativa caso haja projeto de biodigestão anaeróbia planejado:
            </p>
          </div>

          {/* Controle do Volume de Biogás Paramétrico */}
          <div className="p-3.5 bg-muted/30 rounded-lg border border-border/50 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span>Volume de Metano Biogênico para Simulação (Nm³ CH₄/ano)</span>
              <span className="text-primary font-mono text-sm">
                {volumeCH4Simulado.toLocaleString("pt-BR")} Nm³/ano
              </span>
            </div>
            <Slider
              value={[volumeCH4Simulado]}
              min={20000}
              max={500000}
              step={10000}
              onValueChange={(val) => setVolumeCH4Simulado(val[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>20.000 Nm³ (Pequeno porte rural)</span>
              <span>100.000 Nm³ (Médio porte cooperativo)</span>
              <span>500.000 Nm³ (Porte agroindustrial)</span>
            </div>
          </div>

          {/* Limite Estequiométrico e TRL da Rota B */}
          <div className="p-3 bg-hydro/5 rounded-lg border border-hydro/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Reação Global: </span>
              <code className="text-foreground font-semibold">CH₄ + 2 H₂O → CO₂ + 4 H₂ + PSA</code>
            </div>
            <div>
              <span className="text-muted-foreground">Limite Estequiométrico Teórico: </span>
              <strong className="font-mono text-hydro">{limiteEstequiometricoRotaB().toFixed(1)} mol H₂/mol CH₄</strong>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-hydro/20 text-hydro font-medium">
              TRL 8–9 (Comercial / IEA Hydrogen)
            </span>
          </div>

          {/* Tabela de Resultados em Faixas Rota B */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resultados da Simulação da Rota B (Reforma + Purificação PSA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  regime: "Conservador",
                  sub: "Rend: 2.40 mol/mol, Perda PSA: 25%",
                  data: resultadosRotaB.min,
                  destaque: false,
                },
                {
                  regime: "Típico (Referência)",
                  sub: "Rend: 2.75 mol/mol, Perda PSA: 18%",
                  data: resultadosRotaB.tipico,
                  destaque: true,
                },
                {
                  regime: "Otimista",
                  sub: "Rend: 2.95 mol/mol, Perda PSA: 10%",
                  data: resultadosRotaB.max,
                  destaque: false,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  tabIndex={0}
                  className={`group p-3.5 rounded-lg border flex flex-col justify-between space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    card.destaque
                      ? "border-hydro/50 bg-hydro/5 shadow-sm"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{card.regime}</span>
                      {card.destaque && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-hydro/20 text-hydro font-medium">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="pits-reveal text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Potencial Energético (MWh PCI/ano)</p>
                      <p className="text-xl font-extrabold text-hydro">
                        {card.data ? card.data.pel_h2_mwh_ano.toLocaleString("pt-BR") : "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Massa H₂ Líquida</p>
                        <p className="font-bold text-foreground">
                          {card.data ? (card.data.massa_h2_kg_ano / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—"} t/ano
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Eficiência Térmica</p>
                        <p className="font-bold text-foreground">
                          {card.data ? `${card.data.eficiencia_conversao_pct}%` : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="pits-reveal pt-1 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Droplets size={12} className="text-hydro shrink-0" />
                        Demanda Mín. Água Reação
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        {card.data ? card.data.demanda_agua_m3_ano.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"} m³/ano
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proveniência Rota B */}
          <Detalhes titulo="Ver fontes e referências">
          <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Literatura Técnica (BSR):</span>
              <a
                href="https://doi.org/10.1016/j.ijhydene.2013.04.140"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Alves et al. (2013); Vita et al. (2018) — Int J Hydrogen Energy
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Separação PSA:</span>
              <a
                href="https://doi.org/10.1007/s10450-022-00366-z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Luberti et al. (2022) — Adsorption
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          </Detalhes>
        </TabsContent>
      </Tabs>
    </div>
  );
}
