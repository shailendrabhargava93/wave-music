import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Slider,
  Drawer,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface FullPlayerProps {
  open: boolean;
  onClose: () => void;
  songTitle?: string;
  artist?: string;
  albumArt?: string;
  duration?: number;
  audioUrl?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onNextSong?: () => void;
  onPreviousSong?: () => void;
  // Song details for info popup
  albumName?: string;
  label?: string;
  copyright?: string;
  year?: string;
  language?: string;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ 
  open, 
  onClose,
  songTitle = 'Freefall (feat. Oliver Tree)', 
  artist = 'Whethan',
  albumArt,
  duration = 151,
  audioUrl,
  isPlaying = false,
  onTogglePlay,
  onNextSong,
  onPreviousSong,
  albumName,
  label,
  copyright,
  year,
  language
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio] = useState(() => new Audio());
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const totalDuration = duration;

  // Decode HTML entities in strings
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Reset progress and load new song when it changes
  useEffect(() => {
    setProgress(0);
    
    if (audioUrl) {
      audio.src = audioUrl;
      audio.load();
      console.log('Audio loaded:', audioUrl);
    }
  }, [songTitle, duration, audioUrl, audio]);

  // Handle audio playback
  useEffect(() => {
    if (!audioUrl) return;

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        if (onTogglePlay) {
          onTogglePlay();
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl, audio, onTogglePlay]);

  // Update progress as audio plays
  useEffect(() => {
    const updateProgress = () => {
      if (audio.currentTime) {
        setProgress(Math.floor(audio.currentTime));
      }
    };

    const handleEnded = () => {
      if (onTogglePlay) {
        onTogglePlay(); // This will set isPlaying to false in App.tsx
      }
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio, onTogglePlay]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const newTime = newValue as number;
    setProgress(newTime);
    audio.currentTime = newTime;
  };

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: '100%',
          bgcolor: 'background.default',
          backgroundImage: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(to bottom, rgba(40, 40, 40, 0.9), rgba(10, 25, 41, 1))'
              : 'linear-gradient(to bottom, rgba(245, 245, 245, 0.95), rgba(245, 245, 245, 1))',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          py: 2,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ color: 'text.primary' }}
            aria-label="close player"
          >
            <KeyboardArrowDownIcon fontSize="large" />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
            NOW PLAYING
          </Typography>
          <IconButton 
            sx={{ color: 'text.primary' }} 
            aria-label="song information"
            onClick={() => setInfoDialogOpen(true)}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        {/* Album Art */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 3,
          }}
        >
          <Avatar
            src={albumArt}
            variant="rounded"
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: 360,
              maxHeight: 360,
              aspectRatio: '1',
              bgcolor: 'action.hover',
              fontSize: '4rem',
            }}
          >
            🎵
          </Avatar>
        </Box>

        {/* Song Info */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {songTitle}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {artist}
              </Typography>
            </Box>
            <IconButton
              onClick={toggleFavorite}
              sx={{ color: isFavorite ? 'primary.main' : 'text.secondary' }}
              aria-label="favorite"
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 1 }}>
          <Slider
            value={progress}
            min={0}
            max={totalDuration}
            onChange={handleSliderChange}
            sx={{
              color: 'primary.main',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(0, 188, 212, 0.16)',
                },
              },
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-rail': {
                opacity: 0.3,
                bgcolor: 'text.secondary',
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: -0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatTime(progress)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatTime(totalDuration)}
            </Typography>
          </Box>
        </Box>

        {/* Playback Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <IconButton
            onClick={onPreviousSong}
            sx={{ color: 'text.primary' }}
            aria-label="previous track"
          >
            <SkipPreviousIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <IconButton
            onClick={togglePlay}
            sx={{
              bgcolor: 'primary.main',
              color: theme => theme.palette.mode === 'dark' ? '#000' : '#fff',
              width: 64,
              height: 64,
              '&:hover': {
                bgcolor: 'primary.light',
                transform: 'scale(1.06)',
              },
            }}
            aria-label={isPlaying ? 'pause' : 'play'}
          >
            {isPlaying ? (
              <PauseIcon sx={{ fontSize: 36 }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 36 }} />
            )}
          </IconButton>
          <IconButton
            onClick={onNextSong}
            sx={{ color: 'text.primary' }}
            aria-label="next track"
          >
            <SkipNextIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Song Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'background.default',
          color: 'text.primary',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}>
          Song Information
          <IconButton
            onClick={() => setInfoDialogOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: 2 }}>
          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Song Name
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {decodeHtmlEntities(songTitle)}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Artist(s)
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {decodeHtmlEntities(artist)}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Album
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {albumName ? decodeHtmlEntities(albumName) : 'Unknown Album'}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Label
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {label || 'Unknown Label'}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Year
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {year || 'Unknown Year'}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Language
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {language || 'Unknown Language'}
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                    Copyright
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
                    {copyright || 'Copyright information not available'}
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
};

export default FullPlayer;
