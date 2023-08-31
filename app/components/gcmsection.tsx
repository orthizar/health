import { Card, Grid, Loading, Text, useTheme } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import React from 'react';
import { Flex } from "./styles/flex";
import { North, NorthEast, South, SouthEast, East } from "@mui/icons-material";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
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
} from 'chart.js';

import ChartDeferred from 'chartjs-plugin-deferred';

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
  updateMode: 'resize',
  plugins: {
    deferred: {
      xOffset: 150,
      yOffset: 50,
      delay: 500
    }

  },
  interaction: {
    intersect: false,
    mode: 'index' as "index" | "y" | "x" | "dataset" | "point" | "nearest" | undefined,
  },
  scales: {
    y: {
      min: 1,
      max: 15,
      grid: {
        display: false,
      },
      border: {
        display: false
      },
    },
    x: {
      type: "time" as "time",
      time: {
        format: 'HH:mm',
        unit: 'minute',
        stepSize: 1,
        displayFormats: {
          'minute': 'HH:mm',
          'hour': 'HH:mm'
        }
      },
      bounds: 'ticks' as "ticks" | "data" | "ticks" | undefined,
      includeBounds: true,
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


const upperLimit = 10;
const lowerLimit = 3.9;

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

export default function GCMSection() {
  const { theme } = useTheme();
  const [gcmValue, setGCMValue] = useState(0);
  const [gcmTrend, setGCMTrend] = useState(0);
  const [chartData, setChartData] = useState({} as ChartData);


  const fetchData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/gcm', {
        method: 'GET',
        next: {
          revalidate: 60,
          tags: ['gcm'],
        },
        headers: {
          'Cache-Control': 'max-age=0, s-maxage=60, stale-while-revalidate',
        },
      });
      const data = await response.json();
      // var gcmTimestamps = data.graphData.map((item: any) => (new Date(item.Timestamp)).getHours().toString().padStart(2, '0') + ':' + (new Date(item.Timestamp)).getMinutes().toString().padStart(2, '0'));
      // gcmTimestamps.push((new Date(data.glucoseMeasurement.Timestamp)).getHours().toString().padStart(2, '0') + ':' + (new Date(data.glucoseMeasurement.Timestamp)).getMinutes().toString().padStart(2, '0'));
      var gcmTimestamps = data.graphData.map((item: any) => new Date(item.Timestamp));
      gcmTimestamps.push(new Date(data.glucoseMeasurement.Timestamp));
      var gcmValues = data.graphData.map((item: any) => item.Value as number);
      gcmValues.push(data.glucoseMeasurement.Value as number);
      setGCMValue(data.glucoseMeasurement.Value as number);
      setGCMTrend(data.glucoseMeasurement.TrendArrow as number);
      setChartData({
        labels: gcmTimestamps,
        datasets: [
          {
            data: gcmValues,
            fill: false,
            borderWidth: 3,
            pointRadius: 1,
            backgroundColor: ctx => getColor(ctx.raw as number, theme),
            borderColor: ctx => getColor(ctx.raw as number, theme),
            segment: {
              borderColor: ctx => getColor(ctx.p0.parsed.y, theme),
            },
            tension: 0.1,
            yAxisID: 'y',
            xAxisID: 'x',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
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
      direction={'column'}
      align={'center'}
      css={{
        'pt': '$10',
        'pb': '$10',
        'px': '$6',
        '@md': {
          px: '$64',
        },
      }}
    >
      <Card>
        <Card.Header>
          <Grid.Container css={{ pl: "$6" }}>
            <Grid xs={12}>
              <Text h3 css={{ lineHeight: "$xs" }}>
                GCM
              </Text>
            </Grid>
            <Grid xs={12}>
              {
                gcmValue > 0 ? (
                  <Text css={{ color: "$accents8" }}>{gcmValue} mmol/L</Text>
                ) : (
                  <Loading size="sm" />
                )
              }
              {
                //vertically centered icon
                gcmTrend == 1 ? (
                  <Flex css={{ alignItems: 'center', marginLeft: '$5' }}>
                    <South fontSize="small" />
                  </Flex>
                ) : gcmTrend == 2 ? (
                  <Flex css={{ alignItems: 'center', marginLeft: '$5' }}>
                    <SouthEast fontSize="small" />
                  </Flex>
                ) : gcmTrend == 3 ? (
                  <Flex css={{ alignItems: 'center', marginLeft: '$5' }}>
                    <East fontSize="small" />
                  </Flex>
                ) : gcmTrend == 4 ? (
                  <Flex css={{ alignItems: 'center', marginLeft: '$5' }}>
                    <NorthEast fontSize="small" />
                  </Flex>
                ) : gcmTrend == 5 ? (
                  <Flex css={{ alignItems: 'center', marginLeft: '$5' }}>
                    <North fontSize="small" />
                  </Flex>
                ) : (
                  <></>
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