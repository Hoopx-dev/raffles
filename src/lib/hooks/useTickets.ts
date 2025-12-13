'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/store/useWalletStore';
import {
  getTicketList,
  getTicketCounts,
  redeemTickets,
  placeTicket,
  TicketStatus,
  TicketRedeemParams,
  PlacementParams,
  UserTicket,
  TicketCounts,
  PlaceTicketResult,
} from '@/lib/api/tickets';

const SESSION_TOKEN_KEY = 'hoopx_session_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Hook to fetch user tickets with optional filtering
 */
export function useTicketList(status?: TicketStatus, page = 1, pageSize = 20) {
  const { isAuthenticated } = useWalletStore();
  const token = getStoredToken();

  return useQuery({
    queryKey: ['tickets', 'list', status, page, pageSize],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return getTicketList(token, {
        status,
        current: page,
        size: pageSize,
      });
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch ticket counts by status
 */
export function useTicketCounts() {
  const { isAuthenticated } = useWalletStore();
  const token = getStoredToken();

  return useQuery({
    queryKey: ['tickets', 'counts'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return getTicketCounts(token);
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to redeem/purchase tickets
 */
export function useRedeemTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TicketRedeemParams) => {
      const token = getStoredToken();
      if (!token) throw new Error('Not authenticated');
      return redeemTickets(token, params);
    },
    onSuccess: () => {
      // Invalidate ticket queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Hook to place a bet using a ticket
 */
export function usePlaceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlacementParams) => {
      const token = getStoredToken();
      if (!token) throw new Error('Not authenticated');
      return placeTicket(token, params);
    },
    onSuccess: () => {
      // Invalidate ticket queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// Re-export types for convenience
export type {
  UserTicket,
  TicketCounts,
  TicketStatus,
  PlaceTicketResult,
  TicketRedeemParams,
  PlacementParams,
};
