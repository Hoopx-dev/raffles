'use client';

import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTicketList } from '@/lib/hooks/useTickets';

export function WonCard() {
  const router = useRouter();
  const { connected } = useWallet();
  const { data: ticketData } = useTicketList('PLACED');

  // Don't show if not connected
  if (!connected) return null;

  // Find winning tickets (winStatus === 1)
  const winningTickets = (ticketData?.records || []).filter(
    (t) => t.placementInfo?.winStatus === 1
  );

  // Don't show if no winning tickets
  if (winningTickets.length === 0) return null;

  const winningCount = winningTickets.length;

  // Calculate total prize
  const totalPrize = winningTickets.reduce(
    (sum, t) => sum + (t.placementInfo?.prizeAmount || 0),
    0
  );

  return (
    <div className="mx-4 mb-4">
      <div
        onClick={() => router.push('/won')}
        className="bg-gradient-to-r from-[#D4A942] to-[#FFD700] rounded-2xl p-4 shadow-lg animate-glow cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏆</div>
            <div>
              <h3 className="text-[#91000A] font-bold text-lg">You Won!</h3>
              <p className="text-[#91000A]/70 text-sm">
                {winningCount} winning ticket{winningCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#91000A] font-bold text-2xl">
              {totalPrize.toLocaleString()} USDT
            </p>
            <p className="text-[#91000A]/70 text-xs">Tap to view details →</p>
          </div>
        </div>
      </div>
    </div>
  );
}
