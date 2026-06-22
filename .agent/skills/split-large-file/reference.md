# Split Large File — Reference

## Section grouping heuristics

Group files when they share a domain noun in the name:

| Pattern in filename | Target folder |
|---|---|
| `*Tab`, `*Tabs` | `tabs/` or `tabs/<name>/` |
| `*Table`, `*Row` | `sections/<domain>/` or `tabs/<domain>/` |
| `*Dialog`, `*Modal` | `dialogs/` (sibling) or stay as container |
| `*Skeleton`, `*Loading` | `skeletons/` |
| `*Header` | `header/` or `shared/` if tiny |
| `*Section`, `*Block`, `*Info` | `sections/<domain>/` |
| `*utils`, `format*`, `derive*` | `utils/` |
| `*styles`, `*Sx` | `styles/` |
| `*constants`, `*_INFO`, `*_MAX` | `constants/` |

When a tab owns tables + skeletons + helpers, nest under `tabs/<name>/`.

---

## Relative import depth cheat sheet

Given structure:

```txt
dialogs/
├── FeatureDialog.tsx
├── feature-dialog-types.ts
└── feature/
    ├── utils/helper.ts
    ├── shared/Widget.tsx
    └── sections/payment/PaymentSection.tsx
```

| File | Import types | Import utils |
|---|---|---|
| `FeatureDialog.tsx` | `./feature-dialog-types` | `./feature/utils/helper` |
| `feature/utils/helper.ts` | `../../feature-dialog-types` | — |
| `feature/shared/Widget.tsx` | `../../feature-dialog-types` | `../styles/...` |
| `feature/sections/payment/PaymentSection.tsx` | `../../../feature-dialog-types` | `../../utils/helper` |

Rule: count levels from file to `dialogs/`, then one more segment for `feature/`.

---

## What stays in the container

Keep in the main file:

- Main props interface and export
- `useState`, `useReducer`, `useEffect`, `useMemo`, `useCallback` tied to orchestration
- Submit/save/cancel handlers
- Conditional rendering that decides **which section** to show
- Data fetching coordination (or pass fetched data as props to sections)

Move out:

- Individual form fields grouped by domain
- Read-only display blocks
- Table rows
- Format/validation pure functions
- Tooltip/info adornment components
- Static `sx` objects

---

## Props drilling pattern

Extracted sections receive explicit props — avoid hidden context unless already used in the feature:

```tsx
export function PaymentSection(props: {
    draft: OrderDraft
    isDisabled: boolean
    isEditing: boolean
    onStartEdit: () => void
    onCloseEdit: () => void
    onFieldChange: (event: ChangeEvent<HTMLInputElement>) => void
}) { ... }
```

Prefer callback props over importing container state.

---

## Post-split verification commands

```bash
# Typecheck filtered to feature
npx tsc --noEmit 2>&1 | grep -i "feature-name"

# Find stale imports to old monolith internals
rg "from '\./.*old-helper" src/path/to/feature/
```

---

## When NOT to split further

- Component under ~80 lines with no reusable parts
- Single `sx` constant used once
- One-off helper called only in one section (inline or co-locate in same section file)

Stop when the container reads as a table of contents, not a dump of implementation.
