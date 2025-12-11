import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface OctagramChartProps {
  scores: Record<string, number>;
  componentNames: Record<string, string>;
}

const OctagramChart = ({ scores, componentNames }: OctagramChartProps) => {
  // Determine max score
  const maxValue = Math.max(...Object.values(scores));
  const SCALE = 0.7; // === 70%

  // Convert score object → normalized array for Recharts
  const data = Object.keys(scores).map((key) => ({
    key,
    label: componentNames[key] || key,
    rawValue: scores[key], // for highlighting logic
    value: (scores[key] / maxValue) * SCALE, // normalized
  }));

  if (!data.length) return <p>No chart data.</p>;

  // Sort using raw values (not normalized)
  const sortedData = [...data].sort((a, b) => b.rawValue - a.rawValue);

  const top1Key = sortedData[0]?.key;
  const top2Key = sortedData[1]?.key;
  const lowestKey = sortedData[sortedData.length - 1]?.key;

  const getHighlightType = (key: string) => {
    if (key === top1Key || key === top2Key) return "high";
    if (key === lowestKey) return "low";
    return "normal";
  };

  /* ---------------- DOT RENDERER ---------------- */
  const CustomDot = ({ cx, cy, payload }: any) => {
    const type = getHighlightType(payload.payload.key);

    if (type === "high") {
      return (
        <g>
          <circle cx={cx} cy={cy} r={16} fill="#27D787" opacity={0.25} />
          <circle cx={cx} cy={cy} r={10} fill="#27D787" />
          <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.7} />
        </g>
      );
    }

    if (type === "low") {
      return (
        <g>
          <circle cx={cx} cy={cy} r={16} fill="#FF8A3D" opacity={0.25} />
          <circle cx={cx} cy={cy} r={10} fill="#FF8A3D" />
          <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.7} />
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={6} fill="white" stroke="#4DD4AC" strokeWidth={2} />;
  };

  /* ---------------- LABEL RENDERER ---------------- */
  const CustomLabel = ({ x, y, payload, cx, cy }: any) => {
    if (!payload) return null;

    const label = payload.value;
    const words = label.split("-");
    const lines = words.length > 1 ? [words[0] + "-", words.slice(1).join("-")] : [label];

    const isRight = x > cx + 10;
    const isLeft = x < cx - 10;
    const isTop = y < cy - 10;
    const isBottom = y > cy + 10;

    let offsetX = isRight ? 16 : isLeft ? -16 : 0;
    let offsetY = isTop ? -10 : isBottom ? 14 : 0;

    let anchor = isRight ? "start" : isLeft ? "end" : "middle";

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={anchor}
        fill="#64748b"
        fontSize={12}
        fontWeight={500}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x + offsetX} dy={i === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* ======= CHART ======= */}
      <div className="octagram-chart-container p-4 w-full" style={{ minHeight: 520 }}>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />

            <PolarAngleAxis dataKey="label" tick={CustomLabel} tickLine={false} />

            <Radar
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fill="rgba(20,184,166,0.35)"
              dot={<CustomDot />}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* ======= LEGEND ======= */}
      <div className="flex items-center gap-6 mt-2 text-sm font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#27D787" }} />
          Top Score
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#FF8A3D" }} />
          Lowest Score
        </div>
      </div>
    </div>
  );
};

export default OctagramChart;
