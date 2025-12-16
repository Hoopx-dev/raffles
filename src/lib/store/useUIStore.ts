import { create } from 'zustand';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isInfoModalOpen: boolean;
  isRedeemModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLuckyNumberModalOpen: boolean;
  luckyNumbers: number[];
  luckyAmount: number[];
  pendingRedeemAmount: number;
  toast: ToastState | null;
  openInfoModal: () => void;
  closeInfoModal: () => void;
  openRedeemModal: () => void;
  closeRedeemModal: () => void;
  openConfirmModal: (amount: number) => void;
  closeConfirmModal: () => void;
  openLuckyNumberModal: (numbers: number[], amount?: number[]) => void;
  closeLuckyNumberModal: () => void;
  closeAllModals: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isInfoModalOpen: false,
  isRedeemModalOpen: false,
  isConfirmModalOpen: false,
  isLuckyNumberModalOpen: false,
  luckyNumbers: [],
  luckyAmount: [],
  pendingRedeemAmount: 1,
  toast: null,

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

  openLuckyNumberModal: (numbers, amount = []) =>
    set({ isLuckyNumberModalOpen: true, luckyNumbers: numbers, luckyAmount: amount }),
  closeLuckyNumberModal: () =>
    set({ isLuckyNumberModalOpen: false, luckyNumbers: [], luckyAmount: [] }),

  closeAllModals: () =>
    set({
      isInfoModalOpen: false,
      isRedeemModalOpen: false,
      isConfirmModalOpen: false,
      isLuckyNumberModalOpen: false,
    }),

  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
