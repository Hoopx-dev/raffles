'use client';

import { useState } from 'react';
import { Ticket, useTicketStore } from '@/lib/store/useTicketStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface UnbetTicketCardProps {
  ticket: Ticket;
}

// Simple lucky number check (can be customized)
const LUCKY_NUMBERS = [777, 888, 999, 1000, 1111, 1234, 1826];

function checkLuckyNumber(homeScore: number, awayScore: number): number | null {
  const total = homeScore + awayScore;
  if (LUCKY_NUMBERS.includes(total)) {
    return total;
  }
  // Check if last digits match specific patterns
  if (homeScore === awayScore && homeScore > 0) {
    return homeScore; // Matching scores
  }
  return null;
}

export function UnbetTicketCard({ ticket }: UnbetTicketCardProps) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [errors, setErrors] = useState<{ home?: string; away?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const updateTicket = useTicketStore((s) => s.updateTicket);
  const openLuckyNumberModal = useUIStore((s) => s.openLuckyNumberModal);

  const validateScore = (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= 1000;
  };

  const handleSubmit = () => {
    const newErrors: { home?: string; away?: string } = {};

    if (!homeScore || !validateScore(homeScore)) {
      newErrors.home = 'Enter 0-1000';
    }
    if (!awayScore || !validateScore(awayScore)) {
      newErrors.away = 'Enter 0-1000';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    // Update ticket
    updateTicket(ticket.id, {
      status: 'bet',
      homeScore: home,
      awayScore: away,
      timestamp: Date.now(),
    });

    // Check for lucky number
    const luckyNumber = checkLuckyNumber(home, away);
    if (luckyNumber) {
      setTimeout(() => {
        openLuckyNumberModal(luckyNumber);
      }, 300);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-bg-card rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-dark font-bold">{t.tickets.ticketId} #{ticket.id}</span>
        <Badge variant="unbet">{t.tabs.unbet}</Badge>
      </div>

      {/* Score Inputs */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <Input
            type="number"
            label={t.tickets.homeScore}
            placeholder="0-1000"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            error={errors.home}
            min={0}
            max={1000}
          />
        </div>
        <div className="flex items-center justify-center pt-8 text-text-muted text-xl">:</div>
        <div className="flex-1">
          <Input
            type="number"
            label={t.tickets.awayScore}
            placeholder="0-1000"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            error={errors.away}
            min={0}
            max={1000}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleSubmit}
        isLoading={isSubmitting}
      >
        {t.tickets.placePrediction}
      </Button>
    </div>
  );
}
