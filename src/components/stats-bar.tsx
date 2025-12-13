'use client';

import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface StatsBarProps {
  prizePool: number;
  participants: number;
  isLoading?: boolean;
}

export function StatsBar({ prizePool, participants, isLoading }: StatsBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-end px-4 py-3">
      {/* Prize Pool */}
      <div>
        <p className="text-white/60 text-xs uppercase tracking-wide">{t.stats.currentPrizePool}</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-white/20 animate-pulse rounded" />
        ) : (
          <p className="text-white text-2xl font-bold">
            {formatNumber(prizePool)} <span className="text-base font-normal">USDT</span>
          </p>
        )}
      </div>

      {/* Participants */}
      <div className="text-right">
        <p className="text-white/60 text-xs uppercase tracking-wide">{t.stats.participants}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-white/20 animate-pulse rounded ml-auto" />
        ) : (
          <p className="text-[#D99739] font-bold text-2xl">{formatNumber(participants)}</p>
        )}
      </div>
    </div>
  );
}
