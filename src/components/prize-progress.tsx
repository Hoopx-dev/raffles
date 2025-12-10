'use client';

import { formatNumber } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useTranslation } from '@/i18n/useTranslation';

interface PrizeProgressProps {
  currentTickets: number;
  nextTierTickets: number;
  nextTierPrize: number;
}

export function PrizeProgress({ currentTickets, nextTierTickets, nextTierPrize }: PrizeProgressProps) {
  const { t } = useTranslation();
  const progress = Math.min((currentTickets / nextTierTickets) * 100, 100);

  return (
    <div className="mx-4 p-4 rounded-2xl bg-gradient-to-r from-[rgba(255,255,255,0.2)] to-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="next">{t.progress.next}</Badge>
          <span className="text-white/90 text-sm font-medium">{t.progress.unlockHigherPrize}</span>
        </div>
        <span className="text-white font-bold">
          {formatNumber(nextTierPrize)} <span className="text-white/70 text-sm font-normal">USDT</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#DA953F] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs">
        <span className="text-white/60">
          {formatNumber(currentTickets)} / {formatNumber(nextTierTickets)} {t.progress.tickets}
        </span>
        <span className="text-white/80 font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
