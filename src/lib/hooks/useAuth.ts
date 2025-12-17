'use client';

import { useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore, setGlobalDisconnect } from '@/lib/store/useWalletStore';
import { getNonce, siwsLogin, createSiwsMessage } from '@/lib/api/auth';
import { queryClient } from '@/components/providers';
import bs58 from 'bs58';

const SESSION_TOKEN_KEY = 'hoopx_session_token';
const SESSION_WALLET_KEY = 'hoopx_session_wallet';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function getStoredWallet(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_WALLET_KEY);
}

function setStoredSession(token: string, wallet: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_WALLET_KEY, wallet);
}

function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_WALLET_KEY);
}

// Global lock to prevent any concurrent login attempts across re-renders
let globalLoginLock = false;

export function useAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setAddress, setSession, clearAddress, clearSession, sessionToken, isAuthenticated } = useWalletStore();

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
      console.log('Cannot login: publicKey or signMessage not available');
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
      setStoredSession(token, walletAddress);
      setSession(token);

      console.log('SIWS login successful, token stored');
    } catch (error) {
      console.error('SIWS login failed:', error);
      clearStoredSession();
      clearSession();
    } finally {
      globalLoginLock = false;
    }
  }, [publicKey, signMessage, setSession, clearSession]);

  const logout = useCallback(async () => {
    console.log('Logging out - clearing all session data');
    // Clear localStorage session (token + wallet)
    clearStoredSession();
    // Clear zustand store state
    clearAddress();
    clearSession();
    // Clear React Query cache
    queryClient.clear();
    // Reset login state
    globalLoginLock = false;
    // Disconnect wallet
    await disconnect();
    // Note: Don't call select(null) as it can cause issues with mobile wallet adapters
    // The adapter will be re-selected when user clicks connect again
  }, [clearAddress, clearSession, disconnect]);

  // Handle wallet connection and detect wallet switches
  useEffect(() => {
    if (!connected || !publicKey) return;

    const currentWalletAddress = publicKey.toBase58();
    const storedWallet = getStoredWallet();
    const storedToken = getStoredToken();

    // Always update zustand address to match current wallet
    setAddress(currentWalletAddress);

    // Case 1: Valid session exists for current wallet - restore it
    if (storedToken && storedWallet === currentWalletAddress) {
      console.log('Session token exists for current wallet, restoring session');
      setSession(storedToken);
      return;
    }

    // Case 2: Session exists but for DIFFERENT wallet - just logout, no re-login
    if (storedToken && storedWallet && storedWallet !== currentWalletAddress) {
      console.log('🔄 Wallet switched from', storedWallet, 'to', currentWalletAddress);
      console.log('🚪 Auto-logging out due to wallet change...');
      clearStoredSession();
      clearSession();
      queryClient.clear();
      globalLoginLock = false;
      // Don't trigger login - user must manually login
      return;
    }

    // Case 3: No existing session - fresh login needed
    if (!storedToken && !globalLoginLock) {
      console.log('No session token, triggering SIWS login...');
      performSiwsLogin();
    }
  }, [connected, publicKey, setAddress, setSession, clearSession, performSiwsLogin]);

  return {
    isAuthenticated,
    sessionToken,
    login: performSiwsLogin,
    logout,
    isConnected: connected,
  };
}
