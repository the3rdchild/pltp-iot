// material-ui
import { useTheme } from '@mui/material/styles';
import { chartsGridClasses, LineChart } from '@mui/x-charts';

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const drynessData = [95, 99, 96, 99, 95, 97, 98];

const avgValue = 97;
const minThreshold = 93;
const maxThreshold = 100;

export default function ReportAreaChart() {
  const theme = useTheme();
  const axisStyle = { fill: theme.palette.text.secondary };

  return (
    <LineChart
      height={340}
      series={[
        {
          id: 'Dryness Fraction',
          data: drynessData,
          color: '#1d018a',
          showMark: true,
          label: 'Dryness Fraction',
          lineStyle: {
            strokeDasharray: '6 4'
          }
        },
        {
          id: 'Average',
          data: new Array(drynessData.length).fill(avgValue),
          color: '#a1fdb4',
          showMark: false,
          label: 'Average',
          curve: 'linear',
          area: false
        },
        {
          id: 'Min Threshold (90%)',
          data: new Array(drynessData.length).fill(minThreshold),
          color: '#fdcdce',
          showMark: false,
          label: 'Min (95%)',
          curve: 'linear',
          area: false
        },
        {
          id: 'Max Threshold (95%)',
          data: new Array(drynessData.length).fill(maxThreshold),
          color: '#d0c6ff',
          showMark: false,
          label: 'Max (100%)',
          curve: 'linear',
          area: false
        }
      ]}

      xAxis={[
        {
          scaleType: 'point',
          data: labels,
          tickLabelStyle: axisStyle,
          disableLine: true,
          disableTicks: true
        }
      ]}
      yAxis={[
        {
          label: 'Dryness Fraction (%)',
          min: 90,
          max: 105,
          tickLabelStyle: axisStyle
        }
      ]}
      sx={{
        '& .MuiLineElement-root': { strokeWidth: 2 },
        [`& .${chartsGridClasses.line}`]: {
          strokeDasharray: '5 5',
          stroke: theme.palette.divider
        }
      }}
      grid={{ horizontal: true }}
      margin={{ top: 30, bottom: 50, left: 40, right: 20 }}
    />
  );
}
