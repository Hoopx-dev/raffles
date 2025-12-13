const API_BASE_URL = process.env.NEXT_PUBLIC_HOOPX_API_URL || 'https://a03low.hoopx.gg';

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

// Types
export interface RaffleEventInfo {
  id: number;
  title: string;
  destroyWalletAddress: string;
  currentPrizePool: number;
  totalTicketsPlaced: number;
  ticketPriceHoopx: number;
  endTime: string;
  timeZone: string;
  status: number; // 1-active, 2-ended
}

export interface GameInfo {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  gameTime: string;
  status: 'UPCOMING' | 'LIVE' | 'FINAL';
}

export interface PrizePoolTier {
  id: number;
  eventId: number;
  minTickets: number;
  poolAmount: number;
}

export interface HomeIndexData {
  eventInfo: RaffleEventInfo;
  gameList: GameInfo[];
  poolTierVOList: PrizePoolTier[];
}

/**
 * Get home page aggregated data
 * Returns current event info, games, and prize pool tiers
 */
export async function getHomeIndex(): Promise<HomeIndexData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/home/index`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get home data: ${response.status}`);
  }

  const result: ApiResponse<HomeIndexData> = await response.json();
  console.log('getHomeIndex response:', result);
  console.log('Event Info:', result.data?.eventInfo);
  console.log('Game List:', result.data?.gameList);
  console.log('Pool Tiers:', result.data?.poolTierVOList);

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get home data');
  }

  return result.data;
}
