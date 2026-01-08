import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Avatar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { getMeta } from '../services/storage';

interface ArtistPreview {
  id?: string;
  name?: string;
  image?: string;
}

const ARTIST_AVATAR_SIZE = 120;

const ArtistsPage: React.FC<{ onBack: () => void; onArtistSelect?: (id?: string, name?: string, image?: string) => void }> = ({ onBack, onArtistSelect }) => {
  const [artists, setArtists] = useState<ArtistPreview[]>([]);

  useEffect(() => {
    const load = async () => {
      const cached = await getMeta('recommendedArtists');
      if (Array.isArray(cached) && cached.length > 0) {
        setArtists(cached as ArtistPreview[]);
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 14 }}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, backgroundColor: 'background.default', py: 0.5 }}>
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onBack} sx={{ color: 'text.primary' }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>All Artists</Typography>
        </Container>
      </Box>
      <Box sx={{ height: 56 }} />
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {artists.map(artist => (
            <Box key={artist.id ?? artist.name} sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onArtistSelect && onArtistSelect(artist.id, artist.name, artist.image)}>
              <Avatar src={artist.image || undefined} variant="circular" sx={{ width: ARTIST_AVATAR_SIZE, height: ARTIST_AVATAR_SIZE, mx: 'auto', mb: 1 }}>{!artist.image && <MusicNoteIcon />}</Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{artist.name}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ height: { xs: 88, sm: 72 } }} />
      </Container>
    </Box>
  );
};

export default ArtistsPage;
