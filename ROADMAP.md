# AUGUST VISUM — Production Roadmap & API Alignment Document

This document outlines the complete architectural roadmap for the **August Visum** storefront and merchant application. It details the state of the current codebase, necessary dependencies, integration plans for the Node.js/Express/MongoDB backend (as defined in `api.doc`), and a structured, phase-by-phase implementation plan.

---

## 📖 Project Overview
**August Visum ("Forever Classics")** is a premium, editorial-driven streetwear storefront combined with a robust merchant administrative portal. The styling draws inspiration from print magazines and luxury fashion lookbooks:
*   **Palette:** Warm cream/paper (`#EAE3D3`), rich charcoal ink (`#17140F`), muted brick red (`#9A2E1F`), deep olive (`#4B4B37`), and stone accent (`#B9A889`).
*   **Typography:** Editorial serif titles (**Fraunces**), condensed Oswald labels (**Oswald**), and geometric body text (**Inter**).
*   **Architecture:** Next.js 15 App Router divided into two main domain-separated layout groups:
    1.  `(storefront)`: Customer-facing catalog, editorial lookbook, product details, cart, and checkout flow.
    2.  `(merchant)`: Dashboard, inventory controls, categories manager, sales charts, and media uploads.

---

## 🛠️ Dependency Analysis

### 1. Existing Dependencies (Already in `package.json`)
*   `next` (^15.0.0) — React framework.
*   `react` & `react-dom` (^19.0.0) — UI library.
*   `axios` (^1.7.7) — HTTP client.
*   `zustand` (^4.5.5) — Simple, lightweight client-side state management.
*   `clsx` & `tailwind-merge` — Utilities to dynamically merge Tailwind classes.
*   `tailwindcss` (^3.4.13), `postcss`, `autoprefixer` — Styling engine.

### 2. Proposed Necessary Dependencies
To achieve production readiness, the following libraries **MUST** be installed:

| Package Name | Recommended Version | Purpose & Rationale |
| :--- | :--- | :--- |
| **`lucide-react`** | `^0.450.0` | Provides high-quality, lightweight SVG icons for navigation, cart, buttons, and dashboard actions. |
| **`framer-motion`** | `^11.11.0` | Essential for premium, smooth micro-animations (e.g., sliding cart drawer, modal fade-ins, and intersection-based fade-up reveal effects). |
| **`react-hook-form`** | `^7.53.0` | Manages form state, validation triggers, and error messages for complex auth, profile edit, product create, and category forms. |
| **`zod`** | `^3.23.8` | Implements runtime client-side schema validation matching the backend's Zod input schemas, preventing invalid submissions. |
| **`sonner`** | `^1.5.0` | Renders premium, non-blocking toast notifications (e.g., "Added to Cart," "Profile updated successfully," or auth errors). |
| **`recharts`** | `^2.12.7` | Standard library for the merchant sales dashboard to display itemized revenue, trends, and sales lines. |
| **`date-fns`** | `^4.1.0` | Provides date utilities to format review timestamps and sales history logs on the dashboard. |

---

## 🔒 Authentication & Double Token Domain Separation

The backend implements **Double JWT Domain Separation** (separate sign-in structures and secrets for customers vs. merchants) to prevent token cross-replay or unauthorized access.

### Client-Side Security Strategy
1.  **Storage Isolation**:
    *   Customer Tokens: Stored as `agt_user_token` (access token) and `agt_user_refresh` (if using client-managed rotation).
    *   Merchant Tokens: Stored as `agt_merchant_token` and `agt_merchant_refresh`.
2.  **Request Interception**:
    Configure `/src/lib/axios.js` to dynamically attach the correct header based on the target URL path:
    ```javascript
    api.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const isMerchantRoute = config.url.startsWith("/merchants") || 
                                config.url.startsWith("/products") && ["post", "patch", "delete"].includes(config.method) || 
                                config.url.startsWith("/categories") && ["post", "patch", "delete"].includes(config.method) ||
                                config.url.startsWith("/sales");
        
        const tokenKey = isMerchantRoute ? "agt_merchant_token" : "agt_user_token";
        const token = localStorage.getItem(tokenKey);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
    ```
