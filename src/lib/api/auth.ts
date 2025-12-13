const API_BASE_URL = process.env.NEXT_PUBLIC_HOOPX_API_URL || 'https://a03low.hoopx.gg';

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
  console.log('getNonce result:', result);

  if (result.code !== 200) {
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
  console.log('siwsLogin result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Login failed');
  }

  return result.data;
}

/**
 * Create SIWS message for signing
 * Format: siws:{domain}:{nonce};action=login;address={walletAddress}
 */
export function createSiwsMessage(address: string, nonce: string): string {
  const domain = typeof window !== 'undefined' ? window.location.host : 'hoopx.gg';
  return `siws:${domain}:${nonce};action=login;address=${address}`;
}

/**
 * Logout from SIWS session
 * Note: This is best-effort - local logout will proceed even if backend fails
 */
export async function siwsLogout(token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<string> = await response.json();
    console.log('siwsLogout result:', result);

    if (result.code !== 200) {
      console.warn('Backend logout returned non-200:', result.msg);
    }
  } catch (error) {
    // Backend logout failed, but we'll still proceed with local logout
    console.warn('Backend logout request failed:', error);
  }
}
