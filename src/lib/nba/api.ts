import {
  NBAGameRaw,
  NBATeamRaw,
  ProcessedGame,
  GamesByDate,
  CumulativeScore,
  NBA_TEAMS,
  getTeamLogo,
  GameStatus,
} from './types';

const SPORTSDATA_BASE_URL = 'https://api.sportsdata.io/v3/nba/scores/json';

/**
 * Fetch games for a specific date
 */
export async function fetchGamesByDate(date: string, apiKey: string): Promise<NBAGameRaw[]> {
  const response = await fetch(
    `${SPORTSDATA_BASE_URL}/GamesByDate/${date}?key=${apiKey}`,
    { next: { revalidate: 30 } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all teams
 */
export async function fetchTeams(apiKey: string): Promise<NBATeamRaw[]> {
  const response = await fetch(
    `${SPORTSDATA_BASE_URL}/Teams?key=${apiKey}`,
    { next: { revalidate: 86400 } } // Cache for 24 hours
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.status}`);
  }

  return response.json();
}

/**
 * Get game status
 */
function getGameStatus(status: string): GameStatus {
  switch (status) {
    case 'InProgress':
      return 'live';
    case 'Final':
    case 'F/OT':
      return 'final';
    default:
      return 'upcoming';
  }
}

/**
 * Format time remaining
 */
function formatTimeRemaining(minutes: number | null, seconds: number | null): string | undefined {
  if (minutes === null || seconds === null) return undefined;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format start time
 */
function formatStartTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Hong_Kong',
  });
}

/**
 * Format date for display
 */
function formatDate(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Hong_Kong',
  });
}

/**
 * Get date key for grouping
 */
function getDateKey(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toISOString().split('T')[0];
}

/**
 * Process raw game data for UI
 */
export function processGame(game: NBAGameRaw, teamsMap?: Map<number, NBATeamRaw>): ProcessedGame {
  const homeTeamInfo = NBA_TEAMS[game.HomeTeam] || { name: game.HomeTeam, city: '' };
  const awayTeamInfo = NBA_TEAMS[game.AwayTeam] || { name: game.AwayTeam, city: '' };

  const status = getGameStatus(game.Status);

  return {
    gameId: game.GameID,
    status,
    homeTeam: {
      key: game.HomeTeam,
      name: homeTeamInfo.name,
      city: homeTeamInfo.city,
      score: game.HomeTeamScore || 0,
      logo: teamsMap?.get(game.HomeTeamID)?.WikipediaLogoUrl || getTeamLogo(game.HomeTeam),
    },
    awayTeam: {
      key: game.AwayTeam,
      name: awayTeamInfo.name,
      city: awayTeamInfo.city,
      score: game.AwayTeamScore || 0,
      logo: teamsMap?.get(game.AwayTeamID)?.WikipediaLogoUrl || getTeamLogo(game.AwayTeam),
    },
    quarter: game.Quarter || undefined,
    timeRemaining: formatTimeRemaining(game.TimeRemainingMinutes, game.TimeRemainingSeconds),
    startTime: status === 'upcoming' ? formatStartTime(game.DateTime) : undefined,
    date: formatDate(game.DateTime),
    dateKey: getDateKey(game.DateTime),
  };
}

/**
 * Group games by date
 */
export function groupGamesByDate(games: ProcessedGame[]): GamesByDate[] {
  const grouped = new Map<string, ProcessedGame[]>();

  games.forEach((game) => {
    const existing = grouped.get(game.dateKey) || [];
    grouped.set(game.dateKey, [...existing, game]);
  });

  // Sort by date descending (most recent first)
  return Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, dateGames]) => ({
      dateKey,
      date: dateGames[0].date,
      games: dateGames,
    }));
}

/**
 * Calculate cumulative scores
 */
export function calculateCumulativeScore(games: ProcessedGame[]): CumulativeScore {
  let homeTeams = 0;
  let awayTeams = 0;
  let gamesPlayed = 0;

  games.forEach((game) => {
    if (game.status === 'final' || game.status === 'live') {
      homeTeams += game.homeTeam.score;
      awayTeams += game.awayTeam.score;
    }
    if (game.status === 'final') {
      gamesPlayed++;
    }
  });

  return {
    homeTeams,
    awayTeams,
    total: homeTeams + awayTeams,
    gamesPlayed,
    totalGames: games.length,
  };
}

/**
 * Generate date range for raffle period
 */
export function getRaffleDateRange(): string[] {
  // Only Dec 26, 2025 games count for the raffle
  return ['2025-12-26'];
}
