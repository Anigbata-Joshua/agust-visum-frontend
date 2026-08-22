# Phase 1 Walkthrough — Authentication Architecture & API Integration

We have completed the implementation of **Phase 1** of the production roadmap. The frontend network layer is now securely aligned with the backend's domain-separated endpoints, and the user/merchant authentication views are live.

---

## 🛠️ Changes Implemented

### 1. Network Layer & Token Isolation (`src/lib/axios.js`)
*   Refactored the Axios client instance with custom request and response interceptors.
*   **Request Interceptor**: Scans request targets and dynamically injects `Authorization` bearer headers matching either customer (`agt_user_token`) or merchant (`agt_merchant_token`) local session storage.
*   **Response Interceptor**: Listens for `401 Unauthorized` responses and silently performs token rotation by dispatching refresh queries (`/api/users/refresh` or `/api/merchants/refresh`). Triggers custom logout events on session expiration.

### 2. Services Backend Realignment (`src/services/`)
*   **[auth.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/auth.service.js)**: Aligned all routes (register, login, refresh, logout, profile update, change password) separately for customers and merchants.
*   **[product.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/product.service.js)**: Configured endpoint updates for creating, updating, removing products, product-linked multi-image uploads (`POST /products/:id/images`), and full categories organizer management.
*   **[cart.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/cart.service.js)**: Refactored queries to target `/carts` endpoints, supporting checkout notes, clear operations, and item quantity increments.
*   **[social.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/social.service.js)**: Realigned review discussions and product rating score queries.
*   **[sales.service.js (NEW)](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/sales.service.js)**: Created new service pointing to `/sales` analytics endpoint.

### 3. State Management Stores (`src/store/`)
*   **[useAuthStore.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/store/useAuthStore.js)**: Added full customer auth handlers for login/register/logout/update, incorporating localStorage synchronization and error clearing.
*   **[useMerchantStore.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/store/useMerchantStore.js)**: Added full merchant auth handlers, dashboard routing triggers, and storage sync.

### 4. UI Notifications (`src/app/layout.jsx`)
*   **[ToasterProvider.jsx (NEW)](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/components/ui/ToasterProvider.jsx)**: Integrated `sonner` notifications customized to match the editorial blocky theme.
*   Injected `<ToasterProvider />` globally inside the root `layout.jsx`.

### 5. Authentication Views
*   **[auth/page.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/app/(storefront)/auth/page.jsx)**: Built an editorial dual-mode sign-in / registration page for customers, styled in soft paper cream, with error popups and form validation.
*   **[merchant/login/page.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/app/(merchant)/merchant/login/page.jsx)**: Built a brand login / onboarding portal for merchants.

---

## 🧪 Validation & Compilation Results

### Optimized Production Build Check
We ran a test compile check (`npm run build`) locally to confirm codebase stability.
*   **Result**: Compiled successfully in **38.9s**.
*   **Typecheck / Linting**: Checked and validated page data for all **14** generated static pages with no errors.

```
Creating an optimized production build ...
✓ Compiled successfully in 38.9s
Linting and checking validity of types ...
Collecting page data ...
✓ Generating static pages (14/14)
Finalizing page optimization ...
Collecting build traces ...
```
All routes (`/auth` and `/merchant/login`) exported safely as static client bundles.
