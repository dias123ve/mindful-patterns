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

const ORDERED_KEYS = [
  "self-identity",
  "self-esteem",
  "self-agency",
  "self-awareness",
  "self-connection",
  "self-motivation",
  "self-regulation",
  "self-protection",
];

const OctagonChart = ({ scores, componentNames = {} }: OctagonChartProps) => {
  // Use fixed order to avoid messy polygon
  const orderedEntries = ORDERED_KEYS
    .filter((key) => scores[key] !== undefined)
    .map((key) => [key, scores[key]] as [string, number]);

  // Sort for highlight badges
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top2Keys = sortedEntries.slice(0, 2).map(([key]) => key);
  const lowestKey = sortedEntries[sortedEntries.length - 1]?.[0];

  // Convert into Recharts format
  const data = ORDERED_KEYS.map((key) => ({
    key,
    subject: componentNames[key] || key.replace(/-/g, " "),
    value: scores[key] ?? 0,
    fullMark: 50, // max score in quiz
    isTop2: top2Keys.includes(key),
    isLowest: key === lowestKey,
  }));

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Ambient glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl scale-75 opacity-60" />

      <div className="relative h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <defs>
              {/* Gradient fill */}
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.65} />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.65} />
              </linearGradient>

              {/* Stroke gradient */}
              <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              {/* Glow effect */}
              <filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid polygon */}
            <PolarGrid stroke="url(#strokeGradient)" strokeOpacity={0.18} gridType="polygon" />

            {/* Radius reference lines */}
            <PolarRadiusAxis angle={90} domain={[0, 50]} tick={false} axisLine={false} />

            {/* Labels around the radar */}
            <PolarAngleAxis
              dataKey="subject"
              tick={({ payload, x, y, cx, cy, ...rest }) => {
                const angle = Math.atan2(y - cy, x - cx);
                const radius = 14;
                const offsetX = Math.cos(angle) * radius;
                const offsetY = Math.sin(angle) * radius;

                return (
                  <text
                    {...rest}
                    x={x + offsetX}
                    y={y + offsetY}
                    textAnchor={x > cx ? "start" : x < cx ? "end" : "middle"}
                    dominantBaseline="central"
                    className="fill-foreground text-[11px] md:text-xs font-medium"
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {payload.value}
                  </text>
                );
              }}
              tickLine={false}
            />

            {/* Soft background radar */}
            <Radar
              name="Background"
              dataKey="fullMark"
              stroke="transparent"
              fill="hsl(var(--muted))"
              fillOpacity={0.1}
            />

            {/* Main Shape */}
            <Radar
              name="Score"
              dataKey="value"
              stroke="url(#strokeGradient)"
              fill="url(#radarGradient)"
              fillOpacity={0.55}
              strokeWidth={2.5}
              filter="url(#radarGlow)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;

                // Highlight top 2 highest
                if (payload.isTop2) {
                  return (
                    <g key={payload.key}>
                      <circle cx={cx} cy={cy} r={14} fill="#27D787" opacity={0.28} />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={9}
                        fill="#27D787"
                        stroke="#fff"
                        strokeWidth={2.2}
                        filter="url(#radarGlow)"
                      />
                    </g>
                  );
                }

                // Highlight lowest score
                if (payload.isLowest) {
                  return (
                    <g key={payload.key}>
                      <circle cx={cx} cy={cy} r={14} fill="#FF8A3D" opacity={0.28} />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={9}
                        fill="#FF8A3D"
                        stroke="#fff"
                        strokeWidth={2.2}
                        filter="url(#radarGlow)"
                      />
                    </g>
                  );
                }

                // Normal dot
                return (
                  <circle
                    key={payload.key}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#fff"
                    stroke="url(#strokeGradient)"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#27D787] shadow-lg shadow-[#27D787]/40" />
          <span className="text-xs text-muted-foreground font-medium">
            Top Strengths
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF8A3D] shadow-lg shadow-[#FF8A3D]/40" />
          <span className="text-xs text-muted-foreground font-medium">
            Growth Area
          </span>
        </div>
      </div>
    </div>
  );
};

export default OctagonChart;
