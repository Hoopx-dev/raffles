import { create } from 'zustand';

interface UIState {
  isInfoModalOpen: boolean;
  isRedeemModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLuckyNumberModalOpen: boolean;
  luckyNumber: number | null;
  pendingRedeemAmount: number;
  openInfoModal: () => void;
  closeInfoModal: () => void;
  openRedeemModal: () => void;
  closeRedeemModal: () => void;
  openConfirmModal: (amount: number) => void;
  closeConfirmModal: () => void;
  openLuckyNumberModal: (number: number) => void;
  closeLuckyNumberModal: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isInfoModalOpen: false,
  isRedeemModalOpen: false,
  isConfirmModalOpen: false,
  isLuckyNumberModalOpen: false,
  luckyNumber: null,
  pendingRedeemAmount: 1,

  openInfoModal: () => set({ isInfoModalOpen: true }),
  closeInfoModal: () => set({ isInfoModalOpen: false }),

  openRedeemModal: () => set({ isRedeemModalOpen: true }),
  closeRedeemModal: () => set({ isRedeemModalOpen: false }),

  openConfirmModal: (amount) =>
    set({
      isConfirmModalOpen: true,
      isRedeemModalOpen: false,
      pendingRedeemAmount: amount,
    }),
  closeConfirmModal: () =>
    set({ isConfirmModalOpen: false, pendingRedeemAmount: 1 }),

  openLuckyNumberModal: (number) =>
    set({ isLuckyNumberModalOpen: true, luckyNumber: number }),
  closeLuckyNumberModal: () =>
    set({ isLuckyNumberModalOpen: false, luckyNumber: null }),

  closeAllModals: () =>
    set({
      isInfoModalOpen: false,
      isRedeemModalOpen: false,
      isConfirmModalOpen: false,
      isLuckyNumberModalOpen: false,
    }),
}));
