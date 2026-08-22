"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartHydration } from "@/hooks/useCartHydration";
import { formatNaira } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import { buildWhatsAppCheckoutLink, buildOrderMessage } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, setDeliveryNote, checkout, loading } = useCartStore();
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [merchantPhone, setMerchantPhone] = useState(null);
  const [merchantName, setMerchantName] = useState(null);
  useCartHydration();

  useEffect(() => {
    if (typeof cart?.note === "string" && !note) setNote(cart.note);
  }, [cart?.note, note]);

  // Resolve the merchant's phone for the WhatsApp handoff. Backend has no
  // dedicated endpoint for this, so we hit the public merchant profile route
  // once per cart and cache the phone number in component state. We use the
  // shared memo cache so repeated visits don't refetch.
  useEffect(() => {
    const firstItem = cart?.items?.[0];
    if (!firstItem) return;
    const m = firstItem.product?.merchant;
    const merchantId = typeof m === "object" ? m?._id || m?.id : m;
    if (!merchantId) return;
    if (typeof m === "object" && m.phone) {
      setMerchantPhone(m.phone);
      setMerchantName(m.store_name || m.name || null);
      return;
    }
    let cancelled = false;
    import("@/lib/cache").then(({ memoGet }) => {
      if (cancelled) return;
      memoGet(`merchant:${merchantId}`, () => authService.getMerchantProfile(merchantId), {
        ttl: 5 * 60_000,
      })
        .then((res) => {
          if (cancelled) return;
          const data = res?.data?.merchant ?? res?.data;
          setMerchantPhone(data?.phone || null);
          setMerchantName(data?.store_name || data?.name || null);
        })
        .catch(() => {
          /* phone is best-effort — checkout still works without it */
        });
    });
    return () => {
      cancelled = true;
    };
  }, [cart?.items]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-[60vh] flex items-center">
        <Container size="narrow" className="text-center py-20">
          <h1 className="font-display text-3xl">Sign in to check out.</h1>
          <div className="mt-5">
            <Link href="/auth">
              <Button variant="primary" size="md">Sign in / Register</Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity ?? 1),
    0
  );

  const handleCheckout = async () => {
    try {
      setPlacing(true);
      if (note.trim()) {
        const noteRes = await setDeliveryNote(note.trim());
        if (!noteRes.success) {
          toast.error(noteRes.error);
          return;
        }
      }
      const res = await checkout();
      if (res.success) {
        const order = res.order ?? {};
        const orderId =
          order._id || order.id || order.order_id || order.orderNumber || order.reference;

        const lines = (items ?? []).map((it) => {
          const title = it.product?.title || "item";
          const qty = it.quantity ?? 1;
          return `${qty}× ${title}`;
        });

        const message = buildOrderMessage({
          orderId,
          lines,
          totalLabel: formatNaira(total),
          merchantName,
        });

        if (merchantPhone) {
          const link = buildWhatsAppCheckoutLink({
            phone: merchantPhone,
            message,
          });
          toast.success(
            orderId ? `Order #${orderId} placed. Opening WhatsApp…` : "Order placed. Opening WhatsApp…"
          );
          // Use window.location so the redirect happens immediately and the
          // user has a chance to copy the order details before sending.
          if (typeof window !== "undefined") {
            window.location.href = link;
          }
        } else {
          toast.success(
            orderId ? `Order #${orderId} placed.` : "Order placed."
          );
        }
        router.push("/");
      } else {
        toast.error(res.error);
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="bg-paper text-ink">
      <section className="border-b border-ink/10 bg-off">
        <Container size="wide" className="py-10 sm:py-14">
          <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
            Final step
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">Checkout</h1>
        </Container>
      </section>

      <Container size="wide" className="py-10 sm:py-14">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink/60 font-body">
              Your bag is empty. Add a piece to continue.
            </p>
            <div className="mt-5">
              <Link href="/products">
                <Button variant="primary" size="md">Shop the collection</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Order lines + notes */}
            <section className="lg:col-span-8 space-y-8">
              <div className="border border-ink/10">
                <div className="px-5 py-3 border-b border-ink/10 bg-off font-cond text-[10px] tracking-[0.18em] uppercase text-ink/60">
                  Your order
                </div>
                <ul className="divide-y divide-ink/10">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="px-5 py-4 flex items-center gap-4"
                    >
                      {item.product?.images?.[0] && (
                        <div className="w-16 h-20 bg-stone overflow-hidden shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm sm:text-base">
                          {item.product?.title}
                        </div>
                        <div className="font-cond text-[10px] tracking-[0.16em] uppercase text-ink/55 mt-0.5">
                          Qty {item.quantity ?? 1}
                          {item.variation?.color?.text
                            ? ` · ${item.variation.color.text}`
                            : ""}
                          {item.variation?.size?.text
                            ? ` · ${item.variation.size.text}`
                            : ""}
                        </div>
                      </div>
                      <div className="font-cond text-brick">
                        {formatNaira(
                          (item.product?.price ?? 0) * (item.quantity ?? 1)
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block font-cond text-[10px] tracking-[0.18em] uppercase text-ink/60 mb-1.5">
                  Delivery notes (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Any instructions for the courier?"
                  className="w-full bg-off border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brick resize-none"
                />
              </div>
            </section>

            {/* Summary */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 border border-ink/10 p-5 sm:p-6 bg-off">
                <h2 className="font-display text-2xl">Order Summary</h2>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/60 font-body">Subtotal</dt>
                    <dd className="font-cond text-brick">{formatNaira(total)}</dd>
                  </div>
                  <div className="flex justify-between text-ink/60 font-body">
                    <dt>Shipping</dt>
                    <dd className="text-ink/50">Calculated at delivery</dd>
                  </div>
                </dl>
                <div className="mt-5 pt-5 border-t border-ink/10 flex justify-between items-baseline">
                  <span className="font-cond text-[11px] tracking-[0.18em] uppercase">
                    Total
                  </span>
                  <span className="font-display text-2xl text-brick">
                    {formatNaira(total)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  block
                  className="mt-6"
                  onClick={handleCheckout}
                  disabled={loading || placing}
                  loading={loading || placing}
                >
                  {merchantPhone ? (
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle size={15} strokeWidth={1.5} />
                      Place order on WhatsApp
                    </span>
                  ) : (
                    "Place order"
                  )}
                </Button>

                <p className="mt-4 text-[11px] text-ink/50 font-body leading-relaxed">
                  By placing your order, you'll be redirected to WhatsApp to
                  confirm with {merchantName || "the merchant"}. You'll then
                  return here once the conversation is opened.
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}
