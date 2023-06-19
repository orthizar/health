import { Card, Container } from '@nextui-org/react';
import LineChart from './linechart';
import { lineChartOptionsGCM } from '../variables/charts';

export default function GCMChart() {
  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>GCM</h2>
        </Card.Header>
        <Card.Body>
          <LineChart chartData={[{ name: 'GCM', data: [1, 2, 3,4,5,6,7,8,9,2,4,6,2,5,8,9,5,7] }]} chartOptions={lineChartOptionsGCM} />

        </Card.Body>
      </Card>
    </Container>
  );
}