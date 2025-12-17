'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import Image from 'next/image';
import { isInMobileBrowser, isInJupiterBrowser, isAndroidDevice, openInJupiterApp, openInPhantomApp, openInSolflareApp } from '@/lib/utils/mobile-deeplink';

interface MobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Get display name for wallet
 */
const getWalletDisplayName = (walletName: string): string => {
  if (walletName === 'WalletConnect/Reown') {
    return 'Other wallets';
  }
  return walletName;
};

export default function MobileWalletModal({ isOpen, onClose }: MobileWalletModalProps) {
  const { wallets, select, connecting } = useWallet();

  // Filter wallets: hide Jupiter Mobile if already in Jupiter app, hide Mobile Wallet Adapter on Android
  const inJupiterBrowser = isInJupiterBrowser();
  const isAndroid = isAndroidDevice();
  const filteredWallets = wallets.filter(wallet => {
    // Hide Jupiter Mobile if already in Jupiter app
    if (wallet.adapter.name === 'Jupiter Mobile' && inJupiterBrowser) {
      return false;
    }
    // Hide Mobile Wallet Adapter on Android (causes issues)
    if (wallet.adapter.name === 'Mobile Wallet Adapter' && isAndroid) {
      return false;
    }
    return true;
  });

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletName: string) => {
    console.log('handleWalletSelect called:', walletName);
    console.log('isInMobileBrowser:', isInMobileBrowser());
    console.log('isInJupiterBrowser:', isInJupiterBrowser());

    try {
      // Special handling for Jupiter on mobile browser - direct deep link
      if (walletName === 'Jupiter Mobile' && isInMobileBrowser()) {
        console.log('Opening Jupiter app via deep link...');
        onClose();
        openInJupiterApp();
        return;
      }

      // Special handling for Phantom on mobile - use deep link
      if (walletName === 'Phantom' && isInMobileBrowser()) {
        console.log('Opening Phantom app via deep link...');
        onClose();
        openInPhantomApp();
        return;
      }

      // Special handling for Solflare on mobile - use deep link
      if (walletName === 'Solflare' && isInMobileBrowser()) {
        console.log('Opening Solflare app via deep link...');
        onClose();
        openInSolflareApp();
        return;
      }

      // Select wallet - AutoConnectOnSelect component will trigger connect()
      console.log('Selecting wallet via adapter:', walletName);
      select(walletName as import('@solana/wallet-adapter-base').WalletName);
      onClose();
    } catch (error) {
      console.error('Failed to select wallet:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-900 to-purple-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 p-6 animate-slide-up sm:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Select Wallet</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3">
          {filteredWallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              disabled={connecting}
              className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {wallet.adapter.icon && (
                <Image
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg"
                  unoptimized
                />
              )}
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{getWalletDisplayName(wallet.adapter.name)}</div>
                {connecting && (
                  <div className="text-white/50 text-sm mt-1">Connecting...</div>
                )}
              </div>
              <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Info Text */}
        <p className="text-white/50 text-xs text-center mt-6">
          Connect your Solana wallet to redeem tickets
        </p>
      </div>
    </div>
  );
}
