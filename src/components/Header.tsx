import React from 'react';
import { Avatar, Typography, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const Header: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        px: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: '#282828',
            width: 40,
            height: 40
          }}
        >
          <PersonIcon sx={{ color: '#b3b3b3' }} />
        </Avatar>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#fff', 
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {getGreeting()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
