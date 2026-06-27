# Review Code — AI Code Quality Gates

## Purpose

Enforces strict review protocols for all PRs and codebase modifications. Defines quality gates for TypeScript strict mode compliance, React/Next.js component guidelines, Supabase security checks, and client-side performance audits.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Code Diff | ✅ | The changes made in the code |
| Target Stack | ✅ | Next.js 15, TypeScript 5.8, Supabase, TanStack Query, Tailwind v4 |

---

## Outputs

A review markdown summary detailing:
1. **Approval Status** (Approve / Request Changes)
2. **TypeScript Audit** (No `any` or invalid casts)
3. **React/Next.js Audit** (Server component utilization, component line count constraints)
4. **Supabase & Security Audit** (RLS policies, key leakage checks)
5. **Performance & Vitals Audit** (O(n²) lookups, virtualization checks)

---

## Workflow

Reviewers (AI or human) must run the following checks on the proposed diff:

### Step 1 — Check TypeScript Strict Compliance
- Ensure there are no `any` annotations.
- Verify that generic types are correctly constrained.
- Ensure that non-null assertions `!` are not used unless backed by strict checks.
- Do not allow `as` type-casts without written architectural comments explaining the necessity.

### Step 2 — Check Component Line Count & Server Rules
- Every React component file must contain ≤ 300 lines of code. If it exceeds 300 lines, request decomposition into smaller sub-components.
- Ensure all pages are Server Components by default. Verify `'use client'` is only used when React state (`useState`, `useReducer`), effects (`useEffect`), context, or browser-only APIs are absolutely required.

### Step 3 — Supabase and Security Checks
- Verify no anonymous/secret keys or service keys are hardcoded in the codebase.
- Check that all Supabase database calls go through the typed database client `Database` from generated schema definitions.
- Ensure RLS policies are active on the affected tables.

### Step 4 — Check Performance & Vitals
- Inspect all rendering loops. If there is a `.find()` or `.filter()` of a collection list inside another loop or rendering map, reject and request a `Map`/`Set` lookup cache instead.
- If rendering a list longer than 50 items, verify it uses `@tanstack/virtual` for virtualization.
- Ensure state updates are debounced (like searches) to avoid unnecessary re-renders.

---

## Quality Gates

- [ ] Zero build warnings or type errors during `tsc --noEmit`.
- [ ] No `any` type tags present.
- [ ] No component files above 300 lines in the diff.
- [ ] Direct database reads secured behind RLS or backend handlers.
