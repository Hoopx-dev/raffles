const API_BASE_URL = process.env.NEXT_PUBLIC_HOOPX_API_URL || 'https://a03low.hoopx.gg';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

// Types
export type TicketStatus = 'UNUSED' | 'PLACED' | 'EXPIRED' | 'ALL';
export type ClaimStatus = 'UNCLAIMED' | 'CLAIMED';

export interface TicketPlacementInfo {
  luckyStatus: boolean;
  predictHomeScore: number;
  predictAwayScore: number;
  winStatus: number; // 0-pending, 1-correct, 2-incorrect
  prizeAmount: number;
  settledTime: string | null;
  claimStatus: ClaimStatus;
  claimTime: string | null;
}

export interface UserTicket {
  id: number;
  ticketCode: string;
  source: string;
  status: 'UNUSED' | 'PLACED' | 'EXPIRED';
  createTime: string;
  expireTime: string;
  placementInfo: TicketPlacementInfo | null;
}

export interface TicketListResponse {
  records: UserTicket[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface TicketCounts {
  unusedCount: number;
  placedCount: number;
  expiredCount: number;
}

export interface TicketRedeemParams {
  eventId: number;
  txHash: string;
  userWallet: string;
  amountToken: number;
  ticketQuantity: number;
}

export interface PlacementParams {
  eventId: number;
  ticketId: number;
  predictHomeScore: number;
  predictAwayScore: number;
}

export interface LuckyEggReward {
  success: boolean;
  hitCount: number;
  luckyNumbers: number[];
}

export interface PlaceTicketResult {
  success: boolean;
  placementId: number;
  eggReward: LuckyEggReward | null;
  message: string;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get paginated list of user tickets
 */
export async function getTicketList(
  token: string,
  params?: {
    status?: TicketStatus;
    current?: number;
    size?: number;
  }
): Promise<TicketListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.current) searchParams.set('current', params.current.toString());
  if (params?.size) searchParams.set('size', params.size.toString());

  const url = `${API_BASE_URL}/api/v1/user/tickets/list?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to get tickets: ${response.status}`);
  }

  const result: ApiResponse<TicketListResponse> = await response.json();
  console.log('getTicketList result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get tickets');
  }

  return result.data;
}

/**
 * Get ticket counts by status
 */
export async function getTicketCounts(token: string): Promise<TicketCounts> {
  const response = await fetch(`${API_BASE_URL}/api/v1/user/tickets/counts`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to get ticket counts: ${response.status}`);
  }

  const result: ApiResponse<TicketCounts> = await response.json();
  console.log('getTicketCounts result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get ticket counts');
  }

  return result.data;
}

/**
 * Redeem/purchase tickets with HOOPX tokens
 */
export async function redeemTickets(
  token: string,
  params: TicketRedeemParams
): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/v1/user/tickets/redeem`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to redeem tickets: ${response.status}`);
  }

  const result: ApiResponse<number> = await response.json();
  console.log('redeemTickets result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to redeem tickets');
  }

  return result.data;
}

/**
 * Place a bet using a ticket
 */
export async function placeTicket(
  token: string,
  params: PlacementParams
): Promise<PlaceTicketResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/user/tickets/place`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to place ticket: ${response.status}`);
  }

  const result: ApiResponse<PlaceTicketResult> = await response.json();
  console.log('placeTicket result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to place ticket');
  }

  return result.data;
}
