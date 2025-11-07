import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

// assets
import { DownOutlined, UpOutlined } from '@ant-design/icons';

export default function NavCollapse({ item, level }) {
  const theme = useTheme();
  const { pathname } = useLocation();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const isChildSelected = item.children?.some((child) => child.url === pathname);

  useEffect(() => {
    if (isChildSelected) {
      setOpen(true);
      setSelected(item.id);
    }
  }, [isChildSelected, item.id]);

  const handleClick = () => {
    setOpen(!open);
    setSelected(!selected ? item.id : null);
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : null;

  const textColor = theme.palette.mode === 'dark' ? 'grey.400' : 'text.primary';
  const iconSelectedColor = theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main';

  return (
    <>
      <ListItemButton
        disableRipple
        selected={selected === item.id || isChildSelected}
        onClick={handleClick}
        sx={{
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          mb: 0.5,
          borderRadius: `${theme.shape.borderRadius}px`,
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter'
          },
          '&.Mui-selected': {
            bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter',
            borderRight: `0px solid ${theme.palette.primary.main}`,

            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter'
            }
          }
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: selected === item.id || isChildSelected ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter'
                }
              }),
              ...(!drawerOpen &&
                (selected === item.id || isChildSelected) && {
                  bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : 'primary.lighter',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.darker' : 'primary.lighter'
                  }
                })
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <ListItemText
            primary={
              <Typography variant="h6" sx={{ color: selected === item.id || isChildSelected ? iconSelectedColor : textColor }}>
                {item.title}
              </Typography>
            }
          />
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) &&
          (open ? (
            <UpOutlined style={{ fontSize: '0.625rem', marginLeft: 1, color: textColor }} />
          ) : (
            <DownOutlined style={{ fontSize: '0.625rem', marginLeft: 1, color: textColor }} />
          ))}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children?.map((menuItem) => (
            <NavItem key={menuItem.id} item={menuItem} level={level + 1} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};
