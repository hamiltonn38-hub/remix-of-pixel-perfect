/**
 * PITS Chart Design System
 *
 * Wrappers opinionados sobre Recharts que encapsulam:
 *  - Tema visual (cores do CSS, bordas, fontes)
 *  - Tooltip padrão em português
 *  - CartesianGrid, XAxis e YAxis com defaults consistentes
 *  - ResponsiveContainer em toda chamada
 *
 * Uso:
 *   <PitsLineChart data={data} lines={[{ key: "ipse", name: "IPSE", color: "hsl(var(--primary))" }]} xKey="ano" />
 *   <PitsBarChart data={data} bars={[{ key: "biomassa", name: "Biomassa (t/ha)" }]} xKey="faixa" />
 *   <PitsPieChart data={data} />
 *   <PitsComposedChart data={data} bars={[...]} lines={[...]} xKey="ano" rightKey="precip" />
 */

import {
  LineChart, Line,
  BarChart, Bar,
  ComposedChart,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

// ─────────────────────────── shared defaults ───────────────────────────

/** Tooltip estilizado com o tema do app */
function PitsTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      {label !== undefined && (
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      )}
      {payload.map((item, i) => (
        <p key={i} style={{ color: item.color ?? "inherit" }}>
          {item.name}: <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

const AXIS_STYLE = {
  tick: { fontSize: 11 },
  stroke: "hsl(var(--muted-foreground))",
};

const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "hsl(var(--border))",
};

// ─────────────────────────── PitsLineChart ───────────────────────────

export interface LineConfig {
  key: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  dotRadius?: number;
  yAxisId?: "left" | "right";
}

interface PitsLineChartProps {
  data: object[];
  lines: LineConfig[];
  xKey: string;
  height?: number;
  yDomain?: [number | "auto", number | "auto"];
  showLegend?: boolean;
}

export function PitsLineChart({
  data,
  lines,
  xKey,
  height = 260,
  yDomain,
  showLegend = false,
}: PitsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey={xKey} {...AXIS_STYLE} />
        <YAxis domain={yDomain} yAxisId="left" {...AXIS_STYLE} />
        <Tooltip content={<PitsTooltip />} />
        {showLegend && <Legend />}
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color ?? "hsl(var(--primary))"}
            strokeWidth={l.strokeWidth ?? 2}
            dot={{ r: l.dotRadius ?? 3, fill: l.color ?? "hsl(var(--primary))" }}
            yAxisId={l.yAxisId ?? "left"}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────── PitsBarChart ───────────────────────────

export interface BarConfig {
  key: string;
  name: string;
  color?: string;
  radius?: [number, number, number, number];
  yAxisId?: "left" | "right";
}

interface PitsBarChartProps {
  data: object[];
  bars: BarConfig[];
  xKey: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  /** Width for the category axis label area (used in vertical layout) */
  yLabelWidth?: number;
  showLegend?: boolean;
}

export function PitsBarChart({
  data,
  bars,
  xKey,
  height = 250,
  layout = "horizontal",
  yLabelWidth = 80,
  showLegend = false,
}: PitsBarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout}>
        <CartesianGrid {...GRID_PROPS} />
        {isVertical ? (
          <>
            <XAxis type="number" {...AXIS_STYLE} />
            <YAxis dataKey={xKey} type="category" width={yLabelWidth} {...AXIS_STYLE} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
          </>
        )}
        <Tooltip content={<PitsTooltip />} />
        {showLegend && <Legend />}
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            fill={b.color ?? "hsl(var(--secondary))"}
            radius={b.radius ?? (isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0])}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────── PitsPieChart ───────────────────────────

export interface PieSlice {
  nome: string;
  valor: number;
  cor: string;
}

interface PitsPieChartProps {
  data: PieSlice[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

export function PitsPieChart({
  data,
  height = 220,
  innerRadius = 50,
  outerRadius = 80,
  showLegend = false,
}: PitsPieChartProps) {
  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.cor} />
            ))}
          </Pie>
          <Tooltip content={<PitsTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>

      {/* Custom inline legend */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {data.map((p, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: p.cor }}
            />
            {p.nome} ({p.valor}%)
          </span>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────── PitsComposedChart ───────────────────────────

interface PitsComposedChartProps {
  data: object[];
  bars: BarConfig[];
  lines: LineConfig[];
  xKey: string;
  height?: number;
  showLegend?: boolean;
}

export function PitsComposedChart({
  data,
  bars,
  lines,
  xKey,
  height = 300,
  showLegend = true,
}: PitsComposedChartProps) {
  const hasRight = [...bars, ...lines].some((s) => s.yAxisId === "right");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey={xKey} {...AXIS_STYLE} />
        <YAxis yAxisId="left" {...AXIS_STYLE} />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            {...AXIS_STYLE}
            stroke="hsl(var(--hydro))"
          />
        )}
        <Tooltip content={<PitsTooltip />} />
        {showLegend && <Legend />}
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            fill={b.color ?? "hsl(var(--hydro))"}
            opacity={0.5}
            radius={[2, 2, 0, 0]}
            yAxisId={b.yAxisId ?? "left"}
          />
        ))}
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color ?? "hsl(var(--primary))"}
            strokeWidth={l.strokeWidth ?? 2}
            dot={{ r: l.dotRadius ?? 3 }}
            yAxisId={l.yAxisId ?? "left"}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────── PitsRadarChart ───────────────────────────

interface PitsRadarChartProps {
  data: object[];
  dataKey: string;
  angleKey: string;
  color?: string;
  height?: number;
  domain?: [number, number];
}

export function PitsRadarChart({
  data,
  dataKey,
  angleKey,
  color = "hsl(var(--primary))",
  height = 280,
  domain = [0, 1],
}: PitsRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey={angleKey}
          tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
        />
        <PolarRadiusAxis domain={domain} tick={{ fontSize: 10 }} />
        <Radar
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip content={<PitsTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

