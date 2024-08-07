import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import ChartDeferred from "chartjs-plugin-deferred";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TimeSeriesScale,
  ChartOptions,
  TooltipItem,
  ChartTypeRegistry,
  ChartData,
} from "chart.js";
import { theme } from "~/lib/theme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartDeferred,
  TimeSeriesScale
);

export const options: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  updateMode: "resize",
  plugins: {
    deferred: {
      xOffset: 150,
      yOffset: 50,
      delay: 500,
    },
    tooltip: {
      displayColors: false,
      callbacks: {
        title: function (tooltipItems) {
          if (
            tooltipItems[0].dataIndex ===
            tooltipItems[0].chart.data.datasets[0].data.length - 1
          ) {
            return `Prediction for ${tooltipItems[0].label}`;
          }
          return tooltipItems[0].label;
        },
        label: function (tooltipItem) {
          let label = "";
          if (
            tooltipItem.dataIndex ===
            tooltipItem.chart.data.datasets[0].data.length - 1
          ) {
            label += "~";
          }
          // let label = tooltipItem.dataset.label || "";
          // if (label) {
          //   label += " ";
          // }
          if (tooltipItem.parsed.y !== null) {
            label += tooltipItem.parsed.y.toFixed(1) + " mmol/L";
          }
          return label;
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  scales: {
    y: {
      min: 1,
      max: 21,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      type: "time",
      bounds: "ticks",
      includeBounds: true,
      min: () => {
        return Date.now().valueOf() - 12 * 60 * 60 * 1000;
      },
      // max: () => {
      //   return Date.now().valueOf();
      // },
      adapters: {
        date: {},
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
};

function calculateTrend(
  data: Array<{ timestamp: number; glucose: number }>
): [number, number] {
  // linear regression
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].timestamp;
    sumY += data[i].glucose;
    sumXY += data[i].timestamp * data[i].glucose;
    sumXX += data[i].timestamp * data[i].timestamp;
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  return [m, b];
}

export function GlucoseChart({
  glucoseData,
}: {
  glucoseData: {
    graphData: Array<{ timestamp: number; glucose: number }>;
    latestMeasurement: {
      timestamp: number;
      glucose: number;
    };
  } | null;
}) {
  const graphData =
    glucoseData?.graphData.concat([
      {
        timestamp: glucoseData.latestMeasurement.timestamp,
        glucose: glucoseData.latestMeasurement.glucose,
      },
    ]) ?? [];
  const [m, b] = calculateTrend(graphData) ?? [0, 0];
  const graphDataWithTrend =
    graphData.concat([
      {
        timestamp: graphData[graphData.length - 1].timestamp + 30 * 60 * 1000,
        glucose:
          m * (graphData[graphData.length - 1].timestamp + 30 * 60 * 1000) + b,
      },
    ]) ?? [];

  const data: ChartData<"line"> = {
    labels: graphDataWithTrend.map((data) => data.timestamp) || [],
    datasets: [
      {
        label: "Glucose",
        data: graphDataWithTrend.map((data) => data.glucose) || [],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        cubicInterpolationMode: "monotone",
        segment: {
          borderColor: (ctx) =>
            ctx.p1DataIndex === graphDataWithTrend.length - 1
              ? theme.colors.glucoseTrend
              : theme.colors.glucose,
          borderDash: (ctx) =>
            ctx.p1DataIndex === graphDataWithTrend.length - 1 ? [5, 5] : [],
        },
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Glucose</CardTitle>
        <CardDescription>
          {glucoseData?.latestMeasurement.glucose.toFixed(1)} mmol/L
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Line options={options} data={data} />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {m > 0 ? "up" : "down"} by{" "}
          {Math.abs(
            m * (graphData[graphData.length - 1].timestamp + 60 * 60 * 1000) +
              b -
              graphData[graphData.length - 1].glucose
          ).toFixed(2)}{" "}
          mmol/L per hour
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the last 12 hours
        </div>
      </CardFooter>
    </Card>
  );
}
