import { create } from "zustand";
import { cartService } from "@/services/cart.service";

/**
 * Cart is server-authoritative — the store mirrors `GET /api/carts`
 * and calls the matching endpoint for every mutation. After any
 * successful write, we always re-fetch the cart (the API's
 * `POST /carts` may return a snapshot but we don't trust the shape
 * to be 100% stable; the GET is the source of truth).
 */
export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  isDrawerOpen: false,

  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  closeDrawer: () => set({ isDrawerOpen: false }),

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await cartService.get();
      set({ cart: response.data?.cart ?? response.data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not load your bag.";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Adds an item (or upserts the quantity for an existing line).
   * `payload` follows the API contract exactly:
   *   { product_id, quantity, has_variation?, variation?: { color_index?, size_index? } }
   */
  upsertItem: async (payload) => {
    set({ loading: true, error: null });
    try {
      await cartService.upsertItem(payload);
      // Always re-fetch — POST /carts response shape can vary.
      const response = await cartService.get();
      set({ cart: response.data?.cart ?? response.data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not update your bag.";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (productId, params) => {
    set({ loading: true, error: null });
    try {
      await cartService.removeItem(productId, params);
      const response = await cartService.get();
      set({ cart: response.data?.cart ?? response.data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not remove that item.";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ loading: false });
    }
  },

  setDeliveryNote: async (note) => {
    try {
      await cartService.setDeliveryNote(note);
      const response = await cartService.get();
      set({ cart: response.data?.cart ?? response.data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not save delivery note.";
      set({ error: message });
      return { success: false, error: message };
    }
  },

  checkout: async () => {
    set({ loading: true, error: null });
    try {
      const response = await cartService.checkout();
      set({ cart: null });
      return { success: true, order: response.data?.order ?? response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Checkout failed.";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ loading: false });
    }
  },

  clear: async () => {
    set({ loading: true, error: null });
    try {
      await cartService.clear();
      set({ cart: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not clear your bag.";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

/* ------------------------------------------------------------------ *
 * Helpers for the single-merchant cart enforcement (§5.1)
 * ------------------------------------------------------------------ */

/**
 * Returns the merchant identifier of every line item currently in the
 * cart. The product payload from `GET /carts` is a populated object,
 * and products carry the merchant either as `merchant` (ObjectId or
 * populated object) or `merchant_id` depending on backend version.
 * Falls back to `null` if the field isn't present, so the caller can
 * decide what to do with an unknown cart state.
 */
export function getCartMerchantIds(cart) {
  if (!cart?.items?.length) return [];
  const ids = new Set();
  for (const item of cart.items) {
    const merchant = item?.product?.merchant ?? item?.product?.merchant_id;
    if (!merchant) continue;
    const id =
      typeof merchant === "object" ? merchant._id || merchant.id : merchant;
    if (id) ids.add(String(id));
  }
  return Array.from(ids);
}

/**
 * Returns true if adding `incomingProduct` to `cart` would mix merchants.
 * `incomingProduct` may be a full product or just `{ merchant, merchant_id }`.
 */
export function wouldMixMerchants(cart, incomingProduct) {
  if (!cart?.items?.length) return false;
  const cartIds = getCartMerchantIds(cart);
  if (cartIds.length === 0) return false;
  const incoming =
    incomingProduct?.merchant ?? incomingProduct?.merchant_id ?? null;
  if (!incoming) return false;
  const incomingId =
    typeof incoming === "object" ? incoming._id || incoming.id : incoming;
  return !cartIds.includes(String(incomingId));
}
