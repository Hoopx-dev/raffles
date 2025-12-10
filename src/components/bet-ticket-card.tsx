'use client';

import { Ticket } from '@/lib/store/useTicketStore';
import { formatTimeAgo } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface BetTicketCardProps {
  ticket: Ticket;
}

export function BetTicketCard({ ticket }: BetTicketCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-bg-card-mint rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-dark font-bold">{t.tickets.ticketId} #{ticket.id}</span>
        <span className="text-text-muted text-sm">
          {ticket.timestamp ? formatTimeAgo(ticket.timestamp) : ''}
        </span>
      </div>

      {/* Prediction Display */}
      <div className="flex items-center justify-center gap-6">
        {/* Home Score */}
        <div className="text-center flex-1">
          <p className="text-4xl font-bold text-text-dark">{ticket.homeScore}</p>
          <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.homeTeams}</p>
        </div>

        {/* Divider */}
        <div className="text-3xl font-bold text-text-muted">:</div>

        {/* Away Score */}
        <div className="text-center flex-1">
          <p className="text-4xl font-bold text-text-dark">{ticket.awayScore}</p>
          <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{t.cumulative.awayTeams}</p>
        </div>
      </div>
    </div>
  );
}
