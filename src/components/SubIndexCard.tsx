import { LucideIcon } from "lucide-react";

interface SubIndexCardProps {
  label: string;
  acronym: string;
  value: number;
  icon: LucideIcon;
}

export default function SubIndexCard({ label, acronym, value, icon: Icon }: SubIndexCardProps) {
  const pct = Math.round(value * 100);
  const getBarColor = (v: number) => {
    if (v < 0.3) return "bg-destructive";
    if (v < 0.6) return "bg-accent";
    return "bg-success";
  };

  return (
    <div className="pits-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{acronym}</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="pits-metric text-2xl">{value.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground self-end">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
