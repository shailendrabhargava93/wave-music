// SoundCharts API Service for Top Songs in India

const APP_ID = 'TBOY-API_3DE8C120';
const API_KEY = 'c228e42eab8a5997';
const BASE_URL = 'https://customer.api.soundcharts.com/api/v2.14';

export interface SoundChartsSong {
  uuid: string;
  name: string;
  creditName: string;
  imageUrl: string;
}

export interface SoundChartsItem {
  song: SoundChartsSong;
  position: number;
  positionEvolution: number;
  metric: number;
  entryState: string;
  entryDate: string;
  rankDate: string;
  oldPosition: number;
  timeOnChart: number;
  timeOnChartUnit: string;
}

export interface SoundChartsResponse {
  items: SoundChartsItem[];
  page: {
    offset: number;
    limit: number;
    total: number;
    next: string | null;
    previous: string | null;
  };
}

export const soundChartsApi = {
  /**
   * Fetch top songs for India
   * @param offset - Starting position (0-based)
   * @param limit - Number of songs to fetch (default: 10)
   */
  getTopSongs: async (offset: number = 0, limit: number = 10): Promise<SoundChartsResponse> => {
    try {
      // Use a simple global in-flight map to dedupe concurrent SoundCharts requests
      const globalAny: any = globalThis as any;
      if (!globalAny.__soundcharts_inflight) globalAny.__soundcharts_inflight = new Map<string, Promise<any>>();
      const inflight: Map<string, Promise<any>> = globalAny.__soundcharts_inflight;
      const key = `${offset}:${limit}`;
      if (inflight.has(key)) return await inflight.get(key)!;

      const promise = (async () => {
        const response = await fetch(
          `${BASE_URL}/chart/song/top-songs-29/ranking/latest?offset=${offset}&limit=${limit}`,
          {
            headers: {
              'x-app-id': APP_ID,
              'x-api-key': API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`SoundCharts API error: ${response.status}`);
        }

        const data = await response.json();
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
      console.error('Error fetching top songs from SoundCharts:', error);
      throw error;
    }
  },
};

