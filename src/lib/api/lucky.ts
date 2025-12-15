import { useWalletStore } from '@/lib/store/useWalletStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_HOOPX_API_URL || 'https://a03low.hoopx.gg';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

// Helper to clear token from localStorage when 401 occurs
function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hoopx_session_token');
}

// Handle 401 response - clear token and logout user
function handle401Error(): void {
  console.log('401 Unauthorized - logging out user');
  clearStoredToken();
  useWalletStore.getState().clearAddress();
}

// Check response for 401 and handle it
function checkAuthError(response: Response): void {
  if (response.status === 401) {
    handle401Error();
    throw new Error('Session expired. Please reconnect your wallet.');
  }
}

// Types
export interface LuckyWinStats {
  totalCount: number;
  totalRewardAmount: number;
  winningScores: number[];
}

/**
 * Get user's lucky win statistics
 * Returns total count, total reward amount, and list of winning scores
 */
export async function getLuckyStats(): Promise<LuckyWinStats> {
  const token = localStorage.getItem('hoopx_session_token');

  const response = await fetch(`${API_BASE_URL}/api/v1/user/tickets/lucky/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  checkAuthError(response);

  if (!response.ok) {
    throw new Error(`Failed to get lucky stats: ${response.status}`);
  }

  const result: ApiResponse<LuckyWinStats> = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get lucky stats');
  }

  return result.data;
}
