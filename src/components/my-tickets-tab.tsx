'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useTabStore } from '@/lib/store/useTabStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomeData } from '@/lib/hooks/useHomeData';
import { useTicketList, useTicketCounts } from '@/lib/hooks/useTickets';
import { SubTabs } from './ui/tabs';
import { UnbetTicketCard } from './unbet-ticket-card';
import { BetTicketCard } from './bet-ticket-card';

export function MyTicketsTab() {
  const { connected } = useWallet();
  const { ticketSubTab, setTicketSubTab } = useTabStore();
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

  // Not connected state
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-white/60 text-center mb-2">{t.tickets.pleaseConnect}</p>
        <button
          className="text-primary underline font-medium cursor-pointer"
          onClick={() => {
            // This will be handled by the main wallet button
            const walletButton = document.querySelector('[data-wallet-button]');
            if (walletButton instanceof HTMLElement) {
              walletButton.click();
            }
          }}
        >
          {t.tickets.connectNow}
        </button>
      </div>
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
            onTabChange={(tab) => setTicketSubTab(tab as 'unbet' | 'bet')}
          />
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.map((ticket) =>
          ticket.status === 'UNUSED' ? (
            <UnbetTicketCard key={ticket.id} ticket={ticket} eventId={eventId} />
          ) : (
            <BetTicketCard key={ticket.id} ticket={ticket} />
          )
        )}
      </div>

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
