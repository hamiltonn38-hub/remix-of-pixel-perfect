import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Leaf, Users, BarChart3, Target } from "lucide-react";
import Detalhes from "./Detalhes";

export default function SobreModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-sidebar-foreground/75 hover:text-sidebar-foreground transition-colors font-medium">
          <Droplets size={14} />
          <span>Sobre a Plataforma</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/80">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Droplets size={22} className="text-primary" />
            PITS — Plataforma de Inteligência Territorial Socioenergética
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* HAMILTON */}
          <div className="pits-block p-4 space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Target size={16} className="text-secondary" />
              Framework HAMILTON
            </h3>
            <p className="text-foreground leading-relaxed text-xs sm:text-sm">
              O <strong>HAMILTON</strong> (Integração Comunidade–Biomassa para o Planejamento Territorial Sustentável da Caatinga) é um framework interdisciplinar voltado ao planejamento territorial sustentável do semiárido brasileiro.
            </p>
            <Detalhes titulo="Ver detalhamento conceitual">
              <p className="text-muted-foreground leading-relaxed text-xs">
                Estruturado em <strong>quatro módulos interdependentes</strong>, o framework integra dimensões biofísico-ecológicas, produtivas, de governança e de monitoramento para promover a transição energética justa e a gestão sustentável dos recursos naturais em territórios semiáridos.
              </p>
            </Detalhes>
          </div>

          {/* 4 Módulos */}
          <div>
            <h3 className="font-semibold mb-3">Módulos do Framework (passe o mouse para detalhes)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Leaf, title: "I — Biofísico-Ecológico", desc: "Planejamento de paisagens multifuncionais, integridade florestal e zoneamento territorial." },
                { icon: BarChart3, title: "II — Integração Produtiva", desc: "Transição do extrativismo linear para fluxos circulares de biomassa e sistemas agroflorestais." },
                { icon: Users, title: "III — Governança Participativa", desc: "Instrumentos de governança multiescalar baseados nos princípios de Ostrom (1990)." },
                { icon: Target, title: "IV — Monitoramento Socioecológico", desc: "Monitoramento contínuo com integração de dados territoriais e participação comunitária." },
              ].map((mod) => (
                <div key={mod.title} tabIndex={0} className="group pits-block p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center gap-2">
                    <mod.icon size={15} className="text-primary shrink-0" />
                    <h4 className="font-semibold text-xs text-foreground">{mod.title}</h4>
                  </div>
                  <p className="pits-reveal text-xs text-muted-foreground mt-1.5">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IPSE Oficial */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/25 space-y-2">
            <h3 className="font-semibold">Modelo Oficial do IPSE (Artigo Científico)</h3>
            <div className="font-mono text-xs text-center text-foreground font-bold p-2.5 bg-background/80 rounded-lg border border-border/60">
              IPSE = PEL / IVS* &nbsp;•&nbsp; PEL = A_i · Y_i · PCI · η &nbsp;•&nbsp; IVS = 1 − Σ w_k·X_k
            </div>
            <Detalhes titulo="Ver explicação dos componentes">
              <p className="text-muted-foreground text-xs leading-relaxed">
                O <strong>Índice de Potencial Socioenergético (IPSE)</strong> é o indicador oficial do artigo (Seção 3.1), definido como a razão entre o Potencial Energético Local de biomassa (PEL) e o Índice de Vulnerabilidade Social com penalidade climática (IVS*). Os subíndices Biomassa (IB), Infraestrutura (IIE) e Governança (IGL) constituem <em>indicadores setoriais de apoio</em>.
              </p>
            </Detalhes>
          </div>

          {/* FUNDECI & Público */}
          <Detalhes titulo="Sobre o Projeto FUNDECI/2025.0016 e Público-alvo">
            <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/25 space-y-2">
              <h3 className="font-semibold text-xs text-foreground">Projeto FUNDECI/2025.0016</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Esta plataforma é desenvolvida no âmbito do projeto <strong>FUNDECI/2025.0016</strong>, com foco na operacionalização do framework HAMILTON para municípios do semiárido cearense.
              </p>
              <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <strong className="text-foreground">Público-alvo:</strong> Gestores públicos municipais e estaduais • Pesquisadores • Líderes comunitários • Formuladores de políticas públicas
              </div>
            </div>
          </Detalhes>
        </div>
      </DialogContent>
    </Dialog>
  );
}
