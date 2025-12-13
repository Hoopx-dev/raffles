'use client';

import { useTabStore } from '@/lib/store/useTabStore';
import { useTicketCounts } from '@/lib/hooks/useTickets';
import { Tabs } from './ui/tabs';
import { useTranslation } from '@/i18n/useTranslation';

export function TabNavigation() {
  const { mainTab, setMainTab } = useTabStore();
  const { data: counts } = useTicketCounts();
  const { t } = useTranslation();

  // Total tickets = unused + placed (exclude expired from count display)
  const ticketCount = (counts?.unusedCount || 0) + (counts?.placedCount || 0);

  return (
    <div className="px-4 pt-3 relative z-10">
      <Tabs
        tabs={[
          { id: 'live-scores', label: t.tabs.liveScores },
          { id: 'my-tickets', label: t.tabs.myTickets, count: ticketCount > 0 ? ticketCount : undefined },
        ]}
        activeTab={mainTab}
        onTabChange={(tab) => setMainTab(tab as 'live-scores' | 'my-tickets')}
      />
    </div>
  );
}
