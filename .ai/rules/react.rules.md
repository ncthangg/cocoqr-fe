# React Rules

## State
- Redux → global
- Context → DI only
- useState → UI state

## Performance
- useMemo / useCallback when needed
- lazy + Suspense for heavy components

## Rendering
- No inline objects/functions
- Pass primitive props
- Extract sub-components

## Effects
- Strict dependency array

## UX
- Immediate UI update after API success

## Data
- Use `PagingVM` for lists