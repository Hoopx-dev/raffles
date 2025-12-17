'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useUIStore } from '@/lib/store/useUIStore';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useEventStatus } from '@/lib/hooks/useHomeData';
import { getHoopxBalance } from '@/lib/solana/burnTokens';
import { isMobileDevice } from '@/lib/utils/mobile-deeplink';
import MobileWalletModal from './mobile-wallet-modal';
import { useEffect, useState } from 'react';

export function FloatingButtons() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { openInfoModal, openRedeemModal } = useUIStore();
  const { setAddress, clearAddress, setHoopxBalance } = useWalletStore();
  const { t } = useTranslation();
  const { isBettingClosed, isEventEnded } = useEventStatus();
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Sync wallet connection state and fetch balance
  useEffect(() => {
    if (connected && publicKey) {
      setAddress(publicKey.toBase58());

      // Fetch real HOOPX balance
      getHoopxBalance(connection, publicKey)
        .then((balance) => {
          console.log('HOOPX balance:', balance);
          setHoopxBalance(balance);
        })
        .catch((error) => {
          console.error('Failed to fetch HOOPX balance:', error);
          setHoopxBalance(0);
        });
    } else {
      clearAddress();
    }
  }, [connected, publicKey, connection, setAddress, clearAddress, setHoopxBalance]);

  // Close mobile modal when connected
  useEffect(() => {
    if (connected && showMobileModal) {
      setShowMobileModal(false);
    }
  }, [connected, showMobileModal]);

  const handleButtonClick = () => {
    if (connected) {
      openRedeemModal();
    } else {
      // On mobile, show custom modal; on desktop, show standard modal
      if (isMobileDevice()) {
        setShowMobileModal(true);
      } else {
        setVisible(true);
      }
    }
  };

  return (
    <>
      {/* Mobile Wallet Modal */}
      <MobileWalletModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

      {/* Info Button */}
      <button
        onClick={openInfoModal}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#91000A] flex items-center justify-center text-[#D99739] hover:brightness-110 transition-colors z-40 cursor-pointer" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
        aria-label="Info"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Connect/Redeem Button - hide when betting closed or event ended */}
      {!isBettingClosed && !isEventEnded && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-40 max-w-[860px] mx-auto">
          <button
            onClick={handleButtonClick}
            className={`w-full py-4 rounded-full font-semibold uppercase text-sm transition-all cursor-pointer ${
              connected
                ? 'bg-gold text-[#91000A] hover:brightness-110'
                : 'bg-primary text-[#91000A] hover:bg-primary-dark'
            }`}
          >
            {connected ? t.wallet.redeem : t.wallet.connectToRedeem}
          </button>
        </div>
      )}
    </>
  );
}
