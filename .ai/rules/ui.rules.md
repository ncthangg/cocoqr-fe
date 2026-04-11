# UI Rules

> **Scope:** This file is the **single source of truth** for design tokens, CSS utility classes, icons, and styling approach. All other rule files defer here for visual details.
 
## Core
- ALL styling **must** use tokens from `tailwind.config.js` and CSS variables from `globals.css`.
- NEVER use raw/default Tailwind values when a project token exists.

## Design Tokens (from `tailwind.config.js`)

### Colors — semantic tokens only
| Role | Token |
|---|---|
| Page background | `bg-bg` |
| Card / surface | `bg-surface`, `bg-surface-muted`, `bg-surface-elevated` |
| Borders | `border-border`, `border-border-strong`, `border-border-subtle` |
| Primary text | `text-foreground` |
| Secondary text | `text-foreground-secondary`, `text-foreground-muted` |
| Primary action | `bg-primary` / `text-primary-foreground` |
| Status | `text-success`, `text-warning`, `text-danger` |

❌ Never use raw colors like `bg-zinc-900` or `text-[#fff]` for primary UI.

### Spacing
`2xs`=2px, `xs`=4px, `sm`=8px, `md`=16px, `lg`=24px, `xl`=32px, `2xl`=48px

### Border Radius
`rounded-sm`=6px, `rounded-md`=10px, `rounded-lg`=14px, `rounded-xl`=18px, `rounded-2xl`=24px, `rounded-3xl`=32px

### Shadow
`shadow-sm` (cards), `shadow-md` (dropdowns), `shadow-lg` (modals)

### Font Size
`text-xs`=10px, `text-sm`=12px, `text-base`=14px, `text-lg`=16px, `text-xl`=20px, `text-2xl`=24px, `text-3xl`=30px

### Modal Widths 

- Use `max-w-modal-*` tokens only — **never** `max-w-sm`, `max-w-2xl`, etc. for modals. 
`max-w-modal-sm`=400, `md`=600, `lg`=800, `xl`=1000, `2xl`=1200, `3xl`=1400, `4xl`=1600

### Z-Index

`z-dropdown`=40, `z-modal`=50, `z-toast`=60

### Fonts

`font-primary` (Inter), `font-secondary` (Roboto)

## CSS Classes (from `globals.css`)

- Modal: `modal-overlay`, `modal-content` — NEVER inline these
- Layout: `card`, `page-container`
- Buttons: `btn`, `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`
- Form: `input`
- Table: `table-wrapper`, `table`

## Styling Approach

- Use `cn()` or `twMerge` for conditional / merged class strings
- No inline `style={}` — no hard-coded hex values
- Allowed arbitrary values: `calc()`, `var(--)`, grid templates, transforms, opacity modifiers (`bg-primary/10`)
- Forbidden arbitrary values: `mt-[17px]`, `bg-[#fff]`, `text-[13px]`, `shadow-[...]`, `z-[100]`
 
## Icons

`lucide-react` — sizes: `w-4 h-4` (inline), `w-5 h-5` (prominent)

## Accessibility

- `<label>` must be paired with `htmlFor` pointing to the input `id`
- Icon-only buttons must have `aria-label`
- Modal containers must have `aria-modal="true"`