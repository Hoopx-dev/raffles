# HoopXmas Raffle Ticket Website - Action Plan

## Project Overview

Build a "Score Prediction Challenge" website for NBA Christmas 2025 - users predict cumulative scores (Home vs Away split) of all NBA games from Dec 19-26, 2025.

### Key Features

- **Period**: Dec 19th 2025 10:00 PM - Dec 26th 2025 11:30 AM (Hong Kong Time)
- **Games Counted**: All NBA games from Dec 19-26, 2025
- **Raffle Ticket Price**: 10,000 HoopX (~20 USDT) - BURNED on redemption
- **Prediction**: User predicts Home Teams Total vs Away Teams Total (0-1000 each)
- **Multiple Tickets**: Each ticket = different prediction
- **Lucky Number Jackpot**: 100 random winners get 10 USDT each
- **Main Prize Pool**: Guaranteed 2,000 USDT (one winner - closest prediction)
- **Prize Ladder**:
  - 100 Raffles = 2,000 USDT pool
  - 1,000 Raffles = 20,000 USDT pool
  - 10,000 Raffles = 200,000 USDT pool

### Winner Determination

- Cumulative score = Sum of ALL home team scores + ALL away team scores (Dec 19-26)
- Winner = Closest prediction to actual Home:Away split

---

## Design Reference (From Screenshots)

### Screen 1: Live Scores Tab

- Header with "NBA Christmas 2025" logo (animated snow)
- Stats bar: Prize Pool (20,000 USDT) | Participants (1,004)
- Prize ladder progress bar
- Tab navigation: LIVE SCORES | MY TICKETS
- Cumulative Total Score card (Home Teams : Away Teams)
- Game cards grouped by date (Dec 26, 25, 24, 23, 22, 21, 20)
- Each game: Team logos, LIVE/UPCOMING badge, scores, quarter/time
- Floating: "CONNECT TO REDEEM" button + Info icon

### Screen 2: My Tickets Tab (Not Connected)

- Same header/stats
- "Please connect your wallet" + "Connect now" link

### Screen 3: My Tickets Tab - Unbet Tickets

- Tab shows badge count (e.g., "MY TICKETS (1)")
- Ticket card with:
  - "Ticket #200394" + "Unbet" badge (red)
  - Two input fields: "Total Home Teams Score" | "Total Away Teams Score"
  - Placeholder: "0-1000"
  - "PLACE PREDICTION" button (purple)
- "+ Redeem more tickets" button (orange)

### Screen 4: My Tickets Tab - Bet Tickets

- Ticket card (mint green background):
  - "Ticket #200394" + "34 seconds ago"
  - Large prediction display: "896 : 930"
  - Labels: "HOME TEAMS" | "AWAY TEAMS"
- "+ Redeem more tickets" button

### Screen 5: Redeem Modal (Bottom Sheet)

- "Redeem Prediction Tickets" title
- "1 Prediction Ticket = 10,000 HOOPX" (purple text)
- "Each ticket lets you predict total home/away scores (0-1000)"
- Quantity selector: MIN [-] 1 [+] MAX
- "Available Balance: 34,000 HOOPX"
- "Available Redeem: 3 tickets"
- "REDEEM - 10,000 HOOPX" button (yellow/gold)

### Screen 6: Confirm Transaction Modal

- "Redeem Transaction" title
- HoopX logo with transfer icon
- "10,000 HOOPX" (large, purple)
- Details:
  - Transfer to: [burn address]
  - You'll receive: 1 ticket
  - Network fee: $0.035 (0.05187 SOL)
- "CONFIRM" button (yellow/gold)

### Screen 7: Info Modal (Bottom Sheet)

- "Score Prediction Challenge" title
- Period, How to redeem, Prize, Ladder sections

### Sub-tabs for My Tickets (when both exist)

- If user has both unbet and bet tickets:
  - Show sub-tabs: "UNBET" | "BET"
  - Below the main LIVE SCORES | MY TICKETS tabs

### Success States

