"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useWalletStore } from "@/lib/store/useWalletStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { t } = useTranslation();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { truncatedAddress } = useWalletStore();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWalletClick = () => {
    if (connected) {
      setShowDropdown(!showDropdown);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  return (
    <header className='relative pt-10'>
      {/* Content */}
      <div className='relative z-10 px-4 pt-2 pb-6'>
        {/* Top bar: Wallet */}
        <div className='flex justify-end items-center gap-2 -mb-2'>
          {/* Wallet Button - only show when connected */}
          {connected && (
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={handleWalletClick}
                className='px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-white/20 text-white hover:bg-white/30'
              >
                {truncatedAddress}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className='absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-50'>
                  <button
                    onClick={handleDisconnect}
                    disabled={isLoggingOut}
                    className='w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className='flex flex-col items-center'>
          <h1 className='text-4xl md:text-5xl font-bold text-white text-center animate-float drop-shadow-lg'>
            HoopXmas
            <br />
            <span className='text-gold'>Raffle Ticket</span>
          </h1>

          {/* Subtitle */}
          <p className='text-white/90 text-lg font-medium mt-6'>
            {t.header.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
