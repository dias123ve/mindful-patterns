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
  // Convert scores → array usable by recharts
  const data = useMemo(() => {
    return Object.entries(scores).map(([key, value]) => ({
      label: componentNames[key] || key,
      value: value,
    }));
  }, [scores, componentNames]);

  // Highlight logic
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

    return <circle cx={cx} cy={cy} r={6} fill="white" stroke="#4DD4AC" strokeWidth={2} />;
  };

  const CustomLabel = ({ x, y, payload }: any) => {
    if (!x || !y || !payload) return null;

    const offsetX = x > 250 ? 10 : x < 250 ? -10 : 0;
    const offsetY = y > 250 ? 15 : y < 250 ? -10 : 0;

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={x > 260 ? "start" : x < 240 ? "end" : "middle"}
        fill="#64748b"
        fontSize={14}
        fontWeight={500}
        fontFamily="system-ui, sans-serif"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="octagram-chart-container">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
  );
};

export default OctagramChart;
