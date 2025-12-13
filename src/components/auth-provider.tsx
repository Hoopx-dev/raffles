'use client';

import { FC, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that initializes the SIWS authentication flow
 * This component should be nested inside WalletContextProvider
 */
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  // Initialize auth hook - this handles automatic login on wallet connection
  useAuth();

  return <>{children}</>;
};
