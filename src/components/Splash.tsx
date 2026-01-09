import { Box, Typography } from '@mui/material';

const Splash = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0F0F1E 0%, #08080F 100%)',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src="/wave-logo.svg"
        alt="Wave Music"
        sx={{
          width: { xs: 96, sm: 120 },
          height: { xs: 96, sm: 120 },
          mb: 2,
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 24px rgba(0, 188, 212, 0.45))',
          animation: 'splashScale 900ms cubic-bezier(.2,.9,.25,1) both',
          '@keyframes splashScale': {
            '0%': { transform: 'scale(0.85)', opacity: 0 },
            '60%': { transform: 'scale(1.05)', opacity: 1 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      />

      <Typography
        variant="h6"
        sx={{
          color: '#00BCD4',
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        Wave Music
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255,255,255,0.85)',
          mt: 1,
          fontWeight: 500,
          fontSize: { xs: '0.95rem', sm: '1rem' },
        }}
      >
        Enjoy your Music
      </Typography>
    </Box>
  );
};

export default Splash;
