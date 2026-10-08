import { Box, Chip, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from 'prop-types';

export const AI2_PROVISIONAL_TOOLTIP =
  'Kalibrasi TDS sensor→lab belum final (cakupan waktu data live masih sempit) - ' +
  'angka ini indikatif, bukan presisi. Detail: docs/catatan_diskusi_penting.md §1.';

/**
 * Ai2ProvisionalBadge - the PROVISIONAL marker that must accompany every ai2
 * number in the UI (dryness / NCG). Extracted out of the old prediction page so
 * it survives the AI1/AI2 split: values that land inside the lab reference band
 * are exactly the ones that look trustworthy without this label.
 */
const Ai2ProvisionalBadge = ({ size = 'small', inline = false }) => (
  <Tooltip title={AI2_PROVISIONAL_TOOLTIP} arrow>
    {inline ? (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'warning.main', ml: 0.5 }}>
        <InfoOutlinedIcon sx={{ fontSize: '0.95rem' }} />
      </Box>
    ) : (
      <Chip
        label="PROVISIONAL"
        size={size}
        color="warning"
        variant="outlined"
        icon={<InfoOutlinedIcon />}
        sx={{ fontWeight: 700, letterSpacing: 0.3 }}
      />
    )}
  </Tooltip>
);

Ai2ProvisionalBadge.propTypes = {
  size: PropTypes.string,
  inline: PropTypes.bool
};

export default Ai2ProvisionalBadge;
