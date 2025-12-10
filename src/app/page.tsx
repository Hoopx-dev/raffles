'use client';

import { useState } from 'react';
import { useTabStore } from '@/lib/store/useTabStore';
import { Header } from '@/components/header';
import { SnowAnimation } from '@/components/snow-animation';
import { StatsBar } from '@/components/stats-bar';
import { PrizeProgress } from '@/components/prize-progress';
import { TabNavigation } from '@/components/tab-navigation';
import { LiveScoresTab } from '@/components/live-scores-tab';
import { MyTicketsTab } from '@/components/my-tickets-tab';
import { FloatingButtons } from '@/components/floating-buttons';
import { RedeemModal } from '@/components/redeem-modal';
import { ConfirmModal } from '@/components/confirm-modal';
import { InfoModal } from '@/components/info-modal';
import { LuckyNumberModal } from '@/components/lucky-number-modal';
import { LuckyPrizeBanner } from '@/components/lucky-prize-banner';
import { Toast } from '@/components/ui/toast';

// Dummy stats (will be replaced with real data from backend)
const DUMMY_STATS = {
  prizePool: 2000,
  participants: 127,
  currentTickets: 127,
  nextTierTickets: 1000,
  nextTierPrize: 20000,
};

export default function Home() {
  const { mainTab } = useTabStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleRedeemSuccess = () => {
    setToast({
      message: "You've redeemed tickets successfully!",
      type: 'success',
    });
  };

  return (
    <main className="min-h-screen pb-24 max-w-[860px] mx-auto">
      {/* Lucky Prize Banner - fixed at top */}
      <LuckyPrizeBanner />

      {/* Header section with subtle gradient */}
      <div className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/bg-header.png)' }}>
        {/* Snow animation covering entire purple section */}
        <SnowAnimation />

        {/* Header with logo */}
        <Header />

        {/* Stats Bar */}
        <StatsBar
          prizePool={DUMMY_STATS.prizePool}
          participants={DUMMY_STATS.participants}
        />

        {/* Prize Progress */}
        <div className="pb-4">
          <PrizeProgress
            currentTickets={DUMMY_STATS.currentTickets}
            nextTierTickets={DUMMY_STATS.nextTierTickets}
            nextTierPrize={DUMMY_STATS.nextTierPrize}
          />
        </div>

        {/* Tab Navigation */}
        <TabNavigation />
      </div>

      {/* Tab Content - Red background section connected to active tab */}
      <div className="bg-[#91000A] min-h-[50vh] pt-4 -mt-[1px]">
        {mainTab === 'live-scores' ? <LiveScoresTab /> : <MyTicketsTab />}
      </div>

      {/* Floating Buttons */}
      <FloatingButtons />

      {/* Modals */}
      <RedeemModal />
      <ConfirmModal onSuccess={handleRedeemSuccess} />
      <InfoModal />
      <LuckyNumberModal />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
