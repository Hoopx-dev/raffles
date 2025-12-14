'use client';

import { useNBAGames } from '@/lib/nba/hooks';
import { CumulativeScore } from './cumulative-score';
import { GameList } from './game-list';

export function LiveScoresTab() {
  const { data, isLoading, error } = useNBAGames();

  const gamesByDate = data?.gamesByDate || [];
  const cumulativeScore = data?.cumulativeScore || { homeTeams: 0, awayTeams: 0 };

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
