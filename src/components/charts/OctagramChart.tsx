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

  const scale = 1.05;
  let labelX = cx + dx * scale;
  let labelY = cy + dy * scale;

  const anchor = dx > 15 ? "start" : dx < -15 ? "end" : "middle";

  // ---- AUTO WRAP TEKS ----
  const maxChars = 10; // batas sebelum dipotong menjadi 2 baris
  const text = payload.value;

  const words = text.split(" ");
  let line1 = "";
  let line2 = "";

  for (let w of words) {
    if ((line1 + " " + w).trim().length <= maxChars) {
      line1 = (line1 + " " + w).trim();
    } else {
      line2 = (line2 + " " + w).trim();
    }
  }

  // Tambah offset sedikit untuk estetika
  if (Math.abs(dx) > Math.abs(dy)) {
    labelX += dx > 0 ? 10 : -10;
  } else {
    labelY += dy > 0 ? 6 : -6;
  }

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
      <tspan x={labelX} dy="-0.2em">{line1}</tspan>
      {line2 && <tspan x={labelX} dy="1.2em">{line2}</tspan>}
    </text>
  );
};


  return (
    <div className="octagram-chart-container">

      {/* WRAPPER — batasi ukuran chart */}
      <div 
  className="mx-auto"
  style={{
    width: "480px",
    maxWidth: "100%",
    paddingLeft: "40px",
    paddingRight: "40px"
  }}
>
        <ResponsiveContainer width="100%" height={520}>
          <RadarChart
            cx="50%"
            cy="46%"
            outerRadius="68%"
            data={data}
            margin={{ top: 10, right: 60, bottom: 10, left: 60 }}
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
