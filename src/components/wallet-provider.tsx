"use client";

import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { isInWalletBrowser } from "@/lib/utils/mobile-deeplink";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Auto-connect component that triggers connect() when a wallet is selected
 * This is needed when autoConnect={false} to handle the standard wallet modal
 */
const AutoConnectOnSelect: FC<{ children: ReactNode }> = ({ children }) => {
  const { wallet, connected, connecting, connect } = useWallet();

  useEffect(() => {
    // When wallet is selected but not connected/connecting, trigger connect
    if (wallet && !connected && !connecting) {
      connect().catch((error) => {
        // Ignore user rejection errors
        if (error?.name !== "WalletConnectionError") {
          console.error("Auto-connect failed:", error);
        }
      });
    }
  }, [wallet, connected, connecting, connect]);

  return <>{children}</>;
};

interface WalletContextProviderProps {
  children: ReactNode;
}

/**
 * Detect if running on actual mobile device (not just narrow viewport)
 * Uses multiple signals to avoid false positives from responsive design mode
 */
const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check userAgent for mobile patterns
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check if it's a touch-only device (no mouse/trackpad)
  // Desktop browsers in responsive mode still have mouse capability
  const isTouchOnly = 'ontouchstart' in window && navigator.maxTouchPoints > 0 && !matchMedia('(pointer: fine)').matches;

  // Check for mobile-specific navigator properties
  const hasMobileProperties = 'standalone' in navigator ||
    ('userAgentData' in navigator && (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile === true);

  // Must have mobile userAgent AND (touch-only OR mobile properties)
  return mobileUserAgent && (isTouchOnly || hasMobileProperties);
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Use configured RPC endpoint or fallback to public endpoint
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
    []
  );

  // Initialize Jupiter mobile adapter
  const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: "NBA Christmas 2025 Raffle",
        description:
          "Score Prediction Challenge - Predict NBA Christmas Day scores and win prizes!",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://hoopx.gg",
        icons: ["/images/hoopx-logo.png"],
      },
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      features: {
        analytics: false,
        socials: false,
        email: false,
      },
      enableWallets: true,
    },
  });

  // Configure wallets based on platform
  const wallets = useMemo(() => {
    const mobile = isMobile();

    if (mobile) {
      // Mobile: Jupiter first, Phantom/Solflare for direct deep link, then reown for other wallets
      return [jupiterAdapter, new PhantomWalletAdapter(), new SolflareWalletAdapter(), reownAdapter];
    } else {
      // Desktop: Browser extension wallets + WalletConnect (Jupiter extension auto-detected by reown)
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        reownAdapter,
      ];
    }
  }, [reownAdapter, jupiterAdapter]);

  // Enable autoConnect when inside a wallet browser (Jupiter, Phantom, etc.)
  // This allows seamless connection when user opens via deep link
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

  useEffect(() => {
    // Check on client side only
    setShouldAutoConnect(isInWalletBrowser());
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={shouldAutoConnect}>
        <WalletModalProvider>
          <AutoConnectOnSelect>{children}</AutoConnectOnSelect>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
