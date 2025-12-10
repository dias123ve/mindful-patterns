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
  const data = useMemo(() => {
    return Object.entries(scores).map(([key, value]) => ({
      label: componentNames[key] || key,
      value,
    }));
  }, [scores, componentNames]);

  const values = data.map((d) => d.value);
  const sortedValues = [...values].sort((a, b) => b - a);
  const highestTwo = [sortedValues[0], sortedValues[1]];
  const lowest = sortedValues[sortedValues.length - 1];

  const getHighlightType = (value: number): "high" | "low" | "normal" => {
    if (highestTwo.includes(value)) return "high";
    if (value === lowest) return "low";
    return "normal";
  };

  const CustomDot = ({ cx, cy, payload }: any) => {
    if (!cx || !cy || !payload) return null;

    const type = getHighlightType(payload.value);

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
      <circle cx={cx} cy={cy} r={6} fill="white" stroke="#4DD4AC" strokeWidth={2} />
    );
  };

  // FINAL LABEL FIX
  const CustomLabel = ({ cx, cy, x, y, payload }: any) => {
    if (!x || !y || !payload) return null;

    const dx = x - cx;
    const dy = y - cy;

    const scale = 1.10; // lebih dekat
    let labelX = cx + dx * scale;
    let labelY = cy + dy * scale;

    if (Math.abs(dx) > Math.abs(dy)) {
      labelX += dx > 0 ? 10 : -10;
    } else {
      labelY += dy > 0 ? 6 : -4;
    }

    const anchor = dx > 15 ? "start" : dx < -15 ? "end" : "middle";

    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor={anchor}
        fill="#64748b"
        fontSize={13}
        fontWeight={500}
        fontFamily="system-ui, sans-serif"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="octagram-chart-container">

      {/* WRAPPER — batasi ukuran chart */}
      <div className="mx-auto" style={{ width: "480px", maxWidth: "100%" }}>
        <ResponsiveContainer width="100%" height={520}>
          <RadarChart
            cx="50%"
            cy="46%"
            outerRadius="68%"
            data={data}
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />
            <PolarAngleAxis dataKey="label" tick={CustomLabel} tickLine={false} />
            <Radar
              name="Values"
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fillOpacity={0.6}
              fill="#4DD4AC"
              dot={<CustomDot />}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* SINGLE LEGEND (tidak duplikat) */}
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
