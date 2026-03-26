---
name: create-page
description: Guide and steps for creating standard React feature pages.
---
# Create Page Skill

## Purpose
- Blueprint for generating fully compliant feature pages.
- Ensure consistent state, fetch, layout, and UX.

## Steps
1. **Scaffold**: Create `src/pages/<role>/<feature>/page.tsx` (`React.FC`).
2. **Data**: Fetch via `*-api.service.ts` (`Promise<T>`). No direct Axios.
3. **State**: `useState` for UI. Redux `*.slice.ts` for global. Handle lists via `PagingVM`.
4. **UX**: Explicitly manage `loading`, `empty`, `error` render states. Use `react-toastify` for async feedback.
5. **UI**: Assemble via sub-components (`components/ui/`, `components/UICustoms/`). Extract heavy logic blocks (e.g., Modals).

## Performance
- Code-split heavy routes with `lazy` + `Suspense`.
- NO inline objects/functions in render.
- Debounce user inputs (`useEffect` + `setTimeout`).
- Enforce strict `useEffect` dependencies.

## Follow Rules
- **Types**: Explicit `<Props>`. Use `src/models/*.model.ts`. NEVER `any`.
- **Styling**: Strictly Tailwind + `cn()`. NO inline styles.
- **Icons**: Use `lucide-react` (`w-5 h-5`).
