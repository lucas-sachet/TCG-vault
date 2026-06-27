# Prompt Template — Component Generation

You are an expert Frontend Engineer assistant. Generate a React component for the PokéVault platform based on the following specifications.

## Instructions & Coding Standards

1. **Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide React icons, and Motion (Framer Motion).
2. **File Size Constraint**: Keep the component focused and under 300 lines. If it grows larger, break it down.
3. **No Default Exports**: Use named exports exclusively.
4. **TypeScript Safety**: Strict mode TypeScript. Do not use `any` types. Provide explicit types for all props, states, and return types.
5. **Styling & Design System**: 
   - Follow the vault-dark theme system.
   - Use curated color palettes (e.g. `bg-[#1b202c]` for cards, `bg-[#0f0f1a]` for backgrounds).
   - Incorporate subtle borders and glassmorphic blurs (`backdrop-blur-xl`).
   - Use Lucide React icons for all UI iconography.
6. **Mobile First**: Ensure touch targets are at least 44px on mobile layouts.
7. **Animation**: Use Motion (`motion.div`, etc.) for smooth UI entry transitions and hover effects.

---

## Component Specification Request

- **Component Name**: [Name, e.g. CardPriceAlertRow]
- **Description**: [What it does]
- **Props Interface**: [Prop names, types, description]
- **State Details**: [What state it manages, if any]
- **Interactivity Required**: [e.g. Click details, slider, hover effect]
- **Target Location**: [e.g. src/components/CardDetails/CardPriceAlertRow.tsx]

---

## Response Format

Provide the complete file contents for the new component with no placeholder code. Include all imports, Typescript interfaces, styling classes, and animations.
