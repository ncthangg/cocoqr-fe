# Performance Rules

> **Scope:** This file owns all performance optimisation patterns. `react.rules.md` and `component.rules.md` defer to this file — do not duplicate these rules there.

## Memoization

| Tool | When to use |
|---|---|
| `React.memo` | Heavy components that receive stable props |
| `useMemo` | Expensive derived values (sorting, filtering, transforms) |
| `useCallback` | Functions passed as props or used in dependency arrays |

❌ Do **not** memoize everything — only apply where there is a measurable render cost.

## Rendering

- No inline objects or functions in JSX — define them outside the return or in `useCallback`/`useMemo`
- Pass **primitive props** when possible instead of object references
- Extract large, stable UI blocks into named sub-components

```tsx
// ❌ Causes re-render every time
<Button onClick={() => handleSave(id)} style={{ color: 'red' }} />

// ✅
const handleSave = useCallback(() => save(id), [id]);
<Button onClick={handleSave} />
```

## Code Splitting

- Use `React.lazy` + `Suspense` for **heavy** components (rich editors, heavy charts, large modals)
- Do **not** lazy-load small or frequently rendered components — the overhead outweighs the saving

```tsx
const HeavyEditor = lazy(() => import('./HeavyEditor'));
```

## State Co-location

- Keep state as close to where it's used as possible
- Avoid lifting state higher than necessary — unnecessary global state causes broad re-renders
- See `state.rules.md` for choosing between `useState`, Redux, and Context

## Input Optimisation

- Debounce all search/filter inputs — use `useDebounce` from `src/hooks/useDebounce.ts`
- See `form.rules.md` for the usage pattern

## Data Fetching

- **Lazy fetch** data for modals and inactive tabs — fetch only when opened
- **Eager fetch** data for main page content — do not lazy-load primary data