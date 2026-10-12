import { LucideIcon, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubIndexCardProps {
  label: string;
  acronym: string;
  value: number | null | undefined;
  icon: LucideIcon;
  /** Se true, valor baixo é positivo (verde) e valor alto é crítico (vermelho) — ex: IVS */
  inverted?: boolean;
  tooltip?: string;
  fonte?: string;
}

export default function SubIndexCard({
  label,
  acronym,
  value,
  icon: Icon,
  inverted = false,
  tooltip,
  fonte,
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
    <div className="pits-card flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon size={18} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-muted-foreground">{acronym}</p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground/60 hover:text-foreground inline-flex">
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
            <p className="text-sm font-medium leading-tight">{label}</p>
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

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          {isAvailable && (
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        {fonte && (
          <p className="text-[10px] text-muted-foreground/70 mt-1 truncate" title={fonte}>
            {fonte}
          </p>
        )}
      </div>
    </div>
  );
}
