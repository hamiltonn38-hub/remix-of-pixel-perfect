interface IPSEGaugeProps {
  /** Valor normalizado do IPSE (0 a 1) para posicionamento no arco */
  value: number | null | undefined;
  /** Valor bruto do IPSE em GJ/ano */
  rawIpse?: number | null;
  size?: number;
}

export default function IPSEGauge({ value, rawIpse, size = 200 }: IPSEGaugeProps) {
  const isAvailable = value !== null && value !== undefined && !isNaN(value);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = isAvailable ? Math.min(Math.max(value, 0), 1) : 0;
  const offset = circumference * (1 - progress * 0.75); // 270 deg arc

  const getColor = (v: number) => {
    if (v < 0.3) return "hsl(var(--gauge-red))";
    if (v < 0.6) return "hsl(var(--gauge-yellow))";
    return "hsl(var(--gauge-green))";
  };

  const label = !isAvailable
    ? "Não calculável"
    : value < 0.3
    ? "Baixo"
    : value < 0.6
    ? "Moderado"
    : "Alto";

  const formatRaw = (val: number) => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M GJ/ano`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)}k GJ/ano`;
    }
    return `${val.toFixed(0)} GJ/ano`;
  };

  return (
    <div className="flex flex-col items-center text-center">
      <svg width={size} height={size * 0.7} viewBox="0 0 100 75" className="overflow-visible">
        {/* Background arc */}
        <circle
          cx="50" cy="55" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform="rotate(135 50 55)"
        />
        {/* Value arc */}
        {isAvailable && (
          <circle
            cx="50" cy="55" r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(135 50 55)"
            className="transition-all duration-1000 ease-out"
          />
        )}
        {/* Value text */}
        <text x="50" y="52" textAnchor="middle" className="fill-foreground text-[18px] font-bold">
          {isAvailable ? value.toFixed(2) : "N/C"}
        </text>
        <text x="50" y="64" textAnchor="middle" className="fill-muted-foreground text-[7px] font-medium">
          {label}
        </text>
      </svg>
      <div className="mt-1">
        <p className="text-xs font-semibold text-foreground">IPSE Normalizado (0–1)</p>
        {rawIpse !== undefined && rawIpse !== null && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Bruto: {formatRaw(rawIpse)} (PEL / IVS*)
          </p>
        )}
      </div>
    </div>
  );
}
