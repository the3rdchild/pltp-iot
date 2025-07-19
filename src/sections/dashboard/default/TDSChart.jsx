// File: TDSChart.jsx

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const TDSChart = () => {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const tdsData = [45, 60, 50, 56, 47, 45, 56];
  const avg = 51;
  const min = 45;
  const max = 53;

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'TDS (ppm)',
        data: tdsData,
        backgroundColor: '#9cea09',
        borderRadius: 5,
        barPercentage: 0.6
      },
      {
        type: 'line',
        label: `Avg (${avg})`,
        data: Array(labels.length).fill(avg),
        borderColor: 'gray',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0
      },
      {
        type: 'line',
        label: `Min (${min})`,
        data: Array(labels.length).fill(min),
        borderColor: 'orange',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0
      },
      {
        type: 'line',
        label: `Max (${max})`,
        data: Array(labels.length).fill(max),
        borderColor: 'green',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `${value} PPM`
        }
      }
    }
  };

  return (
    <div style={{ height: '380px' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
};

export default TDSChart;