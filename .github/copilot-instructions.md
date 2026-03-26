# Copilot Instructions

## Tech Stack
- React + TypeScript (Vite)
- React Router v6 (`react-router-dom`)
- Redux Toolkit + React-Redux
- Tailwind CSS + custom CSS variables
- React Toastify for notifications
- Axios for API requests
- Lucide React for icons
- Shadcn UI-inspired component utilities (`cva`, `cn`, `Slot`)

## Architecture & Naming
- **Pages**: `src/pages/{role}/{feature}/page.tsx` (Default export).
- **Components**: `src/components/UICustoms/` (Reusable business UI).
- **Services**: `src/services/{name}-api.service.ts` (Typed axios wrappers).
- **State**: `src/store/slices/{name}.slice.ts` (Redux Toolkit).
- **Models**: `src/models/*.ts` (Interfaces/Enums).
- **Constants**: `src/constants/` (API and Route constants).

## Core Patterns
- **Auth**: `AuthProvider` + Redux. Guards: `RequireAuth` > `RequireRole`.
- **API**: `axiosPrivate` (auto-token/refresh) or `axiosPublic`.
- **Layout**: `flex-col` structure using `layouts/{Role}Layout.tsx` + `<Outlet />`.
- **State**: Redux for global/auth; `useState` for transient UI state.

## UI Conventions
- **Styling**:
  - CSS variables are defined in `globals.css`
  - Tailwind maps variables via `tailwind.config.js`
  - Always prefer Tailwind classes instead of raw CSS variables
- **Design**: Premium: `rounded-2xl` (containers), `rounded-3xl` (previews), `bg-surface-muted/30` (headers).
- **Icons**: `Lucide React` (always include explicit size: `w-5 h-5`).
- **Feedback**: `react-toastify` for async operation results.
