import { create } from 'zustand';

interface DraftScore {
  homeScore: string;
  awayScore: string;
}

interface DraftScoreState {
  drafts: Record<number, DraftScore>;
  setDraft: (ticketId: number, homeScore: string, awayScore: string) => void;
  clearDraft: (ticketId: number) => void;
  getDraft: (ticketId: number) => DraftScore | undefined;
}

export const useDraftScoreStore = create<DraftScoreState>((set, get) => ({
  drafts: {},

  setDraft: (ticketId, homeScore, awayScore) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [ticketId]: { homeScore, awayScore },
      },
    })),

  clearDraft: (ticketId) =>
    set((state) => {
      const { [ticketId]: _, ...rest } = state.drafts;
      return { drafts: rest };
    }),

  getDraft: (ticketId) => get().drafts[ticketId],
}));
