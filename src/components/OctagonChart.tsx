import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface OctagonChartProps {
  scores: Record<string, number>;
  componentNames?: Record<string, string>;
}

// FINAL VALID KEYS — MATCH DB EXACTLY
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
  // Protect against incomplete data
  const availableKeys = ORDERED_KEYS.filter((key) => scores[key] !== undefined);
  if (availableKeys.length < 3) return null; // avoid broken polygon

  // Sorting for highlight markers
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top2 = sortedEntries.slice(0, 2).map(([k]) => k);
  const lowest = sortedEntries[sortedEntries.length - 1]?.[0];

  // Convert data for Recharts
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
            <defs>
              {/* Gradient */}
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.65} />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.65} />
              </linearGradient>

              {/* Stroke */}
              <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              {/* Glow */}
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

            {/* Background */}
            <Radar dataKey="fullMark" fill="hsl(var(--muted))" fillOpacity={0.1} stroke="none" />

            {/* Main */}
            <Radar
              dataKey="value"
              stroke="url(#strokeGradient)"
              fill="url(#radarGradient)"
              fillOpacity={0.55}
              strokeWidth={2.4}
              filter="url(#radarGlow)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;

                if (payload.isTop2)
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={14} fill="#27D787" opacity={0.28} />
                      <circle cx={cx} cy={cy} r={8} fill="#27D787" stroke="#fff" strokeWidth={2} />
                    </g>
                  );

                if (payload.isLowest)
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={14} fill="#FF8A3D" opacity={0.28} />
                      <circle cx={cx} cy={cy} r={8} fill="#FF8A3D" stroke="#fff" strokeWidth={2} />
                    </g>
                  );

                return <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="url(#strokeGradient)" strokeWidth={2} />;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
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