- Toast: "You've redeemed 1 ticket successfully!" (green)
- Lucky Number popup: Congrats modal when user hits lucky number after placing bet

---

## Tech Stack

| Category         | Technology                                                   |
| ---------------- | ------------------------------------------------------------ |
| Framework        | Next.js 15+ with App Router                                  |
| Language         | TypeScript 5                                                 |
| Styling          | Tailwind CSS 4 + class-variance-authority (CVA)              |
| Package Manager  | pnpm                                                         |
| State Management | Zustand (with persist middleware)                            |
| Data Fetching    | TanStack React Query                                         |
| Wallet           | Solana Wallet Adapter + Jupiter Mobile + Reown/WalletConnect |
| Blockchain       | @solana/web3.js, @solana/spl-token                           |
| i18n             | next-intl (English/Chinese)                                  |
| HTTP Client      | Axios                                                        |
| NBA Data         | SportsData.io API                                            |
| Deployment       | Vercel                                                       |

---

## Phase 1: Project Setup

### 1.1 Initialize Project

```bash
pnpm create next-app@latest hoopxmas-raffle --typescript --tailwind --eslint --app --src-dir
cd hoopxmas-raffle
```

### 1.2 Install Dependencies

```bash
# Core dependencies
pnpm add @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
pnpm add @solana/web3.js @solana/spl-token
pnpm add @jup-ag/jup-mobile-adapter
pnpm add @reown/appkit @reown/appkit-adapter-solana
pnpm add @tanstack/react-query
pnpm add zustand
pnpm add next-intl
pnpm add axios
pnpm add class-variance-authority clsx tailwind-merge

# Dev dependencies
pnpm add -D @types/node
```

### 1.3 Project Structure

```
/src
├── /app
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main page (single page app)
│   ├── /api
│   │   └── /nba                # NBA API proxy routes
│   │       ├── games/route.ts
│   │       ├── scores/route.ts
│   │       └── teams/route.ts
│   └── globals.css             # Global styles & theme
│
├── /components
│   ├── /ui                     # Reusable UI components
│   │   ├── button.tsx          # CVA-based button
│   │   ├── card.tsx            # Card component
│   │   ├── modal.tsx           # Bottom sheet modal (shareable)
│   │   ├── tabs.tsx            # Tab navigation
│   │   ├── badge.tsx           # Status badges (LIVE, UPCOMING, Unbet)
│   │   ├── progress-bar.tsx    # Prize pool progress
│   │   ├── input.tsx           # Form input
│   │   ├── quantity-selector.tsx # +/- quantity picker
│   │   └── toast.tsx           # Toast notifications
│   │
│   ├── providers.tsx           # All providers wrapper
│   ├── wallet-provider.tsx     # Solana wallet config
│   ├── wallet-button.tsx       # Wallet connect button
│   ├── mobile-wallet-modal.tsx # Mobile wallet selection
│   ├── locale-toggle.tsx       # Language toggle (EN/CN)
│   │
│   ├── header.tsx              # Hero header with logo + snow animation
│   ├── snow-animation.tsx      # Animated snowfall effect
│   ├── stats-bar.tsx           # Prize pool & participants
│   ├── prize-progress.tsx      # Prize ladder progress bar
│   ├── tab-navigation.tsx      # LIVE SCORES / MY TICKETS tabs
│   │
│   ├── live-scores-tab.tsx     # Live scores content
│   ├── cumulative-score.tsx    # Home vs Away cumulative display
│   ├── game-card.tsx           # Individual NBA game card
│   ├── game-list.tsx           # Games grouped by date
│   │
│   ├── my-tickets-tab.tsx      # User's tickets content
│   ├── ticket-sub-tabs.tsx     # UNBET / BET sub-tabs
│   ├── empty-wallet-state.tsx  # Connect wallet prompt
│   ├── unbet-ticket-card.tsx   # Ticket with prediction inputs
│   ├── bet-ticket-card.tsx     # Ticket with placed prediction
│   │
│   ├── redeem-modal.tsx        # Redeem tickets bottom sheet
│   ├── confirm-modal.tsx       # Transaction confirmation modal
│   ├── lucky-number-modal.tsx  # Congrats popup for lucky number
│   ├── share-modal.tsx         # Share prediction modal
│   │
│   ├── connect-redeem-button.tsx # Floating CTA button
│   ├── info-button.tsx         # Floating info icon
│   └── info-modal.tsx          # Rules/info bottom sheet
│
├── /lib
│   ├── /solana
│   │   ├── burn.ts             # HoopX token burn logic
│   │   ├── eligibility.ts      # Jupiter swap eligibility check
│   │   ├── transactions.ts     # Transaction utilities
│   │   └── hooks.ts            # Solana hooks
│   │
│   ├── /nba
│   │   ├── api.ts              # SportsData.io API client
│   │   ├── hooks.ts            # React Query hooks for NBA
│   │   └── types.ts            # NBA data types
│   │
│   ├── /raffle
│   │   ├── api.ts              # Raffle API calls (dummy for now)
│   │   ├── hooks.ts            # React Query hooks
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── dummy-data.ts       # Mock data for development
│   │
│   ├── /store
│   │   ├── useWalletStore.ts   # Wallet state
│   │   ├── useTabStore.ts      # Active tab state
│   │   ├── useTicketStore.ts   # Tickets state (unbet/bet)
│   │   └── useUIStore.ts       # UI preferences (locale, modals)
│   │
│   ├── /utils
│   │   ├── mobile-deeplink.ts  # Mobile detection & deep links
│   │   ├── format.ts           # Number/date formatting
│   │   ├── share.ts            # Share functionality
│   │   └── lucky-number.ts     # Lucky number check logic
│   │
│   ├── http.ts                 # Axios instance
│   ├── queryKeys.ts            # React Query keys
│   └── utils.ts                # General utilities (cn, etc.)
│
├── /i18n
│   ├── config.ts               # Locale config
│   └── /locales
│       ├── en.json             # English translations
│       └── cn.json             # Chinese translations
│
├── /styles
│   └── theme.ts                # Theme color constants
│
└── /public
    └── /images
        ├── nba-christmas-2025.png  # Logo image (provided)
        ├── hoopx-logo.png          # HoopX token logo
        └── bg-header.png           # Purple gradient background
```

