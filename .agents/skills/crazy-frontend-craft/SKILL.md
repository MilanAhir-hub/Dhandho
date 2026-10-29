---
name: crazy-frontend-craft
description: Advanced frontend craftsmanship skill for React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons, keyboard-driven POS workflows, accessible forms, audio/haptic cues, and fluid micro-interactions.
---

# Crazy Frontend Craftsmanship Skill

This skill guides the construction of jaw-dropping, ultra-responsive, highly functional frontend experiences with React 19, TypeScript, and Tailwind CSS v4.

---

## 1. Core Principles of Elite Frontend Craft

1. **Zero-Lag Tactile Feedback**:
   - Every button press should have visible, immediate state transitions (`active:scale-[0.98] transition-transform duration-75`).
   - Loading states must use skeleton screens or subtle shimmer animations, never blank spaces.
   - Cash register / Billing counters should support instant keyboard shortcuts (e.g. `F2` for New Bill, `Enter` to Add Item, `Ctrl+P` to Print).

2. **Typography & Spatial Density**:
   - For POS & Kariyana management, density matters. Store owners need to see 15-20 rows of items without excessive scrolling.
   - Use tabular numbers (`font-mono tabular-nums`) for currency, prices, weights, and stock quantities so columns align perfectly.

3. **Color Intentionality**:
   - Primary: Trusted Navy / Deep Slate (`#0f172a`) or Crisp Modern Emerald (`#059669`) for commerce.
   - Green (`#16a34a`): Cash, Paid, Stock Added, Profit, Lena Hai.
   - Red / Rose (`#e11d48`): Credit/Udhar, Dena Hai, Out of Stock, Refund.
   - Amber (`#d97706`): Low Stock, Pending sync, Warning.

4. **Defensive UI & Error Handling**:
   - Inputs for numbers (price, quantity) must strictly reject invalid inputs gracefully.
   - Quick calculators embedded in input fields (e.g. typing `500/2` auto-calculates `250`).

---

## 2. React 19 + TypeScript Patterns

### Clean Component Typing
```tsx
import React, { useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'kg' | 'g' | 'packet' | 'liter' | 'piece';
}

interface PosBillingProps {
  onCheckout: (items: CartItem[], paymentMode: 'cash' | 'udhar' | 'upi') => Promise<void>;
  isProcessing?: boolean;
}

export const PosBilling: React.FC<PosBillingProps> = ({ onCheckout, isProcessing = false }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  // ...
};
```

### Keyboard Shortcuts Hook
```tsx
import { useEffect } from 'react';

export function useKeyShortcut(key: string, callback: () => void, ctrlKey = false) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (ctrlKey && !e.ctrlKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlKey]);
}
```

---

## 3. Indian Retail & Kirana UX Archetypes

### 1. Dual-Language Product Display
Always display primary name in English + local script (Gujarati/Hindi) where helpful:
```tsx
<div className="flex flex-col">
  <span className="font-semibold text-slate-800">Moong Dal (Yellow)</span>
  <span className="text-xs text-slate-500 font-normal">મગ દાળ / मूंग दाल (1 kg)</span>
</div>
```

### 2. Quick Weight / Unit Picker Pill
```tsx
<div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
  {['250g', '500g', '1kg', '5kg'].map((preset) => (
    <button
      key={preset}
      className="px-2.5 py-1 font-medium rounded-md text-slate-600 hover:text-slate-900 data-[active=true]:bg-white data-[active=true]:shadow-xs"
    >
      {preset}
    </button>
  ))}
</div>
```

### 3. Thermal Print / WhatsApp Share Modal
Direct integration button to send instant bill link to the customer's WhatsApp mobile number.
