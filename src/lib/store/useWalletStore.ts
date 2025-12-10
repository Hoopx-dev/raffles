import { create } from 'zustand';

interface WalletState {
  address: string | null;
  truncatedAddress: string | null;
  hoopxBalance: number;
  setAddress: (address: string | null) => void;
  setHoopxBalance: (balance: number) => void;
  clearAddress: () => void;
}

/**
 * Formats a wallet address to show first 4 and last 4 characters
 */
const formatAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  truncatedAddress: null,
  hoopxBalance: 0,

  setAddress: (address) => set({
    address,
    truncatedAddress: address ? formatAddress(address) : null,
  }),

  setHoopxBalance: (balance) => set({
    hoopxBalance: balance,
  }),

  clearAddress: () => set({
    address: null,
    truncatedAddress: null,
    hoopxBalance: 0,
  }),
}));