---

## Phase 2: Core Infrastructure

### 2.1 Environment Configuration

Create `.env.local`:

```env
# App
NEXT_PUBLIC_IS_STAGING=true
NEXT_PUBLIC_TIMEZONE=Asia/Hong_Kong

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=9da7f5ce-8d01-464b-b59c-4ddd044402e5
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a68ca0938f2edf95553df17e33a52d54
NEXT_PUBLIC_HOOPX_TOKEN_MINT=9GhjesUhxmVo9x4UHpdS6NVi4TGzcx8BtGckUqFrjupx

# NBA SportsData.io (server-side only)
SPORTSDATA_API_KEY=1a18375609134706a9fd8802e752077b

# Raffle Config
NEXT_PUBLIC_RAFFLE_START=2025-12-19T22:00:00+08:00
NEXT_PUBLIC_RAFFLE_END=2025-12-26T11:30:00+08:00
NEXT_PUBLIC_TICKET_PRICE_HOOPX=10000
```

### 2.2 Tailwind Configuration & Theme Colors

```css
/* globals.css - Color palette from design */
:root {
  /* Primary - Purple gradient background */
  --color-primary: #512784;
  --color-primary-dark: #3a1c5e;

  /* Secondary - Gold/Orange accents */
  --color-secondary: #fcb825;
  --color-gold: #f5a623;
  --color-orange: #ff6b35;

  /* Status colors */
  --color-live: #ff4444;
  --color-upcoming: #ffb800;
  --color-success: #31d99c;
  --color-success-light: #e8fff5;
  --color-mint: #b8f5d8;

  /* Badge colors */
  --color-unbet: #ff6b6b;
  --color-bet: #31d99c;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-dark: #1a1a2e;
  --color-text-secondary: #b8b8b8;
  --color-text-muted: #888888;

  /* Backgrounds */
  --color-bg-card: #fffbeb;
  --color-bg-card-mint: #e8fff5;
  --color-bg-dark: #1a1a2e;
  --color-bg-modal: #ffffff;
  --color-bg-input: #f5f5f5;
}
```

