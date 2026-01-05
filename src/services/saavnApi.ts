import { SearchResponse } from '../types/api';
import { setLastFetchFailed } from './networkStatus';

const BASE_URL = 'https://saavn-api-client.vercel.app/api';

export const saavnApi = {
  searchSongs: async (query: string, limit: number = 20): Promise<any> => {
    try {
      if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = { playlists: new Map<string, Promise<any>>(), albums: new Map<string, Promise<any>>(), searches: new Map<string, Promise<any>>(), songsByIds: new Map<string, Promise<any>>(), launches: new Map<string, Promise<any>>() };
      const inflight = (saavnApi as any)._inflight.searches as Map<string, Promise<any>>;
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true, `Failed to fetch song: ${songId}`);
      throw error;
    }
  },

  getSongsByIds: async (ids: string[]) => {
    try {
      if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = { playlists: new Map<string, Promise<any>>(), albums: new Map<string, Promise<any>>(), searches: new Map<string, Promise<any>>(), songsByIds: new Map<string, Promise<any>>(), launches: new Map<string, Promise<any>>() };
      const inflight = (saavnApi as any)._inflight.songsByIds as Map<string, Promise<any>>;
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true);
      throw error;
    }
  },

  getArtistSongs: async (artistId: string, page: number = 0, sortBy: string = 'popularity', sortOrder: string = 'desc'): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/artists/${artistId}/songs?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist songs');
      }
      const data = await response.json();
      setLastFetchFailed(false);
      return data;
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      setLastFetchFailed(true);
      throw error;
    }
  },

  getPlaylistById: async (playlistId: string, limit: number = 100): Promise<any> => {
    // Dedupe in-flight playlist requests so multiple callers share the same Promise
    try {
      if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = { playlists: new Map<string, Promise<any>>(), albums: new Map<string, Promise<any>>() };
      const inflight = (saavnApi as any)._inflight.playlists as Map<string, Promise<any>>;
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
      setLastFetchFailed(true);
      throw error;
    }
  },

  getAlbumById: async (albumId: string, limit: number = 100): Promise<any> => {
    // Dedupe in-flight album requests so multiple callers share the same Promise
    try {
      if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = { playlists: new Map<string, Promise<any>>(), albums: new Map<string, Promise<any>>() };
      const inflight = (saavnApi as any)._inflight.albums as Map<string, Promise<any>>;
      if (inflight.has(albumId)) return inflight.get(albumId)!;

      const promise = (async () => {
        const response = await fetch(`${BASE_URL}/albums?id=${albumId}&limit=${limit}&page=0`);
        if (!response.ok) {
          throw new Error('Failed to fetch album');
        }
        const data = await response.json();
        setLastFetchFailed(false);
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true);
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
      setLastFetchFailed(true);
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
      if (!(saavnApi as any)._inflight) (saavnApi as any)._inflight = { playlists: new Map<string, Promise<any>>(), albums: new Map<string, Promise<any>>(), searches: new Map<string, Promise<any>>(), songsByIds: new Map<string, Promise<any>>(), launches: new Map<string, Promise<any>>() };
      const inflight = (saavnApi as any)._inflight.launches as Map<string, Promise<any>>;
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
      setLastFetchFailed(true, 'Failed to call launch API');
      throw error;
    }
  },
};
