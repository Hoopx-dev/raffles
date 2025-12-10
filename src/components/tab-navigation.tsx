'use client';

import { useTabStore } from '@/lib/store/useTabStore';
import { useTicketStore } from '@/lib/store/useTicketStore';
import { Tabs } from './ui/tabs';
import { useTranslation } from '@/i18n/useTranslation';

export function TabNavigation() {
  const { mainTab, setMainTab } = useTabStore();
  const tickets = useTicketStore((s) => s.tickets);
  const ticketCount = tickets.length;
  const { t } = useTranslation();

  return (
    <div className="px-4 pt-3 relative z-10">
      <Tabs
        tabs={[
          { id: 'live-scores', label: t.tabs.liveScores },
          { id: 'my-tickets', label: t.tabs.myTickets, count: ticketCount },
        ]}
        activeTab={mainTab}
        onTabChange={(tab) => setMainTab(tab as 'live-scores' | 'my-tickets')}
      />
    </div>
  );
}
