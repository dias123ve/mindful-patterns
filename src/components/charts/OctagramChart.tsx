import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface OctagramChartProps {
  scores: Record<string, number>;
  componentNames: Record<string, string>;
}

const OctagramChart = ({ scores, componentNames }: OctagramChartProps) => {
  // Prevent rendering when empty (hindari chart blank)
  if (!scores || Object.keys(scores).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No data available
      </div>
    );
  }

  // Convert data → chart format
  const data = useMemo(() => {
    return Object.entries(scores).map(([key, value]) => ({
      key,
      label: componentNames[key] || key,
      value,
    }));
  }, [scores, componentNames]);

  // Determine top 2 & lowest using index
  const sorted = [...data]
    .map((d, i) => ({ ...d, i }))
    .sort((a, b) => b.value - a.value);

  const topTwo = sorted.slice(0, 2).map((x) => x.i);
  const lowestIndex = sorted[sorted.length - 1].i;

  const getHighlightType = (index: number): "high" | "low" | "normal" => {
    if (topTwo.includes(index)) return "high";
    if (index === lowestIndex) return "low";
    return "normal";
  };

  // DOT styling
  const CustomDot = ({ cx, cy, payload }: any) => {
    if (!cx || !cy) return null;

    const type = getHighlightType(payload.index);

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

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="white"
        stroke="#4DD4AC"
        strokeWidth={2}
      />
    );
  };

  // LABEL FIX — auto offset based on angle
  const CustomLabel = ({ x, y, payload }: any) => {
    const label = payload?.payload?.label;
    if (!label) return null;

    const angle = payload.coordinate?.angle ?? 0;
    const offset = 20;
    const posY = angle > 180 ? y + offset : y - offset;

    const words = label.split(" ");
    const maxChars = 12;
    let line1 = "";
    let line2 = "";

    for (let w of words) {
      if ((line1 + " " + w).trim().length <= maxChars) {
        line1 = (line1 + " " + w).trim();
      } else {
        line2 = (line2 + " " + w).trim();
      }
    }

    return (
      <text
        x={x}
        y={posY}
        textAnchor="middle"
        fill="#64748b"
        fontSize={13}
        fontWeight={500}
      >
        <tspan x={x} dy="-0.2em">{line1}</tspan>
        {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
      </text>
    );
  };

  // Inject index untuk highlight system
  const chartData = data.map((d, i) => ({ ...d, index: i }));

  return (
    <div className="octagram-chart-container">
      <div
        className="mx-auto"
        style={{
          width: "480px",
          maxWidth: "100%",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
      >
        <ResponsiveContainer width="100%" height={520}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="60%"
            data={chartData}
            margin={{ top: 10, right: 50, bottom: 10, left: 50 }}
          >
            <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />
            <PolarAngleAxis
              dataKey="label"
              tick={CustomLabel}
              tickLine={false}
            />
            <Radar
              name="Values"
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fillOpacity={0.6}
              fill="#4DD4AC"
              dot={<CustomDot />}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#27D787]"></span>
          <span>Top Score</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF8A3D]"></span>
          <span>Grow Area</span>
        </div>
      </div>
    </div>
  );
};

export default OctagramChart;
