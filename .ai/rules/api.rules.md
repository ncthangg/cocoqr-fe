# API Rules

> **Scope:** Service file structure, HTTP client usage, error handling, and method naming.
> Folder/naming conventions → `project.rules.md`.

## Service File Structure

- One file per domain: `<domain>-api.service.ts`
- All methods return `Promise<T>` — never `any`
- Location: `src/services/`

```ts
// user-api.service.ts
export const getUserPaging = (): Promise<PagingVm<UserRes>> => { ... }
export const getUserList = (): Promise<UserRes[]> => { ... }
export const getUserById = (id: string): Promise<UserRes> => { ... }
export const postUser    = (body: UserReq): Promise<UserRes> => { ... }
export const putUser     = (id: string, body: UserReq): Promise<UserRes> => { ... }
export const deleteUser  = (id: string): Promise<void> => { ... }
```

---

## HTTP Clients

| Client | Use case |
|---|---|
| `axiosPrivate` | Authenticated requests (includes token/interceptor) |
| `axiosPublic` | Public endpoints (no auth) |

---

## Error Handling

- Wrap every call in `try/catch`
- Show a `toast.error(...)` on failure — never silently swallow errors

```ts
try {
  const data = await getUserById(id);
  return data;
} catch (error) {
  toast.error('Failed to load user.');
  throw error;
}
```

---

## Method Naming

| Action | Name |
|---|---|
| Fetch list | `getAll` |
| Fetch single | `getById` / `get<Entity>ById` |
| Create | `post` / `post<Entity>` |
| Update | `put` / `put<Entity>` |
| Remove | `delete` / `delete<Entity>` |