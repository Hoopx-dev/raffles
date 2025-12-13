'use client';

import { UserTicket } from '@/lib/hooks/useTickets';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from './ui/badge';

interface BetTicketCardProps {
  ticket: UserTicket;
}

function getWinStatusLabel(winStatus: number): string {
  switch (winStatus) {
    case 0: return 'Pending';
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

  return (
    <div className="bg-bg-card-mint rounded-2xl p-4 shadow-sm">
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
          {/* Home Score */}
          <div className="text-center flex-1">
            <p className="text-4xl font-bold text-text-dark">{placement.predictHomeScore}</p>
            <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.homeTeams}</p>
          </div>

          {/* Divider */}
          <div className="text-3xl font-bold text-text-muted">:</div>

          {/* Away Score */}
          <div className="text-center flex-1">
            <p className="text-4xl font-bold text-text-dark">{placement.predictAwayScore}</p>
            <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.awayTeams}</p>
          </div>
        </div>
      )}

      {/* Lucky Status & Prize */}
      {placement && (placement.luckyStatus || placement.prizeAmount > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          {placement.luckyStatus && (
            <Badge variant="next">Lucky Winner!</Badge>
          )}
          {placement.prizeAmount > 0 && (
            <span className="text-sm text-text-muted">
              Prize: <span className="font-bold text-green-600">{placement.prizeAmount} USDT</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
