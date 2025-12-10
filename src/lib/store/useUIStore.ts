import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'cn';

interface UIState {
  locale: Locale;
  isInfoModalOpen: boolean;
  isRedeemModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLuckyNumberModalOpen: boolean;
  luckyNumber: number | null;
  pendingRedeemAmount: number;
  setLocale: (locale: Locale) => void;
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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      locale: 'en',
      isInfoModalOpen: false,
      isRedeemModalOpen: false,
      isConfirmModalOpen: false,
      isLuckyNumberModalOpen: false,
      luckyNumber: null,
      pendingRedeemAmount: 1,

      setLocale: (locale) => set({ locale }),

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
    }),
    {
      name: 'raffle-ui-storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
