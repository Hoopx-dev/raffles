'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTicketList } from '@/lib/hooks/useTickets';
import { useCumulativeScore } from '@/lib/nba/hooks';
import { FireworksAnimation } from '@/components/fireworks-animation';

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function WonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticket');
  const { connected } = useWallet();
  const [copied, setCopied] = useState(false);

  // Fetch all placed tickets to find winning ones
  const { data: ticketData, isLoading } = useTicketList('PLACED');
  const { data: cumulativeScore } = useCumulativeScore();

  // Find winning tickets (winStatus === 1)
  const winningTickets = (ticketData?.records || []).filter(
    (t) => t.placementInfo?.winStatus === 1
  );

  // Get specific ticket if ID provided, otherwise use first winning ticket
  const primaryTicket = ticketId
    ? winningTickets.find((t) => t.id === Number(ticketId))
    : winningTickets[0];

  // Other winning tickets (excluding the primary one)
  const otherWinningTickets = winningTickets.filter(
    (t) => t.id !== primaryTicket?.id
  );

  // Calculate total prize
  const totalPrize = winningTickets.reduce(
    (sum, t) => sum + (t.placementInfo?.prizeAmount || 0),
    0
  );

  // Actual scores from cumulative score
  const actualHomeScore = cumulativeScore?.homeTeams || 0;
  const actualAwayScore = cumulativeScore?.awayTeams || 0;

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  const handleCopyTxId = async (txHash: string) => {
    await navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `I won ${totalPrize} USDT in the HoopXmas Raffle! My prediction was ${primaryTicket?.placementInfo?.predictHomeScore}:${primaryTicket?.placementInfo?.predictAwayScore}. Join the fun at hoopx.gg!`;
    if (navigator.share) {
      navigator.share({
        title: 'HoopXmas Raffle Winner!',
        text,
        url: window.location.href,
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#91000A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!primaryTicket) {
    return (
      <div className="min-h-screen bg-[#91000A] flex flex-col items-center justify-center p-4">
        <p className="text-white/60 text-center mb-4">No winning tickets found</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-white text-[#91000A] rounded-full font-medium cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  const placement = primaryTicket.placementInfo!;
  const isPaid = placement.claimStatus === 'CLAIMED';

  return (
    <div className="min-h-screen bg-[#91000A] relative overflow-hidden">
      {/* Fireworks Background */}
      <FireworksAnimation />

      <div className="max-w-md mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-white/80 hover:text-white mb-4 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/images/won.png"
            alt="You Won!"
            className="h-16 w-auto mx-auto mb-2"
          />
          <p className="text-white/80 mt-1">HoopXmas Raffle Ticket Winner</p>
        </div>

        {/* Winning Scores - Actual Results */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="font-bold text-gray-800">Winning Scores</h2>
          </div>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs text-[#91000A] uppercase mb-1">Home Team</p>
              <p className="text-4xl font-bold text-gray-800">{actualHomeScore}</p>
            </div>
            <span className="text-2xl font-bold text-[#91000A]">VS</span>
            <div className="text-center">
              <p className="text-xs text-[#91000A] uppercase mb-1">Away Team</p>
              <p className="text-4xl font-bold text-gray-800">{actualAwayScore}</p>
            </div>
          </div>
        </div>

        {/* Your Winning Ticket */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border-2 border-[#D4A942] animate-glow-strong">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span>🎟️</span>
              <h2 className="font-bold text-gray-800">Your Winning Ticket</h2>
            </div>
            <span className="bg-[#1B5E20] text-white text-xs px-3 py-1 rounded-full font-medium">
              WINNER
            </span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs text-[#91000A] uppercase mb-1">Home Team</p>
              <p className="text-4xl font-bold text-[#91000A] border-b-2 border-[#91000A] pb-1">
                {placement.predictHomeScore}
              </p>
            </div>
            <span className="text-2xl font-bold text-gray-400">VS</span>
            <div className="text-center">
              <p className="text-xs text-[#1B5E20] uppercase mb-1">Away Team</p>
              <p className="text-4xl font-bold text-[#1B5E20]">
                {placement.predictAwayScore}
              </p>
            </div>
          </div>
        </div>

        {/* Other Winning Tickets */}
        {otherWinningTickets.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span>🎄</span>
              <h2 className="font-bold text-gray-800">Other Winning Ticket</h2>
            </div>
            {otherWinningTickets.slice(0, 1).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">Home Team</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {ticket.placementInfo?.predictHomeScore}
                  </p>
                </div>
                <span className="text-xl font-bold text-gray-400">VS</span>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">Away Team</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {ticket.placementInfo?.predictAwayScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Winning Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-[#1B5E20]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-xs">i</span>
            <h2 className="font-bold text-gray-800">Winning Details</h2>
          </div>
          <p className="text-gray-600 text-sm text-center">
            {winningTickets.length > 1 ? (
              <>These {winningTickets.length} tickets have the closest partial and total scores, with a{' '}
              <span className="font-bold text-[#91000A]">only {Math.abs((actualHomeScore + actualAwayScore) - (placement.predictHomeScore + placement.predictAwayScore))}-point</span>{' '}
              difference from the actual game results!</>
            ) : (
              <>Your ticket has the closest partial and total scores to the actual game results!</>
            )}
          </p>
        </div>

        {/* Your Prize */}
        <div className="bg-[#1B5E20] rounded-2xl p-5 shadow-sm mb-4 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span>🎁</span>
            <h2 className="font-bold">Your Prize</h2>
          </div>
          <p className="text-4xl font-bold text-center text-[#D4A942] mb-1">
            {placement.prizeAmount.toLocaleString()} USDT
          </p>
          <p className="text-center text-white/80 text-sm mb-4">
            Congratulations on your amazing win!
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-lg p-3 text-center">
              <p className="text-xs text-white/60 mb-1">Total Prize Pool</p>
              <p className="font-bold text-[#D4A942]">{totalPrize.toLocaleString()} USDT</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-3 text-center">
              <p className="text-xs text-white/60 mb-1">Winning Tickets</p>
              <p className="font-bold text-[#D4A942]">{winningTickets.length} Ticket{winningTickets.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Payout Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span>⇄</span>
            <h2 className="font-bold text-gray-800">Payout Status</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isPaid ? 'bg-[#1B5E20]' : 'bg-yellow-500'}`}>
              {isPaid ? (
                <CheckIcon className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white text-xl">⏳</span>
              )}
            </div>
            <p className={`font-bold ${isPaid ? 'text-[#1B5E20]' : 'text-yellow-600'}`}>
              {isPaid ? 'PAYMENT COMPLETED' : 'PENDING PAYMENT'}
            </p>
            <p className="text-gray-500 text-sm">
              {isPaid ? 'Funds sent to your wallet' : 'Payment will be processed soon'}
            </p>
          </div>
        </div>

        {/* Transaction ID - only show if paid */}
        {isPaid && placement.txHash && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-[#1B5E20]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span>#</span>
              <h2 className="font-bold text-gray-800">Transaction ID</h2>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-600 break-all text-center font-mono">
                {placement.txHash}
              </p>
            </div>
            <button
              onClick={() => handleCopyTxId(placement.txHash!)}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#1B5E20] text-[#1B5E20] rounded-full py-2 font-medium cursor-pointer hover:bg-[#1B5E20]/5 transition-colors"
            >
              <CopyIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy TxID'}
            </button>
          </div>
        )}

        {/* Share Your Win Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-[#91000A] text-white rounded-full py-3 font-medium cursor-pointer hover:bg-[#7a0008] transition-colors mb-8"
        >
          <ShareIcon className="w-5 h-5" />
          Share Your Win
        </button>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44,4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96,1.32-2.02-.88.52-1.86.9-2.9,1.1-.82-.88-2-1.43-3.3-1.43-2.5,0-4.55,2.04-4.55,4.54,0,.36.03.7.1,1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6,1.45-.6,2.3,0,1.56.8,2.95,2,3.77-.74-.03-1.44-.23-2.05-.57v.06c0,2.2,1.56,4.03,3.64,4.44-.67.2-1.37.2-2.06.08.58,1.8,2.26,3.12,4.25,3.16C5.78,18.1,3.37,18.74,1,18.46c2,1.3,4.4,2.04,6.97,2.04,8.35,0,12.92-6.92,12.92-12.93,0-.2,0-.4-.02-.6.9-.63,1.96-1.22,2.56-2.14Z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.16c3.2,0,3.58.01,4.85.07,1.17.05,1.8.25,2.23.41.56.22.96.48,1.38.9.42.42.68.82.9,1.38.16.42.36,1.06.41,2.23.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.05,1.17-.25,1.8-.41,2.23-.22.56-.48.96-.9,1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68,1.38-.9.42-.16,1.06-.36,2.23-.41,1.27-.06,1.65-.07,4.85-.07M12,0C8.74,0,8.33.01,7.05.07,5.78.13,4.9.33,4.14.63c-.78.3-1.44.71-2.1,1.37-.66.66-1.07,1.32-1.37,2.1C.37,4.9.17,5.78.07,7.05.01,8.33,0,8.74,0,12s.01,3.67.07,4.95c.06,1.27.26,2.15.56,2.91.3.78.71,1.44,1.37,2.1.66.66,1.32,1.07,2.1,1.37.76.3,1.64.5,2.91.56,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c1.27-.06,2.15-.26,2.91-.56.78-.3,1.44-.71,2.1-1.37.66-.66,1.07-1.32,1.37-2.1.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.78-.71-1.44-1.37-2.1-.66-.66-1.32-1.07-2.1-1.37-.76-.3-1.64-.5-2.91-.56C15.67.01,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM19.85,5.6a1.44,1.44,0,1,1-1.44-1.44A1.44,1.44,0,0,1,19.85,5.6Z"/></svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99,0C5.37,0,0,5.37,0,12s5.37,12,11.99,12S24,18.63,24,12,18.62,0,11.99,0Zm5.9,8.15l-1.99,9.38c-.15.67-.54.84-1.1.52l-3.03-2.23-1.46,1.41c-.16.16-.3.3-.61.3l.22-3.1,5.6-5.06c.24-.22-.05-.34-.38-.12l-6.93,4.36-2.99-.93c-.65-.2-.66-.65.14-.96l11.68-4.5c.54-.2,1.01.13.84.93Z"/></svg>
            </a>
          </div>
          <p className="text-white/50 text-xs">
            © 2025 HoopXmas Raffle. All rights reserved.
          </p>
          <p className="text-[#D4A942] text-xs mt-1">
            Merry Christmas and Happy New Year!
          </p>
        </div>
      </div>
    </div>
  );
}
