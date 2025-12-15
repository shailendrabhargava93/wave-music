import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Header from '../components/Header';
import { Song } from '../types/api';
import { SoundChartsItem } from '../services/soundChartsApi';

interface HomePageProps {
  onSongSelect: (song: Song) => void;
  chartSongs: ChartSongWithSaavn[];
  chartSongsLoading: boolean;
}

interface ChartSongWithSaavn extends SoundChartsItem {
  saavnData?: Song;
  isSearching?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onSongSelect, chartSongs, chartSongsLoading }) => {
  const [displayedSongs, setDisplayedSongs] = useState<ChartSongWithSaavn[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Update displayed songs when chartSongs or displayCount changes
  useEffect(() => {
    if (chartSongs.length > 0) {
      setDisplayedSongs(chartSongs.slice(0, displayCount));
      console.log(`📊 Displaying ${displayCount} songs out of ${chartSongs.length}`);
    }
  }, [chartSongs, displayCount]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (displayCount >= chartSongs.length) return; // Don't observe if all songs are displayed

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const newCount = Math.min(displayCount + 10, chartSongs.length);
          console.log(`📜 Loading more songs - from ${displayCount} to ${newCount}`);
          setDisplayCount(newCount);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayCount, chartSongs.length]);

  const handleSongClick = (song: ChartSongWithSaavn) => {
    if (song.saavnData) {
      onSongSelect(song.saavnData);
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
    <Box sx={{ pb: 16 }}>
      <Header />
      
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Trending now • Spotify Charts
        </Typography>

        {chartSongsLoading && displayedSongs.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading top 100 songs...
            </Typography>
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
                  gap: 2,
                  mb: 2,
                  p: 1.5,
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
                <Typography
                  variant="h6"
                  sx={{
                    minWidth: 40,
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  {item.position}
                </Typography>

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

            <Box
              ref={observerTarget}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 3,
                minHeight: 60,
              }}
            >
              {displayCount < chartSongs.length && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading more songs...
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                    Showing {displayCount} of {chartSongs.length}
                  </Typography>
                </Box>
              )}
              {displayCount >= chartSongs.length && chartSongs.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  🎵 All {chartSongs.length} songs loaded!
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
