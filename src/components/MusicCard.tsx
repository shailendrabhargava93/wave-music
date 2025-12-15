import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface MusicCardProps {
  title: string;
  icon: string;
  gradient: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ title, icon, gradient }) => {
  return (
    <Card
      sx={{
        background: gradient,
        borderRadius: 3,
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h3" component="div">
            {icon}
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#fff', 
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MusicCard;
