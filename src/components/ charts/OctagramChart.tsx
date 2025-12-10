import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface OctagramChartProps {
  scores: Record<string, number>;
}

// ORDER of components for consistent radar shape
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

// Convert Supabase scores → chart-ready data
const formatData = (scores: Record<string, number>) => {
  const values = ORDER.map((k) => scores[k] ?? 0);
  const sorted = [...values].sort((a, b) => b - a);

  const highestTwo = sorted.slice(0, 2);
  const lowest = sorted[sorted.length - 1];

  return ORDER.map((key, index) => {
    const value = scores[key] ?? 0;

    let dotType: "high" | "low" | "normal" = "normal";
    if (value === lowest) dotType = "low";
    else if (highestTwo.includes(value)) dotType = "high";

    return {
      key,
      label: key
        .replace("self-", "Self-")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
      dotType,

      // ⭐ Secret Trick to force Recharts to include dotType into payload
      _dotValue: 1,
    };
  });
};

// CUSTOM DOT
const CustomDot = ({ cx, cy, payload }: any) => {
  if (!payload || !cx || !cy) return null;

  const type = payload.dotType;

  if (type === "high") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={18} fill="#27D787" opacity={0.28} />
        <circle cx={cx} cy={cy} r={10} fill="#27D787" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      </g>
    );
  }

  if (type === "low") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={18} fill="#FF8A3D" opacity={0.28} />
        <circle cx={cx} cy={cy} r={10} fill="#FF8A3D" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill="white"
      stroke="#14B8A6"
      strokeWidth={2}
    />
  );
};

// CUSTOM LABEL — prevent overlap
const CustomLabel = ({ x, y, payload, index }: any) => {
  if (!x || !y) return null;

  const dyAdjust = index === 0 ? -6 : index === 4 ? 12 : 4;

  return (
    <text
      x={x}
      y={y + dyAdjust}
      textAnchor="middle"
      fill="#64748b"
      fontSize={13}
      fontWeight={500}
      dy={3}
    >
      {payload.value}
    </text>
  );
};

const OctagramChart = ({ scores }: OctagramChartProps) => {
  const data = formatData(scores);

  return (
    <div className="flex flex-col items-center mt-1">
      {/* Radar Chart */}
      <div className="w-full max-w-xl">
        <ResponsiveContainer width="100%" height={430}>
          <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
            <PolarGrid stroke="#d7e2eb" strokeWidth={1} gridType="polygon" />

            <PolarAngleAxis
              dataKey="label"
              tick={CustomLabel}
              tickLine={false}
            />

            <Radar
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fill="#4DD4AC"
              fillOpacity={0.35}
              dot={<CustomDot />}
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
