'use client';

import Image from 'next/image';
import { ProcessedGame } from '@/lib/nba/types';
import { Badge } from './ui/badge';
import { useTranslation } from '@/i18n/useTranslation';

interface GameCardProps {
  game: ProcessedGame;
}

export function GameCard({ game }: GameCardProps) {
  const { homeTeam, awayTeam, status, quarter, timeRemaining, startTime } = game;
  const { t } = useTranslation();

  return (
    <div className="bg-[#FBECEC] rounded-2xl p-4 shadow-sm">
      {/* Status Badge */}
      <div className="flex flex-col items-center mb-3">
        <Badge variant={status} dot={status === 'live'}>
          {status === 'live' ? t.games.live : status === 'upcoming' ? t.games.upcoming : t.games.final}
        </Badge>
        {status === 'live' && quarter && (
          <span className="text-[#183824] text-sm mt-1">
            Q{quarter}
            {timeRemaining && <span className="text-[#91000A] ml-2">{timeRemaining}</span>}
          </span>
        )}
        {status === 'upcoming' && startTime && (
          <span className="text-[#326046] text-sm mt-1">{t.games.startsAt} {startTime}</span>
        )}
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src={homeTeam.logo}
              alt={homeTeam.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-[#183824] text-sm font-medium text-center">{homeTeam.name}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 px-4">
          <span className="text-2xl font-bold text-[#183824]">{homeTeam.score}</span>
          <span className="text-xl text-[#326046]">:</span>
          <span className="text-2xl font-bold text-[#183824]">{awayTeam.score}</span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src={awayTeam.logo}
              alt={awayTeam.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-[#183824] text-sm font-medium text-center">{awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
}
