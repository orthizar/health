import { Card, Grid, Text } from "@nextui-org/react";
import React from 'react';
import { Flex } from "./styles/flex";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  responsive: true,
  maintainAspectRatio: false,
  updateMode: 'resize',
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
};
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'GCM Values',
      data: [100, 110, 105, 115, 120, 125],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};


export default function GCMSection () {
  var gcm = 0;
  return (
    <Flex
      direction={'column'}
      align={'center'}
      css={{
          'pt': '$20',
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
              <Text h4 css={{ lineHeight: "$xs" }}>
                GCM
              </Text>
            </Grid>
            <Grid xs={12}>
              <Text css={{ color: "$accents8" }}>{gcm} mmol/mol</Text>
            </Grid>
          </Grid.Container>
        </Card.Header>
        <Card.Divider />
        <Card.Body>
          <Line options={options} data={chartData} />
        </Card.Body>
      </Card>
    </Flex>
  );
}