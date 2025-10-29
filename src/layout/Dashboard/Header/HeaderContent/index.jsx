// material-ui
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

// project imports
import Notification from './Notification';
import MobileSection from './MobileSection';

// project import
import { HomeOutlined } from '@ant-design/icons';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  return (
    <>
      <Box sx={{ flexGrow: 1 }} /> {/* Pushes content to the right */}

      <IconButton
        component={Link}
        href="/"
        target="_self"
        disableRipple
        color="secondary"
        title="Home"
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <HomeOutlined />
      </IconButton>

      <Notification />

      {/* Always use 3-dot icon version */}
      <MobileSection />
    </>
  );
}
