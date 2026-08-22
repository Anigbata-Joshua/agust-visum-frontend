# E-Commerce Backend — API Guide for Frontend Devs

This document describes the actual behavior of the backend (routes, controllers, Zod
validation schemas, and Mongoose models) so the frontend can be wired up correctly the
first time. Field names below are copied directly from the backend source — **do not
guess or invent field names** (e.g. it's `title`, not `name`; `full_name`, not `name`;
`descp`, not `description`).

---

## 1. Base URL & Response Envelope

```
Base URL: {API_URL}/api        e.g. https://your-backend.onrender.com/api
```

Every response is JSON with a `success` boolean:

```json
// Success
{ "success": true, "...": "..." }

// Error
{ "success": false, "message": "Human-readable error message" }
```

Validation errors (Zod) return HTTP 400 with all failing fields joined into one message:
```json
{ "success": false, "message": "full_name: full name is required, phone: Invalid input: expected string, received undefined" }
```
Parse the field names out of this string if you want per-field UI errors, or just show it as-is.

---

## 2. Authentication & Authorization

### 2.1 Two completely separate auth domains

Merchants and Users are **fully isolated**. Each has its own JWT secrets, its own
cookie names, and its own auth middleware. A merchant's token will never work on a
`/users/*` route and vice versa.

| Domain | Register | Login | Refresh | Logout |
|---|---|---|---|---|
| **User** (customer) | `POST /users/register` | `POST /users/login` | `POST /users/refresh` | `POST /users/logout` |
| **Merchant** | `POST /merchants/register` | `POST /merchants/login` | `POST /merchants/refresh` | `POST /merchants/logout` |

### 2.2 What login/register return

```json
{
  "success": true,
  "user": { "_id": "...", "full_name": "...", "email": "...", "phone": "...", "createdAt": "...", "updatedAt": "..." },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```
(For merchants, the key is `"merchant"` instead of `"user"`, with the merchant fields — see §4.)

- **Access token** — expires in **45 minutes**, used to authenticate normal requests.
- **Refresh token** — expires in **7 days**, used only to obtain a new access token.

### 2.3 How to send the access token

Every protected route accepts the token **either** as an `Authorization` header **or**
as a cookie:

```
Authorization: Bearer <accessToken>
```

**⚠️ Important cross-domain caveat:** the backend also sets the tokens as cookies
(`userAccessToken`, `userRefreshToken`, `merchantAccessToken`, `merchantRefreshToken`),
but those cookies are set with `sameSite: "strict"` and `httpOnly: true`. Browsers
**never** send `sameSite: strict` cookies on cross-site requests — which is exactly
the situation if your frontend and backend are on different domains (e.g. frontend on
Vercel, backend on Render). **In practice, treat the cookies as unusable from a
separately-hosted frontend and always use the `Authorization: Bearer` header instead,**
storing `accessToken` and `refreshToken` yourself (e.g. in `localStorage`). Cookies
only work automatically if frontend and backend share the same parent domain.

### 2.4 Refreshing an expired access token

