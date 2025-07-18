// material-ui
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

// project imports
import Notification from './Notification';
import MobileSection from './MobileSection';

// project import
import { GithubOutlined } from '@ant-design/icons';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  return (
    <>
      <Box sx={{ flexGrow: 1 }} /> {/* Pushes content to the right */}

      <IconButton
        component={Link}
        href="https://github.com/the3rdchild/pltp-iot.git"
        target="_blank"
        disableRipple
        color="secondary"
        title="Github"
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <GithubOutlined />
      </IconButton>

      <Notification />

      {/* Always use 3-dot icon version */}
      <MobileSection />
    </>
  );
}
