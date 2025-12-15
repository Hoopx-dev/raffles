'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore, setGlobalDisconnect } from '@/lib/store/useWalletStore';
import { getNonce, siwsLogin, createSiwsMessage } from '@/lib/api/auth';
import { queryClient } from '@/components/providers';
import bs58 from 'bs58';

const SESSION_TOKEN_KEY = 'hoopx_session_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

// Global lock to prevent any concurrent login attempts across re-renders
let globalLoginLock = false;

export function useAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setAddress, setSession, clearAddress, clearSession, sessionToken, isAuthenticated } = useWalletStore();
  const loginAttempted = useRef(false);

  // Register global disconnect function for API 401 handlers
  useEffect(() => {
    setGlobalDisconnect(disconnect);
  }, [disconnect]);

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setSession(storedToken);
    }
  }, [setSession]);

  const performSiwsLogin = useCallback(async () => {
    if (!publicKey || !signMessage) {
      return;
    }

    // Check localStorage directly - if token exists, skip login
    const existingToken = getStoredToken();
    if (existingToken) {
      console.log('Session token exists, skipping SIWS login');
      setSession(existingToken);
      return;
    }

    // Use global lock to prevent concurrent attempts
    if (globalLoginLock) {
      console.log('Login already in progress (global lock), skipping');
      return;
    }

    globalLoginLock = true;
    loginAttempted.current = true;

    const walletAddress = publicKey.toBase58();

    try {
      console.log('Starting SIWS login for:', walletAddress);

      // Step 1: Get nonce from server
      const nonce = await getNonce(walletAddress);
      console.log('Got nonce:', nonce);

      // Step 2: Create SIWS message
      const message = createSiwsMessage(walletAddress, nonce);
      console.log('Message to sign:', message);

      // Step 3: Sign the message
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);
      console.log('Signature obtained');

      // Step 4: Login with signature
      const token = await siwsLogin({
        message,
        signature,
        walletAddress,
      });

      // Step 5: Store session in localStorage and state
      setStoredToken(token);
      setSession(token);

      console.log('SIWS login successful');
    } catch (error) {
      console.error('SIWS login failed:', error);
      clearStoredToken();
      clearSession();
      // Reset attempted flag to allow retry
      loginAttempted.current = false;
    } finally {
      globalLoginLock = false;
    }
  }, [publicKey, signMessage, setSession, clearSession]);

  const logout = useCallback(() => {
    console.log('Logging out - clearing all session data');
    // Clear localStorage token
    clearStoredToken();
    // Clear zustand store state
    clearAddress();
    clearSession();
    // Clear React Query cache
    queryClient.clear();
    // Reset login state
    loginAttempted.current = false;
    globalLoginLock = false;
    // Disconnect wallet
    disconnect();
  }, [clearAddress, clearSession, disconnect]);

  // Handle wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      setAddress(walletAddress);

      // Only trigger SIWS login if no session token exists and haven't attempted yet
      const existingToken = getStoredToken();
      if (!existingToken && !loginAttempted.current && !globalLoginLock) {
        console.log('No session token, triggering SIWS login...');
        performSiwsLogin();
      } else if (existingToken) {
        console.log('Session token exists, restoring session');
        setSession(existingToken);
      }
    }
  }, [connected, publicKey, setAddress, setSession, performSiwsLogin]);

  return {
    isAuthenticated,
    sessionToken,
    login: performSiwsLogin,
    logout,
    isConnected: connected,
  };
}
