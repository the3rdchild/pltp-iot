// material-ui
import { useTheme } from '@mui/material/styles';
import { chartsGridClasses, LineChart } from '@mui/x-charts';

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const drynessData = [95, 99, 96, 99, 95, 97, 98, 94, 100, 95, 90, 97];

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
          color: theme.palette.primary.main,
          showMark: true,
          label: 'Dryness Fraction'
        },
        {
          id: 'Average',
          data: new Array(drynessData.length).fill(avgValue),
          color: theme.palette.secondary.main,
          showMark: false,
          label: 'Average',
          curve: 'linear',
          area: false
        },
        {
          id: 'Min Threshold (90%)',
          data: new Array(drynessData.length).fill(minThreshold),
          color: theme.palette.warning.main,
          showMark: false,
          label: 'Min (95%)',
          curve: 'linear',
          area: false
        },
        {
          id: 'Max Threshold (95%)',
          data: new Array(drynessData.length).fill(maxThreshold),
          color: theme.palette.success.main,
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
          strokeDasharray: '4 2',
          stroke: theme.palette.divider
        }
      }}
      grid={{ horizontal: true }}
      margin={{ top: 30, bottom: 50, left: 40, right: 20 }}
    />
  );
}
