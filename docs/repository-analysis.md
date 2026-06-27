# PokéVault — Repository Analysis

## 1. Executive Summary

PokéVault is a high-fidelity Pokémon TCG portfolio management and binder organization platform. Although the product description references Next.js and Firebase, a detailed audit of the repository reveals that the current implementation is built on a **Vite 6 SPA (React 19)** using **Supabase** for user database persistence, authentication, and photo storage.

The current codebase is in a prototype/early-beta state characterized by:
- A custom SPA routing mechanism instead of a standard router package.
- An in-memory client state caching pattern (`useState` in the root) rather than reactive server state synchronization.
- Extremely large component files with high cognitive load (multiple files exceed 1,000 lines).
- Incomplete security boundaries (hardcoded Supabase keys in client files and dev-only authentication bypasses in components).

---

## 2. Directory Layout & Key Modules

Below is the directory structure of the repository, including descriptions, file sizes, and lines of code:

```
d:\TI\aula\TCG-vault\
├── .agent/                    # Workspace agent tools and configurations
├── .ai/                       # AI Development System configurations
├── public/
│   └── sw.js                  # Image caching service worker (64 lines, 1.8KB)
├── src/
│   ├── App.tsx                # Main entry, router & auth manager (782 lines, 30KB)
│   ├── main.tsx               # Renderer & SW registry (19 lines, 560B)
│   ├── types.ts               # Core domain types (85 lines, 2KB)
│   ├── index.css              # Global styling & Tailwind v4 theme (220 lines, 6KB)
│   ├── components/            # View pages and UI sub-widgets
│   │   ├── LandingPage.tsx    # Marketing site & Auth modal (1999 lines, 106KB)
│   │   ├── CardDetailsModal.tsx# Card detail, price chart & holdings (1879 lines, 96KB)
│   │   ├── JourneyTab.tsx     # Timelines & collector history modes (1452 lines, 78KB)
│   │   ├── TrainerLabTab.tsx  # Binder page, PSA scoring, price sniper (1364 lines, 72KB)
│   │   ├── SettingsTab.tsx    # User profiles, CSV exports & settings (1294 lines, 67KB)
│   │   ├── AddCardModal.tsx   # Card API query & individual/bulk add (1184 lines, 58KB)
│   │   ├── CollectionTab.tsx  # Collection grids & view switchers (807 lines, 41KB)
│   │   ├── AnalyticsTab.tsx   # Visual charts & CSV import utility (869 lines, 39KB)
│   │   ├── OnboardingWizard.tsx# Onboarding guide (480 lines, 26KB)
│   │   ├── DashboardTab.tsx   # KPI dashboard & performance charts (508 lines, 23KB)
│   │   ├── WishlistTab.tsx    # Wishlist trackers (451 lines, 22KB)
│   │   ├── CardItem.tsx       # Reusable 3D tilt card display (410 lines, 20KB)
│   │   ├── GoalsSection.tsx   # Goals widgets (444 lines, 20KB)
│   │   ├── BottomNav.tsx      # Sidebar & bottom nav layouts (133 lines, 6KB)
│   │   └── ConfirmationModal.tsx# Confirmation dialogs (124 lines, 4KB)
│   ├── hooks/                 # React state hooks
│   │   ├── useCollection.ts   # Catalog list helper (49 lines, 1.2KB)
│   │   ├── useHoldings.ts     # CollectionItems and Binder CRUD (142 lines, 3.9KB)
│   │   ├── usePortfolio.ts    # Valuation updates & alerts (198 lines, 6.8KB)
│   │   ├── useWishlist.ts     # Wishlist CRUD actions (100 lines, 2.5KB)
│   │   └── useAnalytics.ts    # Analytics helper (67 lines, 1.9KB)
│   ├── services/              # API connections and service implementations
│   │   ├── interfaces.ts      # Service contracts (55 lines, 1.5KB)
│   │   ├── serviceProvider.ts # Service locator/DI (41 lines, 1.3KB)
│   │   ├── supabaseClient.ts  # Supabase client singleton (13 lines, 519B)
│   │   ├── supabase.service.ts# Direct database operations (792 lines, 25KB)
│   │   ├── pokemonTcg.service.ts# Pokémon TCG API v2 client (192 lines, 5.5KB)
│   │   ├── imageUpload.service.ts# Base64 compression & Storage helper (58 lines, 1.6KB)
│   │   └── *                  # 5 unused localStorage service files
│   ├── data/
│   │   └── pokemonData.ts     # Static seed databases & metadata arrays (54 lines, 2.7KB)
│   └── utils/
│       └── imageOptimizer.ts  # Weserv.nl image resizing proxy (35 lines, 950B)
```

