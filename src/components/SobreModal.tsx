import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Leaf, Users, BarChart3, Target } from "lucide-react";

export default function SobreModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors">
          <Droplets size={14} />
          <span>Sobre a Plataforma</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Droplets size={22} className="text-primary" />
            PITS — Plataforma de Inteligência Territorial Socioenergética
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* HAMILTON */}
          <div className="p-4 bg-muted/40 rounded-xl">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <Target size={16} className="text-secondary" />
              Framework HAMILTON
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              O <strong>HAMILTON</strong> (Integração Comunidade–Biomassa para o Planejamento Territorial Sustentável da Caatinga) é um framework interdisciplinar voltado ao planejamento territorial sustentável do semiárido brasileiro, especificamente do bioma Caatinga.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Estruturado em <strong>quatro módulos interdependentes</strong>, o framework integra dimensões biofísico-ecológicas, produtivas, de governança e de monitoramento para promover a transição energética justa e a gestão sustentável dos recursos naturais em territórios semiáridos.
            </p>
          </div>

          {/* 4 Módulos */}
          <div>
            <h3 className="font-semibold mb-3">Módulos do Framework</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Leaf, title: "I — Biofísico-Ecológico", desc: "Planejamento de paisagens multifuncionais, integridade florestal e zoneamento territorial." },
                { icon: BarChart3, title: "II — Integração Produtiva", desc: "Transição do extrativismo linear para fluxos circulares de biomassa e sistemas agroflorestais." },
                { icon: Users, title: "III — Governança Participativa", desc: "Instrumentos de governança multiescalar baseados nos princípios de Ostrom (1990)." },
                { icon: Target, title: "IV — Monitoramento Socioecológico", desc: "Monitoramento contínuo com integração de dados territoriais e participação comunitária." },
              ].map((mod) => (
                <div key={mod.title} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <mod.icon size={14} className="text-primary" />
                    <h4 className="font-medium text-xs">{mod.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IPSE */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h3 className="font-semibold mb-2">Índice IPSE</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              O <strong>Índice de Potencial Socioenergético (IPSE)</strong> é o indicador composto central da plataforma, calculado a partir de quatro sub-índices: Biomassa Disponível (IB), Vulnerabilidade Socioeconômica (IVS), Infraestrutura Energética (IIE) e Governança Local (IGL). Os pesos são personalizáveis pelo usuário, garantindo transparência e adaptabilidade metodológica.
            </p>
            <p className="font-mono text-xs mt-2 text-center text-foreground/70">
              IPSE = w₁·IB + w₂·IVS + w₃·IIE + w₄·IGL
            </p>
          </div>

          {/* FUNDECI */}
          <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
            <h3 className="font-semibold mb-2">Projeto FUNDECI/2025.0016</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Esta plataforma é desenvolvida no âmbito do projeto <strong>FUNDECI/2025.0016</strong>, com foco na operacionalização do framework HAMILTON para municípios do semiárido cearense. O projeto visa fornecer ferramentas de apoio à decisão para gestores públicos municipais e estaduais, pesquisadores, líderes comunitários e formuladores de políticas públicas.
            </p>
          </div>

          {/* Public */}
          <div className="text-xs text-muted-foreground">
            <h3 className="font-semibold text-foreground mb-1">Público-alvo</h3>
            <p>Gestores públicos municipais e estaduais • Pesquisadores • Líderes comunitários • Formuladores de políticas públicas</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
