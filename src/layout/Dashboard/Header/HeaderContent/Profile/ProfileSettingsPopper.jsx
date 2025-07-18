import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// project
import MainCard from 'components/MainCard';
import SettingTab from './SettingTab';
import Transitions from 'components/@extended/Transitions';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number
};

export default function ProfileSettingsPopper({ open, anchorEl, onClose }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Popper
      placement="bottom-end"
      open={open}
      anchorEl={anchorEl}
      role={undefined}
      transition
      disablePortal
      popperOptions={{
        modifiers: [{ name: 'offset', options: { offset: [0, 9] } }]
      }}
    >
      {({ TransitionProps }) => (
        <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
          <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: 290 })}>
            <ClickAwayListener onClickAway={onClose}>
              <MainCard elevation={0} border={false} content={false}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    variant="fullWidth"
                    value={value}
                    onChange={handleChange}
                    aria-label="setting tab"
                    sx={{ px: 1 }}
                  >
                    <Tab
                      icon={<SettingOutlined />}
                      label="Setting"
                      id="profile-tab-0"
                      aria-controls="profile-tabpanel-0"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        textTransform: 'capitalize',
                        gap: 1
                      }}
                    />
                  </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                  <SettingTab />
                </TabPanel>
              </MainCard>
            </ClickAwayListener>
          </Paper>
        </Transitions>
      )}
    </Popper>
  );
}