---

## 3. Architecture & Coding Patterns

### Custom SPA Router
The application does not use React Router or a routing package. Instead, it reads `window.location.pathname` inside `src/App.tsx` and intercepts route changes using a popstate listener.
- `/` `/features` `/binders` `/about` `/privacy` are directed to `LandingPage.tsx`.
- `/app` points to the main authenticated interface `MainVaultApp` inside `App.tsx`.

### In-Memory Caching (Write-Through State)
The 5 hooks (`useCollection`, `useHoldings`, `useWishlist`, `usePortfolio`, `useAnalytics`) load data synchronously from localStorage on mount. State changes are pushed back to Supabase asynchronously using `useEffect` handlers:
```
User Action ──► Hook Mutation ──► State updates ──► useEffect ──► supabase.service.ts
```
If the async request fails, the client state diverges from the database.

### Service Locator Facade
Services are structured behind interfaces defined in `src/services/interfaces.ts`. The implementation mapping is handled dynamically at compile time inside `src/services/serviceProvider.ts`. In the current release, all services are hardwired to use the Supabase implementations.

---

## 4. Technical Debt Catalog

### Security
1. **Hardcoded Supabase Credentials (Critical)**: `src/services/supabaseClient.ts` hardcodes a publishable anonymous key and URL directly in the source files.
2. **Developer Bypass (High)**: `LandingPage.tsx` contains a hardcoded developer login hook (`onAuthSuccess('lucasachet@gmail.com')`) bypassing standard login steps.
3. **Exposed Gemini Key (High)**: Gemini calls in `TrainerLabTab.tsx` are executed client-side, risking API key disclosure.

### Code Quality & Architectural Debt
1. **God Components (High)**: 5 core components exceed 60KB/1000 lines, mixing UI layout, calculations, API requests, and localStorage state.
2. **God Service (High)**: `supabase.service.ts` contains 7 separate service classes in a single file, managing everything from portfolio syncs to image uploads.
3. **Dead Code (Medium)**: Local storage services (`localStorageService.ts`, `cards.service.ts`, `collection.service.ts`, `binder.service.ts`, `wishlist.service.ts`, `priceHistory.service.ts`) are unused in the active build.
4. **Weak Typing (Medium)**: High usage of `any` types across service files and callbacks, bypassing compiler checks.
5. **No Routing Library (Medium)**: Hand-rolled SPA router in `App.tsx` lacks 404 boundaries and code splitting.

### Performance & Concurrency
1. **O(n²) Array Searches (High)**: Loops inside `CollectionTab.tsx` and `AnalyticsTab.tsx` query arrays using `.find()` inside rendering maps instead of indexing lookup structures first.
2. **Stale Closure Bug (High)**: `usePortfolio.syncMarketPrices` queries price alert data and thresholds inside a delayed `setTimeout` function, reading stale closure data instead of functional updaters.
3. **Redundant Service Writes (Medium)**: Custom hooks trigger `useEffect` syncs to the DB immediately on initialization, causing redundant writes on mount.
4. **No Code Splitting (Medium)**: Layouts do not use React lazy loading, loading the entire codebase (including charts and AI widgets) on the first visit.

---

## 5. Missing Documentation & Standards

- **No testing guidelines or test scripts**: The repository has no test files or configuration setups.
- **No Linter or Formatting configurations**: No `.eslintrc.json` or `.prettierrc` files exist.
- **Missing CI/CD pipelines**: No workflows are configured for automated builds, checks, or releases.
- **No typed Database schema**: Schema types are not generated or validated against Supabase.
