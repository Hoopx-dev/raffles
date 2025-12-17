'use client';

import { UserTicket } from '@/lib/hooks/useTickets';
import { useTranslation } from '@/i18n/useTranslation';
import { useUIStore } from '@/lib/store/useUIStore';

interface BetTicketCardProps {
  ticket: UserTicket;
}

function getWinStatusLabel(winStatus: number): string {
  switch (winStatus) {
    case 0: return 'Ongoing';
    case 1: return 'Won';
    case 2: return 'Lost';
    default: return 'Unknown';
  }
}

function getWinStatusColor(winStatus: number): string {
  switch (winStatus) {
    case 0: return 'text-yellow-500';
    case 1: return 'text-green-500';
    case 2: return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function BetTicketCard({ ticket }: BetTicketCardProps) {
  const { t } = useTranslation();
  const placement = ticket.placementInfo;
  const openLuckyNumberModal = useUIStore((s) => s.openLuckyNumberModal);

  const isLucky = !!placement?.luckyStatus;
  const luckyNumbers = placement?.eggReward?.luckyNumbers || [];
  const luckyAmount = placement?.eggReward?.luckyAmount || [];

  // Check which score is the lucky number
  const isHomeLucky = isLucky && luckyNumbers.includes(placement?.predictHomeScore ?? -1);
  const isAwayLucky = isLucky && luckyNumbers.includes(placement?.predictAwayScore ?? -1);

  const handleCardClick = () => {
    if (isLucky && placement) {
      // Show the lucky number modal with the actual lucky numbers and amounts from eggReward
      openLuckyNumberModal(
        luckyNumbers.length > 0 ? luckyNumbers : [placement.predictHomeScore],
        luckyAmount
      );
    }
  };

  return (
    <div
      className={`bg-bg-card-mint rounded-2xl p-4 shadow-sm ${isLucky ? 'cursor-pointer' : ''}`}
      onClick={isLucky ? handleCardClick : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-dark font-bold">{ticket.ticketCode}</span>
        {placement && (
          <span className={`text-sm font-medium ${getWinStatusColor(placement.winStatus)}`}>
            {getWinStatusLabel(placement.winStatus)}
          </span>
        )}
      </div>

      {/* Prediction Display */}
      {placement && (
        <div className="flex items-center justify-center gap-6">
          {/* Away Score (Left) */}
          <div className="text-center flex-1">
            <p className={`text-4xl font-bold ${isAwayLucky ? 'text-[#D4A942] animate-pulse' : 'text-text-dark'}`}>
              {placement.predictAwayScore}
            </p>
            <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.awayTeams}</p>
          </div>

          {/* Divider */}
          <div className="text-3xl font-bold text-text-muted">:</div>

          {/* Home Score (Right) */}
          <div className="text-center flex-1">
            <p className={`text-4xl font-bold ${isHomeLucky ? 'text-[#D4A942] animate-pulse' : 'text-text-dark'}`}>
              {placement.predictHomeScore}
            </p>
            <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.homeTeams}</p>
          </div>
        </div>
      )}

      {/* Lucky Status & Prize */}
      {placement && (!!placement.luckyStatus || placement.prizeAmount > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          {!!placement.luckyStatus && (
            <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D4A942]/30 to-[#FFD700]/30 px-3 py-2 rounded-full w-full">
              <span className="text-lg">🎉</span>
              <span className="text-sm font-bold text-[#D4A942]">Lucky Winner!</span>
            </div>
          )}
          {placement.prizeAmount > 0 && (
            <div className="text-center mt-2">
              <span className="text-sm text-text-muted">
                Prize: <span className="font-bold text-green-600">{placement.prizeAmount} USDT</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
