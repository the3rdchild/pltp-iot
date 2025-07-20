import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import PSteamChart from './PSteamChart';
import PSeparatorChart from './PSeparatorChart';


// Dummy data generators
const generatePressureData = (min, max, count = 12) =>
  Array.from({ length: count }, () => parseFloat((Math.random() * (max - min) + min).toFixed(2)));

// ==============================|| Pressure Graphs ||============================== //

export default function PressureGraphsCard() {
  const [view, setView] = useState('monthly'); // 'monthly' or 'weekly'

  const pressureSeparator = generatePressureData(1000, 1300);
  const pressureSteam = generatePressureData(900, 1133);

  return (
    <>
      <Grid container spacing={2}>
        
        {/* Pressure Separator */}
        <Grid size={{ xs: 12, md: 7, lg: 6}} sx={{ mt: 2 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid>
              <Typography variant="h5">&nbsp;&nbsp;Pressure Separator Tank</Typography>
            </Grid>
            <Grid>
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={() => setView('monthly')}
                  color={view === 'monthly' ? 'primary' : 'secondary'}
                  variant={view === 'monthly' ? 'outlined' : 'text'}
                >
                  Month
                </Button>
                <Button
                  size="small"
                  onClick={() => setView('weekly')}
                  color={view === 'weekly' ? 'primary' : 'secondary'}
                  variant={view === 'weekly' ? 'outlined' : 'text'}
                >
                  Week
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <MainCard content={false} sx={{ mt: 1.5 }}>
            <Box sx={{ pt: 1, pr: 2 }}>
              <PSeparatorChart view={view} data={pressureSeparator} label="Separator Pressure" />
            </Box>
          </MainCard>
        </Grid>

        {/* Pressure Steam */}
        <Grid size={{ xs: 12, md: 7, lg: 6}} sx={{ mt: 2 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid>
              <Typography variant="h5">&nbsp;&nbsp;Pressure Pipe Steam</Typography>
            </Grid>
            <Grid>
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={() => setView('monthly')}
                  color={view === 'monthly' ? 'primary' : 'secondary'}
                  variant={view === 'monthly' ? 'outlined' : 'text'}
                >
                  Month
                </Button>
                <Button
                  size="small"
                  onClick={() => setView('weekly')}
                  color={view === 'weekly' ? 'primary' : 'secondary'}
                  variant={view === 'weekly' ? 'outlined' : 'text'}
                >
                  Week
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <MainCard content={false} sx={{ mt: 1.5 }}>
            <Box sx={{ pt: 1, pr: 2 }}>
              <PSteamChart view={view} data={pressureSteam} label="Steam Pressure" />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
