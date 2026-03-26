---
name: create-modal
description: Blueprint for accessible, animated, and performant UI Modals.
---
# Create Modal Skill

## Purpose
- Deliver standardized popup interfaces.
- Guarantee consistent accessibility and interaction UX.

## Steps
1. **Props**: Enforce explicit `<Props>` (`isOpen`, `onClose`, data payload).
2. **Backdrop**: Implement fixed screen overlay (`bg-black/50`, `fixed inset-0`, `z-50`).
3. **Body**: Centralize modal UI via `flex items-center justify-center`. Use semantic `dialog` tags.
4. **A11y**: 
   - Ensure "click outside backdrop" fires `onClose`.
   - Attach specific `keydown` listener mapping `Escape` key to `onClose`.
5. **Animation**: Utilize Tailwind transitions (`transition-all duration-300 hover:scale-[1.01]`).

## Performance
- **Code Swap**: Wrap heavy/modal chunks using React `lazy` + `Suspense` inside `page.tsx`.
- **Cleanup**: ALWAYS invoke `removeEventListener` inside `useEffect` returns to block memory leaks.
- **Re-renders**: Maintain modal `isOpen` state independently to prevent whole-page layout resets.

## Follow Rules
- **Styling**: Tailwind + `cn()`. Utilize specific tokens `shadow-md`, `rounded-lg`, `bg-bg`. 
- **Icons**: Standardize `X` icon from `lucide-react` for deliberate close actions.
- **UI**: Depend on `components/UICustoms/` for structured layout controls.
