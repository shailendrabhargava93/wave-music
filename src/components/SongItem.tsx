import React from 'react';
import { Box, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface SongItemProps {
  title: string;
  artist?: string;
  imageSrc?: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  highlight?: boolean;
  playing?: boolean;
}

const SongItem: React.FC<SongItemProps> = ({
  title,
  artist,
  imageSrc,
  onClick,
  rightContent,
  highlight = false,
  playing = false,
}) => {
  return (
    <Box
      onClick={onClick}
      aria-current={playing ? 'true' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 1,
        p: 0.5,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
        backgroundColor: highlight ? (theme) => theme.palette.action.selected : 'transparent',
        '&:hover': onClick ? {
          backgroundColor: (theme) => 
            highlight ? theme.palette.action.selected : (theme.palette.mode === 'light'
              ? 'rgba(0, 188, 212, 0.08)'
              : 'rgba(255, 255, 255, 0.05)') ,
        } : {},
      }}
    >
      {playing ? (
        <Box sx={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
          <PlayArrowIcon fontSize="small" />
        </Box>
      ) : (
        <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography sx={{ color: 'text.disabled', fontSize: '1.5rem' }}>
            ♪
          </Typography>
        )}
      </Box>

      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        {artist && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {artist}
          </Typography>
        )}
      </Box>

      {rightContent}
    </Box>
  );
};

export default SongItem;
