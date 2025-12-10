'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTranslation } from '@/i18n/useTranslation';

export function Header() {
  const { t } = useTranslation();
  const { connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { truncatedAddress } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWalletClick = () => {
    if (connected) {
      setShowDropdown(!showDropdown);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  return (
    <header className="relative">
      {/* Content */}
      <div className="relative z-10 px-4 pt-2 pb-6">
        {/* Top bar: Wallet */}
        <div className="flex justify-end items-center gap-2 -mb-2">
          {/* Wallet Button - only show when connected */}
          {connected && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleWalletClick}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-white/20 text-white hover:bg-white/30"
              >
                {truncatedAddress}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/images/heading.png"
            alt="NBA Christmas 2025"
            width={336}
            height={168}
            priority
            className="object-contain animate-float"
          />

          {/* Subtitle */}
          <h1 className="text-white/90 text-lg font-medium mt-2">
            {t.header.subtitle}
          </h1>
        </div>
      </div>
    </header>
  );
}
