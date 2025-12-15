import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ClearIcon from '@mui/icons-material/Clear';
import { saavnApi } from '../services/saavnApi';

interface SearchPageProps {
  onSongSelect: (song: any) => void;
  onPlaylistSelect: (playlistId: string, playlistName: string, playlistImage: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onSongSelect, onPlaylistSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Decode HTML entities in strings
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setSongs([]);
      setPlaylists([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      // Call both APIs in parallel
      const [songsResponse, playlistsResponse] = await Promise.all([
        saavnApi.searchSongs(query, 10),
        saavnApi.searchPlaylists(query, 10)
      ]);
      
      console.log('=== API RESPONSES ===');
      console.log('Songs Response:', songsResponse);
      console.log('Playlists Response:', playlistsResponse);
      
      // Extract songs from response
      const songsData = songsResponse.data?.results || [];
      console.log('Songs data:', songsData);
      
      const validSongs = songsData.filter((song: any) => {
        return song && 
               song.id && 
               song.name && 
               song.image && 
               song.image.length > 0;
      }).slice(0, 10);
      
      // Extract playlists from response
      const playlistsData = playlistsResponse.data?.results || [];
      console.log('Playlists data:', playlistsData);
      
      const validPlaylists = playlistsData.filter((playlist: any) => {
        return playlist && 
               playlist.id && 
               playlist.name && 
               playlist.image && 
               playlist.image.length > 0;
      }).slice(0, 10);
      
      console.log('=== FINAL RESULTS ===');
      console.log('Valid Songs:', validSongs);
      console.log('Valid Playlists:', validPlaylists);
      
      setSongs(validSongs);
      setPlaylists(validPlaylists);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSongs([]);
      setPlaylists([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSongs([]);
    setPlaylists([]);
    setHasSearched(false);
  };

  const getHighQualityImage = (images: Array<{ quality: string; url: string }>) => {
    if (!images || images.length === 0) return '';
    
    // Try to get the highest quality image available
    const qualities = ['500x500', '150x150', '50x50'];
    for (const quality of qualities) {
      const img = images.find(img => img.quality === quality);
      if (img?.url) return img.url;
    }
    
    // Fallback to last available image
    return images[images.length - 1]?.url || '';
  };

  const getArtistNames = (song: any): string => {
    if (song.artists?.primary && Array.isArray(song.artists.primary)) {
      return song.artists.primary.map((artist: any) => artist.name).join(', ');
    }
    return 'Unknown Artist';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ pb: 16, px: 2, pt: 2 }}>
      {/* Search Input */}
      <TextField
        fullWidth
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search songs, playlists..."
        variant="outlined"
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={20} sx={{ color: 'primary.main' }} />
              ) : searchQuery ? (
                <ClearIcon
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                  onClick={handleClearSearch}
                />
              ) : null}
            </InputAdornment>
          ),
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'action.hover',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
        sx={{
          mb: 3,
          '& input': {
            color: 'text.primary',
          },
        }}
      />

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            gap: 2,
          }}
        >
          <CircularProgress size={48} sx={{ color: 'primary.main' }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Searching for songs and playlists...
          </Typography>
        </Box>
      )}

      {/* Songs Section */}
      {!loading && songs.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MusicNoteIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Songs
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'transparent', p: 0 }}>
            {songs.map((song) => (
              <React.Fragment key={song.id}>
                <ListItem
                  onClick={() => onSongSelect(song)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1,
                    px: 1,
                    py: 1.5,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 72 }}>
                    <Avatar
                      src={getHighQualityImage(song.image)}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <MusicNoteIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {decodeHtmlEntities(song.name)}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {decodeHtmlEntities(getArtistNames(song))}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {decodeHtmlEntities(song.album?.name || 'Unknown Album')} • {formatDuration(song.duration)}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Playlists Section */}
      {!loading && playlists.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PlaylistPlayIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Playlists
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'transparent', p: 0 }}>
            {playlists.map((playlist) => (
              <React.Fragment key={playlist.id}>
                <ListItem
                  onClick={() => onPlaylistSelect(playlist.id, playlist.name, getHighQualityImage(playlist.image))}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1,
                    px: 1,
                    py: 1.5,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 72 }}>
                    <Avatar
                      src={getHighQualityImage(playlist.image)}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <PlaylistPlayIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {decodeHtmlEntities(playlist.name)}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {playlist.songCount} songs
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* No Results */}
      {!loading && hasSearched && songs.length === 0 && playlists.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            gap: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: '#404040' }} />
          <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Try searching with different keywords
          </Typography>
        </Box>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            gap: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: '#404040' }} />
          <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
            Search for songs and playlists
          </Typography>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Type at least 3 characters to search
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;
