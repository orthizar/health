import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import ChartDeferred from "chartjs-plugin-deferred";
import { DateTime } from "luxon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartDataset,
  Point,
  TimeSeriesScale,
  ChartOptions,
  TooltipItem,
  ChartTypeRegistry,
} from "chart.js";

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
      callbacks: {
        label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + " mmol/L";
          }
          return label;
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index" as
      | "index"
      | "y"
      | "x"
      | "dataset"
      | "point"
      | "nearest"
      | undefined,
  },
  scales: {
    y: {
      min: 1,
      max: 15,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      type: "time" as const,
      bounds: "ticks" as "ticks" | "data" | "ticks" | undefined,
      includeBounds: true,
      min: () => {
        return Date.now().valueOf() - 12 * 60 * 60 * 1000;
      },
      max: () => {
        return Date.now().valueOf();
      },
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

export function GlucoseChart({
  glucoseData,
}: {
  glucoseData: {
    graphData: Array<{ timestamp: number; glucose?: number; latest?: number }>;
    latestMeasurement: {
      timestamp: number;
      glucose: number;
    };
  } | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Glucose</CardTitle>
        <CardDescription>Today</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            margin={{
              left: 0,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
              interval="equidistantPreserveStart"
              tickFormatter={(value) => {
                return DateTime.fromMillis(value).toLocaleString(
                  DateTime.TIME_SIMPLE
                );
              }}
            />
            <YAxis
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              domain={[0, 21]}
              ticks={[4, 7, 10, 15, 21]}
              allowDataOverflow={true}
              tickFormatter={(value) => {
                return value.toFixed(0);
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    console.log(value, payload);
                    return DateTime.fromMillis(
                      payload[0].payload.timestamp
                    ).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
                  }}
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {(value as number).toFixed(1)}
                        <span className="font-normal text-muted-foreground">
                          mmol/L
                        </span>
                      </div>
                    </>
                  )}
                />
              }
            />

            <Line
              dataKey="glucose"
              data={[
                // {
                //   timestamp: glucoseData?.graphData.reduce((prev, current) =>
                //     prev.timestamp > current.timestamp ? prev : current
                //   ).timestamp,
                //   glucose: glucoseData?.graphData.reduce((prev, current) =>
                //     prev.timestamp > current.timestamp ? prev : current
                //   ).glucose,
                // },
                {
                  timestamp: glucoseData?.latestMeasurement.timestamp,
                  glucose: glucoseData?.latestMeasurement.glucose,
                },
              ]}
              type="monotone"
              stroke="hsl(var(--chart-heartrate))"
              strokeWidth={3}
              dot={false}
              strokeDasharray="1 1"
              name="latest"
            />
            <Line
              dataKey="glucose"
              name="glucose"
              data={glucoseData?.graphData}
              type="monotone"
              stroke="hsl(var(--chart-glucose))"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
