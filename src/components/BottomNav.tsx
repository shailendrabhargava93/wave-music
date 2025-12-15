import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const getTabIndex = (tab: string) => {
    switch (tab) {
      case 'home': return 0;
      case 'search': return 1;
      case 'favourites': return 2;
      case 'settings': return 3;
      default: return 0;
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tabs = ['home', 'search', 'favourites', 'settings'];
    onTabChange(tabs[newValue]);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getTabIndex(activeTab)}
        onChange={handleChange}
        showLabels
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '80px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeIcon />} 
        />
        <BottomNavigationAction 
          label="Search" 
          icon={<SearchIcon />} 
        />
        <BottomNavigationAction 
          label="Library" 
          icon={<FavoriteIcon />} 
        />
        <BottomNavigationAction 
          label="Settings" 
          icon={<SettingsIcon />} 
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
