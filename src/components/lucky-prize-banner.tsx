'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useTicketStore } from '@/lib/store/useTicketStore';
import { formatNumber } from '@/lib/utils';

// Telegram customer service link - update this with actual link
const TELEGRAM_SUPPORT_URL = 'https://t.me/hoopx_support';

export function LuckyPrizeBanner() {
  const { t } = useTranslation();
  const { connected } = useWallet();
  const tickets = useTicketStore((s) => s.tickets);

  // Calculate total won amount from lucky tickets
  // Each lucky number hit = 10 USDT
  const luckyTickets = tickets.filter((ticket) => ticket.isLuckyWinner);
  const totalWonAmount = luckyTickets.length * 10;

  // TODO: Remove this demo amount in production
  // For demo purposes, show a sample amount if no real wins yet
  const displayAmount = totalWonAmount > 0 ? totalWonAmount : 10;
  const showBanner = connected; // Only show when wallet is connected

  const handleClaim = () => {
    window.open(TELEGRAM_SUPPORT_URL, '_blank');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#900008] to-[#600005] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Prize Info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-white/80 text-xs font-medium">{t.luckyPrize.wonAmount}</p>
            <p className="text-white text-xl font-bold">{formatNumber(displayAmount)} USDT</p>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="px-5 py-2 bg-[#DA953F] rounded-full font-bold uppercase text-[#900008] hover:bg-[#DA953F]/90 transition-colors cursor-pointer"
        >
          {t.luckyPrize.claim}
        </button>
      </div>
    </div>
  );
}
