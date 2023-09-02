import { Card, Grid, Loading, Text, useTheme } from "@nextui-org/react";
import { useState, useEffect } from "react";
import React from "react";
import { Flex } from "./styles/flex";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
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
} from "chart.js";

import ChartDeferred from "chartjs-plugin-deferred";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartDeferred,
  TimeSeriesScale,
);
export const options = {
  responsive: true,
  maintainAspectRatio: false,
  updateMode: "resize",
  plugins: {
    deferred: {
      xOffset: 150,
      yOffset: 50,
      delay: 500
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          var label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + " BRPM";
          }
          return label;
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index" as "index" | "y" | "x" | "dataset" | "point" | "nearest" | undefined,
  },
  scales: {
    y: {
      min: 5,
      max: 25,
      grid: {
        display: false,
      },
      border: {
        display: false
      },
    },
    x: {
      type: "time" as "time",
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
        display: false
      },
    },
  },
};

type ChartData = {
  labels: string[];
  datasets: ChartDataset<"line", (number | Point | null)[]>[];
};


const upperLimit = 20;
const lowerLimit = 10;

function getHexFromTheme(themeValue: string) {
  const match = themeValue.match(/var\((.*?)\)/);
  if (match) {
    const cssVar = match[1];
    return getComputedStyle(document.documentElement).getPropertyValue(cssVar);
  }
  return themeValue;
}

function getColor(y: number, theme?: any) {
  return y > upperLimit ? getHexFromTheme(theme?.colors.error.value) : y < lowerLimit ? getHexFromTheme(theme?.colors.error.value) : getHexFromTheme(theme?.colors.success.value);
}

export default function RespirationSection() {
  const { theme } = useTheme();
  const [respirationValue, setRespirationValue] = useState(0);
  const [chartData, setChartData] = useState({} as ChartData);


  const fetchData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/respiration", {
        method: "GET",
        next: {
          revalidate: 120,
          tags: ["respriation"],
        },
        headers: {
          "Cache-Control": "max-age=0, s-maxage=120, stale-while-revalidate",
        },
      });
      const data = await response.json();
      var respirationTimestamps = data.respirationValuesArray.map((item: any) => new Date(item[0] as number));
      var respirationValues = data.respirationValuesArray.map((item: any) => item[1] as number);
      setRespirationValue(respirationValues[respirationValues.length - 1]);
      setChartData({
        labels: respirationTimestamps,
        datasets: [
          {
            data: respirationValues,
            fill: false,
            borderWidth: 3,
            pointRadius: 1,
            backgroundColor: ctx => getColor(ctx.raw as number, theme),
            borderColor: ctx => getColor(ctx.raw as number, theme),
            segment: {
              borderColor: ctx => getColor(ctx.p0.parsed.y, theme),
            },
            tension: 0.1,
            yAxisID: "y",
            xAxisID: "x",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex
      direction={"column"}
      align={"center"}
      css={{
        "pt": "$10",
        "pb": "$10",
        "px": "$6",
        "@md": {
          px: "$64",
        },
      }}
    >
      <Card>
        <Card.Header>
          <Grid.Container css={{ pl: "$6" }}>
            <Grid xs={12}>
              <Text h3 css={{ lineHeight: "$xs" }}>
                Respiration
              </Text>
            </Grid>
            <Grid xs={12}>
              {
                respirationValue > 0 ? (
                  <Text css={{ color: "$accents8" }}>{respirationValue} BRPM</Text>
                ) : (
                  <Loading size="sm" />
                )
              }
            </Grid>
          </Grid.Container>
        </Card.Header>
        <Card.Divider />
        <Card.Body>
          {
            chartData.labels && chartData.datasets ? (
              <Line options={options} data={chartData} />
            ) : (
              <Loading size="lg" />
            )
          }
        </Card.Body>
      </Card>
    </Flex>
  );
}