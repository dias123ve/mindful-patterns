import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface OctagonChartProps {
  scores: Record<string, number>;
  labels: string[];
}

const OctagonChart: React.FC<OctagonChartProps> = ({ scores, labels }) => {
  // Convert the score dictionary into an ordered array matching the labels
  const dataValues = labels.map((key) => scores[key] ?? 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Your Profile",
        data: dataValues,
        backgroundColor: "rgba(99, 102, 241, 0.25)", // soft primary
        borderColor: "rgba(99, 102, 241, 1)", // primary
        borderWidth: 2,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100, // adjust if your scale differs
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
        angleLines: {
          color: "rgba(0,0,0,0.1)",
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "#6b7280", // muted grey
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-72 md:h-80 lg:h-96">
      <Radar data={data} options={options} />
    </div>
  );
};

export default OctagonChart;
