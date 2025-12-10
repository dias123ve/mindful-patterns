import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const data = [
  { label: "Self-Identity", value: 72 },
  { label: "Self-Esteem", value: 55 },
  { label: "Self-Confidence", value: 48 },
  { label: "Self-Agency", value: 68 },
  { label: "Self-Assertiveness", value: 40 },
  { label: "Self-Regulation", value: 50 },
  { label: "Self-Motivation", value: 60 },
  { label: "Self-Compassion", value: 45 },
];

// ---- Highlight Logic ----
const values = data.map((d) => d.value);
const sortedValues = [...values].sort((a, b) => b - a);

const highestTwo = [sortedValues[0], sortedValues[1]];
const lowest = sortedValues[sortedValues.length - 1];

const getHighlightType = (value: number): "high" | "low" | "normal" => {
  if (value === lowest) return "low";
  if (highestTwo.includes(value)) return "high";
  return "normal";
};

// ---- Custom DOT ----
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { label: string; value: number };
}

const CustomDot = ({ cx, cy, payload }: CustomDotProps) => {
  if (!cx || !cy || !payload) return null;

  const type = getHighlightType(payload.value);

  if (type === "high") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="#27D787" opacity={0.25} filter="url(#glowGreen)" />
        <circle cx={cx} cy={cy} r={10} fill="#27D787" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.6} />
      </g>
    );
  }

  if (type === "low") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="#FF8A3D" opacity={0.25} filter="url(#glowOrange)" />
        <circle cx={cx} cy={cy} r={10} fill="#FF8A3D" />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.6} />
      </g>
    );
  }

  // Normal dots
  return (
    <circle cx={cx} cy={cy} r={6} fill="white" stroke="#4DD4AC" strokeWidth={2} />
  );
};

// ---- Custom Label for axis ----
const CustomLabel = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) => {
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
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {payload.value}
    </text>
  );
};

// ---- Main Component ----
const OctagramChart = () => {
  return (
    <div className="octagram-chart-container">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          
          {/* Gradients & Glow */}
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4DD4AC" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.4} />
            </linearGradient>

            <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glowOrange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid */}
          <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />

          {/* Labels */}
          <PolarAngleAxis dataKey="label" tick={CustomLabel} tickLine={false} />

          {/* Radar shape */}
          <Radar
            name="Values"
            dataKey="value"
            stroke="#14B8A6"
            strokeWidth={2}
            fill="url(#radarGradient)"
            dot={<CustomDot />}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OctagramChart;
