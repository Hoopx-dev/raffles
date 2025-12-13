'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLuckyStats } from '@/lib/hooks/useLucky';
import { formatNumber } from '@/lib/utils';

// Telegram customer service link - update this with actual link
const TELEGRAM_SUPPORT_URL = 'https://t.me/hoopx_support';

export function LuckyPrizeBanner() {
  const { t } = useTranslation();
  const { connected } = useWallet();
  const { data: luckyStats, isLoading } = useLuckyStats();

  const totalWonAmount = luckyStats?.totalRewardAmount || 0;
  const totalCount = luckyStats?.totalCount || 0;

  // Only show banner when connected and has wins
  const showBanner = connected && totalWonAmount > 0;

  const handleClaim = () => {
    window.open(TELEGRAM_SUPPORT_URL, '_blank');
  };

  if (!showBanner || isLoading) {
    return null;
  }

  return (
    <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#D99739] to-[#B8812E] relative z-10">
      <div className="flex items-center justify-between">
        {/* Prize Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl">🎉</span>
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium">
              {t.luckyPrize.wonAmount} ({totalCount}x)
            </p>
            <p className="text-white text-lg font-bold">{formatNumber(totalWonAmount)} USDT</p>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="px-5 py-2 bg-white rounded-full font-bold uppercase text-sm text-[#91000A] hover:bg-white/90 transition-colors cursor-pointer shadow-lg"
        >
          {t.luckyPrize.claim}
        </button>
      </div>
    </div>
  );
}
