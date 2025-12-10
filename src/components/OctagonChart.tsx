import React from "react";

interface OctagonChartProps {
  scores: Record<string, number>;
  componentNames: Record<string, string>; // maps component_key → readable label
}

// FIXED ORDER — MUST MATCH Supabase component_scores EXACTLY
const ORDERED_KEYS = [
  "self-identity",
  "self-esteem",
  "self-agency",
  "self-awareness",
  "self-connection",
  "self-motivation",
  "self-regulation",
  "self-protection",
];

const OctagonChart: React.FC<OctagonChartProps> = ({ scores, componentNames }) => {
  const maxScore = 50;

  // Check if data exists
  const hasData = ORDERED_KEYS.some((key) => scores[key] !== undefined);
  if (!hasData) return null;

  // Create polygon points for the score shape
  const points = ORDERED_KEYS.map((key, i) => {
    const value = scores[key] ?? 0;
    const angle = (Math.PI * 2 * i) / ORDERED_KEYS.length - Math.PI / 2;
    const radius = 120 * (value / maxScore);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return `${x},${y}`;
  });

  // Outer reference polygon
  const outerPoints = ORDERED_KEYS.map((_, i) => {
    const angle = (Math.PI * 2 * i) / ORDERED_KEYS.length - Math.PI / 2;
    const radius = 120;
    return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
  });

  return (
    <div className="w-full flex justify-center">
      <svg width="320" height="320" viewBox="-160 -160 320 320">

        {/* Outer octagon grid */}
        <polygon
          points={outerPoints.join(" ")}
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1.5"
        />

        {/* Score Fill */}
        <polygon
          points={points.join(" ")}
          fill="rgba(99,102,241,0.35)"
          stroke="rgb(99,102,241)"
          strokeWidth="2"
        />

        {/* Labels */}
        {ORDERED_KEYS.map((key, i) => {
          const angle = (Math.PI * 2 * i) / ORDERED_KEYS.length - Math.PI / 2;
          const distance = 150;
          const x = distance * Math.cos(angle);
          const y = distance * Math.sin(angle);

          return (
            <text
              key={key}
              x={x}
              y={y}
              fill="#6b7280"
              fontSize="11"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {componentNames[key] ?? key}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default OctagonChart;
