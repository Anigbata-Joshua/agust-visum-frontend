"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartHydration } from "@/hooks/useCartHydration";
import { formatNaira } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LineItemSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    cart,
    loading,
    error,
    fetchCart,
    upsertItem,
    removeItem,
    clear,
  } = useCartStore();

  // Ensure the cart is hydrated for both signed-in and signed-out users
  // visiting directly. Skips the call for signed-out users.
  useCartHydration();

  // Pending removal animation tracking
  const [pendingRemoval, setPendingRemoval] = useState(null);

  // "Clear bag" confirmation dialog state
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Resolve the merchant label for the single-merchant cart UI.
  // The cart payload may have `merchant` populated as an object on each
  // item's product, or it may be an ObjectId string.
  const cartMerchantLabel = (() => {
    const firstItem = cart?.items?.[0];
    const m = firstItem?.product?.merchant;
    if (!m) return null;
    if (typeof m === "object") return m.store_name || m.name || null;
    return null;
  })();

  if (!isAuthenticated) {
    return (
      <main className="min-h-[60vh] flex items-center">
        <Container size="default" className="text-center py-20">
          <ShoppingBag size={36} strokeWidth={1.5} className="mx-auto text-ink/30 mb-4" />
          <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
            Your Bag
          </span>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">
            Sign in to view your bag.
          </h1>
          <p className="text-sm text-ink/60 mt-3 font-body max-w-sm mx-auto">
            Saved pieces, quick re-ordering, and a single checkout across
            every drop.
          </p>
          <div className="mt-6">
            <Link href="/auth">
              <Button variant="primary" size="md">Sign in / Register</Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity ?? 1),
    0
  );

  const handleStep = async (item, delta) => {
    const productId = item.product?._id || item.product?.id || item.product;
    const next = Math.max(1, (item.quantity ?? 1) + delta);
    if (next === item.quantity) return;
    const params = item.has_variation
      ? {
          color_index: item.variation?.color_index ?? undefined,
          size_index: item.variation?.size_index ?? undefined,
        }
      : undefined;
    const res = await upsertItem({
      product_id: productId,
      quantity: next,
      ...(params || {}),
    });
    if (!res.success) toast.error(res.error);
  };

  const handleRemove = async (item) => {
    const productId = item.product?._id || item.product?.id || item.product;
    const params = item.has_variation
      ? {
          color_index: item.variation?.color_index ?? undefined,
          size_index: item.variation?.size_index ?? undefined,
        }
      : undefined;
    const key = `${productId}-${item.variation?.color_index ?? ""}-${item.variation?.size_index ?? ""}`;
    setPendingRemoval(key);
    // Tiny delay so the row's exit animation can play
    setTimeout(async () => {
      const res = await removeItem(productId, params);
      setPendingRemoval(null);
      if (!res.success) toast.error(res.error);
    }, 220);
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await clear();
      if (res.success) toast.success("Bag cleared.");
      else toast.error(res.error);
    } finally {
      setClearing(false);
      setConfirmingClear(false);
    }
  };

  return (
    <main className="bg-paper text-ink">
      <section className="border-b border-ink/10 bg-off">
        <Container size="wide" className="py-10 sm:py-14">
          <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
            Checkout
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">Your Bag</h1>
          <p className="mt-2 text-sm text-ink/60 font-body">
            {loading
              ? "Loading your bag…"
              : `${items.length} piece${items.length === 1 ? "" : "s"} — review, then check out.`}
          </p>
          {cartMerchantLabel && (
            <p className="mt-3 font-cond text-[11px] tracking-[0.18em] uppercase text-ink/60 inline-flex items-center gap-2">
              Shopping from
              <Link
                href={`/stores/${items[0]?.product?.merchant?._id || items[0]?.product?.merchant?.id || ""}`}
                className="text-brick border-b border-brick/40 hover:border-brick pb-0.5"
              >
                {cartMerchantLabel}
              </Link>
            </p>
          )}
        </Container>
      </section>

      <Container size="wide" className="py-10 sm:py-14">
        {error && (
          <p className="text-sm text-brick font-body mb-6">{error}</p>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <LineItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="border border-ink/10 p-5 space-y-3">
                <div className="h-3 w-1/3 bg-ink/10 animate-pulse" />
                <div className="h-3 w-2/3 bg-ink/10 animate-pulse" />
                <div className="h-12 w-full bg-ink/10 animate-pulse mt-4" />
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag size={42} strokeWidth={1.2} className="mx-auto text-ink/30 mb-4" />
            <h2 className="font-display text-3xl">Your bag is empty.</h2>
            <p className="mt-2 text-sm text-ink/60 font-body max-w-sm mx-auto">
              Drop Nº 05 is in the archive. Find your first piece.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <Button variant="primary" size="md">
                  <span className="inline-flex items-center gap-2">
                    Shop the collection <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Line items */}
            <ul className="lg:col-span-8 divide-y divide-ink/10 border-y border-ink/10">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const productId =
                    item.product?._id || item.product?.id || item.product;
                  const key = `${productId}-${item.variation?.color_index ?? ""}-${item.variation?.size_index ?? ""}`;
                  const isRemoving = pendingRemoval === key;
                  return (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: isRemoving ? 0 : 1,
                        x: isRemoving ? 20 : 0,
                      }}
                      exit={{ opacity: 0, x: 30, height: 0, marginTop: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      className="py-5 flex gap-4 sm:gap-5"
                    >
                      <Link
                        href={`/products/${productId}`}
                        className="shrink-0 block w-24 h-32 sm:w-28 sm:h-36 bg-stone overflow-hidden"
                      >
                        {item.product?.images?.[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product?.title || ""}
                            width={112}
                            height={144}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${productId}`}
                              className="font-display text-base sm:text-lg leading-tight hover:text-brick line-clamp-2"
                            >
                              {item.product?.title}
                            </Link>
                            {item.variation && (
                              <div className="mt-1 font-cond text-[10px] tracking-[0.16em] uppercase text-ink/55">
                                {item.variation.color?.text
                                  ? `Color · ${item.variation.color.text}`
                                  : ""}
                                {item.variation.size?.text
                                  ? `  ·  Size ${item.variation.size.text}`
                                  : ""}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item)}
                            aria-label="Remove"
                            className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center text-ink/40 hover:text-brick"
                          >
                            <X size={16} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                          <QuantityStepper
                            quantity={item.quantity ?? 1}
                            onDecrement={() => handleStep(item, -1)}
                            onIncrement={() => handleStep(item, 1)}
                          />
                          <div className="font-cond text-brick text-base sm:text-lg">
                            {formatNaira(
                              (item.product?.price ?? 0) * (item.quantity ?? 1)
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>

              <li className="py-4 flex items-center justify-between">
                <button
                  onClick={() => setConfirmingClear(true)}
                  className="inline-flex items-center gap-1.5 font-cond text-[11px] tracking-[0.16em] uppercase text-ink/50 hover:text-brick border-b border-ink/15 hover:border-brick pb-0.5 transition-colors"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                  Clear bag
                </button>
                <Link
                  href="/products"
                  className="font-cond text-[11px] tracking-[0.16em] uppercase text-ink hover:text-brick border-b border-ink/30 hover:border-brick pb-0.5 transition-colors"
                >
                  Continue shopping
                </Link>
              </li>
            </ul>

            {/* Summary */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 border border-ink/10 p-5 sm:p-6 bg-off">
                <h2 className="font-display text-2xl">Order Summary</h2>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/60 font-body">Subtotal</dt>
                    <dd className="font-cond text-brick">{formatNaira(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink/60 font-body">
                    <dt>Shipping</dt>
                    <dd className="text-ink/50">Calculated at checkout</dd>
                  </div>
                  <div className="flex justify-between text-ink/60 font-body">
                    <dt>Taxes</dt>
                    <dd className="text-ink/50">Calculated at checkout</dd>
                  </div>
                </dl>

                <div className="mt-5 pt-5 border-t border-ink/10 flex justify-between items-baseline">
                  <span className="font-cond text-[11px] tracking-[0.18em] uppercase">
                    Total
                  </span>
                  <span className="font-display text-2xl text-brick">
                    {formatNaira(subtotal)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  block
                  className="mt-6"
                  onClick={() => router.push("/checkout")}
                >
                  <span className="inline-flex items-center gap-2">
                    Checkout <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                </Button>

                <p className="mt-4 text-[11px] text-ink/50 font-body leading-relaxed">
                  Free shipping on orders over ₦150,000. 30-day returns, no
                  questions asked.
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>

      <ConfirmDialog
        open={confirmingClear}
        title="Clear your bag?"
        description={`This will remove all ${items.length} item${items.length === 1 ? "" : "s"} from your bag. This action cannot be undone.`}
        confirmLabel={clearing ? "Clearing…" : "Clear bag"}
        cancelLabel="Keep bag"
        tone="danger"
        loading={clearing}
        onConfirm={handleClear}
        onCancel={() => setConfirmingClear(false)}
      />
    </main>
  );
}

function QuantityStepper({ quantity, onDecrement, onIncrement }) {
  return (
    <div className="inline-flex items-center border border-ink/20">
      <button
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="w-9 h-9 flex items-center justify-center hover:bg-ink hover:text-off disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current transition-colors"
      >
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="w-9 text-center font-cond text-sm tabular-nums">
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-9 h-9 flex items-center justify-center hover:bg-ink hover:text-off transition-colors"
      >
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}
