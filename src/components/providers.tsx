'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletContextProvider } from './wallet-provider';
import { AuthProvider } from './auth-provider';
import { StagingBadge } from './staging-badge';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <StagingBadge />
        </QueryClientProvider>
      </AuthProvider>
    </WalletContextProvider>
  );
}
