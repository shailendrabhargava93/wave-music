import { SearchResponse } from '../types/api';

const BASE_URL = 'https://saavn.sumit.co/api';

export const saavnApi = {
  searchSongs: async (query: string, limit: number = 10): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Songs search failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  },

  searchPlaylists: async (query: string, limit: number = 10): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/search/playlists?query=${encodeURIComponent(query)}&page=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Playlists search failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching playlists:', error);
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
      return data;
    } catch (error) {
      console.error('Error searching:', error);
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
      return data;
    } catch (error) {
      console.error('Error fetching song:', error);
      throw error;
    }
  },

  getSongsByIds: async (ids: string[]) => {
    try {
      const idsParam = ids.join('%2C');
      const response = await fetch(`${BASE_URL}/songs?ids=${idsParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching songs by IDs:', error);
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
      return data;
    } catch (error) {
      console.error('Error searching artists:', error);
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
      return data;
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      throw error;
    }
  },

  getPlaylistById: async (playlistId: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/playlists?id=${playlistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  },
};
