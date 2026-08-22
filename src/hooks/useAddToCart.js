"use client";

import { useEffect, useState } from "react";
import { useCartStore, wouldMixMerchants, getCartMerchantIds } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { productService } from "@/services/product.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

/**
 * Encapsulates the "add this product to cart" flow with the
 * single-merchant enforcement (§5.1).
 *
 * Behaviour:
 *   1. If the user isn't signed in → toast + bail.
 *   2. Look up the product if we only have an id (to read its
 *      `merchant` field — `ProductCard` only has a flat product
 *      object, but the product page passes one in directly).
 *   3. If the cart already has items from a DIFFERENT merchant, ask
 *      the user to confirm: "Cart is from Store A. Adding this will
 *      clear the cart and start fresh with Store B."
 *   4. On confirm: DELETE /carts then POST /carts.
 *   5. On cancel: no-op.
 *
 *   Returns:
 *     - pendingConfirm: { currentMerchantName, newMerchantName, payload }
 *       When truthy, the caller should render a ConfirmDialog.
 *     - confirmAdd / cancelAdd: resolve the dialog.
 *     - addToCart({ product?, productId, quantity, has_variation?, variation? })
 */
export function useAddToCart() {
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart, upsertItem, clear } = useCartStore();
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  // Keep cart fresh when the hook is mounted.
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const addToCart = async ({
    product,
    productId,
    quantity = 1,
    has_variation = false,
    variation,
  } = {}) => {
    if (!isAuthenticated) {
      toast.error("Sign in to add pieces to your bag.");
      return;
    }

    let resolvedProduct = product || null;
    if (!resolvedProduct && productId) {
      try {
        const res = await productService.getById(productId);
        resolvedProduct = res.data?.product ?? res.data;
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not look up that product.");
        return;
      }
    }
    if (!resolvedProduct) {
      toast.error("That product is unavailable.");
      return;
    }

    const payload = {
      product_id: resolvedProduct._id || resolvedProduct.id || productId,
      quantity,
      ...(has_variation && variation ? { has_variation, variation } : {}),
    };

    // Single-merchant enforcement: if the cart already has items from
    // a different merchant, we need explicit confirmation.
    if (wouldMixMerchants(cart, resolvedProduct)) {
      const currentMerchant = getCurrentMerchantFromCart(cart);
      const newMerchant = await resolveMerchantName(resolvedProduct);
      setPendingConfirm({
        currentMerchantName: currentMerchant,
        newMerchantName: newMerchant,
        payload,
      });
      return;
    }

    setBusy(true);
    try {
      const res = await upsertItem(payload);
      if (res.success) toast.success("Added to your bag.");
      else toast.error(res.error || "Could not add to bag.");
    } finally {
      setBusy(false);
    }
  };

  const confirmAdd = async () => {
    if (!pendingConfirm) return;
    setBusy(true);
    try {
      const cleared = await clear();
      if (!cleared.success) {
        toast.error(cleared.error || "Could not clear your bag.");
        return;
      }
      const res = await upsertItem(pendingConfirm.payload);
      if (res.success) toast.success("Bag cleared. Started a new order.");
      else toast.error(res.error || "Could not add to bag.");
    } finally {
      setBusy(false);
      setPendingConfirm(null);
    }
  };

  const cancelAdd = () => setPendingConfirm(null);

  return { addToCart, confirmAdd, cancelAdd, pendingConfirm, busy };
}

/**
 * Best-effort: try to surface the store name for whichever merchant
 * currently has items in the cart. Falls back to a generic label.
 */
function getCurrentMerchantFromCart(cart) {
  if (!cart?.items?.length) return "the current store";
  const first = cart.items[0]?.product?.merchant;
  if (first && typeof first === "object" && first.store_name) return first.store_name;
  if (first && typeof first === "object" && first.name) return first.name;
  return "the current store";
}

/**
 * Resolves a product's merchant into a human-friendly store name. If
 * the product payload only has the merchant ObjectId, we fetch the
 * public merchant profile. Falls back to a generic label on failure.
 */
async function resolveMerchantName(product) {
  const inline = product?.merchant;
  if (inline && typeof inline === "object") {
    return inline.store_name || inline.name || "this store";
  }
  const merchantId =
    (typeof inline === "string" && inline) || product?.merchant_id;
  if (!merchantId) return "this store";
  try {
    const res = await authService.getMerchantProfile(merchantId);
    const m = res.data?.merchant ?? res.data;
    return m?.store_name || m?.name || "this store";
  } catch {
    return "this store";
  }
}
