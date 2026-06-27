# PokéVault — Business Rules Specification

This document details the business and domain rules of the PokéVault platform, extracted from the active codebase.

---

## 1. Collections & Card Holdings

### Card Identification
Each card tracked inside the collection references a unique identifier (`cardId`) conforming to the Pokémon TCG API schema (e.g. `sv1-1`, `base1-4`).
- Source: `src/types.ts` (`Card` interface).

### Multiple Copies & Grading
A user's collection can contain multiple copies of the same card. Each copy is stored as a distinct `CollectionItem` and tracks:
- **Condition / Quality**: Classified using the `CardQuality` type:
  - `M` (Mint)
  - `NM` (Near Mint)
  - `SP` (Slightly Played)
  - `MP` (Moderately Played)
  - `HP` (Heavily Played)
  - `D` (Damaged)
- **Grading status**: Tracks whether a card is `Raw` (ungraded) or graded by a recognized company:
  - `GradeType`: `'Raw' | 'PSA' | 'CGC' | 'BGS'`
  - Graded cards require a grade value (e.g., `10`, `9.5`, `"Authentic"`) and an optional certificate number (`certNumber`).
- Source: `src/types.ts` (`CollectionItem` interface), `src/components/AddCardModal.tsx`.

---

## 2. Binders Organization

- **Virtual Organization**: Binders are logical groups used to organize collections. A binder has a `name` and an optional `description`.
- **Single Association**: A `CollectionItem` can belong to at most one binder.
- **Cover Card**: A binder can display a cover card from the collection (`coverCardId`). If no card is set, a default background displays.
- Source: `src/types.ts` (`Binder` interface), `src/hooks/useHoldings.ts`.

---

## 3. Valuation & Financial Rules

### Pricing Data Source
Card valuations are retrieved from the Pokémon TCG API. The application uses the following priority order for extracting the current market price from `tcgplayer.prices`:
1. `holofoil.market`
2. `reverseHolofoil.market`
3. `normal.market`
4. `normal.mid`
5. `holofoil.mid`
6. `0` (Default if no price is available)
- Source: `src/services/pokemonTcg.service.ts` (`mapToInternalCard` logic).

### Portfolio Metrics & ROI
The portfolio calculations use the following formulas:
- **Acquisition Cost / Cost Basis**: Sum of the purchase price multiplied by quantity for all items.
  $$\text{Cost Basis} = \sum (\text{purchasePrice} \times \text{quantity})$$
- **Current Value**: Sum of the current market price multiplied by quantity.
  $$\text{Current Value} = \sum (\text{currentPrice} \times \text{quantity})$$
- **Return on Investment (ROI)**: Calculated as:
  $$\text{ROI} = \frac{\text{Current Value} - \text{Cost Basis}}{\text{Cost Basis}} \times 100$$
- Source: `src/hooks/useAnalytics.ts` (`calculateProfitLoss` function).

### Multi-Currency Display
The application stores prices in USD. Display formatting supports USD ($), EUR (€), BRL (R$), and JPY (¥). Currency conversion is display-only; the underlying database stores USD.
- Source: `src/components/SettingsTab.tsx`, `src/App.tsx`.

---

## 4. Wishlist & Price Alerts

- **Priority Levels**: Wishlist items track priority levels: `Low`, `Medium`, and `High`.
- **Target Price Alert**: Users can set a target price for wishlist items. When the market price drops below the target price, the item displays a "TARGET REACHED" badge.
- **Acquisition Flow**: When an item is acquired from the wishlist, it is moved to the collection and removed from the wishlist.
- Source: `src/types.ts` (`WishlistItem` interface), `src/components/WishlistTab.tsx`.

---

## 5. Collection Goals

Users can set goals to track their progress. Goals support the following types:
- **`value`**: Tracks the total portfolio valuation against a target monetary value.
- **`set`**: Tracks set completion by counting unique cards owned in the target set.
- **`master_set`**: Tracks master set completion by requiring all card variants (e.g., holofoils, reverse-holofoils) to be owned in Mint/Near Mint condition or with a grade value $\geq 9$.
- **`pokemon`**: Tracks the collection of all cards matching a specific Pokémon species name.
- Source: `src/types.ts` (`CollectionGoal` interface), `src/components/GoalsSection.tsx`.
