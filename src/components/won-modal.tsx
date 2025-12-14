'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketList } from '@/lib/hooks/useTickets';
import { useCumulativeScore } from '@/lib/nba/hooks';

interface WonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WonModal({ isOpen, onClose }: WonModalProps) {
  const router = useRouter();
  const { data: ticketData } = useTicketList('PLACED');
  const { data: cumulativeScore } = useCumulativeScore();

  // Find winning tickets (winStatus === 1)
  const winningTickets = (ticketData?.records || []).filter(
    (t) => t.placementInfo?.winStatus === 1
  );

  const primaryTicket = winningTickets[0];
  const placement = primaryTicket?.placementInfo;

  // Calculate total prize
  const totalPrize = winningTickets.reduce(
    (sum, t) => sum + (t.placementInfo?.prizeAmount || 0),
    0
  );

  // Actual scores
  const actualHomeScore = cumulativeScore?.homeTeams || 0;
  const actualAwayScore = cumulativeScore?.awayTeams || 0;

  if (!isOpen || !primaryTicket || !placement) return null;

  const handleViewDetails = () => {
    onClose();
    router.push(`/won?ticket=${primaryTicket.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#FFF5F5] to-[#FFE8E8] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-4 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-1 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>

        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-[#91000A]">YOU WON!</h2>
            <p className="text-[#91000A]/70 text-sm">HoopXmas Raffle Winner</p>
          </div>

          {/* Prize Amount */}
          <div className="bg-[#1B5E20] rounded-2xl p-4 mb-4 text-center">
            <p className="text-white/80 text-sm mb-1">Your Prize</p>
            <p className="text-3xl font-bold text-[#D4A942]">
              {totalPrize.toLocaleString()} USDT
            </p>
            {winningTickets.length > 1 && (
              <p className="text-white/60 text-xs mt-1">
                from {winningTickets.length} winning tickets
              </p>
            )}
          </div>

          {/* Score Comparison */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Actual Score */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Actual Score</p>
                <p className="text-lg font-bold text-gray-800">
                  {actualHomeScore} : {actualAwayScore}
                </p>
              </div>
              {/* Your Prediction */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Your Prediction</p>
                <p className="text-lg font-bold text-[#1B5E20]">
                  {placement.predictHomeScore} : {placement.predictAwayScore}
                </p>
              </div>
            </div>
          </div>

          {/* Payout Status */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {placement.claimStatus === 'CLAIMED' ? (
              <>
                <span className="w-5 h-5 bg-[#1B5E20] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[#1B5E20] font-medium text-sm">Payment Completed</span>
              </>
            ) : (
              <>
                <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                  ⏳
                </span>
                <span className="text-yellow-600 font-medium text-sm">Payment Pending</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleViewDetails}
              className="w-full py-3 bg-[#91000A] text-white rounded-full font-medium cursor-pointer hover:bg-[#7a0008] transition-colors"
            >
              View Details
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Key for localStorage to track if user has seen the modal
const WON_MODAL_SEEN_KEY = 'hoopx_won_modal_seen';

/**
 * Hook to manage won modal visibility
 * Shows modal once per session when user has winning tickets
 */
export function useWonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { data: ticketData, isLoading } = useTicketList('PLACED');

  // Find winning tickets
  const winningTickets = (ticketData?.records || []).filter(
    (t) => t.placementInfo?.winStatus === 1
  );

  useEffect(() => {
    // Only check once after tickets are loaded
    if (isLoading || hasChecked) return;

    setHasChecked(true);

    // Check if user has winning tickets
    if (winningTickets.length === 0) return;

    // Check if modal was already shown this session
    const seenTicketIds = sessionStorage.getItem(WON_MODAL_SEEN_KEY);
    const currentWinningIds = winningTickets.map(t => t.id).sort().join(',');

    // Show modal if there are new winning tickets
    if (seenTicketIds !== currentWinningIds) {
      setIsOpen(true);
      sessionStorage.setItem(WON_MODAL_SEEN_KEY, currentWinningIds);
    }
  }, [isLoading, hasChecked, winningTickets]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
    hasWinningTickets: winningTickets.length > 0,
  };
}
