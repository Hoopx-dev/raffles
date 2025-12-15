'use client';

import { GamesByDate } from '@/lib/nba/types';
import { GameCard } from './game-card';
import { Badge } from './ui/badge';
import { useTranslation } from '@/i18n/useTranslation';

interface GameListProps {
  gamesByDate: GamesByDate[];
}

export function GameList({ gamesByDate }: GameListProps) {
  const { t } = useTranslation();

  if (gamesByDate.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {t.games.noGames}
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      {gamesByDate.map(({ date, dateKey, games }, index) => (
        <div key={dateKey}>
          {/* Divider line between groups */}
          {index > 0 && (
            <div className="border-t border-white/20 my-4" />
          )}

          {/* Date Header */}
          <div className="flex items-center gap-2 py-2">
            <span className="text-white font-medium">{date}</span>
            <Badge variant="count">{games.length}</Badge>
          </div>

          {/* Games */}
          <div className="space-y-3 mt-2">
            {games.map((game) => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
