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

  return (
    <div className="octagram-chart-container">
      <div className="mx-auto" style={{ width: "480px", maxWidth: "100%" }}>
        <ResponsiveContainer width="100%" height={520}>
          <RadarChart
            cx="50%"
            cy="46%"
            outerRadius="68%"
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />

            {/** MATIKAN LABEL DEFAULT */}
            <PolarAngleAxis dataKey="label" tick={false} tickLine={false} />

            <Radar
              name="Values"
              dataKey="value"
              stroke="#14B8A6"
              strokeWidth={2}
              fillOpacity={0.6}
              fill="#4DD4AC"
              dot={<CustomDot />}
            />

            {/** LABEL MANUAL — TIDAK TERPOTONG */}
            <svg>
              {data.map((entry, index) => {
                const total = data.length;
                const angle = (Math.PI * 2 * index) / total - Math.PI / 2;

                // center chart (harus mengikuti cy/cx RadarChart)
                const cx = 240; 
                const cy = 240;

                // radius label (semakin besar, semakin keluar)
                const radius = 200;

                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);

                const cos = Math.cos(angle);
                const anchor =
                  cos > 0.3 ? "start" :
                  cos < -0.3 ? "end" :
                  "middle";

                return (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    fill="#64748b"
                    fontSize={13}
                    fontWeight={500}
                  >
                    {entry.label}
                  </text>
                );
              })}
            </svg>
          </RadarChart>
        </ResponsiveContainer>
      </div>

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
