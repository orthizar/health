"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    data.push(Math.random() * 100); // Random values between 0 and 100
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
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
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
              left: 12,
              right: 12,
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
            <ChartTooltip
              labelFormatter={(value) => {
                return DateTime.fromISO(value).toLocaleString(
                  DateTime.DATETIME_MED_WITH_SECONDS
                );
              }}
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
