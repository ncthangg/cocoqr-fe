# Modal Rules

> **Scope:** Modal structure, CSS class usage, sizing, and UX behaviour. Design tokens (colors, shadows, z-index) → `ui.rules.md`.

## CSS Classes (from globals.css) 
Always use these pre-built classes — **never re-implement them inline**:
 
| Element | Class | ❌ Never inline |
|---|---|---|
| Overlay | `modal-overlay` | `fixed inset-0 z-[...] bg-black/60 backdrop-blur-sm` |
| Content | `modal-content` | background / border / shadow / animation |
 
## Sizing
Use `max-w-modal-*` tokens only. Raw Tailwind sizes (`max-w-sm`, `max-w-2xl`, etc.) are **forbidden** for modals.
 
| Token | Width | Use case |
|---|---|---|
| `max-w-modal-sm` | 400px | Confirm dialog, alert |
| `max-w-modal-md` | 600px | Single-column form, detail view |
| `max-w-modal-lg` | 800px | Multi-column form |
| `max-w-modal-xl` | 1000px | Complex / tabbed content |
| `max-w-modal-2xl` | 1200px | Editor, preview |
| `max-w-modal-3xl` | 1400px | Dashboard panel |
| `max-w-modal-4xl` | 1600px | Full-screen equivalent |
❌ NEVER: `max-w-sm`, `max-w-2xl`, `max-w-5xl`, etc.

## Structure

```tsx
<div className="modal-overlay" onClick={handleOverlayClick}>
  <div className="modal-content max-w-modal-lg" onClick={e => e.stopPropagation()}>
 
    {/* Header */}
    <div className="flex items-center justify-between border-b p-md">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button aria-label="Close" onClick={onClose}><X className="w-5 h-5" /></button>
    </div>
 
    {/* Body */}
    <div className="p-5 overflow-y-auto custom-scrollbar">
      {children}
    </div>
 
    {/* Footer (optional) */}
    <div className="flex justify-end gap-sm border-t p-md">
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
 
  </div>
</div>
```

## Required Props
Every modal component **must** accept:

```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

## UX Behaviour
- Close on **Escape** key
- Close on **overlay click** (attach handler to overlay div)
- `stopPropagation` on the content div to prevent overlay click from firing inside the modal

## Performance
 
- `return null` early when `!isOpen` — avoids rendering hidden modals
- Wrap overlay click handler in `useCallback`
- Export with `React.memo`