### 2.3 Providers Setup

1. **QueryClientProvider** - TanStack React Query
2. **WalletContextProvider** - Solana wallet adapters
3. **LocaleProvider** - Internationalization (Hong Kong timezone)
4. **ToastProvider** - Notifications

---

## Phase 3: NBA Data Integration (SportsData.io)

### 3.1 API Configuration

```typescript
// lib/nba/api.ts
const SPORTSDATA_BASE_URL = "https://api.sportsdata.io/v3/nba";
const API_KEY = process.env.SPORTSDATA_API_KEY;

// Endpoints:
// GET /scores/json/GamesByDate/{date} - Games for specific date
// GET /scores/json/ScoresByDate/{date} - Live scores by date
// GET /scores/json/Teams - All teams with logos
```

### 3.2 NBA Data Types

```typescript
// lib/nba/types.ts

// Raw API response
interface NBAGameRaw {
  GameID: number;
  Season: number;
  Status: "Scheduled" | "InProgress" | "Final";
  DateTime: string;
  HomeTeam: string;
  AwayTeam: string;
  HomeTeamID: number;
  AwayTeamID: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  Quarter: string | null;
  TimeRemainingMinutes: number | null;
  TimeRemainingSeconds: number | null;
}

interface NBATeamRaw {
  TeamID: number;
  Key: string;
  City: string;
  Name: string;
  WikipediaLogoUrl: string;
}

// Processed for UI
interface ProcessedGame {
  gameId: number;
  status: "live" | "upcoming" | "final";
  homeTeam: TeamDisplay;
  awayTeam: TeamDisplay;
  quarter?: string;
  timeRemaining?: string;
  startTime?: string;
  date: string;
}

interface TeamDisplay {
  key: string;
  name: string;
  city: string;
  score: number;
  logo: string;
}

interface CumulativeScore {
  homeTeams: number;
  awayTeams: number;
  gamesPlayed: number;
  totalGames: number;
}
```

### 3.3 API Proxy Routes

```typescript
// app/api/nba/games/route.ts
// Fetches all games for Dec 19-26, 2025
// Caches response, refreshes every 30s for live games

// app/api/nba/scores/route.ts
// Real-time scores for today's games
// Client polls every 30 seconds

// app/api/nba/teams/route.ts
// Team info including logos
// Cached indefinitely
```

### 3.4 React Query Hooks

```typescript
// lib/nba/hooks.ts
useNBAGames(); // All games Dec 19-26
useLiveScores(); // Auto-refresh 30s
useCumulativeScore(); // Calculated totals
useTeams(); // Team data with logos
```

---

## Phase 4: State Management

### 4.1 Zustand Stores

**useWalletStore** (copy from hoopx-presale)

```typescript
interface WalletState {
  address: string | null;
  truncatedAddress: string | null;
  hoopxBalance: number;
  setAddress: (address: string | null) => void;
  setHoopxBalance: (balance: number) => void;
  clearAddress: () => void;
}
```

**useTabStore**

```typescript
interface TabState {
  mainTab: "live-scores" | "my-tickets";
  ticketSubTab: "unbet" | "bet";
  setMainTab: (tab: "live-scores" | "my-tickets") => void;
  setTicketSubTab: (tab: "unbet" | "bet") => void;
}
```

**useTicketStore**

```typescript
interface Ticket {
  id: string;
  status: "unbet" | "bet";
  homeScore?: number;
  awayScore?: number;
  timestamp?: number;
  txHash?: string;
}

interface TicketState {
  tickets: Ticket[];
  availableRedeem: number; // From Jupiter swap calculation
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  setAvailableRedeem: (count: number) => void;
}
```

**useUIStore**

