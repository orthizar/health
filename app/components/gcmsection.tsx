import { Card, Grid, Loading, Text } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import React from 'react';
import { Flex } from "./styles/flex";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartDataset,
  Point,
} from 'chart.js';

import ChartDeferred from 'chartjs-plugin-deferred';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartDeferred,
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
  scales: {
    y: {
      min: 0,
      max: 20,
    },
  },
};

type ChartData = {
  labels: string[];
  datasets: ChartDataset<"line", (number | Point | null)[]>[];
};


export default function GCMSection () {
  const [gcmValue, setGCMValue] = useState(0);
  const [chartData, setChartData] = useState({} as ChartData);


  const fetchData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/gcm');
      const data = await response.json();
      setGCMValue(data[data.length - 1].Value as number);
      setChartData({
        labels: data.map((item: any) => (new Date(item.Timestamp)).getHours().toString().padStart(2, '0') + ':' + (new Date(item.Timestamp)).getMinutes().toString().padStart(2, '0')),
        datasets: [
          {
            data: data.map((item: any) => item.Value as number),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            yAxisID: 'y',
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
          'pt': '$20',
          'pb': '$5',
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
                  <Text css={{ color: "$accents8" }}>{gcmValue} mmol/mol</Text>
                ) : (
                  <Loading size="sm"/>
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
              <Loading size="lg"/>
            )
          }
        </Card.Body>
      </Card>
    </Flex>
  );
}