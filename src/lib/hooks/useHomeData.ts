'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getHomeIndex,
  HomeIndexData,
  RaffleEventInfo,
  GameInfo,
  PrizePoolTier,
} from '@/lib/api/home';

/**
 * Hook to fetch home page data
 * Returns event info, games, and prize pool tiers
 */
export function useHomeData() {
  return useQuery({
    queryKey: ['home', 'index'],
    queryFn: getHomeIndex,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}

/**
 * Get the next prize pool tier based on current tickets
 */
export function getNextTier(
  currentTickets: number,
  tiers: PrizePoolTier[]
): { nextTierTickets: number; nextTierPrize: number; isMaxTier: boolean } | null {
  // Sort tiers by minTickets ascending
  const sortedTiers = [...tiers].sort((a, b) => a.minTickets - b.minTickets);

  // Find the next tier that hasn't been reached
  for (const tier of sortedTiers) {
    if (tier.minTickets > currentTickets) {
      return {
        nextTierTickets: tier.minTickets,
        nextTierPrize: tier.poolAmount,
        isMaxTier: false,
      };
    }
  }

  // All tiers reached, return the highest tier
  if (sortedTiers.length > 0) {
    const highestTier = sortedTiers[sortedTiers.length - 1];
    return {
      nextTierTickets: highestTier.minTickets,
      nextTierPrize: highestTier.poolAmount,
      isMaxTier: true,
    };
  }

  return null;
}

/**
 * Check if event is active (status 1)
 */
export function useEventStatus() {
  const { data } = useHomeData();
  const isEventActive = data?.eventInfo?.status === 1;
  const isEventEnded = data?.eventInfo?.status === 2;
  return { isEventActive, isEventEnded };
}

// Re-export types
export type { HomeIndexData, RaffleEventInfo, GameInfo, PrizePoolTier };
