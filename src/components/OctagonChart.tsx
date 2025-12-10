import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Customized,
} from "recharts";

interface OctagonChartProps {
  scores: Record<string, number>;
  componentNames?: Record<string, string>;
}

// ORDERED KEYS — MATCH DB EXACTLY
const ORDERED_KEYS = [
  "self-identity",
  "self-esteem",
  "self-confidence",
  "self-agency",
  "self-assertiveness",
  "self-regulation",
  "self-motivation",
  "self-compassion",
];

const OctagonChart = ({ scores, componentNames = {} }: OctagonChartProps) => {
  const availableKeys = ORDERED_KEYS.filter((key) => scores[key] !== undefined);
  if (availableKeys.length < 3) return null; // avoid broken polygon

  // Detect top 2 & lowest
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top2 = sortedEntries.slice(0, 2).map(([k]) => k);
  const lowest = sortedEntries[sortedEntries.length - 1]?.[0];

  // Prepare data for Recharts
  const data = ORDERED_KEYS.map((key) => ({
    key,
    subject: componentNames[key] || key.replace(/-/g, " "),
    value: scores[key] ?? 0,
    fullMark: 50,
    isTop2: top2.includes(key),
    isLowest: key === lowest,
  }));

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl scale-75 opacity-60" />

      <div className="relative h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            {/* Gradients + Glow */}
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.65} />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.65} />
              </linearGradient>

              <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              <filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <PolarGrid stroke="url(#strokeGradient)" strokeOpacity={0.15} gridType="polygon" />
            <PolarRadiusAxis domain={[0, 50]} tick={false} axisLine={false} />

            <PolarAngleAxis
              dataKey="subject"
              tick={({ payload, x, y, cx, cy }) => {
                const angle = Math.atan2(y - cy, x - cx);
                const offset = 12;
                return (
                  <text
                    x={x + Math.cos(angle) * offset}
                    y={y + Math.sin(angle) * offset}
                    className="fill-foreground text-[11px] font-medium"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            {/* Background radar */}
            <Radar dataKey="fullMark" fill="hsl(var(--muted))" fillOpacity={0.1} stroke="none" />

            {/* Main radar shape */}
            <Radar
              dataKey="value"
              stroke="url(#strokeGradient)"
              fill="url(#radarGradient)"
              fillOpacity={0.55}
              strokeWidth={2.4}
              filter="url(#radarGlow)"
              dot={false} // disable default dots
            />

            {/* ⬇️ CUSTOM DOT LAYER — THIS MAKES THE MAGIC WORK */}
            <Customized
              component={({ height, width, cx, cy, outerRadius }) => {
                const radius = outerRadius; // match radar radius

                return (
                  <g>
                    {data.map((entry, index) => {
                      // Compute polar position
                      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
                      const r = (entry.value / 50) * radius;

                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);

                      let size = 4;
                      let fill = "#ffffff";
                      let stroke = "url(#strokeGradient)";
                      let glow = null;

                      // Top 2 → Green
                      if (entry.isTop2) {
                        size = 10;
                        fill = "#27D787";
                        stroke = "#27D787";
                        glow = (
                          <circle cx={x} cy={y} r={18} fill="#27D787" opacity={0.25} />
                        );
                      }

                      // Lowest → Orange
                      if (entry.isLowest) {
                        size = 10;
                        fill = "#FF8A3D";
                        stroke = "#FF8A3D";
                        glow = (
                          <circle cx={x} cy={y} r={18} fill="#FF8A3D" opacity={0.25} />
                        );
                      }

                      return (
                        <g key={index}>
                          {glow}
                          <circle
                            cx={x}
                            cy={y}
                            r={size}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={2}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend stays unchanged */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 bg-[#27D787] rounded-full" /> Top Strengths
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 bg-[#FF8A3D] rounded-full" /> Growth Area
        </div>
      </div>
    </div>
  );
};

export default OctagonChart;
