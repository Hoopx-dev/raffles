import { NextResponse } from 'next/server';
import { fetchGamesByDate, processGame, groupGamesByDate, calculateCumulativeScore, getRaffleDateRange } from '@/lib/nba/api';
import { NBAGameRaw, ProcessedGame } from '@/lib/nba/types';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_SPORTSDATA_API_KEY;

  console.log('[NBA API] API key present:', !!apiKey, 'key length:', apiKey?.length);

  if (!apiKey) {
    console.error('[NBA API] No API key configured');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const dateRange = getRaffleDateRange();
    console.log('[NBA API] Fetching games for dates:', dateRange);
    const allGames: ProcessedGame[] = [];

    // Fetch games for each date in the range
    for (const date of dateRange) {
      try {
        const dateForApi = new Date(date);
        const apiDate = `${dateForApi.getFullYear()}-${String(dateForApi.getMonth() + 1).padStart(2, '0')}-${String(dateForApi.getDate()).padStart(2, '0')}`;

        console.log('[NBA API] Fetching games for:', apiDate);
        const games: NBAGameRaw[] = await fetchGamesByDate(apiDate, apiKey);
        console.log('[NBA API] Got', games.length, 'games for', apiDate);
        const processedGames = games.map((game) => processGame(game));
        allGames.push(...processedGames);
      } catch (error) {
        console.error(`[NBA API] Failed to fetch games for ${date}:`, error);
        // Continue with other dates
      }
    }

    // Group games by date
    const gamesByDate = groupGamesByDate(allGames);

    // Calculate cumulative scores
    const cumulativeScore = calculateCumulativeScore(allGames);

    return NextResponse.json({
      games: allGames,
      gamesByDate,
      cumulativeScore,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch NBA games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
