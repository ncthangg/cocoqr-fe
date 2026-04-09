# Table Implementation Rules

> **Scope:** Implementation of the custom Table component suite at `src/components/UICustoms/Table`. 
> For data shapes (`PagingVM`) → `react.rules.md`.

## Layout
Standard structure to ensure **sticky header** and internal scrolling:
- Parent Container: `flex flex-col min-h-0 overflow-hidden`.
- **TableToolbar**: (Optional) For Search Input and "Add New" buttons.
- **DataTable**: (Required) Must be wrapped in a `div` with `min-h-0 flex-1 overflow-hidden` to allow the body to scroll.
- **TablePagination**: (Optional) Only used for server-side paging.

```tsx
<div className="flex flex-col min-h-0 overflow-hidden border rounded-lg bg-bg shadow-sm">
  <div className="shrink-0 border-b"><TableToolbar ... /></div>
  <div className="flex-1 min-h-0 overflow-hidden"><DataTable ... /></div>
  {/* Only for paged data */}
  <div className="shrink-0 border-t"><TablePagination ... /></div>
</div>
```

## Columns
Define using `useMemo<Column<T>[]>` to optimize rendering:
- `accessor`: Function to retrieve raw data (e.g., `(item) => item.id`).
- `cell`: Custom render function (Badge, Action buttons, Images).
- `width`, `minWidth`, `maxWidth`: CSS width values (e.g., `"120px"`, `"15%"`).
- `truncate`: Clips long text with an ellipsis (requires `width`/`maxWidth`).
- `sortable` & `filterable`: Enables sorting/filtering in the header.

## State
Different patterns based on the Table type:

**1. No Paging (Small dataset/All in memory):**
- Use a simple array state: `const [data, setData] = useState<T[]>([])`.
- Fetch all data at once via `getAll()`.
- Do not pass `pageNumber` or `pageSize` to `DataTable`.

**2. With Paging (Server-side):**
- Manage state via `PagingVM<T>` object: `const [paging, setPaging] = useState<PagingVM<T>>({ list: [], ... })`.
- Always pass `pageNumber={paging.pageNumber}` and `pageSize={paging.pageSize}` to `DataTable` to ensure correct Index/STT calculation.
- API calls must include page/size and update both the `list` and `totalItems`.

## UI
- **Sticky Header**: Automatically enabled whenfollowing the standard Layout structure.
- **Index (STT)**: Set `showIndex={true}` on `DataTable`.
- **Loading & Empty State**: Centrally handled within `DataTable` via the `loading` prop.
- **Row Interaction**:
  - `onRowClick`: Event triggered when clicking a row.
  - `selectedRowPredicate`: Logic to highlight the currently active/selected row.
- **Responsive**: `DataTable` provides horizontal scrolling for containers smaller than the table; `TablePagination` simplifies its UI on mobile.