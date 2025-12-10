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

const OctagonChart = ({ scores, componentNames = {} }: OctagonChartProps) => {
  // Sort scores highest → lowest
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const top2Keys = sortedEntries.slice(0, 2).map(([key]) => key);
  const lowestKey = sortedEntries[sortedEntries.length - 1]?.[0];

  // Build data for Recharts
  const data = Object.entries(scores).map(([key, value]) => ({
    subject:
      componentNames[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
    fullMark: 100,
    key,
    isTop2: top2Keys.includes(key),
    isLowest: key === lowestKey,
  }));

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: "#374151" }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />

            {/* BACKGROUND SHAPE */}
            <Radar
              name="background"
              dataKey="fullMark"
              stroke="transparent"
              fill="#e5e7eb"
              fillOpacity={0.15}
            />

            {/* MAIN SCORE SHAPE */}
            <Radar
              name="score"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.35}
              dot={(props: any) => {
                const { cx, cy, payload } = props;

                // ---- CUSTOM TOP 2 ----
                if (payload.isTop2) {
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="#27D787"
                        opacity={0.25}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill="#27D787"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }

                // ---- CUSTOM LOWEST ----
                if (payload.isLowest) {
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="#FF8A3D"
                        opacity={0.25}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill="#FF8A3D"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }

                // ---- DEFAULT DOT ----
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#ffffff"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#27D787]" />
          <span className="text-xs text-muted-foreground">Top Strengths</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF8A3D]" />
          <span className="text-xs text-muted-foreground">Growth Area</span>
        </div>
      </div>
    </div>
  );
};

export default OctagonChart;
