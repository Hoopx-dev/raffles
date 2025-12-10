import { NextResponse } from 'next/server';
import { fetchGamesByDate, processGame, groupGamesByDate, calculateCumulativeScore, getRaffleDateRange } from '@/lib/nba/api';
import { NBAGameRaw, ProcessedGame } from '@/lib/nba/types';

export async function GET() {
  const apiKey = process.env.SPORTSDATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const dateRange = getRaffleDateRange();
    const allGames: ProcessedGame[] = [];

    // Fetch games for each date in the range
    for (const date of dateRange) {
      try {
        const formattedDate = date.replace(/-/g, '-'); // Format: 2025-DEC-25
        const dateForApi = new Date(date);
        const apiDate = `${dateForApi.getFullYear()}-${String(dateForApi.getMonth() + 1).padStart(2, '0')}-${String(dateForApi.getDate()).padStart(2, '0')}`;

        const games: NBAGameRaw[] = await fetchGamesByDate(apiDate, apiKey);
        const processedGames = games.map((game) => processGame(game));
        allGames.push(...processedGames);
      } catch (error) {
        console.error(`Failed to fetch games for ${date}:`, error);
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
