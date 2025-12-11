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
  /* ---------------- NORMALIZATION ---------------- */
  const maxValue = Math.max(...Object.values(scores));
  const SCALE = 0.4; // shrink radar area to 40% of chart radius

  const data = Object.keys(scores).map((key) => ({
    key,
    label: componentNames[key] || key,
    rawValue: scores[key],
    value: (scores[key] / maxValue) * SCALE,
  }));

  if (!data.length) return <p>No chart data.</p>;

  /* ---------------- HIGHLIGHT LOGIC ---------------- */
  const sorted = [...data].sort((a, b) => b.rawValue - a.rawValue);
  const top1 = sorted[0]?.key;
  const top2 = sorted[1]?.key;
  const lowest = sorted[sorted.length - 1]?.key;

  const getHighlightType = (key: string) => {
    if (key === top1 || key === top2) return "high";
    if (key === lowest) return "low";
    return "normal";
  };

  /* ---------------- DOT OFFSET FIX (FINAL) ---------------- */
  const CustomDot = (props: any) => {
    const { cx, cy, payload, viewBox } = props;

    const type = getHighlightType(payload.payload.key);

    // TRUE center of chart
    const centerX = viewBox.cx;
    const centerY = viewBox.cy;

    // DOT actual original coordinate
    const baseX = cx;
    const baseY = cy;

    // Move dot inward: if SCALE = 0.4 → factor = 0.6
    const factor = 1 - SCALE;

    const adjX = baseX + (centerX - baseX) * factor;
    const adjY = baseY + (centerY - baseY) * factor;

    /* -------- DOT DRAWING -------- */
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

  /* ---------------- RESPONSIVE LABEL ---------------- */
  const CustomLabel = ({ x, y, payload, cx, cy, viewBox }: any) => {
    if (!payload) return null;

    const label = payload.value;
    const parts = label.split("-");
    const lines = parts.length > 1 ? [parts[0] + "-", parts.slice(1).join("-")] : [label];

    const chartWidth = viewBox?.outerRadius ? viewBox.outerRadius * 2 : 300;

    const fontSize = Math.max(9, Math.min(12, chartWidth / 28));
    const lineHeight = fontSize + 2;

    const isRight = x > cx;
    const isLeft = x < cx;
    const isTop = y < cy;
    const isBottom = y > cy;

    const offsetScale = Math.max(0.7, Math.min(1, chartWidth / 300));
    let offsetX = isRight ? 14 * offsetScale : isLeft ? -14 * offsetScale : 0;
    let offsetY = isTop ? -10 * offsetScale : isBottom ? 14 * offsetScale : 0;

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
          <tspan key={idx} x={x + offsetX} dy={idx === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-full flex flex-col items-center gap-2">

      {/* CHART WRAPPER */}
      <div className="octagram-chart-container p-1 sm:p-1 w-full" style={{ minHeight: 260 }}>
        <ResponsiveContainer
          width="100%"
          height={
            window.innerWidth < 640 ? 280 :
            window.innerWidth < 1024 ? 350 :
            420
          }
        >
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={
              window.innerWidth < 640 ? "34%" :
              window.innerWidth < 1024 ? "38%" :
              "42%"
            }
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

      {/* LEGEND */}
      <div className="flex items-center gap-6 mt-[3px] mb-[6px] text-sm font-medium text-slate-600">
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
