import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

export default function MainCardAI({ prediction = 'Ideal' }) {
  const getPredictionConfig = (pred) => {
    switch (pred?.toLowerCase()) {
      case 'ideal':
        return {
          label: 'Ideal',
          color: '#22c55e', // Green
          bgColor: '#22c55e15'
        };
      case 'warning':
        return {
          label: 'Warning',
          color: '#f59e0b', // Orange
          bgColor: '#f59e0b15'
        };
      case 'abnormal':
        return {
          label: 'Abnormal',
          color: '#ef4444', // Red
          bgColor: '#ef444415'
        };
      default:
        return {
          label: 'Ideal',
          color: '#22c55e',
          bgColor: '#22c55e15'
        };
    }
  };

  const config = getPredictionConfig(prediction);

  return (
    <MainCard
      title="Prediksi Resiko Turbin"
      contentSX={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '4rem',
            fontWeight: 700,
            color: config.color,
            textAlign: 'center',
            lineHeight: 1
          }}
        >
          {config.label}
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: '8px',
            borderRadius: 1,
            bgcolor: config.bgColor,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: prediction?.toLowerCase() === 'ideal' ? '100%' : prediction?.toLowerCase() === 'warning' ? '60%' : '30%',
              bgcolor: config.color,
              borderRadius: 1,
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          Status: {config.label}
        </Typography>
      </Box>
    </MainCard>
  );
}

MainCardAI.propTypes = {
  prediction: PropTypes.string
};
