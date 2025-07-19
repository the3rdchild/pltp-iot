// File: components/DrynessChart.jsx

import React from 'react';
import Chart from 'react-apexcharts';

// Dummy dryness fraction data
const rawData = [
  { x: 1, y: 82 }, { x: 2, y: 84 }, { x: 3, y: 81 },
  { x: 4, y: 79 }, { x: 5, y: 88 }, { x: 6, y: 91 },
  { x: 7, y: 89 }, { x: 8, y: 87 }, { x: 9, y: 90 },
  { x: 10, y: 93 }, { x: 11, y: 78 }, { x: 12, y: 83 },
  { x: 13, y: 85 }, { x: 14, y: 76 }, { x: 15, y: 92 },
  { x: 16, y: 80 }, { x: 17, y: 94 }, { x: 18, y: 82 },
  { x: 19, y: 88 }, { x: 20, y: 89 }
];

// Calculate linear regression (simple least squares)
function getRegression(data) {
  const n = data.length;
  const sumX = data.reduce((acc, val) => acc + val.x, 0);
  const sumY = data.reduce((acc, val) => acc + val.y, 0);
  const sumXY = data.reduce((acc, val) => acc + val.x * val.y, 0);
  const sumXX = data.reduce((acc, val) => acc + val.x * val.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const line = data.map(d => ({ x: d.x, y: slope * d.x + intercept }));
  const equation = `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`;
  return { line, equation };
}

const { line: regressionLine, equation } = getRegression(rawData);

const DrynessChart = () => {
  const options = {
    chart: { type: 'scatter', zoom: { enabled: true } },
    xaxis: { title: { text: 'Sample' }, tickAmount: 10 },
    yaxis: {
      title: { text: 'Dryness Fraction (%)' },
      min: 70,
      max: 100,
      plotLines: []
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: '#FF5722',
          label: { text: 'Min Limit (80%)', style: { color: '#fff', background: '#FF5722' } }
        },
        {
          y: 95,
          borderColor: '#4CAF50',
          label: { text: 'Max Limit (95%)', style: { color: '#fff', background: '#4CAF50' } }
        }
      ],
      text: [
        {
          x: 2,
          y: 98,
          text: equation,
          style: { color: '#333', fontSize: '12px' }
        }
      ]
    },
    stroke: { width: [0, 2], curve: 'straight' },
    legend: { show: true, position: 'top' },
    colors: ['#008FFB', '#FF4560']
  };

  const series = [
    {
      name: 'Dryness Points',
      type: 'scatter',
      data: rawData.map(p => ({ x: p.x, y: p.y }))
    },
    {
      name: 'Regression Line',
      type: 'line',
      data: regressionLine.map(p => ({ x: p.x, y: p.y }))
    }
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
};

export default DrynessChart;
