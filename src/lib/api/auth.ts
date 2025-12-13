const API_BASE_URL = process.env.NEXT_PUBLIC_HOOPX_API_URL || 'http://54.46.105.230:9093';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

/**
 * Get nonce for SIWS login
 */
export async function getNonce(address: string): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/nonce?address=${encodeURIComponent(address)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get nonce: ${response.status}`);
  }

  const result: ApiResponse<string> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.msg || 'Failed to get nonce');
  }

  return result.data;
}

interface SiwsLoginParams {
  message: string;
  signature: string;
  walletAddress: string;
}

/**
 * Login with SIWS (Sign In With Solana)
 */
export async function siwsLogin(params: SiwsLoginParams): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const result: ApiResponse<string> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.msg || 'Login failed');
  }

  return result.data;
}

/**
 * Create SIWS message for signing
 */
export function createSiwsMessage(address: string, nonce: string): string {
  const domain = typeof window !== 'undefined' ? window.location.host : 'hoopx.gg';
  const uri = typeof window !== 'undefined' ? window.location.origin : 'https://hoopx.gg';
  const issuedAt = new Date().toISOString();

  return `${domain} wants you to sign in with your Solana account:
${address}

Sign in to HOOPX

URI: ${uri}
Version: 1
Chain ID: mainnet
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}
