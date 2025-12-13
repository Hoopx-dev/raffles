'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { usePlaceTicket, UserTicket } from '@/lib/hooks/useTickets';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface UnbetTicketCardProps {
  ticket: UserTicket;
  eventId?: number;
}

export function UnbetTicketCard({ ticket, eventId = 1 }: UnbetTicketCardProps) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [errors, setErrors] = useState<{ home?: string; away?: string }>({});
  const { t } = useTranslation();

  const openLuckyNumberModal = useUIStore((s) => s.openLuckyNumberModal);
  const { mutate: placeTicket, isPending: isSubmitting } = usePlaceTicket();

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

    setErrors({});

    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    placeTicket(
      {
        eventId,
        ticketId: ticket.id,
        predictHomeScore: home,
        predictAwayScore: away,
      },
      {
        onSuccess: (result) => {
          console.log('Place ticket result:', result);
          // Show lucky number modal if hit lucky egg
          if (result.eggReward?.success && result.eggReward.luckyNumbers.length > 0) {
            openLuckyNumberModal(result.eggReward.luckyNumbers[0]);
          }
        },
        onError: (error) => {
          console.error('Failed to place ticket:', error);
          setErrors({ home: 'Failed to submit prediction' });
        },
      }
    );
  };

  return (
    <div className="bg-bg-card rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-dark font-bold">{ticket.ticketCode}</span>
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
