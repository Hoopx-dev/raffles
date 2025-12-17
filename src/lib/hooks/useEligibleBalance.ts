'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTicketList } from './useTickets';

// ============================================
// ELIGIBILITY CUTOFF DATE - Change this to adjust when swaps become eligible
// Only HOOPX tokens received AFTER this date can be used for ticket redemption
// ============================================
export const ELIGIBILITY_CUTOFF_DATE = '2025-12-17T00:00:00Z';
const ELIGIBILITY_CUTOFF_TIMESTAMP = Math.floor(new Date(ELIGIBILITY_CUTOFF_DATE).getTime() / 1000);
const ELIGIBILITY_CUTOFF_MS = new Date(ELIGIBILITY_CUTOFF_DATE).getTime();

// Formatted date for display (e.g., "Dec 16")
export const ELIGIBILITY_CUTOFF_DISPLAY = new Date(ELIGIBILITY_CUTOFF_DATE).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

// HOOPX token mint address
const HOOPX_MINT = process.env.NEXT_PUBLIC_HOOPX_MINT || '11111111111111111111111111111111';

// Extract Helius API key from RPC URL
function getHeliusApiKey(): string | null {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '';
  const match = rpcUrl.match(/api-key=([^&]+)/);
  return match ? match[1] : null;
}

const DEFAULT_TICKET_PRICE = 10000;

interface HeliusTokenTransfer {
  mint: string;
  tokenAmount: number;
  toUserAccount: string;
  fromUserAccount: string;
}

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string; // 'SWAP', 'TRANSFER', etc.
  source: string; // 'JUPITER', 'RAYDIUM', etc.
  tokenTransfers: HeliusTokenTransfer[];
}

interface EligibleBalanceResult {
  /** Total HOOPX received from swaps after cutoff date */
  totalSwapped: number;
  /** User's current wallet balance */
  walletBalance: number;
  /** Available to redeem (min of swapped and wallet balance) */
  availableQuota: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Calculate eligible HOOPX balance using Helius Enhanced Transactions API
 * - Fetches swap transactions for the wallet
 * - Sums up HOOPX received after cutoff date
 * - Single API call, no transaction parsing needed
 *
 * @param ticketPrice - Price per ticket in HOOPX (unused, kept for API compatibility)
 * @param enabled - Only fetch when true (e.g., when modal is open)
 */
export function useEligibleBalance(ticketPrice: number = DEFAULT_TICKET_PRICE, enabled: boolean = true): EligibleBalanceResult {
  const { publicKey } = useWallet();
  const { isAuthenticated } = useWalletStore();
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);

  // Get all tickets to count those created after cutoff
  const { data: ticketData } = useTicketList(undefined, 1, 100);

  // Count tickets created after the cutoff date
  const ticketsAfterCutoff = ticketData?.records?.filter((ticket) => {
    const ticketTime = new Date(ticket.createTime).getTime();
    return ticketTime >= ELIGIBILITY_CUTOFF_MS;
  }) || [];
  const ticketsRedeemedAfterCutoff = ticketsAfterCutoff.length;
  const hoopxUsedForTickets = ticketsRedeemedAfterCutoff * ticketPrice;

  const query = useQuery({
    queryKey: ['swap-history-helius', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');

      const apiKey = getHeliusApiKey();
      if (!apiKey) throw new Error('Helius API key not found');

      const walletAddress = publicKey.toBase58();

      // Call Helius Enhanced Transactions API - get ALL transactions (not just SWAP)
      // because recent swaps might be categorized differently
      const response = await fetch(
        `https://api-mainnet.helius-rpc.com/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=50`
      );

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const transactions: HeliusTransaction[] = await response.json();

      // Debug: log all transactions
      console.log('Helius transactions:', transactions.map(tx => ({
        type: tx.type,
        source: tx.source,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        transfers: tx.tokenTransfers?.filter(t => t.mint === HOOPX_MINT).map(t => ({
          amount: t.tokenAmount,
          to: t.toUserAccount,
        })),
      })));

      // Sum up HOOPX received from SWAP transactions after cutoff date
      let totalSwapped = 0;

      for (const tx of transactions) {
        // Skip transactions before cutoff date
        if (tx.timestamp < ELIGIBILITY_CUTOFF_TIMESTAMP) continue;

        // Only count DEX swap transactions (Jupiter, Raydium, Orca, etc.)
        const DEX_SOURCES = ['JUPITER', 'RAYDIUM', 'ORCA', 'METEORA', 'PHOENIX'];
        if (!DEX_SOURCES.includes(tx.source)) {
          continue;
        }

        // Check token transfers for HOOPX received
        for (const transfer of tx.tokenTransfers || []) {
          // Check if this is HOOPX being received by our wallet
          if (
            transfer.mint === HOOPX_MINT &&
            transfer.toUserAccount === walletAddress &&
            transfer.tokenAmount > 0
          ) {
            totalSwapped += transfer.tokenAmount;
          }
        }
      }

      console.log('Eligible HOOPX swapped (from SWAP only):', totalSwapped);

      return { totalSwapped };
    },
    enabled: enabled && isAuthenticated && !!publicKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minute cache
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch when modal opens
    refetchOnReconnect: false,
  });

  const totalSwapped = query.data?.totalSwapped || 0;
  // Eligible = swapped after cutoff - tickets redeemed after cutoff
  const eligibleAfterDeduction = Math.max(0, totalSwapped - hoopxUsedForTickets);
  // Available is the minimum of: eligible amount OR what's in wallet
  const availableQuota = Math.min(eligibleAfterDeduction, hoopxBalance);

  console.log('Eligible balance calc:', {
    totalSwapped,
    ticketsRedeemedAfterCutoff,
    hoopxUsedForTickets,
    eligibleAfterDeduction,
    availableQuota,
  });

  return {
    totalSwapped: eligibleAfterDeduction, // Show after deduction
    walletBalance: hoopxBalance,
    availableQuota,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
