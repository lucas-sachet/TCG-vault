# Design Tokens — Visual & Motion Guidelines

This document outlines the visual rules, Tailwind v4 theme tokens, and motion timings for the premium vault-dark design system of PokéVault.

---

## Palette (Vault-Dark Theme)

PokéVault uses a high-fidelity dark glassmorphic palette with ambient blurs.

| Token | Hex Value | CSS Custom Property | Usage |
|-------|-----------|----------------------|-------|
| **Vault Black** | `#0f0f1a` | `--color-vault-black` | Main background color |
| **Vault Dark Blue** | `#1b202c` | `--color-vault-dark-blue` | Card and modal container background |
| **Vault Slate** | `#222938` | `--color-vault-slate` | Navigation components, sidebar, borders |
| **Vault Gold** | `#fbbf24` | `--color-vault-gold` | Primary text accents, highlights, levels |
| **Vault Accent** | `#6366f1` | `--color-vault-accent` | Button gradients, neon outlines, interactive elements |
| **Vault Surface** | `#2d3548` | `--color-vault-surface` | Tooltips, badge backgrounds, input fields |

---

## Typography

The typography scale is built around 3 Google Fonts to reflect code structures, metrics, and display details:

- **Display & Headings**: Space Grotesk (`font-sans`)
- **Body Text**: Inter (`font-body`)
- **Metrics, Prices, and Codes**: JetBrains Mono (`font-mono`)

### Scale
- `text-2xs` (10px / 0.625rem): Cert numbers, sub-indicators.
- `text-xs` (12px / 0.75rem): Badges, helpers, small stats.
- `text-sm` (14px / 0.875rem): Standard body copy, inputs.
- `text-base` (16px / 1rem): Primary labels, menu buttons.
- `text-lg` (18px / 1.125rem): Secondary headings, titles.
- `text-xl` (20px / 1.25rem): Drawer page titles.
- `text-2xl` (24px / 1.5rem): Card titles, main headers.
- `text-3xl` (30px / 1.875rem): Metric values, total portfolio values.

---

## Glassmorphism & Elevation

Use semi-transparent backdrops, high-blur ratios, and thin translucent borders to establish structural layers.

- **Standard Cards**: `backdrop-blur-xl bg-[#1b202c]/80 border border-[#2d3548]/50 shadow-lg`
- **Floating Modals**: `backdrop-blur-2xl bg-[#0f0f1a]/95 border border-[#6366f1]/20 shadow-2xl`
- **Ambient Glows**: Use absolute positioned divs with `bg-gradient-to-tr`, opacity `0.1`, and `blur-3xl`.

---

## Motion Timings (Framer Motion)

Animations should feel weightless, responsive, and organic.

### Duration Scale
- **Micro-interactions** (0.15s): Button hovers, toggle switches.
- **Drawer / Sheet Slide-ups** (0.35s): Modal slides, sidebar openings (using spring physics).
- **Page Transitions** (0.4s): Slide-and-fade layouts.
- **Card Tilts**: Perspective transitions handled on mouse-move (no transition delay), returning to default with spring `0.5s`, damping `20`, stiffness `150`.

### CSS Card Tilt Effect Settings
- **Perspective**: `1000px`
- **Tilt Angle**: Max `15deg`
- **Sheen Blend Mode**: `mix-blend-color-dodge`
- **Holographic Radial Gradient**: `radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 60%)`
