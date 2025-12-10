'use client';

import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface StatsBarProps {
  prizePool: number;
  participants: number;
}

export function StatsBar({ prizePool, participants }: StatsBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-end px-4 py-3">
      {/* Prize Pool */}
      <div>
        <p className="text-white/60 text-xs uppercase tracking-wide">{t.stats.currentPrizePool}</p>
        <p className="text-white text-2xl font-bold">
          {formatNumber(prizePool)} <span className="text-base font-normal">USDT</span>
        </p>
      </div>

      {/* Participants */}
      <div className="text-right">
        <p className="text-white/60 text-xs uppercase tracking-wide">{t.stats.participants}</p>
        <p className="text-orange font-bold text-2xl">{formatNumber(participants)}</p>
      </div>
    </div>
  );
}
