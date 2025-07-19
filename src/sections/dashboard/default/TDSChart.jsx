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
      data: [45, 60, 50, 56, 47, 45, 56],
      backgroundColor: '#9cea09',
      borderRadius: 6,
      barThickness: 20
    },
    {
      type: 'line',
      label: 'Avg (51 ppm)',
      data: new Array(7).fill(51),
      borderColor: '#FFA500',
      borderDash: [6, 6],
      pointRadius: 0,
      borderWidth: 2,
      fill: false
    },
    {
      type: 'line',
      label: 'Max (53 ppm)',
      data: new Array(7).fill(53),
      borderColor: '#ff4d4f',
      borderDash: [4, 4],
      pointRadius: 0,
      borderWidth: 2,
      fill: false
    },
    {
      type: 'line',
      label: 'Min (45 ppm)',
      data: new Array(7).fill(45),
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
      min: 44,
      max: 60,
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
    <div style={{ height: '434px', padding: '0 12px' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
}