3.  **Automatic Session Revocation**:
    If a `401 Unauthorized` response is received, the interceptor must automatically clear the corresponding local storage token, update the corresponding Zustand store (`useAuthStore` or `useMerchantStore`), and redirect the user/merchant to the appropriate login page.

---

## 🗺️ Backend Endpoints & Frontend Services Mapping

The current placeholders in `src/services/` must be aligned with the actual endpoints defined in `api.doc`:

### 1. Authentication Services (`src/services/auth.service.js`)

| Action | HTTP Method & Target Endpoint | Frontend Service Method | Context / Usage |
| :--- | :--- | :--- | :--- |
| **Customer Register** | `POST /api/users/register` | `authService.registerUser(data)` | Customer Sign Up page |
| **Customer Login** | `POST /api/users/login` | `authService.loginUser(credentials)` | Customer Login page |
| **Customer Refresh** | `POST /api/users/refresh` | `authService.refreshUserToken()` | Interceptor trigger on expiry |
| **Customer Logout** | `POST /api/users/logout` | `authService.logoutUser()` | Navbar logout |
| **Customer Update** | `PATCH /api/users/me` | `authService.updateUser(data)` | Customer account edit |
| **Customer Pass** | `PATCH /api/users/me/change-password` | `authService.changeUserPassword(data)`| Account security panel |
| **Merchant Register** | `POST /api/merchants/register` | `authService.registerMerchant(data)` | Merchant Store registration |
| **Merchant Login** | `POST /api/merchants/login` | `authService.loginMerchant(credentials)`| Merchant Login portal |
| **Merchant Refresh**| `POST /api/merchants/refresh` | `authService.refreshMerchantToken()` | Interceptor trigger on expiry |
| **Merchant Logout** | `POST /api/merchants/logout` | `authService.logoutMerchant()` | Sidebar / Admin logout |
| **Merchant Profile** | `GET /api/merchants/:id` | `authService.getMerchantProfile(id)` | Storefront merchant profile view |
| **Merchant Update** | `PATCH /api/merchants/me` | `authService.updateMerchant(data)` | Merchant profile settings |
| **Merchant Pass** | `PATCH /api/merchants/me/change-password` | `authService.changeMerchantPassword(data)`| Account security panel |

### 2. Catalog & Products Services (`src/services/product.service.js`)

| Action | HTTP Method & Target Endpoint | Frontend Service Method | Context / Usage |
| :--- | :--- | :--- | :--- |
| **Browse Products** | `GET /api/products` | `productService.list(params)` | Storefront catalog & search filters |
| **Get Product Info** | `GET /api/products/:id` | `productService.getById(id)` | Storefront product detail page |
| **Create Product** | `POST /api/products` | `productService.create(data)` | Merchant dashboard add product |
| **Update Product** | `PATCH /api/products/:id` | `productService.update(id, data)` | Merchant product edit panel |
| **Delete Product** | `DELETE /api/products/:id` | `productService.remove(id)` | Merchant product listing delete |
| **Upload Product Images** | `POST /api/products/:id/images` | `productService.uploadImages(id, formData)` | Product image manager (max 5) |
| **Browse Categories** | `GET /api/categories` | `productService.listCategories(params)`| Category filters / Header dropdown |
| **Create Category** | `POST /api/categories` | `productService.createCategory(data)` | Merchant categories organizer |
| **Rename Category** | `PATCH /api/categories/:id` | `productService.renameCategory(id, data)`| Merchant categories manager |
| **Delete Category** | `DELETE /api/categories/:id` | `productService.removeCategory(id)` | Merchant categories organizer |

### 3. Shopping Cart Services (`src/services/cart.service.js`)

