---
name: create-table
description: Blueprint for data-rich UI tables with sorting, searching, and pagination.
---
# Create Table Skill

## Purpose
- Standardize data presentation layers.
- Unify pagination, search, and sorting mechanisms.

## Steps
1. **State**: Init `PagingVM` local object (`pageNumber`, `pageSize`, `totalItems`).
2. **Fetch**: Call `*-api.service.ts` triggering off `pageNumber`, `search`, or `sort` changes.
3. **UX States**: Conditionally render explicit `loading` (Skeletons) or `empty` constraints (Fallback UI).
4. **Assembly**: Compose using `DataTable`, `TableToolbar`, and `TablePagination` from `components/UICustoms/`.
5. **Action**: Ensure list cells invoke separate handlers strictly typed via models.

## Performance
- **Debounce**: Throttle `search` keystrokes via `useDebounce` hook from `src/hooks/useDebounce.ts` before calling API.
- **Memoize**: Store column mappings natively in `useMemo`. Lock fetch functions with `useCallback`.
- **Isolation**: Trigger list re-renders strictly on pagination/sort changes, avoiding parent layout shifts.

## Follow Rules
- **Types**: Strictly bind collections via `PagingVM<EntityRes>`.
- **Styling**: Tailwind + `cn()`.
- **Icons**: Explicit `lucide-react` dimensions (`w-4 h-4`).
