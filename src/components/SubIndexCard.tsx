import { LucideIcon, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FonteInfo from "./FonteInfo";

interface SubIndexCardProps {
  label: string;
  acronym: string;
  value: number | null | undefined;
  icon: LucideIcon;
  /** Se true, valor baixo é positivo (verde) e valor alto é crítico (vermelho) — ex: IVS */
  inverted?: boolean;
  tooltip?: string;
  fonte?: string;
  variavelManifest?: string;
  codigoIBGE?: string;
  ano?: number | string;
  dataConsulta?: string;
  tabela?: string;
}

export default function SubIndexCard({
  label,
  acronym,
  value,
  icon: Icon,
  inverted = false,
  tooltip,
  fonte,
  variavelManifest,
  codigoIBGE,
  ano,
  dataConsulta = "11/10/2026",
  tabela,
}: SubIndexCardProps) {
  const isAvailable = value !== null && value !== undefined && !isNaN(value);
  const pct = isAvailable ? Math.round(Math.min(1, Math.max(0, value)) * 100) : 0;

  const getBarColor = (v: number) => {
    if (inverted) {
      // Para o IVS: menor carência = melhor (verde); maior carência = pior (vermelho)
      if (v <= 0.25) return "bg-success";
      if (v <= 0.45) return "bg-accent";
      return "bg-destructive";
    }
    // Padrão: maior é melhor
    if (v < 0.3) return "bg-destructive";
    if (v < 0.6) return "bg-accent";
    return "bg-success";
  };

  return (
    <div tabIndex={0} className="group pits-card flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Icon size={18} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-foreground/80">{acronym}</p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground inline-flex" aria-label={`Informações sobre ${acronym}`}>
                        <Info size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-2">
                      <p>{tooltip}</p>
                      {fonte && <p className="text-[10px] text-muted-foreground mt-1">Fonte: {fonte}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm font-semibold leading-tight">{label}</p>
            {tooltip && (
              <p className="pits-reveal text-[10px] text-muted-foreground mt-1 leading-snug">{tooltip}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          {isAvailable ? (
            <>
              <span className="pits-metric text-2xl">{value.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">
                {pct}% {inverted && <span className="text-[10px]">(carência)</span>}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">Dados indisponíveis</span>
          )}
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/40">
          {isAvailable && (
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        {/* Proveniência do MANIFEST (Regra 2) */}
        {variavelManifest ? (
          <FonteInfo variavel={variavelManifest} codigoIBGE={codigoIBGE} />
        ) : fonte ? (
          <FonteInfo instituicao={fonte} ano={ano ?? 2025} dataConsulta={dataConsulta} tabela={tabela} />
        ) : null}
      </div>
    </div>
  );
}