| Action | HTTP Method & Target Endpoint | Frontend Service Method | Context / Usage |
| :--- | :--- | :--- | :--- |
| **Retrieve Cart** | `GET /api/carts` | `cartService.get()` | Drawer initialize / Cart page |
| **Add / Edit Item** | `POST /api/carts` | `cartService.upsertItem(data)` | Add to Cart / Quantity adjust |
| **Delete Item Variation**| `DELETE /api/carts/items/:product_id` | `cartService.removeItem(id, query)` | Remove item (`color_index`/`size_index`)|
| **Set Checkout Notes** | `POST /api/carts/set-note` | `cartService.setDeliveryNote(note)` | Checkout delivery instructions |
| **Complete Checkout** | `POST /api/carts/checkout` | `cartService.checkout()` | Submit order payment/details |
| **Clear Cart** | `DELETE /api/carts` | `cartService.clear()` | Empty cart button |

### 4. Interactions & Social Services (`src/services/social.service.js`)

| Action | HTTP Method & Target Endpoint | Frontend Service Method | Context / Usage |
| :--- | :--- | :--- | :--- |
| **Get Product Likes** | `GET /api/likes?product_id=:id` | `socialService.getLikes(productId)` | Product header metrics |
| **Like Product** | `POST /api/likes` | `socialService.like(productId)` | Heart click action |
| **Unlike Product** | `DELETE /api/likes/:product_id` | `socialService.unlike(productId)` | Heart unclick action |
| **Get Product Ratings** | `GET /api/ratings?product_id=:id` | `socialService.getRatings(productId)` | Product page average stars & reviews |
| **Submit / Edit Review**| `POST /api/ratings` | `socialService.submitRating(data)` | Customer review text & score (1-5) |
| **Delete Review** | `DELETE /api/ratings/:product_id` | `socialService.deleteRating(productId)` | Customer review manage pane |
| **Get Comments Thread**| `GET /api/reviews?product_id=:id` | `socialService.getReviews(productId)` | Public discussions / Q&A thread |
| **Post Comment** | `POST /api/reviews` | `socialService.postComment(data)` | Community forum input box |
| **Edit Comment** | `PATCH /api/reviews/:id` | `socialService.editComment(id, data)` | Customer comments edit |
| **Delete Comment** | `DELETE /api/reviews/:id` | `socialService.deleteComment(id)` | Customer comments delete |

### 5. Sales Analytics Service (`src/services/sales.service.js`) *[NEW FILE REQUIRED]*

| Action | HTTP Method & Target Endpoint | Frontend Service Method | Context / Usage |
| :--- | :--- | :--- | :--- |
| **Retrieve Analytics** | `GET /api/sales` | `salesService.getAnalytics()` | Merchant sales charts & metrics |

---

## 📈 Phase-by-Phase Production Roadmap

### Phase 1: Authentication Architecture & API Integration Setup
*   **Targeted Tasks**:
    1.  Install necessary dependencies: `npm install lucide-react framer-motion react-hook-form zod sonner recharts date-fns`.
    2.  Update `src/lib/axios.js` to set up authorization headers dynamically, handle cookie tokens, and inject response/request interceptors for handling access token refresh rotation (`/api/users/refresh` and `/api/merchants/refresh`) and 401 logouts.
    3.  Define the API integration mapping inside files under `src/services/`.
    4.  Update Zustand stores (`useAuthStore.js` and `useMerchantStore.js`) to handle tokens, user info, and loading/error states.
    5.  Implement Customer registration/login screens under `src/app/(storefront)/auth/` with validation schema rules.
    6.  Implement Merchant registration/login screens under `src/app/(merchant)/merchant/login/` with validation.

