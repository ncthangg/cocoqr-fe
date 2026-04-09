# React Rules

> **Scope:** React-specific patterns not owned by other files.
> Performance (memoization, rendering, code splitting) → `performance.rules.md`. 
> State tool selection → `state.rules.md`.

## Effects
- Always specify an **explicit, complete dependency array** in `useEffect`
- Never suppress the `exhaustive-deps` lint rule — fix the root cause instead

## UX — Optimistic Updates
 
After a successful API call, **update the UI immediately** — do not wait for a re-fetch to reflect changes.
 
```tsx
const handleDelete = async (id: string) => {
  await deleteUser(id);
  setUsers(prev => prev.filter(u => u.id !== id)); // immediate update
};
```

## Data
- Paging → use `PagingVM`
- No paging → use `Object[]`