```typescript
interface UIState {
  locale: "en" | "cn";
  isInfoModalOpen: boolean;
  isRedeemModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLuckyNumberModalOpen: boolean;
  luckyNumber: number | null;
  setLocale: (locale: "en" | "cn") => void;
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  setLuckyNumber: (number: number | null) => void;
}
```

---

## Phase 5: Component Implementation

### 5.1 Header Component with Snow Animation

```tsx
// components/header.tsx
// - Purple gradient background
// - NBA Christmas 2025 logo image (provided)
// - "Score Prediction Challenge" subtitle
// - EN language toggle (top right)
// - Animated snowfall overlay

// components/snow-animation.tsx
// - CSS/Canvas animated snowflakes
// - Falls continuously in header area
// - Subtle, not distracting
```

### 5.2 Stats Bar Component

```tsx
// components/stats-bar.tsx
// Left: "Current Prize Pool" + "20,000 USDT"
// Right: "Participants" + "1,004" (orange)
```

### 5.3 Prize Progress Component

```tsx
// components/prize-progress.tsx
// - "NEXT" badge (yellow)
// - "Unlock Higher Prize Pool" + "200,000 USDT"
// - Progress bar with gradient
// - "1,004 / 10,000 tickets" + "10%"
```

### 5.4 Tab Navigation

```tsx
// components/tab-navigation.tsx
// - LIVE SCORES | MY TICKETS
// - MY TICKETS shows badge count when tickets exist
// - Active: purple text + underline
```

### 5.5 Ticket Sub-Tabs

```tsx
// components/ticket-sub-tabs.tsx
// - Only visible when user has both unbet AND bet tickets
// - UNBET | BET buttons
// - Positioned below main tabs
```

### 5.6 Cumulative Score Display

```tsx
// components/cumulative-score.tsx
// - Purple gradient card
// - "Cumulative Total Score" header
// - Large numbers: HOME TEAMS : AWAY TEAMS
// - Updates in real-time
```

### 5.7 Game Card Component

```tsx
// components/game-card.tsx
// - Cream background (#FFFBEB)
// - Status badge: LIVE (red) or UPCOMING (yellow)
// - Team logos from SportsData.io API
// - Team names from API
// - Score display or "Starts at X:XXPM"
// - Quarter + time remaining for live games
```

### 5.8 Unbet Ticket Card

```tsx
// components/unbet-ticket-card.tsx
// - "Ticket #XXXXXX" + "Unbet" badge (red)
// - Two inputs side by side:
//   - "Total Home Teams Score" (0-1000)
//   - "Total Away Teams Score" (0-1000)
// - "PLACE PREDICTION" button (purple)
// - Validates input range
```

### 5.9 Bet Ticket Card

```tsx
// components/bet-ticket-card.tsx
// - Mint green background
// - "Ticket #XXXXXX" + timestamp ("34 seconds ago")
// - Large prediction: "896 : 930"
// - Labels: "HOME TEAMS" : "AWAY TEAMS"
// - Share button (optional)
```

### 5.10 Redeem Modal

```tsx
// components/redeem-modal.tsx
// - Bottom sheet style
// - "Redeem Prediction Tickets" title
// - "1 Prediction Ticket = 10,000 HOOPX"
// - Quantity selector with MIN/MAX
// - Available Balance display
// - Available Redeem display (from Jupiter swaps)
// - "REDEEM - XX,XXX HOOPX" button
```

### 5.11 Confirm Modal

```tsx
// components/confirm-modal.tsx
// - "Redeem Transaction" title
// - HoopX logo + amount
// - Transfer to: [burn address - truncated]
// - You'll receive: X ticket(s)
// - Network fee display
// - "CONFIRM" button
```

### 5.12 Lucky Number Modal

```tsx
// components/lucky-number-modal.tsx
// - Celebratory design (confetti?)
// - "Congratulations!" title
// - "You hit lucky number #XX!"
// - "You've won 10 USDT!"
// - Close/Share buttons
```

### 5.13 Share Modal

