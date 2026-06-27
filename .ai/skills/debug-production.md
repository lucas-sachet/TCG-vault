# Debug Production — Incident & Defect Remediation

## Purpose

Provides a step-by-step diagnostic workflow for identifying, reproducing, and fixing bugs in the PokéVault production environment. Focuses on resolving issues with data synchronization, market price fluctuations, client state mismatch, and performance degradation.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Incident Report / Bug Description | ✅ | Detailed report of the unexpected behavior or crash |
| Logs | ⬚ | Console errors, network request payloads, Supabase logs, or telemetry |
| Environment | ✅ | Production, Staging, or Local |

---

## Outputs

1. **Reproduction Case**: Code snippet or click path showing how the defect occurs.
2. **Root Cause Analysis (RCA)**: Explanation of why the bug occurred (stale state, concurrency race, etc.).
3. **Remediation Plan**: Fix details, verified locally.
4. **Post-Incident Checklist**: Test coverage additions, validation verification.

---

## Workflow

### Step 1 — Local Reproduction
Create a test case reproducing the issue. If it is a pricing/portfolio calculation defect, create a mock collection item mimicking the reported user's holdings:

```typescript
// scratch/repro-bug.ts
import { calculateProfitLoss } from '@/hooks/useAnalytics';

const mockHoldings = [{
  id: 'test-1',
  cardId: 'xy1-1',
  purchasePrice: 10,
  quantity: 1
}];

const mockPrices = {
  'xy1-1': 15
};

console.log(calculateProfitLoss(mockHoldings, mockPrices));
// Expect: absolute: 5, percentage: 50
```

### Step 2 — Trace the Data Synchronization Path
For Supabase syncing bugs, trace whether the error happened:
- Client-side hook update (`useState`)
- Network cache layer (`TanStack Query` state)
- API endpoint/Supabase Client request
- Supabase PostgreSQL trigger / RLS policy restriction

### Step 3 — Fix Concurrency & Consequential Issues
If fixing calculations, ensure:
1. Float precision is handled correctly (avoid rounding errors).
2. React state updates are functional `setX(prev => ...)` to avoid reading stale closure data inside `setTimeout` or asynchronous blocks.
3. Errors are propagated cleanly to UI using error boundaries or toast notifications, not swallowed in service files.

---

## Validation Steps

1. Run the local reproduction code and check if the fix resolves the discrepancy.
2. Verify that network traffic to Supabase/Pokemon TCG API is clean (no 429 Rate Limit, no 401 Unauthorized).
3. Ensure regression tests are written to prevent the same bug from returning.

---

## Quality Gates

- [ ] Bug is fully resolved without introducing type casting or breaking existing tests.
- [ ] Swallowed errors are removed; proper telemetry/logging or toast notifications are added.
- [ ] No regression occurs in Core Web Vitals (LCP, FID, CLS).
