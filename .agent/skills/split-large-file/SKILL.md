---
name: split-large-file
description: Decomposes large React/Next.js files into smaller organized modules (components, sections, utils, styles). Use when the user mentions splitting a file, reducing file size, structure-organizer, or asks to read a file and separate it into smaller organized files with a summarized original entry point.
---

# Split Large File

## User prompt (verbatim)

When the user attaches a file and writes:

> @nome-do-seu-arquivo.**. Por favor, leia este arquivo e separe-o em arquivos menores e organizados, criando componentes ou seções separadas de acordo com as boas práticas. Crie os novos arquivos e deixe o arquivo original mais resumido e de facil leitura para quem for refatorar.

Follow this skill exactly.

---

## Goal

Reduce a monolithic file to a **thin container** that orchestrates state, handlers, and composition. Move UI blocks, helpers, styles, and constants into focused sibling files.

**Do NOT** change business logic or behavior.

---

## Before moving anything

1. Read the entire target file.
2. List natural groupings by filename and responsibility:
   - tabs, tables, dialogs, forms, sections
   - skeletons/loading
   - domain-specific blocks (transport, products, payment, freight, nfe, totals)
   - pure helpers (format, validation, totals, mappers)
   - shared micro-components (headers, hints, adornments)
   - styles (`sx`, styled wrappers)
   - constants (labels, limits, tooltips)
3. Show **old structure → proposed structure** before executing.
4. Only create folders that reduce clutter — avoid micro-folders for single tiny files.

---

## Preferred folder layout

Create a subfolder named after the feature (kebab-case) next to the original file:

```txt
feature-dialog/
├── FeatureDialog.tsx              # container (~30–50% of original size)
├── feature-dialog-types.ts        # types shared across modules
├── feature-dialog-reducer.ts      # if reducer/state machine exists
└── feature-name/
    ├── constants/
    ├── styles/
    ├── utils/
    ├── shared/                    # reusable UI atoms within this feature
    └── sections/                  # domain UI blocks
        ├── products/
        ├── freight/
        └── totals/
```

Use only folders that make sense. Max depth: `feature/sections/products/` — no deeper nesting.

---

## Extraction rules

| Extract to | When |
|---|---|
| `sections/<domain>/` | Self-contained UI block (form section, table row, list, card group) |
| `shared/` | Small reusable pieces used by 2+ sections or container |
| `utils/` | Pure functions: format, mask, validation, totals, mappers |
| `styles/` | Shared `sx` objects and styled wrappers |
| `constants/` | Static strings, limits, tooltip copy |
| `*-types.ts` | Interfaces/types used across modules (keep at dialog root) |

**Preserve component names** — reorganize, do not rename unless required for clarity.

**Keep the public import path** — external consumers must still import from the original file path (e.g. `./dialogs/FeatureDialog`).

---

## Container file responsibilities

The original file becomes:

- Props interface and main export
- State, effects, handlers, submit logic
- Composition of extracted sections
- Wiring callbacks to child components

Move out everything that can stand alone without reading 500+ lines of context.

---

## Import path rules

After moving files, fix all relative imports:

| From | To types at dialog root | To utils/styles in feature subfolder |
|---|---|---|
| `feature/sections/foo/Component.tsx` | `../../../feature-dialog-types` | `../../utils/...` |
| `feature/utils/helper.ts` | `../../feature-dialog-types` | `../constants/...` |
| `feature/shared/Widget.tsx` | `../../feature-dialog-types` | `../styles/...` |
| Container `FeatureDialog.tsx` | `./feature-dialog-types` | `./feature/sections/...` |

Also update: dynamic imports, barrel exports, type-only imports, and any parent that imported internal helpers from the old monolith.

---

## Project conventions (tex-next)

- React 19, Next.js App Router, TypeScript strict
- MUI v7, `TexSvgIcon`, dayjs, `TexUtils`
- `'use client'` only where needed
- Named exports; avoid default except `page.tsx`
- No lodash; no behavior changes during split
- Descriptive variable names — no abbreviations in business logic

---

## Execution checklist

```
Task Progress:
- [ ] Analyze file and propose tree
- [ ] Create new files with extracted code
- [ ] Rewrite container as thin orchestrator
- [ ] Fix all imports (grep for broken paths)
- [ ] Run tsc / linter on touched files
- [ ] Confirm external imports still resolve
- [ ] Remove temporary extraction scripts if any
```

---

## Validation

Refactor is complete only when:

- `tsc --noEmit` passes for touched modules (or no new errors introduced)
- No broken imports remain
- Original public export path unchanged
- Business rules and UI behavior preserved
- Container is readable at a glance (sections composed, not inlined)

---

## Anti-patterns

- Do not move files between unrelated features
- Do not create empty folders or `Component/index.tsx` wrappers for single files
- Do not introduce new dependencies
- Do not refactor unrelated code in the same pass
- Do not leave duplicate logic in container and extracted files

---

## Example outcome

**Before:** `SaleOrderDialog.tsx` (~2888 lines)

**After:**

```txt
dialogs/
├── SaleOrderDialog.tsx          (~1400 lines — container)
├── sale-order-dialog-types.ts
├── sale-order-workspace-reducer.ts
└── sale-order/
    ├── constants/
    ├── styles/
    ├── utils/
    ├── shared/
    └── sections/
        ├── export-payment/
        ├── freight/
        ├── nfe/
        ├── products/
        └── totals/
```

For import depth examples and section grouping patterns, see [reference.md](reference.md).
