import { SearchResponse } from '../types/api';
import { setLastFetchFailed } from './networkStatus';

const getInflight = () => {
  if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = {} as any;
  const root = (saavnApi as any)._inflight as Record<string, Map<string, Promise<any>>>;
  root.playlists = root.playlists ?? new Map<string, Promise<any>>();
  root.albums = root.albums ?? new Map<string, Promise<any>>();
  root.artists = root.artists ?? new Map<string, Promise<any>>();
  root.searches = root.searches ?? new Map<string, Promise<any>>();
  root.songsByIds = root.songsByIds ?? new Map<string, Promise<any>>();
  root.launches = root.launches ?? new Map<string, Promise<any>>();
  return root as {
    playlists: Map<string, Promise<any>>;
    albums: Map<string, Promise<any>>;
    artists: Map<string, Promise<any>>;
    searches: Map<string, Promise<any>>;
    songsByIds: Map<string, Promise<any>>;
    launches: Map<string, Promise<any>>;
  };
};

const markFetchFailed = (message?: string) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setLastFetchFailed(true, message ?? 'Network offline');
  } else {
    // Don't mark fetch failure when online; banner reserved for offline state
    setLastFetchFailed(false);
  }
};

const BASE_URL = 'https://saavn-api-client.vercel.app/api';

export const saavnApi = {
  searchSongs: async (query: string, limit: number = 20): Promise<any> => {
    try {
      const inflight = getInflight().searches;
      const key = `${query}::${limit}`;
      if (inflight.has(key)) return inflight.get(key)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Songs search failed');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(key, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(key);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      markFetchFailed();
      throw error;
    }
  },

  searchPlaylists: async (query: string, limit: number = 20): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/search/playlists?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Playlists search failed');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error searching playlists:', error);
      markFetchFailed();
      throw error;
    }
  },

  search: async (query: string, limit: number = 5): Promise<SearchResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error searching:', error);
      markFetchFailed();
      throw error;
    }
  },

  getSongById: async (songId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/songs/${songId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch song');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error fetching song:', error);
      markFetchFailed(`Failed to fetch song: ${songId}`);
      throw error;
    }
  },

  getSongsByIds: async (ids: string[]) => {
    try {
      const inflight = getInflight().songsByIds;
      const key = ids.join(',');
      if (inflight.has(key)) return inflight.get(key)!;

      const promise = (async () => {
        const idsParam = ids.join('%2C');
        const response = await fetch(`${BASE_URL}/songs?ids=${idsParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(key, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(key);
      }
    } catch (error) {
      console.error('Error fetching songs by IDs:', error);
      markFetchFailed();
      throw error;
    }
  },

  searchArtists: async (query: string, limit: number = 10): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Artists search failed');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error searching artists:', error);
      markFetchFailed();
      throw error;
    }
  },

  getArtistSongs: async (artistId: string, page: number = 0, sortBy: string = 'popularity', sortOrder: string = 'desc'): Promise<any> => {
    try {
      const inflight = getInflight().artists;
      const key = `${artistId}::${page}::${sortBy}::${sortOrder}`;
      if (inflight.has(key)) return inflight.get(key)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/artists/${artistId}/songs?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artist songs');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(key, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(key);
      }
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      markFetchFailed();
      throw error;
    }
  },

  getPlaylistById: async (playlistId: string, limit: number = 100): Promise<any> => {
    // Dedupe in-flight playlist requests so multiple callers share the same Promise
    try {
      const inflight = getInflight().playlists;
      if (inflight.has(playlistId)) return inflight.get(playlistId)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/playlists?id=${playlistId}&limit=${limit}&page=0`);
        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(playlistId, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(playlistId);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      markFetchFailed();
      throw error;
    }
  },

  getAlbumById: async (albumId: string, limit: number = 100): Promise<any> => {
    // Dedupe in-flight album requests so multiple callers share the same Promise
    try {
      const inflight = getInflight().albums;
      if (inflight.has(albumId)) return inflight.get(albumId)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/albums?id=${albumId}&limit=${limit}&page=0`);
        if (!response.ok) {
          throw new Error('Failed to fetch album');
        }
        const data = await response.json();
        setLastFetchFailed(false);

        // Normalize response shape: some upstream responses may place songs
        // at `data.songs`, `songs`, or directly under `data` as an array.
        try {
          const songsFromData = Array.isArray(data?.data?.songs) ? data.data.songs :
            Array.isArray(data?.songs) ? data.songs :
            Array.isArray(data?.data) ? data.data : [];

          // If we found songs at a top-level path but not under data.songs,
          // ensure callers always see `response.data.songs` populated.
          if (!Array.isArray(data?.data?.songs) && songsFromData.length > 0) {
            data.data = data.data || {};
            data.data.songs = songsFromData;
          }
        } catch (err) {
          // ignore normalization errors and return raw data
        }

        return data;
      })();

      inflight.set(albumId, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(albumId);
      }
    } catch (error) {
      console.error('Error fetching album:', error);
      markFetchFailed();
      throw error;
    }
  },

  getArtistById: async (artistId: string): Promise<any> => {
    try {
      const inflight = getInflight().artists;
      const key = `artist_meta::${artistId}`;
      if (inflight.has(key)) return inflight.get(key)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/artists/${artistId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artist');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(key, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(key);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
      markFetchFailed();
      throw error;
    }
  },

  searchAlbums: async (query: string, limit: number = 20): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Albums search failed');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error searching albums:', error);
      markFetchFailed();
      throw error;
    }
  },

  getSongSuggestions: async (songId: string, limit: number = 5): Promise<any> => {
    try {
      // Make sure songId doesn't have any encoding issues
      const cleanSongId = encodeURIComponent(songId.trim());
      const url = `${BASE_URL}/songs/${cleanSongId}/suggestions?limit=${limit}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch song suggestions: ${response.status}`);
      }
      
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error fetching song suggestions:', error);
      markFetchFailed();
      throw error;
    }
  },
  // Calls the client-provided /launch endpoint which returns a rich
  // payload containing multiple modules (new_albums, new_trending,
  // top_playlists, etc.). Home page consumes `new_albums` and
  // `top_playlists` / `new_trending` for latest albums and trending
  // playlists. The response shape can vary, so callers should access
  // nested properties defensively.
  launch: async (): Promise<any> => {
    try {
      const inflight = getInflight().launches;
      const key = 'launch';
      if (inflight.has(key)) return inflight.get(key)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/launch`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Launch API Error:', response.status, errorText);
          throw new Error('Launch API failed');
        }
        const data = await response.json();
        setLastFetchFailed(false);
        return data;
      })();

      inflight.set(key, promise);
      try {
        const res = await promise;
        return res;
      } finally {
        inflight.delete(key);
      }
    } catch (error) {
      console.error('Error calling launch API:', error);
      markFetchFailed('Failed to call launch API');
      throw error;
    }
  },
};
