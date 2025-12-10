'use client';

import { useQuery } from '@tanstack/react-query';
import { ProcessedGame, GamesByDate, CumulativeScore } from './types';

interface GamesResponse {
  games: ProcessedGame[];
  gamesByDate: GamesByDate[];
  cumulativeScore: CumulativeScore;
  lastUpdated: string;
}

/**
 * Fetch all NBA games for the raffle period
 */
export function useNBAGames() {
  return useQuery<GamesResponse>({
    queryKey: ['nba', 'games'],
    queryFn: async () => {
      const response = await fetch('/api/nba/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live scores
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Get cumulative score from games data
 */
export function useCumulativeScore() {
  const { data, ...rest } = useNBAGames();
  return {
    ...rest,
    data: data?.cumulativeScore,
  };
}

/**
 * Get games grouped by date
 */
export function useGamesByDate() {
  const { data, ...rest } = useNBAGames();
  return {
    ...rest,
    data: data?.gamesByDate,
  };
}
