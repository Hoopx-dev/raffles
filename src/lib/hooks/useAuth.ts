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

  const logout = useCallback(() => {
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
    disconnect();
  }, [clearAddress, clearSession, disconnect]);

  // Dedicated effect to detect wallet switches and auto-logout
  // This runs whenever publicKey changes (including when user switches wallet in Jupiter app)
  useEffect(() => {
    if (!publicKey) return;

    const currentWalletAddress = publicKey.toBase58();
    const storedWallet = getStoredWallet();
    const storedToken = getStoredToken();

    // If we have a stored wallet AND token, but wallet changed, force logout
    if (storedWallet && storedToken && storedWallet !== currentWalletAddress) {
      console.log('🔄 Wallet switched from', storedWallet, 'to', currentWalletAddress);
      console.log('🚪 Auto-logging out due to wallet change...');

      // Clear everything
      clearStoredSession();
      clearAddress();
      clearSession();
      queryClient.clear();
      globalLoginLock = false;

      // Update to new address (this will trigger login flow below)
      setAddress(currentWalletAddress);
    }
  }, [publicKey, clearAddress, clearSession, setAddress]);

  // Handle wallet connection and login flow
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();

      // Always update zustand address to match current wallet
      setAddress(walletAddress);

      // Check if token exists AND belongs to the current wallet
      const existingToken = getStoredToken();
      const storedWallet = getStoredWallet();

      if (existingToken && storedWallet === walletAddress) {
        // Token exists and matches current wallet - restore session
        console.log('Session token exists for current wallet, restoring session');
        setSession(existingToken);
      } else if (!globalLoginLock) {
        // No valid token for this wallet - trigger login
        console.log('No valid session token for wallet, triggering SIWS login...');
        performSiwsLogin();
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
