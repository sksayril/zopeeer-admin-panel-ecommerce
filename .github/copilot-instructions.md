# Copilot Instructions for AI Coding Agents

## Project Overview
- **React + TypeScript admin panel** for e-commerce management
- **JWT authentication** with persistent login and secure logout
- **Vendor and category management** with hierarchical data and status indicators
- **Modern UI/UX** using Tailwind CSS, React Hot Toast, and modular components
- **Centralized API service** (`src/services/api.ts`) with Axios interceptors for token management and error handling
- **Context-based state management** (`src/contexts/AuthContext.tsx`) for authentication and profile

## Architecture & Data Flow
- **App entry:** `src/main.tsx` → `src/App.tsx`
- **Layout:** `src/components/AdminLayout.tsx` wraps all admin pages
- **Navigation:** `src/components/Sidebar.tsx` for menu and profile
- **Pages:** Located in `src/components/pages/` (e.g., `Vendors.tsx`, `Categories.tsx`, `Profile.tsx`)
- **Forms:** Located in `src/components/forms/` (e.g., `CreateVendorForm.tsx`, `CreateCategoryForm.tsx`)
- **API calls:** Use `api.ts` for all HTTP requests; tokens are injected automatically
- **Authentication:** Managed via `AuthContext.tsx`, with login/logout, token storage, and profile refresh

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Lint:** `npm run lint`
- **Typecheck:** `npm run typecheck`
- **Preview build:** `npm run preview`
- **Demo credentials:** `admin@example.com` / `admin123`

## Project-Specific Patterns
- **API requests:** Always use the centralized `api.ts` service; do not use `fetch` directly
- **Token management:** Tokens are stored in `localStorage` and injected via Axios interceptors
- **Error handling:** Use React Hot Toast for user feedback; network/auth errors redirect to login
- **Loading states:** All async actions should show loading indicators and prevent duplicate submissions
- **Form validation:** Use real-time validation and password strength indicators in forms
- **Status indicators:** Use `isActive`, `isVerified` fields for vendors/categories; display visually in UI
- **Modals:** Forms for creating vendors/categories are shown in modals for seamless UX
- **Hierarchical categories:** Support nested subcategories; display as expandable/collapsible trees

## Integration Points
- **API base URL:** `https://7cvccltb-5000.inc1.devtunnels.ms/api`
- **Endpoints:** See `README.md` for full endpoint documentation and example payloads
- **External dependencies:**
  - `axios` for HTTP
  - `react-hot-toast` for notifications
  - `tailwindcss` for styling
  - `eslint`, `prettier` for code quality

## Key Files & Directories
- `src/services/api.ts` — API client and interceptors
- `src/contexts/AuthContext.tsx` — Auth state and logic
- `src/components/` — UI components, forms, pages
- `src/components/pages/` — Main admin pages
- `src/components/forms/` — Form components
- `src/components/AdminLayout.tsx` — Layout wrapper
- `src/components/Sidebar.tsx` — Navigation

## Example Patterns
- **API usage:**
  ```ts
  import api from '../services/api';
  const res = await api.get('/admin/vendors');
  ```
- **Auth context usage:**
  ```tsx
  const { admin, login, logout } = useContext(AuthContext);
  ```
- **Loading state:**
  ```tsx
  const [loading, setLoading] = useState(false);
  // ...
  {loading ? <Spinner /> : <Button />}
  ```

---

If any section is unclear or missing, please provide feedback to improve these instructions.