"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

import { DateTime } from "luxon";

// generate random data with seed (List of objects with timestamp, desktop, mobile)

const generateRandomData = (numPoints: number): number[] => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push(Math.random() * 21); // Random values between 0 and 100
  }
  return data;
};

const smoothData = (data: number[], factor: number): number[] => {
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    for (let j = Math.max(0, i - factor); j <= i; j++) {
      sum += data[j];
    }
    smoothed.push(sum / (i - Math.max(0, i - factor) + 1)); // Moving average
  }
  return smoothed;
};

const data1 = smoothData(generateRandomData(12 * 60), 50);

const chartData = data1.map((value, index) => {
  return {
    timestamp: DateTime.local()
      .minus({ minutes: 12 * 60 - index })
      .toISO(),
    desktop: value,
  };
});

const chartConfig = {
  desktop: {
    label: "Glucose",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function GlucoseChart() {
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
            data={chartData}
            margin={{
              right: 36,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value) => {
                return DateTime.fromISO(value).toLocaleString(
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
            <ReferenceArea
              y1={10}
              y2={1000}
              fill="var(--chart-bad)"
              fillOpacity={0.1}
              ifOverflow="visible"
            />
            <ReferenceLine
              y={10}
              stroke="var(--chart-bad)"
              strokeDasharray="3 5"
              label={{
                value: "High",
                position: "insideBottomRight",
                fill: "var(--chart-bad)",
              }}
            />
            <ReferenceArea
              y1={7}
              y2={10}
              fill="var(--chart-warning)"
              fillOpacity={0.1}
              ifOverflow="visible"
            />
            <ReferenceLine
              y={7}
              stroke="var(--chart-warning)"
              strokeDasharray="3 5"
              label={{
                value: "High",
                position: "insideBottomRight",
                fill: "var(--chart-warning)",
              }}
            />
            <ReferenceArea
              y1={4}
              y2={7}
              fill="var(--chart-good)"
              fillOpacity={0.1}
              ifOverflow="visible"
            />
            <ReferenceLine
              y={4}
              stroke="var(--chart-bad)"
              strokeDasharray="3 5"
              label={{
                value: "Low",
                position: "insideTopRight",
                fill: "var(--chart-bad)",
              }}
            />
            <ReferenceArea
              y1={0}
              y2={4}
              fill="var(--chart-bad)"
              fillOpacity={0.1}
              ifOverflow="visible"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return DateTime.fromISO(value).toLocaleString(
                      DateTime.DATETIME_MED_WITH_SECONDS
                    );
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
              dataKey="desktop"
              type="monotone"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
