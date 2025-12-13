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
import { useTabStore } from "@/lib/store/useTabStore";
import { useHomeData, getNextTier } from "@/lib/hooks/useHomeData";
import { useState } from "react";

export default function Home() {
  const { mainTab } = useTabStore();
  const { data: homeData, isLoading: isHomeLoading } = useHomeData();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Get event info from API
  const eventInfo = homeData?.eventInfo;
  const poolTiers = homeData?.poolTierVOList || [];

  // Calculate next tier
  const nextTier = eventInfo
    ? getNextTier(eventInfo.totalTicketsPlaced, poolTiers)
    : null;

  const handleRedeemSuccess = () => {
    setToast({
      message: "You've redeemed tickets successfully!",
      type: "success",
    });
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
          prizePool={eventInfo?.currentPrizePool || 0}
          participants={eventInfo?.totalTicketsPlaced || 0}
          isLoading={isHomeLoading}
        />

        {/* Prize Progress */}
        <PrizeProgress
          currentTickets={eventInfo?.totalTicketsPlaced || 0}
          nextTierTickets={nextTier?.nextTierTickets || 1000}
          nextTierPrize={nextTier?.nextTierPrize || 20000}
          isLoading={isHomeLoading}
          isMaxTier={nextTier?.isMaxTier}
        />

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
