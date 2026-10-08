// pages/settings/dataInput.jsx
import { Grid, Box } from '@mui/material';
import SettingsHeader from '../../components/settings/SettingsHeader';
import DataInputForm from '../../components/settings/DataInputForm';
import LabSampleImport from '../../components/settings/LabSampleImport';
import LabComparisonChart from '../../components/settings/LabComparisonChart';

const DataInput = () => {
  return (
    <Box>
      <SettingsHeader title="Manual Data Input" subtitle="Settings" />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <DataInputForm />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <LabComparisonChart />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <LabSampleImport />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataInput;
