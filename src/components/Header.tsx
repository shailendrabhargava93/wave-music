import React, { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { History } from '../icons';

interface HeaderProps {
  onRecentlyPlayedClick?: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRecentlyPlayedClick, onSettingsClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box 
      sx={(theme) => ({ 
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.5,
        mb: 2,
        px: { xs: 2, sm: 2 },
        backgroundColor: isScrolled 
          ? theme.palette.background.default
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
        boxShadow: isScrolled 
          ? `0 1px 6px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'}`
          : 'none',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          component="img"
          src="/wave-logo.svg"
          alt="Wave Music"
          sx={{
            width: 35,
            height: 35,
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
          Wave
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onRecentlyPlayedClick && (
          <IconButton onClick={onRecentlyPlayedClick} sx={{ color: 'text.primary' }}>
            <History sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        {onSettingsClick && (
          <IconButton onClick={onSettingsClick} sx={{ color: 'text.primary' }}>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default Header;
