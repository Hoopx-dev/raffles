'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLuckyStats, LuckyWinStats } from '@/lib/api/lucky';

/**
 * Hook to fetch user's lucky win statistics
 * Only fetches when wallet is connected
 */
export function useLuckyStats() {
  const { connected } = useWallet();

  return useQuery({
    queryKey: ['lucky', 'stats'],
    queryFn: getLuckyStats,
    enabled: connected,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Re-export types
export type { LuckyWinStats };
