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
  // Normalize values
  const maxValue = Math.max(...Object.values(scores));
  const SCALE = 0.6; // radar height

  const data = Object.keys(scores).map((key) => ({
    key,
    label: componentNames[key] || key,
    rawValue: scores[key],
    value: (scores[key] / maxValue) * SCALE,
  }));

  if (!data.length) return <p>No chart data.</p>;

  // Highlight logic
  const sorted = [...data].sort((a, b) => b.rawValue - a.rawValue);
  const top1 = sorted[0]?.key;
  const top2 = sorted[1]?.key;
  const lowest = sorted[sorted.length - 1]?.key;

  const getHighlightType = (key: string) => {
    if (key === top1 || key === top2) return "high";
    if (key === lowest) return "low";
    return "normal";
  };

  /* -------------------------------------------------
     DOT RENDERER — pulls dots inward without error
  -------------------------------------------------- */
  const CustomDot = (props: any) => {
    const { cx, cy, payload, chartWidth, chartHeight } = props;

    if (!cx || !cy || !payload) return null;

    const type = getHighlightType(payload.payload.key);

    // true center of radar
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;

    // how much dot should be pulled inward
    const DOT_PULL = 1 - SCALE; // automatic sync with radar scale

    const adjX = cx + (centerX - cx) * DOT_PULL;
    const adjY = cy + (centerY - cy) * DOT_PULL;

    if (type === "high") {
      return (
        <g>
          <circle cx={adjX} cy={adjY} r={16} fill="#27D787" opacity={0.25} />
          <circle cx={adjX} cy={adjY} r={10} fill="#27D787" />
          <circle cx={adjX} cy={adjY} r={4} fill="white" opacity={0.7} />
        </g>
      );
    }

    if (type === "low") {
      return (
        <g>
          <circle cx={adjX} cy={adjY} r={16} fill="#FF8A3D" opacity={0.25} />
          <circle cx={adjX} cy={adjY} r={10} fill="#FF8A3D" />
          <circle cx={adjX} cy={adjY} r={4} fill="white" opacity={0.7} />
        </g>
      );
    }

    return (
      <circle
        cx={adjX}
        cy={adjY}
        r={6}
        fill="white"
        stroke="#4DD4AC"
        strokeWidth={2}
      />
    );
  };

  /* -------------------------------------------------
     RESPONSIVE LABEL RENDERER
  -------------------------------------------------- */
  const CustomLabel = ({ x, y, payload, cx, cy, viewBox }: any) => {
    if (!payload) return null;

    const label = payload.value;
    const parts = label.split("-");
    const lines =
      parts.length > 1 ? [parts[0] + "-", parts.slice(1).join("-")] : [label];

    const fontSize = Math.max(9, 12);

    const isRight = x > cx;
    const isLeft = x < cx;
    const isTop = y < cy;
    const isBottom = y > cy;

    let offsetX = isRight ? 14 : isLeft ? -14 : 0;
    let offsetY = isTop ? -10 : isBottom ? 14 : 0;

    const anchor = isRight ? "start" : isLeft ? "end" : "middle";

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={anchor}
        fill="#64748b"
        fontSize={fontSize}
        fontWeight={500}
      >
        {lines.map((line, idx) => (
          <tspan key={idx} x={x + offsetX} dy={idx === 0 ? 0 : fontSize + 2}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  /* -------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="octagram-chart-container p-1 w-full" style={{ minHeight: 260 }}>
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="52%"   // chart stays big
            data={data}
            margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
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

      {/* Legend */}
      <div className="flex items-center gap-6 mt-[4px] mb-[6px] text-sm font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-[#27D787]" />
          Top Score
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-[#FF8A3D]" />
          Lowest Score
        </div>
      </div>
    </div>
  );
};

export default OctagramChart;
