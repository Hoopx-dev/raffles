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

export interface LuckyEggRewardRaw {
  success: boolean;
  hitCount: number;
  luckyNumbers: string | number[]; // API may return as JSON string "[1,2]" or actual array
}

export interface LuckyEggReward {
  success: boolean;
  hitCount: number;
  luckyNumbers: number[];
}

function parseLuckyEggReward(raw: LuckyEggRewardRaw | null): LuckyEggReward | null {
  if (!raw) return null;

  let luckyNumbers: number[] = [];

  if (raw.luckyNumbers) {
    // If it's already an array, use it directly
    if (Array.isArray(raw.luckyNumbers)) {
      luckyNumbers = raw.luckyNumbers;
    } else if (typeof raw.luckyNumbers === 'string') {
      // If it's a string, try to parse it
      try {
        luckyNumbers = JSON.parse(raw.luckyNumbers);
      } catch {
        // If parsing fails, try to extract numbers
        const matches = raw.luckyNumbers.match(/\d+/g);
        luckyNumbers = matches ? matches.map(Number) : [];
      }
    }
  }

  return {
    success: raw.success,
    hitCount: raw.hitCount,
    luckyNumbers,
  };
}

export interface TicketPlacementInfo {
  luckyStatus: number; // 0-not lucky, 1-lucky winner
  predictHomeScore: number;
  predictAwayScore: number;
  winStatus: number; // 0-ongoing, 1-won, 2-lost
  prizeAmount: number;
  settledTime: string | null;
  claimStatus: ClaimStatus;
  claimTime: string | null;
  txHash?: string; // transaction hash for claimed prizes
  eggReward?: LuckyEggReward | null; // lucky egg reward info
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

// Raw types for API response parsing
interface TicketPlacementInfoRaw {
  luckyStatus: number;
  predictHomeScore: number;
  predictAwayScore: number;
  winStatus: number;
  prizeAmount: number;
  settledTime: string | null;
  claimStatus: ClaimStatus;
  claimTime: string | null;
  txHash?: string;
  eggReward?: LuckyEggRewardRaw | null;
}

interface UserTicketRaw {
  id: number;
  ticketCode: string;
  source: string;
  status: 'UNUSED' | 'PLACED' | 'EXPIRED';
  createTime: string;
  expireTime: string;
  placementInfo: TicketPlacementInfoRaw | null;
}

interface TicketListResponseRaw {
  records: UserTicketRaw[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

function parseTicketPlacementInfo(raw: TicketPlacementInfoRaw | null): TicketPlacementInfo | null {
  if (!raw) return null;
  return {
    ...raw,
    eggReward: parseLuckyEggReward(raw.eggReward || null),
  };
}

function parseUserTicket(raw: UserTicketRaw): UserTicket {
  return {
    ...raw,
    placementInfo: parseTicketPlacementInfo(raw.placementInfo),
  };
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

  const result: ApiResponse<TicketListResponseRaw> = await response.json();
  console.log('getTicketList result:', result);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get tickets');
  }

  // Parse eggReward in each ticket's placementInfo
  return {
    ...result.data,
    records: result.data.records.map(parseUserTicket),
  };
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

interface PlaceTicketResultRaw {
  success: boolean;
  placementId: number;
  eggReward: LuckyEggRewardRaw | null;
  message: string;
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

  const result: ApiResponse<PlaceTicketResultRaw> = await response.json();
  console.log('placeTicket result:', result);

  // API returns code 0 or 200 for success
  if (result.code !== 0 && result.code !== 200) {
    throw new Error(result.msg || 'Failed to place ticket');
  }

  // Parse the eggReward to convert luckyNumbers from string to array
  return {
    success: result.data.success,
    placementId: result.data.placementId,
    eggReward: parseLuckyEggReward(result.data.eggReward),
    message: result.data.message,
  };
}
