import { create } from 'zustand';

type MainTab = 'live-scores' | 'my-tickets';
type TicketSubTab = 'unbet' | 'bet';

interface TabState {
  mainTab: MainTab;
  ticketSubTab: TicketSubTab;
  setMainTab: (tab: MainTab) => void;
  setTicketSubTab: (tab: TicketSubTab) => void;
}

export const useTabStore = create<TabState>((set) => ({
  mainTab: 'live-scores',
  ticketSubTab: 'unbet',

  setMainTab: (tab) => set({ mainTab: tab }),
  setTicketSubTab: (tab) => set({ ticketSubTab: tab }),
}));
