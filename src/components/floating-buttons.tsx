'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useUIStore } from '@/lib/store/useUIStore';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useEffect } from 'react';

export function FloatingButtons() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { openInfoModal, openRedeemModal } = useUIStore();
  const { setAddress, clearAddress, truncatedAddress } = useWalletStore();
  const { t } = useTranslation();

  // Sync wallet connection state
  useEffect(() => {
    if (connected && publicKey) {
      setAddress(publicKey.toBase58());
    } else {
      clearAddress();
    }
  }, [connected, publicKey, setAddress, clearAddress]);

  return (
    <>
      {/* Info Button */}
      <button
        onClick={openInfoModal}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-gray-50 transition-colors z-40 cursor-pointer"
        aria-label="Info"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Connect/Redeem Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-40">
        <div className="flex gap-3">
          {/* Wallet Button */}
          <button
            data-wallet-button
            onClick={() => connected ? disconnect() : setVisible(true)}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all cursor-pointer ${
              connected
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-primary text-white'
            }`}
          >
            {connected ? truncatedAddress : t.wallet.connect}
          </button>

          {/* Redeem Button (only when connected) */}
          {connected && (
            <button
              onClick={openRedeemModal}
              className="flex-1 py-4 rounded-xl font-semibold bg-gold text-text-dark hover:brightness-110 transition-all cursor-pointer"
            >
              {t.wallet.redeem}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
