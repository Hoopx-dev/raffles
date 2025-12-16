'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTabStore } from '@/lib/store/useTabStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomeData } from '@/lib/hooks/useHomeData';
import { useTicketList, useTicketCounts } from '@/lib/hooks/useTickets';
import { isMobileDevice } from '@/lib/utils/mobile-deeplink';
import MobileWalletModal from './mobile-wallet-modal';
import { SubTabs } from './ui/tabs';
import { UnbetTicketCard } from './unbet-ticket-card';
import { BetTicketCard } from './bet-ticket-card';

const TICKETS_PER_PAGE = 10;

export function MyTicketsTab() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { ticketSubTab, setTicketSubTab } = useTabStore();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const openRedeemModal = useUIStore((s) => s.openRedeemModal);
  const { t } = useTranslation();

  // Get event ID from home data
  const { data: homeData } = useHomeData();
  const eventId = homeData?.eventInfo?.id;

  // Fetch counts first to determine which tabs to show
  const { data: counts, isLoading: countsLoading } = useTicketCounts();

  const hasUnbet = (counts?.unusedCount || 0) > 0;
  const hasBet = (counts?.placedCount || 0) > 0;
  const showSubTabs = hasUnbet && hasBet;

  // Determine which status to fetch based on available tickets
  const effectiveStatus = showSubTabs
    ? (ticketSubTab === 'unbet' ? 'UNUSED' : 'PLACED')
    : hasUnbet
    ? 'UNUSED'
    : hasBet
    ? 'PLACED'
    : 'ALL';

  // Fetch tickets based on effective status
  const { data: ticketData, isLoading: ticketsLoading, error } = useTicketList(effectiveStatus);

  const isLoading = countsLoading || ticketsLoading;
  // Filter out invalid tickets
  const tickets = (ticketData?.records || []).filter(
    (t) => t.status === 'UNUSED' || t.status === 'PLACED' || t.status === 'EXPIRED'
  );

  // Pagination
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
    return tickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);
  }, [tickets, currentPage]);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: 'unbet' | 'bet') => {
    setTicketSubTab(tab);
    setCurrentPage(1);
  };

  const handleConnect = () => {
    if (isMobileDevice()) {
      setShowMobileModal(true);
    } else {
      setVisible(true);
    }
  };

  // Not connected state
  if (!connected) {
    return (
      <>
        <MobileWalletModal
          isOpen={showMobileModal}
          onClose={() => setShowMobileModal(false)}
        />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-white/60 text-center mb-2">{t.tickets.pleaseConnect}</p>
          <button
            className="text-primary underline font-medium cursor-pointer"
            onClick={handleConnect}
          >
            {t.tickets.connectNow}
          </button>
        </div>
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-center">Loading tickets...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-red-400 text-center mb-4">Failed to load tickets</p>
        <button
          onClick={openRedeemModal}
          className="flex items-center gap-2 text-[#D99739] font-medium cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-[#D99739] flex items-center justify-center text-white text-sm">+</span>
          {t.tickets.redeemFirst}
        </button>
      </div>
    );
  }

  // No tickets state
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-white/60 text-center mb-4">{t.tickets.noTickets}</p>
        <button
          onClick={openRedeemModal}
          className="flex items-center gap-2 text-[#D99739] font-medium cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-[#D99739] flex items-center justify-center text-white text-sm">+</span>
          {t.tickets.redeemFirst}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      {/* Sub-tabs (only shown when both unbet and bet exist) */}
      {showSubTabs && (
        <div className="mb-4">
          <SubTabs
            tabs={[
              { id: 'unbet', label: `${t.tabs.unbet} (${counts?.unusedCount || 0})` },
              { id: 'bet', label: `${t.tabs.bet} (${counts?.placedCount || 0})` },
            ]}
            activeTab={ticketSubTab}
            onTabChange={(tab) => handleTabChange(tab as 'unbet' | 'bet')}
          />
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {paginatedTickets.map((ticket) =>
          ticket.status === 'UNUSED' ? (
            <UnbetTicketCard key={ticket.id} ticket={ticket} eventId={eventId} />
          ) : (
            <BetTicketCard key={ticket.id} ticket={ticket} />
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>
          <span className="text-white/70">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Redeem More Button */}
      <button
        onClick={openRedeemModal}
        className="flex items-center gap-2 mt-6 text-orange font-medium cursor-pointer"
      >
        <span className="w-6 h-6 rounded-full bg-[#D99739] flex items-center justify-center text-white text-sm">+</span>
        {t.tickets.redeemFirst}
      </button>
    </div>
  );
}
