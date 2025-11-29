import { Box } from '@mui/material';
import MetricCard from 'components/cards/MetricCard';
import GaugeChart from 'components/GaugeChart';

export default function MobileLayout({ data, limits }) {
  if (!data || !limits) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        width: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Metric cards */}
      <MetricCard title="TDS" value={data.tds} limit={limits.tds} />
      <MetricCard title="Dryness" value={data.dryness} limit={limits.dryness} />
      <MetricCard title="NCG" value={data.ncg} limit={limits.ncg} />
      <MetricCard title="Pressure" value={data.pressure} limit={limits.pressure} />
      <MetricCard title="Temperature" value={data.temperature} limit={limits.temperature} />
      <MetricCard title="Flow" value={data.flow} limit={limits.flow} />

      {/* Gauge charts */}
      <GaugeChart title="Active Power" value={data.activePower} limit={limits.activePower} />
      <GaugeChart title="Reactive Power" value={data.reactivePower} limit={limits.reactivePower} />
      <GaugeChart title="Voltage" value={data.voltage} limit={limits.voltage} />
      <GaugeChart title="Speed" value={data.stSpeed} limit={limits.stSpeed} />
      <GaugeChart title="Current" value={data.current} limit={limits.current} />
    </Box>
  );
}
