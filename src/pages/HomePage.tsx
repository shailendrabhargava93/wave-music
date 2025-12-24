import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import Header from '../components/Header';
import { Song, CurrentSong } from '../types/api';
import { SoundChartsItem } from '../services/soundChartsApi';
import { saavnApi } from '../services/saavnApi';
import AlbumIcon from '@mui/icons-material/Album';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { FAVOURITE_SONGS_KEY, persistFavourites, readFavourites, getMeta, setMeta } from '../services/storage';

interface HomePageProps {
  onSongSelect: (song: Song) => void;
  chartSongs: ChartSongWithSaavn[];
  chartSongsLoading: boolean;
  onViewAllCharts: () => void;
  onAlbumSelect: (albumId: string, albumName: string, albumImage: string) => void;
  onPlaylistSelect: (playlistId: string, playlistName: string, playlistImage: string) => void;
  onRecentlyPlayedClick?: () => void;
  onSettingsClick?: () => void;
  onAddToQueue?: (song: Song) => void;
  onPlayNext?: (song: Song) => void;
  onShowSnackbar?: (message: string) => void;
  lastPlayedSong?: CurrentSong | null;
}

interface ChartSongWithSaavn extends SoundChartsItem {
  saavnData?: Song;
  isSearching?: boolean;
}

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const LATEST_ALBUMS_KEY = 'latestAlbums';
const LATEST_ALBUMS_TIMESTAMP_KEY = 'latestAlbumsTimestamp';
const TRENDING_PLAYLISTS_KEY = 'trendingPlaylists';
const TRENDING_PLAYLISTS_TIMESTAMP_KEY = 'trendingPlaylistsTimestamp';
const SIMILAR_ARTIST_FETCH_LIMIT = 5;
const SIMILAR_ARTIST_DISPLAY_LIMIT = 3;

interface SimilarArtist {
  id: string;
  name: string;
  image?: string;
}

interface ArtistEntry {
  id?: string;
  name?: string;
}

const ARTIST_SPLIT_PATTERN = /(?:,|&|feat\.?|ft\.?|featuring)/gi;

const extractArtistNames = (artistField?: string): string[] => {
  if (!artistField) return [];
  return artistField
    .split(ARTIST_SPLIT_PATTERN)
    .map(name => name.trim())
    .filter(Boolean);
};

const joinArtistNames = (artists?: ArtistEntry[]): string => {
  if (!artists || artists.length === 0) return '';
  return artists
    .map(artist => artist?.name?.trim() ?? '')
    .filter(Boolean)
    .join(', ');
};

const joinArtistIds = (artists?: ArtistEntry[]): string => {
  if (!artists || artists.length === 0) return '';
  return artists
    .map(artist => artist?.id?.trim() ?? '')
    .filter(Boolean)
    .join(', ');
};

const getHighQualityImage = (images?: Array<{ quality?: string; url?: string; link?: string }>): string => {
  if (!images || images.length === 0) return '';
  const qualities = ['500x500', '150x150', '50x50'];
  for (const quality of qualities) {
    const img = images.find(image => image.quality === quality);
    if (img?.url) return img.url;
    if (img?.link) return img.link;
  }
  const fallback = images.find(image => image.url || image.link);
  if (fallback) {
    return fallback.url || fallback.link || '';
  }
  return '';
};

const normalizeArtistName = (raw?: string): string => {
  const decoded = decodeHtmlEntities(raw || '');
  return decoded.replace(/\s+/g, ' ').trim();
};

