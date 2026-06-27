# Refactor Module — Decomposing God Classes & Components

## Purpose

Guides the process of decomposing large monolithic components (e.g., `LandingPage.tsx` at 1999+ lines, `CardDetailsModal.tsx` at 1879+ lines, `supabase.service.ts` at 792+ lines) into focused, testable, and reusable modules of ≤ 300 lines.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Monolithic File Path | ✅ | Path to the target component/service to refactor |
| Dependency List | ✅ | Hooks, context, and external dependencies used by the file |
| Target Decomposition structure | ✅ | List of proposed smaller sub-files |

---

## Outputs

1. **Refactored Module Index**: Main entry point file using named exports.
2. **Decomposed Sub-components**: Multiple focused React components or helper utility files (each ≤ 300 lines).
3. **Dedicated Hooks**: Extracted React hooks for isolating state and side effects.
4. **Unit Tests**: Coverage validating that the refactored code has identical behavior (no regressions).

---

## Workflow

### Step 1 — Dependency Mapping
Create a map of the file's imports and exports to identify clear separation points. For example, in `CardDetailsModal.tsx`:
- Carousel UI & image error handling → `CardImageCarousel.tsx`
- Custom SVG pricing graph & hover crosshair → `CardPriceHistoryChart.tsx`
- Expandable specimen uploader & details form → `HoldingItemEditor.tsx`
- History list → `CardJourneyTimeline.tsx`

### Step 2 — Extract Business Logic to Custom Hooks
Move state logic, async uploads, and data filters out of view components into dedicated hooks:

```typescript
// src/hooks/useHoldingEditor.ts
import { useState } from 'react';
import { uploadImageIfBase64 } from '@/services/imageUpload.service';

export function useHoldingEditor(itemId: string, initialNotes: string) {
  const [notes, setNotes] = useState(initialNotes);
  const [isUploading, setIsUploading] = useState(false);

  const handleNotesChange = (val: string) => setNotes(val);
  
  return {
    notes,
    isUploading,
    handleNotesChange
  };
}
```

### Step 3 — Build Stateless Presentation Sub-components
Refactor the sub-components to accept primitive props and event callbacks:

```typescript
// src/components/CardDetails/CardPriceHistoryChart.tsx
import type { PriceSnapshot } from '@/types';

interface PriceChartProps {
  priceHistory: PriceSnapshot[];
  currencySymbol: string;
  onHoverPoint: (idx: number | null) => void;
}

export function CardPriceHistoryChart({ priceHistory, currencySymbol, onHoverPoint }: PriceChartProps) {
  // Rendering logic for SVG graph
  return (
    <svg className="w-full h-48">
      {/* Chart graphics */}
    </svg>
  );
}
```

### Step 4 — Assembly & Export
Reassemble the main component by composing the new stateless parts. Export via named exports only:

```typescript
// src/components/CardDetails/index.ts
export { CardDetailsModal } from './CardDetailsModal';
```

---

## Validation Steps

1. Run compiler type-check (`npm run lint` / `tsc --noEmit`) to verify no missing props or type mismatches.
2. Check file line counts: ensure no newly created file exceeds 300 lines.
3. Compare visual rendering and behavior against the production baseline to ensure zero regression.

---

## Quality Gates

- [ ] Every new sub-component file is under 300 lines of code.
- [ ] No inline database calls or base64 uploads remain in the UI files.
- [ ] Named exports are used exclusively; no default exports.
- [ ] Unit tests written cover the extracted business logic hooks.
