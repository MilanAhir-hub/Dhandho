---
name: tailwind-v4-mastery
description: Comprehensive guide and best practices for Tailwind CSS v4. Covers CSS-first configuration, @import "tailwindcss", @theme tokens, @utility, @variant, Vite integration via @tailwindcss/vite, container queries, and retail/dashboard design patterns.
---

# Tailwind CSS v4 Mastery Skill

Tailwind CSS v4 is a ground-up rewrite focused on performance, native modern CSS features, and a **CSS-first configuration engine** that eliminates `tailwind.config.js`.

---

## 1. Core Architecture in Tailwind v4

### No More `tailwind.config.js`
Tailwind v4 is configured entirely inside CSS files using standard CSS directives:
- `@import "tailwindcss";` — loads all base styles, components, and utilities in one line.
- `@theme` — customizes design tokens (colors, fonts, breakpoints, spacing, animations).
- `@utility` — defines custom single-purpose utility classes.
- `@variant` — defines custom variants (e.g. `@variant pointer-fine (@media (pointer: fine));`).

### Vite Setup (`@tailwindcss/vite`)
Instead of PostCSS, Tailwind v4 uses a dedicated Lightning CSS-powered Vite plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### Entry Stylesheet (`src/index.css`)
```css
@import "tailwindcss";

@theme {
  /* Brand Palettes */
  --color-brand-primary: #16a34a; /* Indian Green / Khata Success */
  --color-brand-danger: #dc2626;  /* Udhar Alert / Red */
  --color-brand-accent: #f59e0b;  /* Warm Mustard / Kirana Gold */
  
  /* Fonts */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Custom Radius & Shadows */
  --radius-pos: 12px;
  --shadow-pos: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
}
```

---

## 2. Key Tailwind v4 Features & Syntax Changes

### 1. The `@theme` Directive
Replace `tailwind.config.js -> theme.extend` with `@theme` directly in CSS:
```css
@theme {
  --color-dhandho-cash: #059669;
  --color-dhandho-credit: #e11d48;
  --color-dhandho-surface: #f8fafc;
  --color-dhandho-card: #ffffff;
}
```
Now use: `bg-dhandho-cash`, `text-dhandho-credit`, `bg-dhandho-surface`.

### 2. Built-in Container Queries
Container queries are native in v4 without extra plugins:
```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-3">
    <!-- Responsive inside card/sidebar -->
  </div>
</div>
```

### 3. Dynamic Values & Modern Color Modifiers
Color opacity can be set with slash syntax or arbitrary values:
- `bg-emerald-500/15` (15% opacity)
- `border-rose-600/30`
- `color-mix` is supported under the hood.

### 4. Custom Utility Creation with `@utility`
```css
@utility pos-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  transition: all 0.15s ease-in-out;
  user-select: none;
}
```

---

## 3. Kirana / POS & Dashboard Tailwind UI Patterns

### High-Speed POS Counter Card
```tsx
<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aata 10kg</span>
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">In Stock: 14</span>
  </div>
  <div className="mt-2 flex items-baseline justify-between">
    <span className="text-2xl font-bold tracking-tight text-slate-900">₹420</span>
    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 active:scale-95 transition-all">
      + Add to Bill
    </button>
  </div>
</div>
```

### Udhar / Khata Balance Badges
```tsx
{/* Money to Receive (Lena Hai) */}
<div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
  <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-700">
    <ArrowDownLeft className="h-5 w-5" />
  </div>
  <div>
    <p className="text-xs font-medium text-emerald-800">Aapko Milega (To Receive)</p>
    <p className="text-lg font-bold text-emerald-700">₹14,250</p>
  </div>
</div>

{/* Money to Pay (Dena Hai) */}
<div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3">
  <div className="rounded-full bg-rose-500/20 p-2 text-rose-700">
    <ArrowUpRight className="h-5 w-5" />
  </div>
  <div>
    <p className="text-xs font-medium text-rose-800">Aapko Dena Hai (To Pay)</p>
    <p className="text-lg font-bold text-rose-700">₹5,100</p>
  </div>
</div>
```
