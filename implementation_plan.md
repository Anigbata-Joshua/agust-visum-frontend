# Implementation Plan — Phase 1: Authentication Architecture & API Integration Setup

Implement the foundation for backend API integration and secure user authentication separation (Double JWT Domain) for both customers (users) and merchants.

## User Review Required

> [!IMPORTANT]
> **Dynamic Interceptors & Token Isolation**:
> We are introducing isolated token keys in `localStorage` (`agt_user_token` for customers and `agt_merchant_token` for merchants). The Axios client in `src/lib/axios.js` will automatically intercept outgoing requests to determine if they target merchant-only routes or modify store configuration, attaching the appropriate headers dynamically.
>
> We will also implement automatic session refresh rotation. If a request returns a `401 Unauthorized` and an access token is expired, the client will attempt to automatically refresh the session via `/api/users/refresh` or `/api/merchants/refresh` respectively, before retrying the failed request.

---

## Open Questions

> [!NOTE]
> None at this moment. The user-modified roadmap already aligned the exact storage key names (`agt_user_token` and `agt_merchant_token`). We will proceed directly with this standard.

---

## Proposed Changes

### Core Network Layer

#### [MODIFY] [axios.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/lib/axios.js)
*   Update the base Axios configuration.
*   Implement request interceptors to scan the path and HTTP method, dynamically injecting either `agt_user_token` or `agt_merchant_token`.
*   Implement response interceptors to listen for `401 Unauthorized` errors. On intercept, trigger the corresponding token refresh endpoints (`/api/users/refresh` for customers, `/api/merchants/refresh` for merchants). If refresh fails or the token is revoked, clear storage and redirect.

---

### API Service Mappings

#### [MODIFY] [auth.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/auth.service.js)
*   Align authentication endpoints with `api.doc`:
    *   **Customer Auth**: `/users/register`, `/users/login`, `/users/refresh`, `/users/logout`, `/users/me`, `/users/me/change-password`
    *   **Merchant Auth**: `/merchants/register`, `/merchants/login`, `/merchants/refresh`, `/merchants/logout`, `/merchants/:id`, `/merchants/me`, `/merchants/me/change-password`

#### [MODIFY] [product.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/product.service.js)
*   Align product management and search routes:
    *   Get Products: `GET /products` (with filters)
    *   Get Detail: `GET /products/:id`
    *   Create Product: `POST /products` (Merchant only)
    *   Update Product: `PATCH /products/:id` (Merchant only)
    *   Delete Product: `DELETE /products/:id` (Merchant only)
    *   Image Upload: `POST /products/:id/images` (Merchant only, max 5, `multipart/form-data`)
    *   Categories: `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`

#### [MODIFY] [cart.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/cart.service.js)
*   Align customer cart management routes:
    *   Get Cart: `GET /carts`
    *   Upsert/Add Item: `POST /carts` (body supports `product_id`, `quantity`, `color_index`, `size_index`)
    *   Remove Item: `DELETE /carts/items/:product_id` (supports query params `color_index` & `size_index`)
    *   Checkout Message: `POST /carts/set-note`
    *   Checkout order creation: `POST /carts/checkout`
    *   Clear Cart: `DELETE /carts`

#### [MODIFY] [social.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/social.service.js)
*   Align likes, reviews, and community threads:
    *   Likes: `GET /api/likes?product_id=:id`, `POST /api/likes`, `DELETE /api/likes/:product_id`
    *   Ratings (Reviews): `GET /api/ratings?product_id=:id`, `POST /api/ratings`, `DELETE /api/ratings/:product_id`
    *   Comments Thread: `GET /api/reviews?product_id=:id`, `POST /api/reviews`, `PATCH /api/reviews/:id`, `DELETE /api/reviews/:id`

#### [NEW] [sales.service.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/services/sales.service.js)
*   Create new sales service targeting merchant revenue endpoints:
    *   Get Sales Tracking: `GET /sales`

---

### Client State Stores

#### [MODIFY] [useAuthStore.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/store/useAuthStore.js)
*   Update state properties to manage loading status, current user profile, error responses, and action callbacks to trigger registration, login, logout, and token setting.

#### [MODIFY] [useMerchantStore.js](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/store/useMerchantStore.js)
*   Update state properties to manage current authenticated merchant, onboarding status, and action callbacks to login, register, and refresh profiles.

---

### Front-End Views

#### [NEW] [ToasterProvider.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/components/ui/ToasterProvider.jsx)
*   Create a provider wrapping Sonner `<Toaster />` to inject at the root layout of the app for application-wide notifications.

#### [MODIFY] [layout.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/app/layout.jsx)
*   Add the `<ToasterProvider />` to wrap the app layout tree.

#### [MODIFY] [auth/page.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/app/(storefront)/auth/page.jsx)
*   Transform this page into a sleek dual-mode Customer Authentication screen (Login / Register toggles) styled with the editorial theme.
*   Integrate client-side validation using `react-hook-form` and `zod`.
*   Connect the sign-in form to the `useAuthStore` actions and display success/error alerts via `sonner`.

#### [MODIFY] [login/page.jsx](file:///c:/Users/USER/Downloads/august-visum-frontend/august-visum-frontend/src/app/(merchant)/merchant/login/page.jsx)
*   Transform this page into a professional Merchant Login & Store Registration screen.
*   Integrate `react-hook-form` validation schemas.
*   Connect submit handlers to `useMerchantStore` and trigger redirecting to `/merchant/dashboard` on success.

---

## Verification Plan

### Automated Tests
*   Run the development build server locally:
    ```bash
    npm run dev
    ```
*   Verify code compilation matches standard and clean of warnings.

### Manual Verification
1.  **Register Customer**: Navigate to `/auth` on the storefront. Submit the customer registration form and verify the network requests are sent to `/api/users/register`. Verify that the cookie/localStorage token `agt_user_token` is saved.
2.  **Login Customer**: Submit the login form with valid credentials. Verify successful authorization, state setting in `useAuthStore`, and redirect to `/`.
3.  **Register/Login Merchant**: Navigate to `/merchant/login`. Perform a merchant registration. Verify endpoint matches `/api/merchants/register` and saves token `agt_merchant_token`. Verify dashboard routing.
4.  **Security Headers & Interceptors**: Inspect request headers on subsequent requests to confirm the correct token domain mapping is applied (merchant requests contain the merchant token, while user requests contain the user token).
