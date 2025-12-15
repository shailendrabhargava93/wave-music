import { Box, Typography, Button } from '@mui/material';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(180deg, #1A1A2E 0%, #0F0F1E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Grid Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 188, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* App Name */}
        <Typography
          variant="h6"
          sx={{
            color: '#00BCD4',
            fontWeight: 600,
            letterSpacing: 2,
            mb: 4,
            fontSize: '0.9rem',
          }}
        >
          Wave Music
        </Typography>

        {/* Main Heading */}
        <Typography
          variant="h3"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            mb: 2,
            lineHeight: 1.2,
            fontSize: { xs: '2.5rem', sm: '3rem' },
          }}
        >
          Enjoy your{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(90deg, #00BCD4 0%, #8A2BE2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            favorite
          </Box>
        </Typography>
        <Typography
          variant="h3"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            mb: 6,
            lineHeight: 1.2,
            fontSize: { xs: '2.5rem', sm: '3rem' },
          }}
        >
          music
        </Typography>

        {/* Get Started Button */}
        <Button
          variant="contained"
          onClick={onGetStarted}
          fullWidth
          sx={{
            backgroundColor: '#00BCD4',
            color: '#FFFFFF',
            py: 2,
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)',
            '&:hover': {
              backgroundColor: '#00ACC1',
              boxShadow: '0 12px 28px rgba(0, 188, 212, 0.4)',
            },
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 188, 212, 0.1) 100%)',
        }}
      />
    </Box>
  );
};

export default WelcomeScreen;
