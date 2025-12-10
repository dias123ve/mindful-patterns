import React from "react";

interface OctagonChartProps {
  scores: Record<string, number>;
  componentNames: Record<string, string>;
}

const OctagonChart: React.FC<OctagonChartProps> = ({ scores, componentNames }) => {
  const maxScore = 50; // max per component
  const keys = Object.keys(scores);

  // Convert polar coordinates to x,y positions
  const points = keys.map((key, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2; // start at top
    const radius = 120 * (scores[key] / maxScore); // scale radius by score
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return `${x},${y}`;
  });

  // Outer perfect octagon (for reference grid)
  const outerPoints = keys.map((_, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    const radius = 120; // full radius
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return `${x},${y}`;
  });

  return (
    <div className="w-full flex justify-center">
      <svg width="320" height="320" viewBox="-160 -160 320 320">
        {/* Outer octagon */}
        <polygon
          points={outerPoints.join(" ")}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1.5"
        />

        {/* Filled score shape */}
        <polygon
          points={points.join(" ")}
          fill="rgba(99,102,241,0.35)"
          stroke="rgb(99,102,241)"
          strokeWidth="2"
        />

        {/* Labels around the octagon */}
        {keys.map((key, i) => {
          const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
          const labelRadius = 150;
          const x = labelRadius * Math.cos(angle);
          const y = labelRadius * Math.sin(angle);

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
