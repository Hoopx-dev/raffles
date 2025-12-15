'use client';

import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { getLuckyStats, LuckyWinStats } from '@/lib/api/lucky';

const SESSION_TOKEN_KEY = 'hoopx_session_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Hook to fetch user's lucky win statistics
 * Only fetches when authenticated (not just connected)
 */
export function useLuckyStats() {
  const { isAuthenticated } = useWalletStore();
  const token = getStoredToken();

  return useQuery({
    queryKey: ['lucky', 'stats'],
    queryFn: getLuckyStats,
    enabled: isAuthenticated && !!token, // Require authentication, not just connection
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Re-export types
export type { LuckyWinStats };
