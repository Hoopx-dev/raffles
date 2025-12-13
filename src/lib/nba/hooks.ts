'use client';

import { useHomeData, GameInfo } from '@/lib/hooks/useHomeData';
import { ProcessedGame, GamesByDate, CumulativeScore, GameStatus, getTeamLogo, NBA_TEAMS } from './types';
import { groupGamesByDate, calculateCumulativeScore } from './api';

interface GamesResponse {
  games: ProcessedGame[];
  gamesByDate: GamesByDate[];
  cumulativeScore: CumulativeScore;
  lastUpdated: string;
}

/**
 * Convert GameInfo from home API to ProcessedGame format
 */
function convertGameInfo(game: GameInfo): ProcessedGame {
  const statusMap: Record<string, GameStatus> = {
    UPCOMING: 'upcoming',
    LIVE: 'live',
    FINAL: 'final',
  };

  const gameDate = new Date(game.gameTime);
  const dateKey = gameDate.toISOString().split('T')[0];
  const date = gameDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Hong_Kong',
  });

  // Extract team keys from team names (e.g., "Lakers" -> "LAL")
  const getTeamKey = (teamName: string): string => {
    for (const [key, info] of Object.entries(NBA_TEAMS)) {
      if (info.name === teamName || info.city === teamName) {
        return key;
      }
    }
    return teamName.substring(0, 3).toUpperCase();
  };

  const homeKey = getTeamKey(game.homeTeam);
  const awayKey = getTeamKey(game.awayTeam);

  return {
    gameId: game.id,
    status: statusMap[game.status] || 'upcoming',
    homeTeam: {
      key: homeKey,
      name: game.homeTeam,
      city: NBA_TEAMS[homeKey]?.city || '',
      score: game.homeScore || 0,
      logo: game.homeLogo || getTeamLogo(homeKey),
    },
    awayTeam: {
      key: awayKey,
      name: game.awayTeam,
      city: NBA_TEAMS[awayKey]?.city || '',
      score: game.awayScore || 0,
      logo: game.awayLogo || getTeamLogo(awayKey),
    },
    startTime: statusMap[game.status] === 'upcoming'
      ? gameDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Hong_Kong',
        })
      : undefined,
    date,
    dateKey,
  };
}

/**
 * Fetch all NBA games for the raffle period from home API
 */
export function useNBAGames() {
  const { data: homeData, isLoading, error } = useHomeData();

  const gamesResponse: GamesResponse | undefined = homeData?.gameList
    ? (() => {
        const allGames = homeData.gameList.map(convertGameInfo);
        const gamesByDate = groupGamesByDate(allGames);
        const cumulativeScore = calculateCumulativeScore(allGames);

        return {
          games: allGames,
          gamesByDate,
          cumulativeScore,
          lastUpdated: new Date().toISOString(),
        };
      })()
    : undefined;

  return {
    data: gamesResponse,
    isLoading,
    error,
  };
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
