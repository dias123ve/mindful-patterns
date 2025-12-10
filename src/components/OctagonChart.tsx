import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Customized,
} from "recharts";

interface OctagramChartProps {
  scores: Record<string, number>;
}

const ORDER = [
  "self-identity",
  "self-esteem",
  "self-confidence",
  "self-agency",
  "self-assertiveness",
  "self-regulation",
  "self-motivation",
  "self-compassion",
];

// Format Supabase scores → radar data
const formatData = (scores: Record<string, number>) =>
  ORDER.map((key) => ({
    key,
    label: key.replace("self-", "Self-").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: scores[key] ?? 0,
  }));

// Detect highlight
const getDotTypes = (data: any[]) => {
  const values = data.map((d) => d.value);
  const sorted = [...values].sort((a, b) => b - a);
  const highestTwo = sorted.slice(0, 2);
  const lowest = sorted[sorted.length - 1];

  return data.map((d) => ({
    ...d,
    dotType:
      d.value === lowest ? "low" : highestTwo.includes(d.value) ? "high" : "normal",
  }));
};

// Custom dot renderer using a top-level layer
const DotLayer = ({ cx, cy, radius, points }: any) => {
  return (
    <g>
      {points.map((p: any, i: number) => {
        const { x, y, dotType } = p;

        if (dotType === "high") {
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={18} fill="#27D787" opacity={0.25} />
              <circle cx={x} cy={y} r={10} fill="#27D787" />
              <circle cx={x} cy={y} r={4} fill="white" opacity={0.9} />
            </g>
          );
        }

        if (dotType === "low") {
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={18} fill="#FF8A3D" opacity={0.25} />
              <circle cx={x} cy={y} r={10} fill="#FF8A3D" />
              <circle cx={x} cy={y} r={4} fill="white" opacity={0.9} />
            </g>
          );
        }

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill="white"
            stroke="#14B8A6"
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
};

const OctagramChart = ({ scores }: OctagramChartProps) => {
  // Format and detect highlight groups
  let data = formatData(scores);
  data = getDotTypes(data);

  return (
    <div className="flex flex-col items-center mt-1">
      <div className="w-full max-w-xl">
        <ResponsiveContainer width="100%" height={430}>
          <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
            <PolarGrid stroke="#d7e2eb" strokeWidth={1} gridType="polygon" />

            <PolarAngleAxis
              dataKey="label"
              tickLine={false}
              tick={({ x, y, payload, index }) => {
                const dy = index === 0 ? -6 : index === 4 ? 12 : 4;
                return (
                  <text
                    x={x}
                    y={y + dy}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={13}
                    fontWeight={500}
                    dy={3}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            {/* Main shape */}
            <Radar
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fill="#4DD4AC"
              fillOpacity={0.35}
              dot={false} // ← disable default dots
            />

            {/* CUSTOM DOT LAYER */}
            <Customized
              component={({ width, height, cx, cy, radius }) => {
                // Compute each point's (x,y)
                const points = data.map((d, i) => {
                  const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                  const r = (d.value / 100) * radius * 1.35; // adjust scaling

                  return {
                    ...d,
                    x: cx + r * Math.cos(angle),
                    y: cy + r * Math.sin(angle),
                  };
                });

                return <DotLayer points={points} />;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#27D787]" /> Top Scores
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF8A3D]" /> Growth Area
        </div>
      </div>
    </div>
  );
};

export default OctagramChart;