```tsx
// components/share-modal.tsx
// - Share prediction to social media
// - Copy link functionality
// - Twitter/X share button
```

---

## Phase 6: Wallet & Blockchain

### 6.1 Files to Copy from hoopx-presale

| Source                               | Destination             |
| ------------------------------------ | ----------------------- |
| `components/wallet-provider.tsx`     | Same                    |
| `components/wallet-button.tsx`       | Same (modify styling)   |
| `components/mobile-wallet-modal.tsx` | Same                    |
| `lib/utils/mobile-deeplink.ts`       | Same                    |
| `lib/store/useWalletStore.ts`        | Same (add hoopxBalance) |

### 6.2 Ticket Redemption Logic

#### Eligibility Calculation

```typescript
// lib/solana/eligibility.ts

// Query Jupiter swap transactions (Dec 19-26, 2025)
// Filter by Jupiter Program ID + HoopX token output
// Calculate: totalAvailableTickets = swapAmounts / 10,000
// availableRedeem = totalAvailableTickets - redeemedCount
// Validation: walletBalance >= availableRedeem * 10,000
```

#### Burn Flow

```typescript
// lib/solana/burn.ts

// 1. Create burn instruction for ticketAmount * 10,000 HoopX
// 2. User confirms in wallet UI
// 3. Wait for confirmation
// 4. Create ticket(s) in local state
// 5. (Future: Submit to backend)
```

#### Jupiter Detection

```typescript
// lib/solana/eligibility.ts
const JUPITER_V6_PROGRAM = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
const HOOPX_MINT = "9GhjesUhxmVo9x4UHpdS6NVi4TGzcx8BtGckUqFrjupx";

// Use Helius Enhanced Transactions API
// GET https://api.helius.xyz/v0/addresses/{address}/transactions
```

---

## Phase 7: Dummy Data (Backend Not Ready)

### 7.1 Mock Data Structure

```typescript
// lib/raffle/dummy-data.ts

export const DUMMY_RAFFLE_CONFIG = {
  prizePool: 20000,
  participants: 1004,
  ticketsSold: 1004,
  maxTickets: 10000,
  startTime: "2025-12-19T22:00:00+08:00",
  endTime: "2025-12-26T11:30:00+08:00",
  ticketPrice: 10000,
  ladder: [
    { tickets: 100, prize: 2000 },
    { tickets: 1000, prize: 20000 },
    { tickets: 10000, prize: 200000 },
  ],
  luckyNumbers: [7, 23, 45, 67, 88], // Example lucky numbers
};

export const DUMMY_USER_TICKETS: Ticket[] = [
  {
    id: "200394",
    status: "unbet",
  },
  {
    id: "200395",
    status: "bet",
    homeScore: 896,
    awayScore: 930,
    timestamp: Date.now() - 34000,
  },
];
```

### 7.2 Local Storage Persistence

- Store user's tickets in localStorage
- Persist between sessions
- Clear on wallet disconnect

---

## Phase 8: Lucky Number Feature

### 8.1 Logic

```typescript
// lib/utils/lucky-number.ts

// When user places prediction:
// 1. Generate or check against predefined lucky numbers
// 2. If prediction matches a lucky number pattern:
//    - Show congratulations modal
//    - Mark as winner in local state
// 3. Lucky number could be:
//    - Sum of home + away prediction
//    - Last digits
//    - Specific combinations
```

### 8.2 UI Flow

1. User enters prediction (Home: 896, Away: 930)
2. Clicks "PLACE PREDICTION"
3. System checks if matches lucky number
4. If match: Show `lucky-number-modal.tsx` with confetti
5. If no match: Just save prediction normally

---

## Phase 9: Internationalization

### 9.1 Translation Structure

