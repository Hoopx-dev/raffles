'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useTicketStore } from '@/lib/store/useTicketStore';
import { useTabStore } from '@/lib/store/useTabStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { SubTabs } from './ui/tabs';
import { UnbetTicketCard } from './unbet-ticket-card';
import { BetTicketCard } from './bet-ticket-card';

export function MyTicketsTab() {
  const { connected } = useWallet();
  const tickets = useTicketStore((s) => s.tickets);
  const { ticketSubTab, setTicketSubTab } = useTabStore();
  const openRedeemModal = useUIStore((s) => s.openRedeemModal);
  const { t } = useTranslation();

  const unbetTickets = tickets.filter((t) => t.status === 'unbet');
  const betTickets = tickets.filter((t) => t.status === 'bet');
  const hasUnbet = unbetTickets.length > 0;
  const hasBet = betTickets.length > 0;
  const showSubTabs = hasUnbet && hasBet;

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
              { id: 'unbet', label: t.tabs.unbet },
              { id: 'bet', label: t.tabs.bet },
            ]}
            activeTab={ticketSubTab}
            onTabChange={(tab) => setTicketSubTab(tab as 'unbet' | 'bet')}
          />
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {(!showSubTabs || ticketSubTab === 'unbet') &&
          unbetTickets.map((ticket) => (
            <UnbetTicketCard key={ticket.id} ticket={ticket} />
          ))}

        {(!showSubTabs || ticketSubTab === 'bet') &&
          betTickets.map((ticket) => (
            <BetTicketCard key={ticket.id} ticket={ticket} />
          ))}
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
