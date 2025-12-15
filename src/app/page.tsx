"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import { FloatingButtons } from "@/components/floating-buttons";
import { Header } from "@/components/header";
import { InfoModal } from "@/components/info-modal";
import { LiveScoresTab } from "@/components/live-scores-tab";
import { LuckyNumberModal } from "@/components/lucky-number-modal";
import { LuckyPrizeBanner } from "@/components/lucky-prize-banner";
import { MyTicketsTab } from "@/components/my-tickets-tab";
import { PrizeProgress } from "@/components/prize-progress";
import { RedeemModal } from "@/components/redeem-modal";
import { SnowAnimation } from "@/components/snow-animation";
import { StatsBar } from "@/components/stats-bar";
import { TabNavigation } from "@/components/tab-navigation";
import { Toast } from "@/components/ui/toast";
import { WonCard } from "@/components/won-card";
import { WonModal, useWonModal } from "@/components/won-modal";
import { useTabStore } from "@/lib/store/useTabStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { useHomeData, getNextTier, getCurrentPrizePool, useEventStatus } from "@/lib/hooks/useHomeData";
import { useTicketList } from "@/lib/hooks/useTickets";

export default function Home() {
  const { mainTab } = useTabStore();
  const { toast, showToast, hideToast } = useUIStore();
  const { data: homeData, isLoading: isHomeLoading } = useHomeData();
  const { isEventEnded } = useEventStatus();
  const { isOpen: isWonModalOpen, closeModal: closeWonModal } = useWonModal();
  const { data: ticketData } = useTicketList('PLACED');

  // Get event info from API
  const eventInfo = homeData?.eventInfo;
  const poolTiers = homeData?.poolTierVOList || [];
  const totalTickets = eventInfo?.totalTicketsPlaced || 0;

  // Calculate current prize pool from tiers (fallback to API value if tiers empty)
  const currentPrizePool = poolTiers.length > 0
    ? getCurrentPrizePool(totalTickets, poolTiers)
    : (eventInfo?.currentPrizePool || 0);

  // Calculate next tier
  const nextTier = eventInfo
    ? getNextTier(totalTickets, poolTiers)
    : null;

  // Check if user has winning tickets
  const hasWinningTickets = (ticketData?.records || []).some(
    (t) => t.placementInfo?.winStatus === 1
  );

  // Show WonCard if event ended and user has winning tickets
  const showWonCard = isEventEnded && hasWinningTickets;

  const handleRedeemSuccess = () => {
    showToast("You've redeemed tickets successfully!", "success");
  };

  return (
    <main className='min-h-screen pb-24 max-w-[860px] mx-auto'>
      {/* Header section with subtle gradient */}
      <div
        className='relative overflow-hidden bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url(/images/bg-header.png)" }}
      >
        {/* Snow animation covering entire purple section */}
        <SnowAnimation />

        {/* Header with logo */}
        <Header />

        {/* Stats Bar */}
        <StatsBar
          prizePool={currentPrizePool}
          participants={totalTickets}
          isLoading={isHomeLoading}
          isEventEnded={isEventEnded}
        />

        {/* Prize Progress or Won Card */}
        {showWonCard ? (
          <WonCard />
        ) : (
          <PrizeProgress
            currentTickets={totalTickets}
            nextTierTickets={nextTier?.nextTierTickets || 1000}
            nextTierPrize={nextTier?.nextTierPrize || 20000}
            isLoading={isHomeLoading}
            isMaxTier={nextTier?.isMaxTier}
          />
        )}

        {/* Lucky Prize Banner */}
        <LuckyPrizeBanner />

        {/* Tab Navigation */}
        <TabNavigation />
      </div>

      {/* Tab Content - Red background section connected to active tab */}
      <div className='bg-[#91000A] min-h-[50vh] pt-4 -mt-[1px]'>
        {mainTab === "live-scores" ? <LiveScoresTab /> : <MyTicketsTab />}
      </div>

      {/* Floating Buttons */}
      <FloatingButtons />

      {/* Modals */}
      <RedeemModal ticketPrice={eventInfo?.ticketPriceHoopx} />
      <ConfirmModal
        onSuccess={handleRedeemSuccess}
        eventId={eventInfo?.id}
        burnAddress={eventInfo?.destroyWalletAddress}
        ticketPrice={eventInfo?.ticketPriceHoopx}
      />
      <InfoModal />
      <LuckyNumberModal />
      <WonModal isOpen={isWonModalOpen} onClose={closeWonModal} />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </main>
  );
}