```json
{
  "header": {
    "subtitle": "Score Prediction Challenge"
  },
  "stats": {
    "currentPrizePool": "Current Prize Pool",
    "participants": "Participants",
    "unlockHigher": "Unlock Higher Prize Pool",
    "tickets": "tickets"
  },
  "tabs": {
    "liveScores": "LIVE SCORES",
    "myTickets": "MY TICKETS",
    "unbet": "UNBET",
    "bet": "BET"
  },
  "scores": {
    "cumulativeTotal": "Cumulative Total Score",
    "homeTeams": "HOME TEAMS",
    "awayTeams": "AWAY TEAMS",
    "live": "LIVE",
    "upcoming": "UPCOMING",
    "final": "FINAL",
    "startsAt": "Starts at"
  },
  "tickets": {
    "connectPrompt": "Please connect your wallet",
    "connectNow": "Connect now",
    "ticketNumber": "Ticket #{{id}}",
    "unbet": "Unbet",
    "totalHomeScore": "Total Home Teams Score",
    "totalAwayScore": "Total Away Teams Score",
    "placePrediction": "PLACE PREDICTION",
    "redeemMore": "Redeem more tickets",
    "secondsAgo": "{{seconds}} seconds ago",
    "minutesAgo": "{{minutes}} minutes ago"
  },
  "redeem": {
    "title": "Redeem Prediction Tickets",
    "rate": "1 Prediction Ticket = 10,000 HOOPX",
    "description": "Each ticket lets you predict total home/away scores (0-1000)",
    "min": "MIN",
    "max": "MAX",
    "ticket": "Ticket",
    "availableBalance": "Available Balance",
    "availableRedeem": "Available Redeem",
    "redeemButton": "REDEEM - {{amount}} HOOPX"
  },
  "confirm": {
    "title": "Redeem Transaction",
    "transferTo": "Transfer to",
    "youllReceive": "You'll receive",
    "networkFee": "Network fee",
    "confirm": "CONFIRM"
  },
  "lucky": {
    "congrats": "Congratulations!",
    "hitNumber": "You hit lucky number #{{number}}!",
    "won": "You've won 10 USDT!",
    "close": "Close",
    "share": "Share"
  },
  "buttons": {
    "connectToRedeem": "CONNECT TO REDEEM"
  },
  "info": {
    "title": "Score Prediction Challenge",
    "period": "Period",
    "periodValue": "From 19th Dec 2025 10:00PM to 26th Dec 2025 11:30AM (HKT)",
    "periodNote": "(Beginning of the last NBA Xmas game)",
    "howToRedeem": "How to redeem",
    "redeemRule1": "10,000 HOOPX for 1 Raffle Ticket (around 20 USDT)",
    "redeemRule2": "Same wallet can buy multiple Raffle tickets",
    "prize": "Prize",
    "prizeRule1": "100 random jackpot (10 USDT) for picking the lucky number (only one chance for one number)",
    "prizeRule2": "Guaranteed 2,000 USDT pool prize",
    "prizeRule3": "One winner only (closest bet)",
    "ladder": "Ladder",
    "ladder100": "100 Raffles: 2,000 USDT",
    "ladder1000": "1,000 Raffles: 20,000 USDT",
    "ladder10000": "10,000 Raffles: 200,000 USDT"
  },
  "toast": {
    "redeemSuccess": "You've redeemed {{count}} ticket successfully!",
    "predictionPlaced": "Prediction placed successfully!",
    "error": "Something went wrong. Please try again."
  }
}
```

---

## Phase 10: Implementation Checklist

### Foundation

- [ ] Initialize Next.js project with pnpm
- [ ] Install all dependencies
- [ ] Set up Tailwind CSS with theme colors
- [ ] Configure environment variables
- [ ] Set up providers (Query, Wallet, Locale)
- [ ] Add NBA Christmas 2025 logo image

### Wallet Integration

- [ ] Copy wallet-provider.tsx from hoopx-presale
- [ ] Copy mobile-wallet-modal.tsx
- [ ] Copy mobile-deeplink.ts utilities
- [ ] Adapt wallet-button.tsx for this design
- [ ] Set up useWalletStore with balance tracking

### NBA Data Integration

- [ ] Create NBA API proxy routes
- [ ] Implement team data fetching (with logos)
- [ ] Implement games fetching (Dec 19-26)
- [ ] Implement live scores with auto-refresh
- [ ] Calculate cumulative scores

