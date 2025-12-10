'use client';

import { useState } from 'react';
import { GamesByDate } from '@/lib/nba/types';
import { GameCard } from './game-card';
import { Badge } from './ui/badge';
import { useTranslation } from '@/i18n/useTranslation';

interface GameListProps {
  gamesByDate: GamesByDate[];
}

export function GameList({ gamesByDate }: GameListProps) {
  const { t } = useTranslation();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    new Set(gamesByDate.slice(0, 2).map((d) => d.dateKey))
  );

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

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
          <button
            onClick={() => toggleDate(dateKey)}
            className="flex items-center justify-between w-full py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{date}</span>
              <Badge variant="count">{games.length}</Badge>
            </div>
            <svg
              className={`w-5 h-5 text-white/60 transition-transform ${
                expandedDates.has(dateKey) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Games */}
          {expandedDates.has(dateKey) && (
            <div className="space-y-3 mt-2">
              {games.map((game) => (
                <GameCard key={game.gameId} game={game} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
