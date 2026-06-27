# PokéVault — Gap Analysis

This gap analysis compares PokéVault's current prototype state against production-ready requirements. Gaps are categorized by priority:
- **P0**: Critical security or data integrity issues that must be resolved immediately.
- **P1**: Core architecture and infrastructure deficiencies that block scalability.
- **P2**: Feature limitations or UX inconsistencies.
- **P3**: Technical debt items and refactoring tasks.

---

## 1. Security Gaps (P0)

### Hardcoded Supabase Credentials
- **Description**: The Supabase publishable anonymous key and project URL are hardcoded in the client initialization file.
- **Affected File**: `src/services/supabaseClient.ts`.
- **Desired State**: Load credentials dynamically from server-side environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### Hardcoded Developer Authentication Bypass
- **Description**: The landing page includes an unauthenticated developer bypass hook that logs in as `lucasachet@gmail.com` with a single click.
- **Affected File**: `src/components/LandingPage.tsx`.
- **Desired State**: Remove the bypass and enforce standard email/password or OAuth SSO flows.

### Client-Side API Key Exposure (Gemini)
- **Description**: Google Gemini AI requests are executed client-side, exposing the API keys to the browser.
- **Affected File**: `src/components/TrainerLabTab.tsx`.
- **Desired State**: Route AI requests through Next.js server route handlers (`/api/trainer-lab/analyze`) to keep API keys secured.

---

## 2. Architecture & Data Gaps (P1)

### Stale Closures in Pricing Simulation
- **Description**: The price sync simulation triggers state changes inside `setTimeout` blocks that read stale render-time closures, leading to race conditions.
- **Affected File**: `src/hooks/usePortfolio.ts` (`syncMarketPrices`).
- **Desired State**: Use functional state updates (`setPrices(prev => ...)` or ref-based caches) to reference current values.

### Swallowed Database Errors
- **Description**: DB requests catch errors, log them using `console.error`, and return empty structures. The client UI is unaware of database sync failures.
- **Affected File**: `src/services/supabase.service.ts`.
- **Desired State**: Propagate database errors to the caller or hooks, and display descriptive toast notifications to the user.

### Dead/Unused Services
- **Description**: The project includes 5 localStorage service files that are completely unused, adding unnecessary code weight.
- **Affected Files**: `localStorageService.ts`, `cards.service.ts`, `collection.service.ts`, etc.
- **Desired State**: Remove the unused files.

---

## 3. Performance & UI Gaps (P2)

### Monolithic File Sizes
- **Description**: Five core modules exceed 1000 lines of code, mixing UI layout, calculations, state, and file upload handlers.
- **Affected Files**: `LandingPage.tsx` (1999 lines), `CardDetailsModal.tsx` (1879 lines), `JourneyTab.tsx` (1452 lines), etc.
- **Desired State**: Refactor into modular component folders of $\leq 300$ lines.

### O(n²) Array Searching Loops
- **Description**: Card grids search arrays using `.find()` inside rendering maps on every frame, leading to slow rendering.
- **Affected Files**: `CollectionTab.tsx`, `AnalyticsTab.tsx`.
- **Desired State**: Cache array indexes into a lookup `Map` structure before rendering loops.

### No Virtual Scroll Support
- **Description**: Large card lists render all DOM nodes eagerly, causing performance bottlenecks for large collections.
- **Affected Files**: `CollectionTab.tsx`, `WishlistTab.tsx`.
- **Desired State**: Integrate virtualized rendering (`@tanstack/react-virtual`) for lists containing more than 50 cards.