### UI Components

- [ ] Base modal (bottom sheet)
- [ ] Button with CVA variants
- [ ] Badge (LIVE, UPCOMING, Unbet, Bet)
- [ ] Progress bar
- [ ] Tabs component
- [ ] Input component
- [ ] Quantity selector (+/- buttons)
- [ ] Toast notifications

### Page Components

- [ ] Header with snow animation
- [ ] Stats bar
- [ ] Prize progress bar
- [ ] Tab navigation (main + sub-tabs)
- [ ] Cumulative score display
- [ ] Game card with API data
- [ ] Game list grouped by date
- [ ] Empty wallet state
- [ ] Unbet ticket card with inputs
- [ ] Bet ticket card
- [ ] Redeem modal
- [ ] Confirm transaction modal
- [ ] Lucky number modal
- [ ] Info modal
- [ ] Floating buttons

### State Management

- [ ] useWalletStore
- [ ] useTabStore
- [ ] useTicketStore
- [ ] useUIStore

### Blockchain Integration

- [ ] Jupiter swap eligibility check
- [ ] HoopX burn transaction
- [ ] Balance fetching

### Features

- [ ] Ticket redemption flow
- [ ] Prediction placement
- [ ] Lucky number check
- [ ] Share functionality

### i18n

- [ ] English translations
- [ ] Chinese translations
- [ ] Language toggle

### Testing & Polish

- [ ] Mobile responsive testing
- [ ] Wallet connection flows (desktop + mobile)
- [ ] Snow animation performance
- [ ] Live score auto-refresh
- [ ] Error handling
- [ ] Loading states

### Deployment

- [ ] Configure Vercel project
- [ ] Set environment variables
- [ ] Deploy to production

---

## API Keys & Credentials

### SportsData.io NBA API

- **API Key**: `1a18375609134706a9fd8802e752077b`
- **Base URL**: `https://api.sportsdata.io/v3/nba`
- **Documentation**: https://sportsdata.io/developers/api-documentation/nba

### Solana

- **RPC**: `https://mainnet.helius-rpc.com/?api-key=9da7f5ce-8d01-464b-b59c-4ddd044402e5`
- **WalletConnect**: `a68ca0938f2edf95553df17e33a52d54`
- **HoopX Mint**: `9GhjesUhxmVo9x4UHpdS6NVi4TGzcx8BtGckUqFrjupx`
- **Jupiter v6**: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`

---

## Design Assets

### Provided

- [x] NBA Christmas 2025 logo (`nba-christmas-2025.png`)
- [x] Design mockups (7 screens)

### From API

- Team logos: SportsData.io `WikipediaLogoUrl` field
- Team names: SportsData.io `Name` field

### To Create

- [ ] Snow animation (CSS/Canvas)
- [ ] HoopX logo (from existing assets)
- [ ] Confetti animation for lucky number

---

## Color Reference (Final)

| Element            | Color                   |
| ------------------ | ----------------------- |
| Header gradient    | #512784 → #3a1c5e       |
| Prize pool text    | #FFFFFF                 |
| Participants count | #FF6B35                 |
| NEXT badge         | #FFB800                 |
| Tab active         | #512784 + underline     |
| Tab inactive       | #888888                 |
| Cumulative card    | Purple gradient         |
| Game cards         | #FFFBEB                 |
| LIVE badge         | #FF4444                 |
| UPCOMING badge     | #FFB800                 |
| Unbet badge        | #FF6B6B                 |
| Bet ticket bg      | #E8FFF5 / #B8F5D8       |
| CTA button         | #512784                 |
| Redeem button      | #F5A623                 |
| Info button        | #FF6B35 (orange circle) |
| Success toast      | #31D99C bg              |

---

## Reference Repository

**hoopx-presale**: `/Users/ariuslee/Projects/hoopx-presale`

- Wallet integration patterns
- Mobile wallet modal
- Jupiter deep linking
- Zustand store patterns
- React Query hooks
- Tailwind configuration
