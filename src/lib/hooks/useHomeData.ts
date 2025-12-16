'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getHomeIndex,
  HomeIndexData,
  RaffleEventInfo,
  GameInfo,
  PrizePoolTier,
} from '@/lib/api/home';
import { parseBeijingTime } from '@/lib/utils';

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
 * Get the current prize pool based on tickets and tiers
 * Returns the pool amount for the highest tier that has been reached
 */
export function getCurrentPrizePool(
  currentTickets: number,
  tiers: PrizePoolTier[]
): number {
  if (tiers.length === 0) return 0;

  // Sort tiers by minTickets descending to find highest reached tier
  const sortedTiers = [...tiers].sort((a, b) => b.minTickets - a.minTickets);

  // Find the highest tier that has been reached
  for (const tier of sortedTiers) {
    if (currentTickets >= tier.minTickets) {
      return tier.poolAmount;
    }
  }

  // If no tier reached, return the lowest tier's pool (tier with minTickets = 0)
  const lowestTier = sortedTiers[sortedTiers.length - 1];
  return lowestTier?.poolAmount || 0;
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
 * Returns:
 * - isEventActive: event status is 1
 * - isBettingClosed: countdown expired but event not ended (betting window closed)
 * - isEventEnded: event status is 2
 */
export function useEventStatus() {
  const { data } = useHomeData();
  const isEventActive = data?.eventInfo?.status === 1;
  const isEventEnded = data?.eventInfo?.status === 2;

  // Check if betting is closed (countdown expired)
  // Use parseBeijingTime since API returns Beijing time
  const endTime = data?.eventInfo?.endTime;
  const isBettingClosed = endTime ? parseBeijingTime(endTime).getTime() <= Date.now() : false;

  return { isEventActive, isBettingClosed, isEventEnded };
}

// Re-export types
export type { HomeIndexData, RaffleEventInfo, GameInfo, PrizePoolTier };
