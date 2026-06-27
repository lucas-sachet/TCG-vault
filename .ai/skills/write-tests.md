# Write Tests — Vitest, React Testing Library & Playwright

## Purpose

Establishes testing guidelines, test patterns, and implementation strategies for unit tests (Vitest), component tests (React Testing Library), and E2E integration tests (Playwright) within PokéVault. Ensures all business rules, portfolio calculations, and auth gates are fully test-covered.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Code File Path | ✅ | Path to the module or component requiring tests |
| Test Category | ✅ | `unit` (hooks/utilities), `component` (UI rendering/events), `e2e` (flows) |

---

## Outputs

A matching test file (e.g., `src/hooks/usePortfolio.test.ts` or `src/components/CardItem.test.tsx`) that implements comprehensive, high-coverage testing.

---

## Workflow

### Step 1 — Unit Testing Hooks & Helpers (Vitest)
For hooks and business calculation functions, use Vitest. Mock external services and check return states:

```typescript
// src/hooks/useAnalytics.test.ts
import { describe, it, expect } from 'vitest';
import { calculateProfitLoss } from './useAnalytics';
import type { CollectionItem } from '@/types';

describe('calculateProfitLoss', () => {
  it('should calculate correct ROI percentage and values', () => {
    const mockItems: CollectionItem[] = [{
      id: '1',
      cardId: 'xy1-1',
      purchasePrice: 100,
      quantity: 2,
      currency: 'USD',
      purchaseDate: '2026-01-01',
      gradeType: 'Raw'
    }];
    
    const mockPrices = { 'xy1-1': 150 };

    const result = calculateProfitLoss(mockItems, mockPrices);

    expect(result.absolute).toBe(100); // 2 * (150 - 100)
    expect(result.percentage).toBe(50); // (150 - 100) / 100 * 100
    expect(result.isProfit).toBe(true);
  });
});
```

### Step 2 — Component Testing (React Testing Library)
For UI components, verify correct rendering, loading states, and event callbacks. Mock child dependencies if needed.

```tsx
// src/components/ConfirmationModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmationModal } from './ConfirmationModal';

describe('ConfirmationModal', () => {
  it('should render modal content when open', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Item"
        description="Are you sure you want to delete this card?"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
```

### Step 3 — End-to-End Testing (Playwright)
Verify core user paths: Auth modal completion, onboarding completion, portfolio synchronization, and card additions.

```typescript
// tests/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should register and navigate to app dashboard', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Build Your Free Vault');
  
  await page.fill('input[type="email"]', 'newuser@pokevault.com');
  await page.fill('input[name="password"]', 'VaultPassword123');
  await page.click('button[type="submit"]');

  // Verify onboarding wizard displays
  await expect(page.locator('text=Welcome to PokéVault')).toBeVisible();
});
```

---

## Validation Steps

1. Run unit/component tests: `npx vitest run`.
2. Run E2E integration tests: `npx playwright test`.
3. Check code coverage reports and ensure test targets are met.

---

## Quality Gates

- [ ] Unit test coverage on core math helpers and analytics is 100%.
- [ ] Mocks are clean, scoped, and do not call real APIs or databases.
- [ ] No test code is imported or shipped in production bundles.
- [ ] No hardcoded authentication credentials are stored inside E2E test files.
