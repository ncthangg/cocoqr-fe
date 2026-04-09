# Form Rules

> **Scope:** Form library, field structure, UX behaviour, and accessibility. 
> Toast library → `project.rules.md`.
> Debounce hook usage is defined here; the hook lives in `src/hooks/useDebounce.ts`.

## Libraries
- **`react-hook-form`** — form state & submission
- **`zod`** — schema validation (pair with `zodResolver`)

## Structure
- Every field must follow: **Label → Input → Error message**
- Use the shared `FormField` component — do not build ad-hoc field wrappers.
 
```tsx
<FormField name="email" label="Email" error={errors.email?.message}>
  <input className="input" {...register('email')} />
</FormField>
```

## UX Behaviour
- Disable the submit button while the request is loading
- Show a `toast.error(...)` on API failure
- Show a `toast.success(...)` on successful submission

## Input Optimisation
- Prefer **uncontrolled inputs** (react-hook-form default) — use controlled only when the UI must react to every keystroke
- For search inputs, debounce with `useDebounce` from `src/hooks/useDebounce.ts`
 
```tsx
const debouncedSearch = useDebounce(searchValue, 400);
```

## Accessibility 
- Every `<input>` must have a paired `<label htmlFor="...">` 
- Every `<input>` must include a `name` attribute