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
  // Get highest score for normalization
  const maxValue = Math.max(...Object.values(scores));
  const SCALE = 0.8; // reduce max height

  // Normalize data
  const data = Object.keys(scores).map((key) => ({
    key,
    label: componentNames[key] || key,
    rawValue: scores[key],
    value: (scores[key] / maxValue) * SCALE,
  }));

  if (!data.length) return <p>No chart data.</p>;

  // Highlight logic
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

  /* ---------------- RESPONSIVE LABEL ---------------- */
  const CustomLabel = ({ x, y, payload, cx, cy, viewBox }: any) => {
    if (!payload) return null;

    const label = payload.value;
    const words = label.split("-");
    const lines = words.length > 1 ? [words[0] + "-", words.slice(1).join("-")] : [label];

    const chartWidth = viewBox?.outerRadius ? viewBox.outerRadius * 2 : 300;

    // Responsive font size
    const fontSize = Math.max(9, Math.min(12, chartWidth / 30));
    const lineHeight = fontSize + 2;

    const isRight = x > cx + 10;
    const isLeft = x < cx - 10;
    const isTop = y < cy - 10;
    const isBottom = y > cy + 10;

    // Responsive offset
    const offsetScale = Math.max(0.7, Math.min(1, chartWidth / 300));
    let offsetX = isRight ? 14 * offsetScale : isLeft ? -14 * offsetScale : 0;
    let offsetY = isTop ? -10 * offsetScale : isBottom ? 14 * offsetScale : 0;

    let anchor =
      isRight ? "start" : isLeft ? "end" : "middle";

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={anchor}
        fill="#64748b"
        fontSize={fontSize}
        fontWeight={500}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x + offsetX} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div
        className="octagram-chart-container p-3 sm:p-4 w-full"
        style={{
          minHeight: 150,         // mobile
        }}
      >
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="42%"        // MOBILE-FRIENDLY
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
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

      {/* LEGEND */}
      <div className="flex items-center gap-6 mt-1 text-sm font-medium text-slate-600">
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
