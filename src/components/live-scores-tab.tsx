'use client';

import { useNBAGames } from '@/lib/nba/hooks';
import { CumulativeScore } from './cumulative-score';
import { GameList } from './game-list';

// Dummy data for development
const DUMMY_GAMES_BY_DATE = [
  {
    dateKey: '2025-12-26',
    date: 'Dec 26',
    games: [
      {
        gameId: 1,
        status: 'live' as const,
        homeTeam: { key: 'LAL', name: 'Lakers', city: 'Los Angeles', score: 54, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
        awayTeam: { key: 'BOS', name: 'Celtics', city: 'Boston', score: 48, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
        quarter: '3',
        timeRemaining: '4:32',
        date: 'Dec 26',
        dateKey: '2025-12-26',
      },
      {
        gameId: 2,
        status: 'live' as const,
        homeTeam: { key: 'NYK', name: 'Knicks', city: 'New York', score: 88, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png' },
        awayTeam: { key: 'BKN', name: 'Nets', city: 'Brooklyn', score: 91, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
        quarter: '3',
        timeRemaining: '4:32',
        date: 'Dec 26',
        dateKey: '2025-12-26',
      },
      {
        gameId: 3,
        status: 'upcoming' as const,
        homeTeam: { key: 'DAL', name: 'Mavericks', city: 'Dallas', score: 0, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png' },
        awayTeam: { key: 'MIA', name: 'Heat', city: 'Miami', score: 0, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png' },
        startTime: '8:30PM',
        date: 'Dec 26',
        dateKey: '2025-12-26',
      },
      {
        gameId: 4,
        status: 'upcoming' as const,
        homeTeam: { key: 'GSW', name: 'Warriors', city: 'Golden State', score: 0, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png' },
        awayTeam: { key: 'DEN', name: 'Nuggets', city: 'Denver', score: 0, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' },
        startTime: '10:30PM',
        date: 'Dec 26',
        dateKey: '2025-12-26',
      },
    ],
  },
  {
    dateKey: '2025-12-25',
    date: 'Dec 25',
    games: [
      {
        gameId: 5,
        status: 'final' as const,
        homeTeam: { key: 'PHI', name: '76ers', city: 'Philadelphia', score: 112, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png' },
        awayTeam: { key: 'MIL', name: 'Bucks', city: 'Milwaukee', score: 108, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' },
        date: 'Dec 25',
        dateKey: '2025-12-25',
      },
    ],
  },
  {
    dateKey: '2025-12-24',
    date: 'Dec 24',
    games: [
      {
        gameId: 6,
        status: 'final' as const,
        homeTeam: { key: 'CHI', name: 'Bulls', city: 'Chicago', score: 98, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
        awayTeam: { key: 'CLE', name: 'Cavaliers', city: 'Cleveland', score: 105, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png' },
        date: 'Dec 24',
        dateKey: '2025-12-24',
      },
    ],
  },
  {
    dateKey: '2025-12-23',
    date: 'Dec 23',
    games: [
      {
        gameId: 7,
        status: 'final' as const,
        homeTeam: { key: 'HOU', name: 'Rockets', city: 'Houston', score: 110, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png' },
        awayTeam: { key: 'SAC', name: 'Kings', city: 'Sacramento', score: 102, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png' },
        date: 'Dec 23',
        dateKey: '2025-12-23',
      },
    ],
  },
  {
    dateKey: '2025-12-22',
    date: 'Dec 22',
    games: [
      {
        gameId: 8,
        status: 'final' as const,
        homeTeam: { key: 'ATL', name: 'Hawks', city: 'Atlanta', score: 115, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png' },
        awayTeam: { key: 'ORL', name: 'Magic', city: 'Orlando', score: 118, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png' },
        date: 'Dec 22',
        dateKey: '2025-12-22',
      },
    ],
  },
  {
    dateKey: '2025-12-21',
    date: 'Dec 21',
    games: [
      {
        gameId: 9,
        status: 'final' as const,
        homeTeam: { key: 'TOR', name: 'Raptors', city: 'Toronto', score: 99, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png' },
        awayTeam: { key: 'IND', name: 'Pacers', city: 'Indiana', score: 104, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png' },
        date: 'Dec 21',
        dateKey: '2025-12-21',
      },
    ],
  },
  {
    dateKey: '2025-12-20',
    date: 'Dec 20',
    games: [
      {
        gameId: 10,
        status: 'final' as const,
        homeTeam: { key: 'MEM', name: 'Grizzlies', city: 'Memphis', score: 121, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png' },
        awayTeam: { key: 'NOP', name: 'Pelicans', city: 'New Orleans', score: 116, logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png' },
        date: 'Dec 20',
        dateKey: '2025-12-20',
      },
    ],
  },
];

const DUMMY_CUMULATIVE = {
  homeTeams: 928,
  awayTeams: 897,
};

export function LiveScoresTab() {
  const { data, isLoading, error } = useNBAGames();

  // Use API data if available, otherwise use dummy data
  const gamesByDate = data?.gamesByDate || DUMMY_GAMES_BY_DATE;
  const cumulativeScore = data?.cumulativeScore || DUMMY_CUMULATIVE;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <CumulativeScore
        homeTeams={cumulativeScore.homeTeams}
        awayTeams={cumulativeScore.awayTeams}
      />
      <GameList gamesByDate={gamesByDate} />
    </>
  );
}