```
POST /users/refresh          (or /merchants/refresh)
Body: { "refreshToken": "<the refresh token you stored>" }
```
Response:
```json
{ "success": true, "accessToken": "new...", "refreshToken": "new..." }
```
**The refresh token rotates on every use** — you must overwrite your stored
`refreshToken` with the new one every time, not just the access token. If you reuse an
old (already-rotated) refresh token, the backend treats it as a stolen-token signal and
**revokes the entire session** (you'll get a 401 and have to log in again).

Recommended pattern: on any `401` response from a protected route, call `/refresh` with
your stored refresh token, save both new tokens, and retry the original request once.
If refresh itself fails, force logout.

### 2.5 Logging out

```
POST /users/logout           (or /merchants/logout)
Body: { "refreshToken": "<current refresh token>" }
```
This invalidates the refresh token server-side. Always send it explicitly (again,
don't rely on the cookie cross-domain). Clear your local tokens regardless of whether
this call succeeds.

### 2.6 Authorization rules (who can do what)

- **Ownership is enforced server-side**, not just hidden in the UI. E.g. a merchant can
  only update/delete their **own** products and categories — the backend filters by
  `{ _id: ..., merchant: req.merchant._id }`, so attempting to edit another merchant's
  resource returns `404 Not Found` (not 403 — this is intentional, to avoid leaking
  existence of other merchants' resources).
- **Merchant approval gate:** `POST /products` (create product) checks
  `req.merchant.status !== 'approved'` and returns `403` if the merchant's `status` is
  still `"pending"` or `"suspended"`. New merchants register with `status: "pending"` by
  default — there is currently no self-service way to become `"approved"`; that must be
  changed directly in the database/admin process. **Tell merchants they can't list
  products until approved**, and surface `merchant.status` in your merchant dashboard UI.
- Reviews/ratings/likes can only be edited or deleted by their **author** (`user` field
  match), enforced the same way.

---

## 3. Rate Limiting

- **General limiter:** applies to all of `/api/*` — default **300 requests / 15 min** per IP.
- **Stricter auth limiter:** applies specifically to `POST /users/register`,
  `POST /users/login`, `POST /merchants/register`, `POST /merchants/login` — default
  **100 requests / 15 min** per IP. If you hit this while testing repeatedly, you'll get:
  ```json
  { "success": false, "message": "Too many requests from this IP, please try again later." }
  ```

---

## 4. Data Models & Required Fields

Field requirements below come directly from the Zod validation schemas (request-time)
and Mongoose schemas (persistence-time) — both agree, listed once.

### 4.1 Merchant

| Field | Type | Required on register? | Notes |
|---|---|---|---|
| `full_name` | string | ✅ | |
| `email` | string | ✅ | must be valid email, unique, lowercased |
| `phone` | string | ✅ | |
| `phones` | string[] | optional | extra phone numbers |
| `password` | string | ✅ | see §4.5 password rules |
| `store_name` | string | ✅ | |
| `descp` | string | optional | store description (**not** `description`) |
| `icon` | string (URL) | optional | |
| `banner` | string (URL) | optional | |
| `state`, `district` | string | optional | not settable at register — only via `PATCH /merchants/me` |
| `social_media.x`, `.face_book`, `.instagram` | string | optional | only via `PATCH /merchants/me` |
| `status` | enum: `pending` \| `approved` \| `suspended` | — | server-controlled, defaults to `pending`, see §2.6 |

`PATCH /merchants/me` accepts any subset of: `full_name, email, phone, phones,
store_name, descp, icon, banner, state, district, social_media{x,face_book,instagram}`.

### 4.2 User (customer)

| Field | Type | Required on register? |
|---|---|---|
| `full_name` | string | ✅ |
| `email` | string | ✅ (valid, unique, lowercased) |
| `phone` | string | ✅ |
| `password` | string | ✅ |

`PATCH /users/me` accepts any subset of: `full_name, email, phone`.

### 4.3 Product

| Field | Type | Required on create? | Notes |
|---|---|---|---|
| `title` | string | ✅ | **not** `name` |
| `descp` | string | optional | **not** `description` |
| `price` | number ≥ 0 | ✅ | |
| `brand` | string | optional | |
| `quantity` | integer ≥ 0 | optional | defaults to `0` |
| `category_id` | ObjectId string | ✅ | must be a category **owned by the requesting merchant**, or you get `404 "Category not found for this merchant"` |
| `images` | string[] (URLs) | optional at create | see §5 for the separate upload endpoint |
| `currency` | string | optional | defaults `"NGN"` |
| `min_qty`, `max_qty` | integer > 0 | optional | |
| `discount` | number ≥ 0 | optional | |
| `discount_expiration` | ISO datetime string | optional | |
| `has_refund_policy`, `has_discount`, `has_shipment`, `has_variation` | boolean | optional | |
| `shipping_locations` | string[] | optional | |
| `attrib` | array of `{ type, content: [{name, value}] }` | optional | freeform spec groups (e.g. "Material") |
| `variations` | array of `{ type, text, content: [{ display?: [{type: 'image'|'text', value}], text }] }` | optional | e.g. a "color" or "size" selector group — **there is no flat `colors[]`/`sizes[]` field**, it's always this nested structure |

`PATCH /products/:id` accepts the same shape, all fields optional (partial update). The
product's `category` can be changed by passing a new `category_id` (still must belong
to the same merchant).

### 4.4 Category

| Field | Type | Required on create? |
|---|---|---|
| `name` | string | ✅ (unique per merchant — duplicate name → `409`) |
| `image` | string (URL) | optional |

### 4.5 Password rules (both User and Merchant)

Enforced both by Zod (on the way in) and by the Mongoose schema (belt & suspenders):
- Minimum 6 characters
- At least one uppercase letter
- At least one number
- At least one special character (non-alphanumeric)

Example valid password: `Passw0rd!`

### 4.6 Cart

Cart is **server-authoritative and per-user** — there's exactly one cart per user,
auto-created on first use. Item shape:
```json
{
  "product": "<ObjectId>",        // populated to full product object on GET /carts
  "quantity": 1,
  "has_variation": false,
  "variation": { "color_index": 0, "size_index": null }  // only present if has_variation
}
```
`POST /carts` body: `{ product_id, quantity, has_variation?, variation?: {color_index?, size_index?} }`
— posting the same `product_id` + matching `variation` again **updates the quantity**
rather than duplicating the line item.

`DELETE /carts/items/:product_id` — pass `color_index`/`size_index` as **query
params** (not body) to remove one specific variation; omit both to remove all line
items of that product regardless of variation.

### 4.7 Order (created only via checkout, read-only otherwise)

`POST /carts/checkout` snapshots the current cart into an `Order`, then empties the
cart. There is currently no `GET /orders` endpoint exposed to users — order history for
a customer isn't retrievable yet (the commented-out route exists in
`user.controller.js` but isn't wired up). Merchants see their line items via `GET
/sales` instead (§4.8).

### 4.8 Sales (merchant-only, read-only)

`GET /sales` returns every line item across all orders that include at least one of the
calling merchant's products:
```json
{
  "success": true,
  "count": 12,
  "total_revenue": 458000,
  "sales": [
    {
      "order_id": "...", "user": "<ObjectId>", "status": "pending",
      "created_at": "...", "product": "<ObjectId>", "title": "...",
      "unit_price": 12000, "quantity": 2, "line_total": 24000
    }
  ]
}
```
Use `total_revenue` directly rather than summing `sales[]` yourself.

### 4.9 Review, Rating, Like

| Model | Fields | Notes |
|---|---|---|
| **Review** | `product_id` (create only), `text` | free-text comment thread, one user can post many |
| **Rating** | `product_id` (create only), `value` (1–5 int, required), `text` (optional) | **one rating per user per product** — re-`POST`ing the same `product_id` **upserts** it rather than erroring |
| **Like** | `product_id` | idempotency is enforced: liking twice returns `409 "Product already liked"` |

`GET /likes`, `GET /ratings`, `GET /reviews` all **require** `?product_id=` as a query
param — calling without it returns `400`.

The `GET /likes` response does **not** tell you whether the *current* user has liked the
product — it just returns the raw list of likes (each with a populated `user`). To show
a filled/unfilled heart, compare the current user's `_id` against `likes[].user._id`
client-side.

---

## 5. Image Uploads (Cloudinary)

```
POST /products/:id/images
Content-Type: multipart/form-data
Auth: merchant, must own the product
Field name: "images"   (up to 5 files)
```
- Accepted: `.jpg .jpeg .png .webp .gif`, max **5MB per file**.
- Files are uploaded to Cloudinary server-side and the resulting URLs are **appended**
  to the product's existing `images[]` array (this endpoint adds images, it doesn't
  replace the array — there's no endpoint to remove a single image once uploaded, only
  full product update).
- There is currently **no equivalent upload endpoint for merchant `icon`/`banner`** —
  those fields only accept a pre-existing URL string via `PATCH /merchants/me`.

---

## 6. Security Specializations Worth Knowing

- **Mass-assignment protection:** all request bodies are parsed through Zod schemas
  that strip any field not explicitly declared, before they ever reach a Mongo query.
  Sending extra fields (e.g. trying to set `status: "approved"` on merchant register)
  is silently ignored — it won't error, it just won't have any effect.
- **XSS sanitization:** every request body is recursively sanitized for script/XSS
  content before validation. You don't need to sanitize input client-side for security
  purposes (though you still should for UX/validation feedback).
- **`toJSON` strips secrets automatically:** `password` and `refreshToken` are never
  present in any User/Merchant object returned by the API, even though they exist in
  the DB — no need to filter them out client-side.
- **Ownership checks return 404, not 403:** as noted in §2.6, trying to act on a
  resource you don't own looks identical to that resource not existing. Don't build UI
  that distinguishes "not found" from "not yours" based on status code alone.

---

## 7. Quick Endpoint Reference

```
AUTH — USERS
POST   /users/register               No auth required     { full_name, email, phone, password }
POST   /users/login                  No auth required     { email, password }
POST   /users/refresh                No auth required*     { refreshToken }
POST   /users/logout                 No auth required*     { refreshToken }
PATCH  /users/me                     🔒 Auth: Bearer <userAccessToken>     { full_name?, email?, phone? }
PATCH  /users/me/change-password     🔒 Auth: Bearer <userAccessToken>     { old_password, new_password }

AUTH — MERCHANTS
POST   /merchants/register           No auth required     { full_name, email, phone, phones?, password, store_name, descp?, icon?, banner? }
POST   /merchants/login              No auth required     { email, password }
POST   /merchants/refresh            No auth required*     { refreshToken }
POST   /merchants/logout             No auth required*     { refreshToken }
GET    /merchants/:id                No auth required     — public storefront profile
PATCH  /merchants/me                 🔒 Auth: Bearer <merchantAccessToken>     { full_name?, email?, phone?, phones?, store_name?, descp?, icon?, banner?, state?, district?, social_media? }
PATCH  /merchants/me/change-password 🔒 Auth: Bearer <merchantAccessToken>     { old_password, new_password }

PRODUCTS
GET    /products                     No auth required     ?merchant_id=&category_id=&search=&page=&limit=
GET    /products/:id                 No auth required
POST   /products                     🔒 Auth: Bearer <merchantAccessToken>     { title, price, category_id, ...see §4.3 } — requires status "approved"
PATCH  /products/:id                 🔒 Auth: Bearer <merchantAccessToken> (must own product)     partial of above
POST   /products/:id/images          🔒 Auth: Bearer <merchantAccessToken> (must own product)     multipart "images" field, max 5
DELETE /products/:id                 🔒 Auth: Bearer <merchantAccessToken> (must own product)

CATEGORIES
GET    /categories                   No auth required     ?merchant_id=
POST   /categories                   🔒 Auth: Bearer <merchantAccessToken>     { name, image? }
PATCH  /categories/:id               🔒 Auth: Bearer <merchantAccessToken> (must own category)
DELETE /categories/:id               🔒 Auth: Bearer <merchantAccessToken> (must own category)

CART — every route requires 🔒 Auth: Bearer <userAccessToken>
GET    /carts
POST   /carts                        { product_id, quantity, has_variation?, variation? }
POST   /carts/set-note               { note }
POST   /carts/checkout
DELETE /carts
DELETE /carts/items/:product_id      ?color_index=&size_index=

SALES
GET    /sales                        🔒 Auth: Bearer <merchantAccessToken>

REVIEWS / RATINGS / LIKES
GET    /reviews  | /ratings | /likes    No auth required     — requires ?product_id=
POST   /reviews                      🔒 Auth: Bearer <userAccessToken>     { product_id, text }
PATCH  /reviews/:id                  🔒 Auth: Bearer <userAccessToken> (must be author)     { text }
DELETE /reviews/:id                  🔒 Auth: Bearer <userAccessToken> (must be author)
POST   /ratings                      🔒 Auth: Bearer <userAccessToken>     { product_id, value (1-5), text? } — upserts
DELETE /ratings/:product_id          🔒 Auth: Bearer <userAccessToken> (must be author)
POST   /likes                        🔒 Auth: Bearer <userAccessToken>     { product_id }
DELETE /likes/:product_id            🔒 Auth: Bearer <userAccessToken> (must be author)

HEALTH
GET    /health                       No auth required     — not rate-limited, use for uptime checks
```
`*` = doesn't need a prior access token, but does need a valid `refreshToken` in the request body.

---

## 8. Common Pitfalls (from real integration bugs)

1. **Sending `name`/`description`/`business_name` instead of `full_name`/`descp`/`store_name`** — the #1 source of "expected string, received undefined" Zod errors. Always match the tables in §4 exactly.
2. **Forgetting `phone` on registration** — it's required for both Users and Merchants, easy to leave off a form.
3. **Not rotating the refresh token** — if you only ever save the *original* refresh token and never update it after calling `/refresh`, the next refresh will fail with a "token reuse detected" error and force a full logout.
4. **Assuming cookies "just work"** — they won't, cross-domain. Always use `Authorization: Bearer <token>` explicitly.
5. **Creating a product without a category** — `category_id` is required and must belong to the merchant; there's no default/uncategorized bucket.
6. **Trying to create a product before merchant approval** — check `merchant.status === "approved"` before showing the "add product" UI, or handle the `403` gracefully.
