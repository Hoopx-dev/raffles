import { NextResponse } from 'next/server';
import { fetchTeams } from '@/lib/nba/api';

export async function GET() {
  const apiKey = process.env.SPORTSDATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const teams = await fetchTeams(apiKey);

    // Create a map of team key to team info
    const teamsMap = teams.reduce((acc, team) => {
      acc[team.Key] = {
        id: team.TeamID,
        key: team.Key,
        name: team.Name,
        city: team.City,
        logo: team.WikipediaLogoUrl,
        primaryColor: team.PrimaryColor,
        secondaryColor: team.SecondaryColor,
      };
      return acc;
    }, {} as Record<string, {
      id: number;
      key: string;
      name: string;
      city: string;
      logo: string;
      primaryColor: string;
      secondaryColor: string;
    }>);

    return NextResponse.json({
      teams: teamsMap,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch NBA teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
