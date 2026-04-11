# Component Rules
 
> **Scope:** Component structure, composition, and UX states. 
> Styling tokens → `ui.rules.md`.
> Performance (memoization, rendering) → `performance.rules.md`.
> State choices → `state.rules.md`.

## Structure
- Use `React.FC`
- `page.tsx` = smart component (state/fetch/route)
- Extract complex blocks to sub-components
- Explicit `<Props>` interface. NEVER `any`

## Composition
- Use `children` / Slot
- Extend HTML attributes when needed

## Styling
- NO inline styles
- Use Tailwind + `cn()` / `cva()`

## Organization
- `components/ui` → generic
- `components/UICustoms` → project

## UX States
- Always handle: loading / empty / error

## Icons
- Use `lucide-react`
- Size: `w-5 h-5`