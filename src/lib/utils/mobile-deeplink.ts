/**
 * Mobile deep linking utilities for wallet apps
 */

/**
 * Detect if user is in a wallet app's in-app browser
 */
export function isInWalletBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for known wallet app browsers
  const walletBrowsers = [
    'phantom',
    'solflare',
    'backpack',
    'glow',
    'slope',
    'trust',
    'coinbase',
    'metamask',
    'jupiter',
  ];

  return walletBrowsers.some(wallet => userAgent.includes(wallet));
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if user is on Android device
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Detect if user is in mobile browser (not wallet app)
 */
export function isInMobileBrowser(): boolean {
  return isMobileDevice() && !isInWalletBrowser();
}

/**
 * Detect if user is specifically in Jupiter wallet's in-app browser
 */
export function isInJupiterBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('jupiter');
}

/**
 * Build URL with referral parameters
 */
export function buildUrlWithReferral(baseUrl: string, referralAddress?: string): string {
  const url = new URL(baseUrl);

  if (referralAddress) {
    url.searchParams.set('ref', referralAddress);
  }

  return url.toString();
}

/**
 * Open Phantom app on mobile with URL (Android deep link)
 */
export function openInPhantomApp(): void {
  if (typeof window === 'undefined') return;

  const currentUrl = encodeURIComponent(window.location.href);

  // Phantom deep link format: https://phantom.app/ul/browse/{url}
  // This works on both iOS and Android
  const deepLink = `https://phantom.app/ul/browse/${currentUrl}`;

  console.log('Phantom deep link:', deepLink);
  window.location.href = deepLink;
}

/**
 * Open Solflare app on mobile with URL (Android deep link)
 */
export function openInSolflareApp(): void {
  if (typeof window === 'undefined') return;

  const currentUrl = encodeURIComponent(window.location.href);

  // Solflare deep link format
  const deepLink = `https://solflare.com/ul/v1/browse/${currentUrl}`;

  console.log('Solflare deep link:', deepLink);
  window.location.href = deepLink;
}

/**
 * Open Jupiter app on mobile with URL
 */
export function openInJupiterApp(referralAddress?: string): void {
  if (typeof window === 'undefined') return;

  // Build current URL with referral params
  const currentUrl = buildUrlWithReferral(window.location.href, referralAddress);

  // Jupiter deep link format: jupiter://browse/{url}
  const deepLink = `jupiter://browse/${encodeURIComponent(currentUrl)}`;

  console.log('Jupiter deep link:', deepLink);
  window.location.href = deepLink;

  // Fallback: If Jupiter app doesn't open in 2 seconds, open app store
  const timeout = setTimeout(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      window.location.href = 'https://play.google.com/store/apps/details?id=ag.jup.jupiter';
    } else if (isIOS) {
      window.location.href = 'https://apps.apple.com/app/jupiter-wallet/id6449832272';
    }
  }, 2000);

  // Clear timeout if page unloads (app opened successfully)
  window.addEventListener('blur', () => {
    clearTimeout(timeout);
  }, { once: true });
}
