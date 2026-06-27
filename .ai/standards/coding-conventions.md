# Coding Conventions — Next.js & Supabase Stack

This document establishes the official coding standards and conventions for the target stack of PokéVault.

---

## File and Folder Naming

- **Folders**: Lowercase, kebab-case (e.g. `src/components/card-details/`).
- **Components**: PascalCase (e.g. `CardItem.tsx`).
- **Hooks**: camelCase starting with `use` (e.g. `useCollection.ts`).
- **Services/Utils**: camelCase (e.g. `pokemonTcg.service.ts`, `imageOptimizer.ts`).
- **Constants/Data**: camelCase or UPPER_SNAKE (e.g. `pokemonData.ts`).
- **Styles**: kebab-case (e.g. `index.css`).

---

## Import Ordering

Group and order imports to maintain code readability:

```typescript
// 1. React & Next.js Core Libraries
import React, { useState, useMemo } from 'react';
import Image from 'next/image';

// 2. Third-Party Dependencies (npm packages)
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LucideIcon, Trash2 } from 'lucide-react';

// 3. Project Utilities, Context, Types, Services
import type { Card, CollectionItem } from '@/types';
import { supabase } from '@/services/supabaseClient';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

// 4. Sub-Components
import { ConfirmationModal } from '@/components/ConfirmationModal';

// 5. CSS / Styles
import './styles.css';
```

---

## TypeScript Guidelines

### 1. Types vs Interfaces
- Use `interface` for data schemas and objects that can be extended:
  ```typescript
  export interface Card {
    id: string;
    name: string;
    // ...
  }
  ```
- Use `type` for unions, intersections, utility helpers, and actions:
  ```typescript
  export type TabId = 'dashboard' | 'collection' | 'wishlist' | 'settings';
  ```

### 2. Strict Type Safety
- **No `any`**: Type maps strictly using proper schemas. If typing is unknown, use `unknown`.
- **No unannotated `as` casts**: Use guards or conditional narrowing instead:
  ```typescript
  // Reject:
  const item = data as CollectionItem;

  // Accept:
  if (!isValidCollectionItem(data)) throw new Error('Invalid format');
  ```

---

## React Component Structure

Every React component must follow this structure:

```tsx
// 1. Props interface definition
export interface CardBadgeProps {
  label: string;
  variant: 'danger' | 'success' | 'warning';
}

// 2. Component definition (named export)
export function CardBadge({ label, variant }: CardBadgeProps) {
  // 3. React Hooks (State, Effects, Memoization)
  const themeClass = useMemo(() => {
    switch (variant) {
      case 'danger': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  }, [variant]);

  // 4. Render output (JSX)
  return (
    <span className={`px-2 py-1 text-xs border rounded-md ${themeClass}`}>
      {label}
    </span>
  );
}
```

---

## TanStack Query Key Structure

Define static query key factories to manage caching, retrieval, and invalidation:

```typescript
export const collectionKeys = {
  all: ['collection'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: { userId: string; binderId?: string }) => [...collectionKeys.lists(), filters] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};
```
