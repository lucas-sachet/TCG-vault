# PokéVault

PokéVault is an intelligent, high-fidelity portfolio management and visual binder organization platform designed for serious Pokémon TCG collectors. It allows users to track real-time card valuations, calculate cost basis and net ROI, manage wishlists, and organize collections inside interactive virtual binders.

---

## 🚀 Key Features

*   **SPA Path-Based Routing:**
    *   `/` - Dynamic landing home page detailing the value propositions.
    *   `/features` - An in-depth overview of the platform's automation, financial tracking, and visual assets layers.
    *   `/binders` - An interactive 3x3 pocket binder playground mimicking physical binder sleeve sheets.
    *   `/about` - PokéVault's project mission and core team info.
    *   `/privacy` - Privacy policy detailing Brazilian General Data Protection Law (LGPD) conformity.
    *   `/app` - The secure main dashboard vault application (requires authentication).
*   **Interactive 3x3 Pocket Binder Demo (`/binders`):**
    *   **3D Perspective Tilt:** Cards dynamically tilt in 3D space following the cursor's coordinate offsets.
    *   **Holographic Sheen:** Moving `mix-blend-color-dodge` radial gradient glint simulates physical holographic cards on hover.
    *   **Tactile Binder sleeve layout:** Designed with binder rings cutouts and slot borders.
    *   **Interactive Empty Slots:** Labeled "Awaiting Chase" with a card back layout and addition trigger that guides users to register/log in.
    *   **Real-time ROI Overlays:** Popover metrics showing condition, cost basis, live value, set progress, and gains.
*   **Secure Dashboard App (`/app`):**
    *   Live database syncing with Supabase.
    *   Auto cataloging, wishlists, and analytical breakdowns.
    *   Multi-currency toggling between USD ($), EUR (€), BRL (R$), and JPY (¥).
*   **Regulatory Compliance:**
    *   Brazilian General Data Protection Law (LGPD) compliant privacy declaration.
    *   Persistent Cookie Consent toast notification that stores acceptance flags in `localStorage`.

---

## 🛠️ Tech Stack

*   **Frontend Core:** React 19, Vite 6, TypeScript
*   **Database & Authentication:** Supabase (PostgreSQL client)
*   **Animations:** Motion (Framer Motion v12) & 3D CSS Transforms
*   **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
*   **Icons:** Lucide React

---

## ⚙️ Prerequisites

Before you start, make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or `pnpm` / `yarn` package managers

---

## 🏃 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/lucas-sachet/TCG-vault.git
cd TCG-vault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Configure environment variables if you want to connect to a custom database. By default, PokéVault includes fallback parameters connecting to a sandbox database endpoint.
Create a `.env.local` or `.env` in the root folder:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📁 Architecture Overview

### Directory Layout
```text
├── src/
│   ├── components/            # Reusable UI & sub-page components
│   │   ├── LandingPage.tsx    # Marketing site pages (/, /features, /binders, etc.)
│   │   ├── BottomNav.tsx      # Vault Dashboard floating tab navigation
│   │   ├── DashboardTab.tsx   # Aggregated analytics widgets and progress goals
│   │   ├── CollectionTab.tsx  # Physical card binder spreadsheet view
│   │   └── ...
│   ├── hooks/                 # Custom React state hooks
│   │   ├── useCollection.ts   # Core cataloging card additions
│   │   ├── useHoldings.ts     # User binder logs & grading notes
│   │   ├── usePortfolio.ts    # ROI tracking & target price alerts
│   │   └── ...
│   ├── services/              # API connections
│   │   ├── supabaseClient.ts  # Supabase client instantiation
│   │   └── supabase.service.ts# Cache loading and cloud database replication
│   ├── App.tsx                # App entrypoint & Popstate history router
│   ├── main.tsx               # DOM Renderer mounting hook
│   └── index.css              # Global custom CSS styles and Tailwind imports
├── public/                    # Static asset files
├── package.json               # Node dependencies and build scripts
└── vite.config.ts             # Vite configuration files
```

### Routing Flow
```text
URL Request (/path)
       │
       ▼
Popstate / App listener (src/App.tsx)
       │
       ├─► Path matches '/app'?
       │     ├─► User logged in? ─────► Render MainVaultApp (Dashboard tabs)
       │     └─► User logged out? ────► Redirect to '/', Open Auth Modal
       │
       └─► Path is marketing (/features, /binders, /about, /privacy, /)?
             └─► Render LandingPage component (passes currentPath, navigate)
```

---

## 💻 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Runs the Vite dev server on port `3001` |
| **Production Build** | `npm run build` | Builds the project for production inside `dist/` |
| **Type Check** | `npm run lint` | Runs TypeScript compilation checks (`tsc --noEmit`) |
| **Clean** | `npm run clean` | Deletes generated production directories |
| **Preview** | `npm run preview` | Previews the build output locally |

---

## 🔍 Troubleshooting

*   **Direct Route Refresh 404:**
    When running under generic static hosts, refreshing `/features` or `/binders` directly can lead to a 404. Ensure your server hosts are configured with a single-page application (SPA) fallback to redirect all requests to `index.html`.
*   **Supabase Data Failures:**
    If database changes are not synchronized, verify your network connection or double check if the credentials in `src/services/supabaseClient.ts` match your active Supabase project's keys.