### Phase 2: Design Porting & Storefront Shell
*   **Targeted Tasks**:
    1.  Transform raw HTML sections in `design/index.html` into clean, modular React components:
        *   `<HeroSection />` in `src/components/storefront/HeroSection.jsx` (display styling with typography crop overlays and silhouettes).
        *   `<Ticker />` in `src/components/storefront/Ticker.jsx` (animated marquee).
        *   `<ShopTheLookRail />` in `src/components/storefront/ShopTheLookRail.jsx` (horizontal card slider with custom gradients).
        *   `<EditorialSplit />` in `src/components/storefront/EditorialSplit.jsx` (content visual split block).
        *   `<NewDropGrid />` or `ProductGrid` in `src/components/storefront/ProductGrid.jsx`.
    2.  Implement the global editorial Header and Footer components (`src/components/layout/Header.jsx` and `src/components/layout/Footer.jsx`) using the tailwind color variables (`ink`, `paper`, `brick`, `olive`).
    3.  Set up the home page page router in `src/app/(storefront)/page.jsx` by linking components together and fetching the initial catalog items using `productService.list()`.

### Phase 3: Core E-Commerce Customer Actions
*   **Targeted Tasks**:
    1.  **Product List & Filter Page** (`src/app/(storefront)/products/page.jsx`): Create a search field, pagination bars, and categories sidebar filtering items by `merchant_id`, `category_id`, or search terms.
    2.  **Product Detail Page** (`src/app/(storefront)/products/[id]/page.jsx`): Build out a detail presentation featuring:
        *   Interactive color/size options selection.
        *   Likes metric counter.
        *   Reviews tabs.
    3.  **Shopping Cart Drawer**: Utilize `framer-motion` to build a sliding tray side cart. Incorporate Zustand `useCartStore` synchronized with `cartService` calls (`upsertItem`, `removeItem`, `clear`).
    4.  **Checkout & Delivery Form** (`src/app/(storefront)/checkout/page.jsx`): Form collecting payment tokens or shipping details, a field for delivery instructions (`/api/carts/set-note`), and final checkout submissions to close out the purchase.

### Phase 4: Customer Social & Engagement Features
*   **Targeted Tasks**:
    1.  **Likes Functionality**: A toggling heart widget on cards and the product page calling `socialService.like(id)` / `socialService.unlike(id)` with state updating.
    2.  **Ratings & Reviews System**: Submit visual stars score (1-5) and reviews text input, triggering `socialService.submitRating()`. Show user edits or removal of existing posts.
    3.  **Discussions Panel**: A comment listing panel displaying threads from `/api/reviews?product_id=:id` and enabling authors to post, modify, or erase text comments.

### Phase 5: Merchant Dashboard & Business Admin Portal
*   **Targeted Tasks**:
    1.  **Merchant Layout**: Build a dark-accented admin dashboard shell with links to Products, Categories, and Revenue.
    2.  **Categories Manager** (`src/app/(merchant)/merchant/categories/`): List, create, rename, and purge custom catalog categories.
    3.  **Products Manager** (`src/app/(merchant)/merchant/products/`): Product edit/creation forms integrated with:
        *   A robust `ImageUploader` component handling stream uploads up to 5 images directly to the `/api/products/:id/images` media routing.
        *   Variant setup grids (colors, sizes).
    4.  **Sales & Revenue Analytics** (`src/app/(merchant)/merchant/sales/`): Plot aggregate revenue figures and daily metrics using `recharts` line graphs, accompanied by a clean list displaying individual line transactions.

### Phase 6: SEO, Verification & Production Readiness
*   **Targeted Tasks**:
    1.  **SEO Audit**: Verify descriptive metadata, unique browser title tags, Open Graph card definitions, and page hierarchies (`h1` - `h6`) on every route.
    2.  **User Experience Polish**: Add CSS skeleton placeholders for fetching states, set up page-level error handlers, and implement custom 404 screens.
    3.  **Accessibility**: Confirm responsive scaling down to mobile widths, verify font contrast, and support motion restrictions (`@media (prefers-reduced-motion)` overrides).
    4.  **Verification**: Execute build scripts `npm run build` locally to identify and resolve any module resolution conflicts or static export warnings.
