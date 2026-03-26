# Performance Rules

## Memoization
- `memo` → heavy components only
- `useMemo` → expensive derived values
- `useCallback` → function props / deps

## Rendering
- No inline objects/functions
- Pass primitives instead of objects
- Extract sub-components

## Code Splitting
- Use `lazy` + `Suspense`
- Split heavy routes / modals

## State
- Co-locate state locally

## Input Optimization
- Debounce search via `useEffect + setTimeout`