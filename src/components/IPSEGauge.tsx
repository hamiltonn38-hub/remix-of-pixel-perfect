interface IPSEGaugeProps {
  value: number;
  size?: number;
}

export default function IPSEGauge({ value, size = 200 }: IPSEGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 1);
  const offset = circumference * (1 - progress * 0.75); // 270 deg arc

  const getColor = (v: number) => {
    if (v < 0.3) return "hsl(var(--gauge-red))";
    if (v < 0.6) return "hsl(var(--gauge-yellow))";
    return "hsl(var(--gauge-green))";
  };

  const label = value < 0.3 ? "Baixo" : value < 0.6 ? "Moderado" : "Alto";

  return (
    <div className="flex flex-col items-center">
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
        {/* Value text */}
        <text x="50" y="52" textAnchor="middle" className="fill-foreground text-[18px] font-bold">
          {value.toFixed(2)}
        </text>
        <text x="50" y="64" textAnchor="middle" className="fill-muted-foreground text-[7px]">
          {label}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">Índice IPSE</p>
    </div>
  );
}
