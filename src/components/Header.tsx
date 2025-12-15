import React from 'react';
import { Typography, Box } from '@mui/material';

const Header: React.FC = () => {
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
        <Box
          component="img"
          src="/wave-logo.png"
          alt="Wave Music"
          sx={{
            width: 48,
            height: 48,
            objectFit: 'contain',
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.primary',
            display: 'block',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 600,
            letterSpacing: 0.5,
            lineHeight: 1.2
          }}
        >
          Wave Music
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
