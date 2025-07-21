import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const data = {
  labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  datasets: [
    {
      type: 'bar',
      label: 'TDS (ppm)',
      data: [6, 5, 4, 8, 7, 4, 5],
      backgroundColor: '#9cea09',
      borderRadius: 6,
      barThickness: 20
    },
    {
      type: 'line',
      label: 'Avg (5 ppm)',
      data: new Array(7).fill(5),
      borderColor: '#FFA500',
      borderDash: [6, 6],
      pointRadius: 0,
      borderWidth: 2,
      fill: false
    },
    {
      type: 'line',
      label: 'Max (10 ppm)',
      data: new Array(7).fill(8),
      borderColor: '#ff4d4f',
      borderDash: [4, 4],
      pointRadius: 0,
      borderWidth: 2,
      fill: false
    },
    {
      type: 'line',
      label: 'Min (4 ppm)',
      data: new Array(7).fill(4),
      borderColor: '#1890ff',
      borderDash: [4, 4],
      pointRadius: 0,
      borderWidth: 2,
      fill: false
    }
  ]
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 16,
        boxHeight: 8,
        font: {
          size: 12
        },
        padding: 12
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      min: 0,
      max: 10,
      ticks: {
        stepSize: 2,
        callback: (value) => `${value}`
      },
      grid: {
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

export default function TDSChart() {
  return (
    <div style={{ height: '493px', padding: '0 12px' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
}
