"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEventStatus, useHomeData } from "@/lib/hooks/useHomeData";
import { useWalletStore } from "@/lib/store/useWalletStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(endTime: string): TimeRemaining {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export function Header() {
  const { t } = useTranslation();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { truncatedAddress } = useWalletStore();
  const { logout } = useAuth();
  const { data: homeData } = useHomeData();
  const { isBettingClosed, isEventEnded } = useEventStatus();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );
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

  // Countdown timer
  useEffect(() => {
    const endTime = homeData?.eventInfo?.endTime;
    if (!endTime) return;

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(endTime));

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [homeData?.eventInfo?.endTime]);

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
      // Clear all React Query caches (tickets, counts, etc.)
      queryClient.clear();
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  return (
    <header className='relative'>
      {/* Content */}
      <div className='relative z-10 px-4 pt-2 pb-2'>
        {/* Top bar: Wallet */}
        <div className='flex justify-end items-center gap-2 -mb-2'>
          {/* Wallet Button - only show when connected */}
          {connected && (
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={handleWalletClick}
                className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-white/20 text-white hover:bg-white/30'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                  />
                </svg>
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
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className='flex flex-col items-center pt-10'>
          <h1 className='text-4xl md:text-5xl font-bold text-white text-center animate-float drop-shadow-lg'>
            HoopXmas
            <br />
            <span className='text-gold'>Raffle Ticket</span>
          </h1>

          {/* Subtitle */}
          <p className='text-white/90 text-lg font-medium mt-1'>
            {t.header.subtitle}
          </p>

          {/* Event Status Badge */}
          <div className='mt-1'>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                isEventEnded
                  ? "bg-red-500/30 text-red-300"
                  : isBettingClosed
                  ? "bg-yellow-500/30 text-yellow-300"
                  : "bg-green-500/30 text-green-300"
              }`}
            >
              {isEventEnded ? "Event Ended" : isBettingClosed ? "Betting Closed" : "Ongoing"}
            </span>
          </div>

          {/* Countdown Timer */}
          {timeRemaining && !timeRemaining.isExpired && (
            <div className='mt-2 flex items-center gap-2'>
              <div className='flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2'>
                <div className='text-center'>
                  <span className='text-white font-bold'>
                    {String(timeRemaining.days).padStart(2, "0")}
                  </span>
                  <p className='text-white/60 text-[10px] uppercase'>Days</p>
                </div>
                <span className='text-white/60 mx-1'>:</span>
                <div className='text-center'>
                  <span className='text-white font-bold'>
                    {String(timeRemaining.hours).padStart(2, "0")}
                  </span>
                  <p className='text-white/60 text-[10px] uppercase'>Hrs</p>
                </div>
                <span className='text-white/60 mx-1'>:</span>
                <div className='text-center'>
                  <span className='text-white font-bold'>
                    {String(timeRemaining.minutes).padStart(2, "0")}
                  </span>
                  <p className='text-white/60 text-[10px] uppercase'>Min</p>
                </div>
                <span className='text-white/60 mx-1'>:</span>
                <div className='text-center'>
                  <span className='text-white font-bold'>
                    {String(timeRemaining.seconds).padStart(2, "0")}
                  </span>
                  <p className='text-white/60 text-[10px] uppercase'>Sec</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
