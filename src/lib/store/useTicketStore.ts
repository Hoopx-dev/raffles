import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ticket {
  id: string;
  status: 'unbet' | 'bet';
  homeScore?: number;
  awayScore?: number;
  timestamp?: number;
  txHash?: string;
}

interface TicketState {
  tickets: Ticket[];
  availableRedeem: number;
  addTicket: (ticket: Ticket) => void;
  addTickets: (tickets: Ticket[]) => void;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  setAvailableRedeem: (count: number) => void;
  clearTickets: () => void;
  getUnbetTickets: () => Ticket[];
  getBetTickets: () => Ticket[];
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],
      availableRedeem: 0,

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),

      addTickets: (newTickets) =>
        set((state) => ({
          tickets: [...state.tickets, ...newTickets],
        })),

      updateTicket: (id, data) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id ? { ...ticket, ...data } : ticket
          ),
        })),

      removeTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        })),

      setAvailableRedeem: (count) =>
        set({ availableRedeem: count }),

      clearTickets: () =>
        set({ tickets: [], availableRedeem: 0 }),

      getUnbetTickets: () =>
        get().tickets.filter((t) => t.status === 'unbet'),

      getBetTickets: () =>
        get().tickets.filter((t) => t.status === 'bet'),
    }),
    {
      name: 'raffle-tickets-storage',
    }
  )
);
