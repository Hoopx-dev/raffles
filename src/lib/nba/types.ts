// Raw SportsData.io API response types
export interface NBAGameRaw {
  GameID: number;
  Season: number;
  SeasonType: number;
  Status: 'Scheduled' | 'InProgress' | 'Final' | 'F/OT' | 'Postponed' | 'Canceled';
  Day: string;
  DateTime: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayTeamID: number;
  HomeTeamID: number;
  AwayTeamScore: number | null;
  HomeTeamScore: number | null;
  Updated: string;
  Quarter: string | null;
  TimeRemainingMinutes: number | null;
  TimeRemainingSeconds: number | null;
  Channel: string;
  GlobalGameID: number;
  GlobalAwayTeamID: number;
  GlobalHomeTeamID: number;
  PointSpread: number | null;
  OverUnder: number | null;
  AwayTeamMoneyLine: number | null;
  HomeTeamMoneyLine: number | null;
}

export interface NBATeamRaw {
  TeamID: number;
  Key: string;
  Active: boolean;
  City: string;
  Name: string;
  LeagueID: number;
  StadiumID: number;
  Conference: string;
  Division: string;
  PrimaryColor: string;
  SecondaryColor: string;
  TertiaryColor: string;
  QuaternaryColor: string;
  WikipediaLogoUrl: string;
  WikipediaWordMarkUrl: string;
  GlobalTeamID: number;
}

// Processed types for UI
export type GameStatus = 'live' | 'upcoming' | 'final';

export interface TeamDisplay {
  key: string;
  name: string;
  city: string;
  score: number;
  logo: string;
}

export interface ProcessedGame {
  gameId: number;
  status: GameStatus;
  homeTeam: TeamDisplay;
  awayTeam: TeamDisplay;
  quarter?: string;
  timeRemaining?: string;
  startTime?: string;
  date: string;
  dateKey: string; // For grouping (e.g., "2025-12-25")
}

export interface GamesByDate {
  date: string;
  dateKey: string;
  games: ProcessedGame[];
}

export interface CumulativeScore {
  homeTeams: number;
  awayTeams: number;
  total: number;
  gamesPlayed: number;
  totalGames: number;
}

// Team mapping for logos
export const NBA_TEAMS: Record<string, { name: string; city: string }> = {
  ATL: { name: 'Hawks', city: 'Atlanta' },
  BOS: { name: 'Celtics', city: 'Boston' },
  BKN: { name: 'Nets', city: 'Brooklyn' },
  CHA: { name: 'Hornets', city: 'Charlotte' },
  CHI: { name: 'Bulls', city: 'Chicago' },
  CLE: { name: 'Cavaliers', city: 'Cleveland' },
  DAL: { name: 'Mavericks', city: 'Dallas' },
  DEN: { name: 'Nuggets', city: 'Denver' },
  DET: { name: 'Pistons', city: 'Detroit' },
  GS: { name: 'Warriors', city: 'Golden State' },
  GSW: { name: 'Warriors', city: 'Golden State' },
  HOU: { name: 'Rockets', city: 'Houston' },
  IND: { name: 'Pacers', city: 'Indiana' },
  LAC: { name: 'Clippers', city: 'LA' },
  LAL: { name: 'Lakers', city: 'Los Angeles' },
  MEM: { name: 'Grizzlies', city: 'Memphis' },
  MIA: { name: 'Heat', city: 'Miami' },
  MIL: { name: 'Bucks', city: 'Milwaukee' },
  MIN: { name: 'Timberwolves', city: 'Minnesota' },
  NO: { name: 'Pelicans', city: 'New Orleans' },
  NOP: { name: 'Pelicans', city: 'New Orleans' },
  NY: { name: 'Knicks', city: 'New York' },
  NYK: { name: 'Knicks', city: 'New York' },
  OKC: { name: 'Thunder', city: 'Oklahoma City' },
  ORL: { name: 'Magic', city: 'Orlando' },
  PHI: { name: '76ers', city: 'Philadelphia' },
  PHO: { name: 'Suns', city: 'Phoenix' },
  PHX: { name: 'Suns', city: 'Phoenix' },
  POR: { name: 'Trail Blazers', city: 'Portland' },
  SA: { name: 'Spurs', city: 'San Antonio' },
  SAS: { name: 'Spurs', city: 'San Antonio' },
  SAC: { name: 'Kings', city: 'Sacramento' },
  TOR: { name: 'Raptors', city: 'Toronto' },
  UTA: { name: 'Jazz', city: 'Utah' },
  WAS: { name: 'Wizards', city: 'Washington' },
};

export function getTeamLogo(teamKey: string): string {
  // Use ESPN CDN for team logos
  const teamMap: Record<string, string> = {
    ATL: 'atl',
    BOS: 'bos',
    BKN: 'bkn',
    CHA: 'cha',
    CHI: 'chi',
    CLE: 'cle',
    DAL: 'dal',
    DEN: 'den',
    DET: 'det',
    GS: 'gs',
    GSW: 'gs',
    HOU: 'hou',
    IND: 'ind',
    LAC: 'lac',
    LAL: 'lal',
    MEM: 'mem',
    MIA: 'mia',
    MIL: 'mil',
    MIN: 'min',
    NO: 'no',
    NOP: 'no',
    NY: 'ny',
    NYK: 'ny',
    OKC: 'okc',
    ORL: 'orl',
    PHI: 'phi',
    PHO: 'phx',
    PHX: 'phx',
    POR: 'por',
    SA: 'sa',
    SAS: 'sa',
    SAC: 'sac',
    TOR: 'tor',
    UTA: 'utah',
    WAS: 'wsh',
  };
  const key = teamMap[teamKey] || teamKey.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nba/500/${key}.png`;
}
