import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Global disconnect function that can be set by useAuth and called from API handlers
let globalDisconnect: (() => void) | null = null;

export function setGlobalDisconnect(fn: () => void) {
  globalDisconnect = fn;
}

export function callGlobalDisconnect() {
  if (globalDisconnect) {
    globalDisconnect();
  }
}

interface WalletState {
  address: string | null;
  truncatedAddress: string | null;
  hoopxBalance: number;
  sessionToken: string | null;
  isAuthenticated: boolean;
  setAddress: (address: string | null) => void;
  setHoopxBalance: (balance: number) => void;
  setSession: (token: string) => void;
  clearSession: () => void;
  clearAddress: () => void;
}

/**
 * Formats a wallet address to show first 4 and last 4 characters
 */
const formatAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      truncatedAddress: null,
      hoopxBalance: 0,
      sessionToken: null,
      isAuthenticated: false,

      setAddress: (address) => set({
        address,
        truncatedAddress: address ? formatAddress(address) : null,
      }),

      setHoopxBalance: (balance) => set({
        hoopxBalance: balance,
      }),

      setSession: (token) => set({
        sessionToken: token,
        isAuthenticated: true,
      }),

      clearSession: () => set({
        sessionToken: null,
        isAuthenticated: false,
      }),

      clearAddress: () => set({
        address: null,
        truncatedAddress: null,
        hoopxBalance: 0,
        sessionToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'hoopx-wallet-storage',
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
