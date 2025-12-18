'use client';

import { useWalletStore } from '@/lib/store/useWalletStore';

const DEFAULT_TICKET_PRICE = 10000;

interface EligibleBalanceResult {
  /** User's current wallet balance */
  walletBalance: number;
  /** Available to redeem (same as wallet balance now) */
  availableQuota: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get eligible HOOPX balance for ticket redemption
 * Simply returns the current HOOPX balance in the wallet
 */
export function useEligibleBalance(
  _ticketPrice: number = DEFAULT_TICKET_PRICE,
  _enabled: boolean = true
): EligibleBalanceResult {
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);

  return {
    walletBalance: hoopxBalance,
    availableQuota: hoopxBalance,
    isLoading: false,
    error: null,
  };
}
