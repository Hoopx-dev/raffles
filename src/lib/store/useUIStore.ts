import { create } from 'zustand';

interface UIState {
  isInfoModalOpen: boolean;
  isRedeemModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLuckyNumberModalOpen: boolean;
  luckyNumbers: number[];
  pendingRedeemAmount: number;
  openInfoModal: () => void;
  closeInfoModal: () => void;
  openRedeemModal: () => void;
  closeRedeemModal: () => void;
  openConfirmModal: (amount: number) => void;
  closeConfirmModal: () => void;
  openLuckyNumberModal: (numbers: number[]) => void;
  closeLuckyNumberModal: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isInfoModalOpen: false,
  isRedeemModalOpen: false,
  isConfirmModalOpen: false,
  isLuckyNumberModalOpen: false,
  luckyNumbers: [],
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

  openLuckyNumberModal: (numbers) =>
    set({ isLuckyNumberModalOpen: true, luckyNumbers: numbers }),
  closeLuckyNumberModal: () =>
    set({ isLuckyNumberModalOpen: false, luckyNumbers: [] }),

  closeAllModals: () =>
    set({
      isInfoModalOpen: false,
      isRedeemModalOpen: false,
      isConfirmModalOpen: false,
      isLuckyNumberModalOpen: false,
    }),
}));
