'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProcessedGame } from '@/lib/nba/types';
import { Badge } from './ui/badge';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Parse time string "MM:SS" to total seconds
 */
function parseTimeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Format seconds to "MM:SS" string
 */
function formatSecondsToTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface GameCardProps {
  game: ProcessedGame;
}

export function GameCard({ game }: GameCardProps) {
  const { homeTeam, awayTeam, status, quarter, timeRemaining, startTime } = game;
  const { t } = useTranslation();

  // Countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    timeRemaining ? parseTimeToSeconds(timeRemaining) : 0
  );

  // Sync with API when timeRemaining changes
  useEffect(() => {
    if (timeRemaining) {
      setRemainingSeconds(parseTimeToSeconds(timeRemaining));
    }
  }, [timeRemaining]);

  // Countdown effect for live games
  useEffect(() => {
    if (status !== 'live' || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, remainingSeconds > 0]);

  const displayTime = status === 'live' && remainingSeconds > 0
    ? formatSecondsToTime(remainingSeconds)
    : timeRemaining;

  // Different background colors based on game status
  const cardBgColor = status === 'live'
    ? 'bg-[#FFF5F5] border border-[#91000A]/20' // Light red for live
    : status === 'upcoming'
    ? 'bg-[#F5F9F6] border border-[#326046]/20' // Light green for upcoming
    : 'bg-[#FBECEC]'; // Light cream for final

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${cardBgColor}`}>
      {/* Status Badge */}
      <div className="flex flex-col items-center mb-3">
        {status === 'live' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#91000A] text-white text-xs font-semibold uppercase">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {t.games.live}
          </div>
        ) : (
          <Badge variant={status}>
            {status === 'upcoming' ? t.games.upcoming : t.games.final}
          </Badge>
        )}
        {status === 'live' && quarter && (
          <span className="text-[#183824] text-sm mt-1">
            {quarter}
            {displayTime && <span className="ml-1">{displayTime}</span>}
          </span>
        )}
        {status === 'upcoming' && startTime && (
          <span className="text-[#326046] text-sm mt-1">{t.games.startsAt} {startTime}</span>
        )}
      </div>

      {/* Teams and Score */}
      <div className="flex items-start justify-between">
        {/* Away Team (Left) */}
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

        {/* Score */}
        <div className="flex items-center gap-3 px-4">
          <span className="text-2xl font-bold text-[#183824]">{awayTeam.score}</span>
          <span className="text-xl text-[#326046]">:</span>
          <span className="text-2xl font-bold text-[#183824]">{homeTeam.score}</span>
        </div>

        {/* Home Team (Right) */}
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
      </div>
    </div>
  );
}
