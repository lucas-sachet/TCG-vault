# Engineering Standards — Next.js & Supabase Stack

This document establishes the official coding standards, code structures, testing requirements, and styling guidelines for the PokéVault platform.

---

## 1. TypeScript Standards

### Strict Type Checking
TypeScript strict mode is required. Unsafe escapes and compiler overrides are prohibited.
- **No `any`**: All parameters, responses, and states must use explicit types. If a type is unknown (e.g., dynamic error payloads), use `unknown`.
- **No type assertions**: Avoid `as` casts. Use type guards, type narrowing, or type discriminators instead.
- **Null safety**: Do not use non-null assertions (`!`). Use optional chaining (`?.`) or add explicit check statements:
  ```typescript
  // Reject:
  const card = cards.find(c => c.id === id)!;

  // Accept:
  const card = cards.find(c => c.id === id);
  if (!card) throw new Error(`Card with ID ${id} not found`);
  ```

---

## 2. React & Next.js Standards

### Component Size Limits
Keep components focused and modular:
- **Maximum Line Count**: Component files must not exceed 300 lines of code. If a component file exceeds this limit, decompose it into smaller files or extract business logic into custom hooks.
- **Named Exports**: Use named exports exclusively (`export function Component()`) to simplify IDE searches and auto-imports. Do not use default exports.

### Server Components vs Client Components
By default, all components are Server Components.
- Use `'use client'` only when incorporating React state (`useState`, `useReducer`), effects (`useEffect`), context, or browser-only APIs.
- Keep Client Components small and leaf-level.

---

## 3. Data Fetching & Caching (TanStack Query)

- **No raw useEffect fetches**: Do not use `useState` + `useEffect` to fetch data from APIs or Supabase. All async queries must use TanStack Query.
- **Queries & Mutations**:
  - Read operations: Use `useQuery` with structured keys.
  - Write operations: Use `useMutation` with explicit cache invalidations or optimistic updates.
- **Query Keys**: Use a structured query key factory:
  ```typescript
  export const queryKeys = {
    collection: (userId: string) => ['collection', userId] as const,
    wishlist: (userId: string) => ['wishlist', userId] as const,
  };
  ```

---

## 4. Supabase & Database Standards

- **No Hardcoded Keys**: API endpoints and credentials must resolve from environment variables on the server. Never expose client keys in source files.
- **Typed Client**: Always instantiate the Supabase client using the generated Database types:
  ```typescript
  import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
  import type { Database } from '@/types/database';

  export const supabase = createClientComponentClient<Database>();
  ```
- **RLS Policies**: Row-Level Security must be active on all tables. Queries must use the user's JWT ID (`auth.uid()`) to validate access.

---

## 5. Testing Standards

- **Test Framework**: Use Vitest for unit testing and React Testing Library for component rendering tests.
- **E2E Testing**: Use Playwright for E2E user path flows (e.g. auth, card creation).
- **Guidelines**:
  - Run checks before submitting a PR.
  - Mock third-party APIs and Supabase network traffic in unit tests.
  - Maintain a test file location adjacent to the file under test (e.g., `CardItem.test.tsx` adjacent to `CardItem.tsx`).