const sanitizeSearchTerm = (raw?: string): string => {
  const decoded = decodeHtmlEntities(raw || '');
  return decoded
    .replace(/[^\p{L}0-9\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const collectArtistImageSources = (candidate: any): Array<{ quality?: string; url?: string; link?: string }> => {
  const sources: Array<{ quality?: string; url?: string; link?: string }> = [];
  if (!candidate) return sources;
  if (Array.isArray(candidate.image)) {
    sources.push(...candidate.image.filter(Boolean));
  }
  if (Array.isArray(candidate.images)) {
    sources.push(...candidate.images.filter(Boolean));
  }
  if (candidate.imageUrl) {
    sources.push({ link: candidate.imageUrl });
  }
  if (candidate.cover) {
    sources.push({ link: candidate.cover });
  }
  if (candidate.thumbnail) {
    sources.push({ link: candidate.thumbnail });
  }
  if (candidate.avatar) {
    if (typeof candidate.avatar === 'string') {
      sources.push({ link: candidate.avatar });
    } else if (candidate.avatar?.url) {
      sources.push({ link: candidate.avatar.url });
    }
  }
  if (candidate.avatarUrl) {
    sources.push({ link: candidate.avatarUrl });
  }
  return sources;
};

const convertSearchResultToSong = (result: any): Song => {
  const primaryArtists = result.artists?.primary ?? [];
  const featuredArtists = result.artists?.featured ?? [];
  const primaryNames = joinArtistNames(primaryArtists) || (typeof result.primaryArtists === 'string' ? result.primaryArtists : '');
  const featuredNames = joinArtistNames(featuredArtists) || (typeof result.featuredArtists === 'string' ? result.featuredArtists : '');
  const primaryIds = joinArtistIds(primaryArtists) || result.primaryArtistsId || '';
  const featuredIds = joinArtistIds(featuredArtists) || result.featuredArtistsId || '';

  const albumInfo = result.album
    ? {
        id: result.album.id || '',
        name: result.album.name || '',
        url: result.album.url || '',
      }
    : undefined;

  return {
    id: result.id || `${result.name}-${Date.now()}`,
    name: result.name || 'Unknown song',
    album: albumInfo,
    year: result.year || '',
    releaseDate: result.releaseDate || '',
    duration: result.duration || 0,
    label: result.label || '',
    primaryArtists: primaryNames,
    primaryArtistsId: primaryIds,
    featuredArtists: featuredNames,
    featuredArtistsId: featuredIds,
    explicitContent: result.explicitContent ?? 0,
    playCount: result.playCount ?? 0,
    language: result.language || '',
    hasLyrics: result.hasLyrics ?? false,
    url: result.url || '',
    copyright: result.copyright || '',
    image: Array.isArray(result.image) ? result.image : [],
    downloadUrl: Array.isArray(result.downloadUrl) ? result.downloadUrl : [],
  };
};

const decodeHtmlEntities = (text: string): string => {
  if (!text || typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const HomePage: React.FC<HomePageProps> = ({ onSongSelect, chartSongs, chartSongsLoading, onViewAllCharts, onAlbumSelect, onPlaylistSelect, onRecentlyPlayedClick, onSettingsClick, onAddToQueue, onPlayNext, onShowSnackbar, lastPlayedSong }) => {
  const [displayedSongs, setDisplayedSongs] = useState<ChartSongWithSaavn[]>([]);
  const [latestAlbums, setLatestAlbums] = useState<any[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsFetched, setAlbumsFetched] = useState(false);
  const [trendingPlaylists, setTrendingPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistsFetched, setPlaylistsFetched] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSong, setSelectedSong] = useState<ChartSongWithSaavn | null>(null);
  const [favouriteSongs, setFavouriteSongs] = useState<string[]>([]);
  const [similarArtists, setSimilarArtists] = useState<SimilarArtist[]>([]);
  const [similarArtistsLoading, setSimilarArtistsLoading] = useState(false);
  const [activeArtist, setActiveArtist] = useState<SimilarArtist | null>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [artistSongsLoading, setArtistSongsLoading] = useState(false);
  const [artistSongsError, setArtistSongsError] = useState<string | null>(null);

  // Fetch latest albums only once
  useEffect(() => {
    const fetchLatestAlbums = async () => {
      if (albumsFetched) return; // Skip if already fetched
      
      try {
        setAlbumsLoading(true);
        const cachedData = await getMeta(LATEST_ALBUMS_KEY);
        const cacheTimestamp = await getMeta(LATEST_ALBUMS_TIMESTAMP_KEY);
        const parsedTimestamp =
          typeof cacheTimestamp === 'number'
            ? cacheTimestamp
            : Number(cacheTimestamp);
        
        if (
          Array.isArray(cachedData) &&
          Number.isFinite(parsedTimestamp) &&
          Date.now() - parsedTimestamp < CACHE_DURATION_MS
        ) {
          setLatestAlbums(cachedData);
          setAlbumsFetched(true);
          return;
        }
        
        const response = await saavnApi.searchAlbums('latest', 10);
        if (response?.data?.results) {
          const albums = response.data.results.slice(0, 10);
          setLatestAlbums(albums);
          setAlbumsFetched(true);
          await setMeta(LATEST_ALBUMS_KEY, albums);
          await setMeta(LATEST_ALBUMS_TIMESTAMP_KEY, Date.now());
        }
      } catch (error) {
        console.warn('Failed to load latest albums', error);
      } finally {
        setAlbumsLoading(false);
      }
    };

    fetchLatestAlbums();
  }, [albumsFetched]);

  // Fetch trending playlists only once
  useEffect(() => {
    const fetchTrendingPlaylists = async () => {
      if (playlistsFetched) return;
      
      try {
        setPlaylistsLoading(true);
        const cachedData = await getMeta(TRENDING_PLAYLISTS_KEY);
        const cacheTimestamp = await getMeta(TRENDING_PLAYLISTS_TIMESTAMP_KEY);
        const parsedTimestamp =
          typeof cacheTimestamp === 'number'
            ? cacheTimestamp
            : Number(cacheTimestamp);
        
        if (
          Array.isArray(cachedData) &&
          Number.isFinite(parsedTimestamp) &&
          Date.now() - parsedTimestamp < CACHE_DURATION_MS
        ) {
          setTrendingPlaylists(cachedData);
          setPlaylistsFetched(true);
          return;
        }
        
        const response = await saavnApi.searchPlaylists('2025', 10);
        if (response?.data?.results) {
          const playlists = response.data.results.slice(0, 10);
          setTrendingPlaylists(playlists);
          setPlaylistsFetched(true);
          await setMeta(TRENDING_PLAYLISTS_KEY, playlists);
          await setMeta(TRENDING_PLAYLISTS_TIMESTAMP_KEY, Date.now());
        }
      } catch (error) {
        console.warn('Failed to load trending playlists', error);
      } finally {
        setPlaylistsLoading(false);
      }
    };

    fetchTrendingPlaylists();
  }, [playlistsFetched]);

  // Update displayed songs - show only first 10 on home page
  useEffect(() => {
    if (chartSongs.length > 0) {
      setDisplayedSongs(chartSongs.slice(0, 10));
    }
  }, [chartSongs]);

  // Load favourite songs
  useEffect(() => {
    const loadFavouriteIds = async () => {
      const saved = await readFavourites(FAVOURITE_SONGS_KEY);
      setFavouriteSongs(saved.map((song: any) => song.id));
    };

    loadFavouriteIds();
  }, []);

  const similarToLabel = (() => {
    if (!lastPlayedSong?.artist) return '';
    const extracted = extractArtistNames(lastPlayedSong.artist);
    if (extracted.length > 0) return extracted[0];
    return lastPlayedSong.artist;
  })();

  const displayedSimilarArtists = similarArtists.slice(0, SIMILAR_ARTIST_DISPLAY_LIMIT);

  useEffect(() => {
    let isMounted = true;
    const artistField = lastPlayedSong?.artist;
    if (!artistField) {
      setSimilarArtists([]);
      setActiveArtist(null);
      setArtistSongs([]);
      setArtistSongsError(null);
      setSimilarArtistsLoading(false);
      return;
    }

    const queries = extractArtistNames(artistField).filter(Boolean);
    if (queries.length === 0) {
      setSimilarArtists([]);
      setActiveArtist(null);
      setArtistSongs([]);
      setArtistSongsError(null);
      setSimilarArtistsLoading(false);
      return;
    }

    setSimilarArtistsLoading(true);
    setSimilarArtists([]);
    setActiveArtist(null);
    setArtistSongs([]);
    setArtistSongsError(null);

    (async () => {
      const recommended: SimilarArtist[] = [];
      const seen = new Set<string>();
      const originalNames = queries.map(name => name.toLowerCase());
      try {
        for (const query of queries.slice(0, 2)) {
          if (recommended.length >= SIMILAR_ARTIST_FETCH_LIMIT) break;
          const response = await saavnApi.searchArtists(query, 20);
          const candidates = response?.data?.results ?? [];
          for (const candidate of candidates) {
            if (recommended.length >= SIMILAR_ARTIST_FETCH_LIMIT) break;
            if (!candidate?.id) continue;
            if (seen.has(candidate.id)) continue;
            const candidateName = normalizeArtistName(candidate.name);
            if (!candidateName) continue;
            if (originalNames.includes(candidateName.toLowerCase())) continue;

            seen.add(candidate.id);
            const candidateImages = collectArtistImageSources(candidate);
            const image = getHighQualityImage(candidateImages);

            recommended.push({
              id: candidate.id,
              name: candidateName,
              image,
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load similar artists', error);
      } finally {
        if (isMounted) {
          setSimilarArtists(recommended);
          setSimilarArtistsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [lastPlayedSong]);

  const handleSongClick = (song: ChartSongWithSaavn) => {
    if (song.saavnData) {
      onSongSelect(song.saavnData);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, song: ChartSongWithSaavn) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSong(song);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSong(null);
  };

  const handlePlayNext = () => {
    if (selectedSong?.saavnData && onPlayNext) {
      onPlayNext(selectedSong.saavnData);
    }
    handleMenuClose();
  };

  const handleAddToQueue = () => {
    if (selectedSong?.saavnData && onAddToQueue) {
      onAddToQueue(selectedSong.saavnData);
    }
    handleMenuClose();
  };

  const handleAddToFavourites = async () => {
    if (!selectedSong?.saavnData) return;

    try {
      const favourites = await readFavourites(FAVOURITE_SONGS_KEY);
      const isFavourite = favourites.some((song: any) => song.id === selectedSong.saavnData!.id);

      if (isFavourite) {
        const updated = favourites.filter((song: any) => song.id !== selectedSong.saavnData!.id);
        setFavouriteSongs(prev => prev.filter(id => id !== selectedSong.saavnData!.id));
        await persistFavourites(FAVOURITE_SONGS_KEY, updated);
        if (onShowSnackbar) {
          onShowSnackbar('Removed from favourites');
        }
      } else {
        const newFavourite = {
          id: selectedSong.saavnData.id,
          name: selectedSong.saavnData.name,
          artist: selectedSong.saavnData.primaryArtists,
          albumArt: selectedSong.saavnData.image && selectedSong.saavnData.image.length > 0 
            ? selectedSong.saavnData.image[0].link || ''
            : '',
          addedAt: Date.now(),
        };
        const updated = [...favourites, newFavourite];
        setFavouriteSongs(prev => [...prev, selectedSong.saavnData!.id]);
        await persistFavourites(FAVOURITE_SONGS_KEY, updated);
        if (onShowSnackbar) {
          onShowSnackbar('Added to favourites ❤️');
        }
      }
    } catch (error) {
      console.warn('Unable to update favourite songs', error);
    }
  };

  const handleSimilarArtistClick = async (artist: SimilarArtist) => {
    if (!artist) return;
    setActiveArtist(artist);
    setArtistSongs([]);
    setArtistSongsLoading(true);
    setArtistSongsError(null);

    try {
      const searchQuery = sanitizeSearchTerm(artist.name);
      const response = await saavnApi.searchSongs(searchQuery || artist.name, 20);
      const songs = response?.data?.results ?? [];
      const mappedSongs = songs.map((song: any) => convertSearchResultToSong(song));
      setArtistSongs(mappedSongs.slice(0, 6));
    } catch (error) {
      console.warn('Failed to load songs for artist', artist.name, error);
      setArtistSongsError('Unable to load songs right now');
    } finally {
      setArtistSongsLoading(false);
    }
  };

  const getImageUrl = (imageArray: any[]): string => {
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      return '';
    }

    const qualities = ['150x150', '500x500', '50x50'];
    
    for (const quality of qualities) {
      const img = imageArray.find((img: any) => img.quality === quality);
      if (img) {
        return img.url || img.link || '';
      }
    }
    
    const firstImg = imageArray[0];
    return firstImg?.url || firstImg?.link || '';
  };

  return (
    <Box sx={{ pb: 14, pt: 0 }}>
      <Header 
        onRecentlyPlayedClick={onRecentlyPlayedClick}
        onSettingsClick={onSettingsClick}
      />
      
      <Box sx={{ px: 2 }}>
        {/* Latest Albums Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
            Latest Albums
          </Typography>

          {albumsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} sx={{ color: 'primary.main' }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {latestAlbums.map((album) => (
                <Box
                  key={album.id}
                  onClick={() => onAlbumSelect(album.id, album.name, getHighQualityImage(album.image))}
                  sx={{
                    minWidth: 140,
                    maxWidth: 140,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar
                    src={getHighQualityImage(album.image)}
                    variant="rounded"
                    sx={{
                      width: 140,
                      height: 140,
                      mb: 1,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <AlbumIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                    }}
                  >
                    {album.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {album.artists?.primary?.[0]?.name || 'Various Artists'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Trending Playlists Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
            Trending Playlists
          </Typography>

          {playlistsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} sx={{ color: 'primary.main' }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {trendingPlaylists.map((playlist) => (
                <Box
                  key={playlist.id}
                  onClick={() => onPlaylistSelect(playlist.id, playlist.name, getHighQualityImage(playlist.image))}
                  sx={{
                    minWidth: 140,
                    maxWidth: 140,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar
                    src={getHighQualityImage(playlist.image)}
                    variant="rounded"
                    sx={{
                      width: 140,
                      height: 140,
                      mb: 1,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <PlaylistPlayIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                    }}
                  >
                    {playlist.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {lastPlayedSong?.artist && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Similar artists{similarToLabel ? ` to ${similarToLabel}` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Curated for you
              </Typography>
            </Box>
            {similarArtistsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} sx={{ color: 'primary.main' }} />
              </Box>
            ) : similarArtists.length > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 1,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
              >
                {displayedSimilarArtists.map((artist) => (
                  <Box
                    key={artist.id}
                    component="button"
                    type="button"
                    onClick={() => handleSimilarArtistClick(artist)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSimilarArtistClick(artist);
                      }
                    }}
                    aria-label={`Show songs by ${artist.name}`}
                    tabIndex={0}
                    sx={{
                      minWidth: 140,
                      p: 1,
                      borderRadius: 2,
                      border: artist.id === activeArtist?.id ? '1px solid' : '1px solid transparent',
                      borderColor: artist.id === activeArtist?.id ? 'primary.main' : 'divider',
                      backgroundColor: artist.id === activeArtist?.id ? 'action.selected' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.2s, border-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      color: 'inherit',
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px',
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Avatar
                      src={artist.image || undefined}
                      variant="rounded"
                      imgProps={{ loading: 'lazy' }}
                      sx={{
                        width: 96,
                        height: 96,
                        mb: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: '1.75rem',
                      }}
                    >
                      <MusicNoteIcon />
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {artist.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {artist.id === activeArtist?.id ? 'Selected' : 'Tap to view songs'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No similar artists found right now.
                </Typography>
              </Box>
            )}
            {activeArtist && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Songs by {activeArtist.name}
                </Typography>
                {artistSongsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} sx={{ color: 'primary.main' }} />
                  </Box>
                ) : artistSongs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No songs available for {activeArtist.name} right now.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {artistSongs.map((song) => (
                      <ListItem
                        key={song.id}
                        onClick={() => onSongSelect(song)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          p: 0.5,
                          px: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 56 }}>
                          <Avatar
                            src={getHighQualityImage(song.image)}
                            variant="rounded"
                            sx={{ width: 48, height: 48 }}
                          >
                            <MusicNoteIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
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
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {decodeHtmlEntities(song.primaryArtists || '')}
                            </Typography>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {artistSongsError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {artistSongsError}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Trending Songs Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Trending now
          </Typography>
          {chartSongs.length > 10 && (
            <IconButton
              onClick={onViewAllCharts}
              size="small"
              sx={{
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              aria-label="view all trending songs"
            >
              <ArrowForwardIcon />
            </IconButton>
          )}
        </Box>

        {chartSongsLoading && displayedSongs.length === 0 && (
          <Box>
            {[...Array(10)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                  p: 1.5,
                }}
              >
                <Skeleton variant="text" width={40} height={40} sx={{ flexShrink: 0 }} />
                <Skeleton variant="rounded" width={56} height={56} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {displayedSongs.length > 0 && (
          <Box>
            {displayedSongs.map((item) => (
              <Box
                key={item.position}
                onClick={() => handleSongClick(item)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                  p: 0.5,
                  borderRadius: 1,
                  cursor: item.saavnData ? 'pointer' : 'default',
                  opacity: item.saavnData ? 1 : 0.7,
                  transition: 'background-color 0.2s',
                  '&:hover': item.saavnData ? {
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'light'
                        ? 'rgba(0, 188, 212, 0.08)'
                        : 'rgba(255, 255, 255, 0.05)',
                  } : {},
                }}
              >
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
                  {item.isSearching ? (
                    <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                  ) : item.saavnData?.image && item.saavnData.image.length > 0 ? (
                    <img
                      src={getImageUrl(item.saavnData.image)}
                      alt={item.song.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : item.song.imageUrl ? (
                    <img
                      src={item.song.imageUrl}
                      alt={item.song.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography sx={{ color: 'text.disabled', fontSize: '1.5rem' }}>
                      ♪
                    </Typography>
                  )}
                </Box>

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
                    {item.song.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.song.creditName}
                  </Typography>
                </Box>

                {item.saavnData && (
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, item)}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}

                {item.isSearching && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Finding...
                  </Typography>
                )}
                {!item.isSearching && !item.saavnData && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Not available
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedSong?.saavnData && onSongSelect(selectedSong.saavnData)}>
          <ListItemIcon>
            <PlayArrowIcon fontSize="small" />
          </ListItemIcon>
          Play
        </MenuItem>
        {onPlayNext && (
          <MenuItem onClick={handlePlayNext}>
            <ListItemIcon>
              <PlaylistAddIcon fontSize="small" />
            </ListItemIcon>
            Play Next
          </MenuItem>
        )}
        {onAddToQueue && (
          <MenuItem onClick={handleAddToQueue}>
            <ListItemIcon>
              <QueueMusicIcon fontSize="small" />
            </ListItemIcon>
            Add to Queue
          </MenuItem>
        )}
        <MenuItem onClick={handleAddToFavourites}>
          <ListItemIcon>
            {selectedSong?.saavnData && favouriteSongs.includes(selectedSong.saavnData.id) ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          {selectedSong?.saavnData && favouriteSongs.includes(selectedSong.saavnData.id) ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default HomePage;
