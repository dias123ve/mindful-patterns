import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// ---------------------
// DATA (EDITABLE)
// ---------------------
const data = [
  { label: "Self-Identity", value: 72 },
  { label: "Self-Esteem", value: 55 },
  { label: "Self-Confidence", value: 48 },
  { label: "Self-Agency", value: 68 },
  { label: "Self-Assertiveness", value: 40 },
  { label: "Self-Regulation", value: 35 }, // ← lowest
  { label: "Self-Motivation", value: 60 },
  { label: "Self-Compassion", value: 45 },
];

// ---------------------
// LOGIC FOR HIGHLIGHT
// ---------------------
const values = data.map((d) => d.value);
const sorted = [...values].sort((a, b) => b - a);

const highestTwo = sorted.slice(0, 2);
const lowestOne = sorted[sorted.length - 1];

const getType = (value: number) => {
  if (value === lowestOne) return "low";
  if (highestTwo.includes(value)) return "high";
  return "normal";
};

// ---------------------
// CUSTOM DOT COMPONENT
// ---------------------
const CustomDot = ({ cx, cy, payload }: any) => {
  if (!cx || !cy || !payload) return null;

  const type = getType(payload.value);

  if (type === "high") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={18} fill="#27D787" opacity={0.25} />
        <circle cx={cx} cy={cy} r={10} fill="#27D787" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      </g>
    );
  }

  if (type === "low") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={18} fill="#FF8A3D" opacity={0.25} />
        <circle cx={cx} cy={cy} r={10} fill="#FF8A3D" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      </g>
    );
  }

  return (
    <circle cx={cx} cy={cy} r={5} fill="white" stroke="#14B8A6" strokeWidth={2} />
  );
};

// ---------------------
// CUSTOM LABEL (FIXED CLIPPING)
// ---------------------
const CustomLabel = ({ x, y, payload }: any) => {
  if (!x || !y || !payload) return null;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="#64748b"
      fontSize={13}
      fontWeight={500}
      dy={4}
    >
      {payload.value}
    </text>
  );
};

// ---------------------
// MAIN COMPONENT
// ---------------------
const OctagramChart = () => {
  return (
    <div className="flex flex-col items-center mt-4">
      {/* RADAR CHART */}
      <div className="w-full max-w-xl -mt-2"> 
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
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

      {/* LEGENDS */}
      <div className="flex gap-6 mt-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#27D787]" />
          Top Scores
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF8A3D]" />
          Growth Area
        </div>
      </div>
    </div>
  );
};

export default OctagramChart;
