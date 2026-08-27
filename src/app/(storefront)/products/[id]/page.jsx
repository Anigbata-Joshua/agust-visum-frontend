"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Truck, RefreshCcw, Shield } from "lucide-react";
import { productService } from "@/services/product.service";
import { socialService } from "@/services/social.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddToCart } from "@/hooks/useAddToCart";
import { formatNaira, cn } from "@/lib/utils";
import { RatingStars } from "@/components/storefront/RatingStars";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

// next/image forwards refs, so framer-motion can animate it directly —
// this replaces the old motion.img crossfade with an optimized image
// while keeping the same enter/exit transition.
const MotionImage = motion(Image);

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const {
    addToCart,
    confirmAdd,
    cancelAdd,
    pendingConfirm,
    busy: addBusy,
  } = useAddToCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [ratings, setRatings] = useState({ average: 0, items: [] });
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("reviews");

  // Variation selection — store indexes of selected color & size group, if any.
  const variations = product?.variations ?? [];
  const colorGroup = variations.find((v) => /color/i.test(v.text || v.type || ""));
  const sizeGroup = variations.find((v) => /size/i.test(v.text || v.type || ""));
  const [colorIndex, setColorIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(0);

  // Sticky add-to-cart bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      productService.getById(id),
      socialService.getLikes(id).catch(() => ({ data: {} })),
      socialService.getRatings(id).catch(() => ({ data: {} })),
      socialService.getReviews(id).catch(() => ({ data: {} })),
      productService.list({ limit: 4 }).catch(() => ({ data: {} })),
    ])
      .then(([productRes, likesRes, ratingsRes, reviewsRes, relatedRes]) => {
        if (cancelled) return;
        setProduct(productRes.data?.product ?? productRes.data);

        const likeList = likesRes.data?.likes ?? [];
        const userId = user?._id || user?.id;
        setLikes({
          count: likesRes.data?.count ?? likeList.length,
          liked: !!userId && likeList.some((l) => (l.user?._id || l.user?.id || l.user) === userId),
        });

        setRatings({
          average: ratingsRes.data?.average ?? 0,
          items: ratingsRes.data?.ratings ?? [],
        });
        setReviews(reviewsRes.data?.reviews ?? []);

        const relList = relatedRes.data?.products ?? relatedRes.data?.results ?? relatedRes.data ?? [];
        const filtered = (Array.isArray(relList) ? relList : []).filter(
          (p) => (p._id || p.id) !== id
        );
        setRelated(filtered.slice(0, 4));
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load this product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Show sticky mobile add-to-cart bar when primary CTA scrolls out
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const node = ctaRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [product]);

  if (loading) {
    return (
      <main className="px-5 sm:px-6 lg:px-10 py-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-3">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-sm text-brick font-body mb-4">{error}</p>
        <Link href="/products" className="font-cond text-xs uppercase tracking-[0.18em] border-b border-ink pb-0.5">
          Back to the shop
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-sm text-ink/50 font-body">Product not found.</p>
      </main>
    );
  }

  const images = (product.images || []).filter(Boolean);
  const hasGallery = images.length > 0;
  const outOfStock = (product.quantity ?? 1) <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to add items to your bag.");
      return;
    }
    if (outOfStock) {
      toast.error("This piece is currently out of stock.");
      return;
    }
    const hasVariation = !!colorGroup || !!sizeGroup;
    await addToCart({
      product,
      quantity: 1,
      has_variation: hasVariation,
      variation: hasVariation
        ? {
            color_index: colorGroup ? colorIndex : undefined,
            size_index: sizeGroup ? sizeIndex : undefined,
          }
        : undefined,
    });
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to like this product.");
      return;
    }
    const wasLiked = likes.liked;
    setLikes((l) => ({ count: Math.max(0, l.count + (wasLiked ? -1 : 1)), liked: !wasLiked }));
    try {
      if (wasLiked) await socialService.unlike(id);
      else await socialService.like(id);
    } catch (err) {
      setLikes((l) => ({ count: Math.max(0, l.count + (wasLiked ? 1 : -1)), liked: wasLiked }));
      toast.error(err.response?.data?.message || "Could not update like.");
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to leave a rating.");
      return;
    }
    if (!ratingInput) {
      toast.error("Pick a star rating first.");
      return;
    }
    try {
      const res = await socialService.submitRating({
        product_id: id,
        value: ratingInput,
        text: ratingText.trim() || undefined,
      });
      setRatings((r) => ({
        average: res.data?.average ?? r.average,
        items: [res.data?.rating, ...(r.items || [])].filter(Boolean),
      }));
      setRatingInput(0);
      setRatingText("");
      toast.success("Thanks for rating.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit rating.");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to leave a comment.");
      return;
    }
    if (!comment.trim()) return;
    try {
      const res = await socialService.postComment({ product_id: id, text: comment.trim() });
      setReviews((r) => [res.data?.review, ...r]);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post your comment.");
    }
  };

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.items.filter((r) => Math.round(r.value ?? 0) === star).length;
    return {
      star,
      count,
      pct: ratings.items.length ? (count / ratings.items.length) * 100 : 0,
    };
  });

  return (
    <main className="bg-paper text-ink">
      <Container size="wide" className="pt-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50 mb-6">
          <Link href="/" className="hover:text-brick">Home</Link>
          <span className="mx-2 text-ink/30">/</span>
          <Link href="/products" className="hover:text-brick">Shop</Link>
          <span className="mx-2 text-ink/30">/</span>
          <span className="text-ink/70">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] bg-stone overflow-hidden">
              {hasGallery ? (
                <AnimatePresence mode="wait">
                  <MotionImage
                    key={images[galleryIndex]}
                    src={images[galleryIndex]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink/30 font-cond text-xs uppercase tracking-widest">
                  No image
                </div>
              )}

              {hasGallery && images.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-paper/90 border border-ink/10 flex items-center justify-center hover:bg-paper"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-paper/90 border border-ink/10 flex items-center justify-center hover:bg-paper"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </>
              )}

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {outOfStock && <Badge>Out of stock</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {hasGallery && images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={cn(
                      "relative aspect-square bg-stone overflow-hidden border-2 transition-colors",
                      i === galleryIndex ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    aria-label={`Image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
            <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
              {product.category?.name || "August Visum"}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">
              {product.title}
            </h1>
            <div className="font-cond text-2xl text-brick mt-3">
              {formatNaira(product.price ?? 0)}
            </div>

            {/* Rating + like row */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <RatingStars value={ratings.average} size="md" showNumber />
                <span className="font-cond text-[10px] tracking-wider text-ink/50">
                  ({ratings.items.length})
                </span>
              </div>
              <button
                onClick={handleToggleLike}
                className={cn(
                  "ml-auto inline-flex items-center gap-1.5 font-cond text-[11px] tracking-[0.16em] uppercase border-b pb-0.5 transition-colors",
                  likes.liked ? "text-brick border-brick" : "text-ink/60 border-ink/20 hover:text-brick hover:border-brick"
                )}
              >
                <Heart size={14} strokeWidth={1.5} fill={likes.liked ? "currentColor" : "none"} />
                {likes.liked ? "Saved" : "Save"} · {likes.count}
              </button>
            </div>

            {product.descp && (
              <p className="mt-5 text-sm text-ink/70 leading-relaxed font-body">
                {product.descp}
              </p>
            )}

            {/* Variation swatches */}
            {colorGroup && (
              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
                    Color · {colorGroup.content?.[colorIndex]?.text}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorGroup.content?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setColorIndex(i)}
                      className={cn(
                        "min-w-[44px] h-10 px-3 text-xs border transition-colors",
                        i === colorIndex
                          ? "border-ink bg-ink text-off"
                          : "border-ink/20 hover:border-ink"
                      )}
                    >
                      {String(opt.text)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizeGroup && (
              <div className="mt-5">
                <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
                  Size · {sizeGroup.content?.[sizeIndex]?.text}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizeGroup.content?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSizeIndex(i)}
                      className={cn(
                        "min-w-[44px] h-10 px-3 text-xs border transition-colors",
                        i === sizeIndex
                          ? "border-ink bg-ink text-off"
                          : "border-ink/20 hover:border-ink"
                      )}
                    >
                      {String(opt.text)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to bag */}
            <div ref={ctaRef} className="mt-8 flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={outOfStock || addBusy}
                loading={addBusy}
                size="lg"
                block
                className="flex-1"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag size={15} strokeWidth={1.5} />
                  {outOfStock ? "Out of stock" : "Add to Bag"}
                </span>
              </Button>
            </div>

            {/* Reassurance row */}
            <ul className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { Icon: Truck, label: "Free shipping" },
                { Icon: RefreshCcw, label: "30-day returns" },
                { Icon: Shield, label: "Archive quality" },
              ].map(({ Icon, label }) => (
                <li key={label} className="border border-ink/10 p-3 flex flex-col items-center gap-1.5">
                  <Icon size={16} strokeWidth={1.5} className="text-brick" />
                  <span className="font-cond text-[9px] tracking-[0.18em] uppercase text-ink/60">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabs: Reviews | Discussion */}
        <section className="mt-16 sm:mt-24">
          <div role="tablist" className="flex gap-6 border-b border-ink/10">
            {[
              { key: "reviews", label: `Reviews · ${ratings.items.length}` },
              { key: "discussion", label: `Discussion · ${reviews.length}` },
            ].map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "py-3 font-cond text-[11px] tracking-[0.18em] uppercase border-b-2 -mb-px transition-colors",
                  activeTab === t.key ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "reviews" && (
            <div className="grid lg:grid-cols-12 gap-10 mt-8">
              {/* Distribution */}
              <div className="lg:col-span-4">
                <div className="border border-ink/10 p-5 bg-off">
                  <div className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
                    Average Rating
                  </div>
                  <div className="flex items-end gap-3 mt-1">
                    <div className="font-display text-5xl">
                      {(ratings.average || 0).toFixed(1)}
                    </div>
                    <div className="pb-2">
                      <RatingStars value={ratings.average} size="md" />
                      <div className="font-cond text-[10px] tracking-wider text-ink/50 mt-1">
                        {ratings.items.length} rating{ratings.items.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {distribution.map((d) => (
                      <div key={d.star} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-cond text-ink/60">{d.star}★</span>
                        <div className="flex-1 h-1.5 bg-ink/10">
                          <div
                            className="h-full bg-brick"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-cond text-ink/50">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review list + form */}
              <div className="lg:col-span-8 space-y-6">
                <form
                  onSubmit={handleSubmitRating}
                  className="border border-ink/10 p-5 bg-off"
                >
                  <h3 className="font-display text-lg">Leave a rating</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-ink/50">
                      Your rating
                    </span>
                    <StarPicker value={ratingInput} onChange={setRatingInput} />
                  </div>
                  <textarea
                    value={ratingText}
                    onChange={(e) => setRatingText(e.target.value)}
                    rows={3}
                    placeholder="Optional — tell other buyers what worked."
                    className="mt-3 w-full bg-paper border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brick resize-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" type="submit" variant="primary">Submit rating</Button>
                  </div>
                </form>

                <ul className="divide-y divide-ink/10">
                  {ratings.items.length === 0 && (
                    <li className="py-8 text-sm text-ink/50 font-body text-center">
                      No ratings yet — be the first.
                    </li>
                  )}
                  {ratings.items.map((r, i) => (
                    <li key={r._id || r.id || i} className="py-5">
                      <div className="flex items-center gap-3">
                        <RatingStars value={r.value} size="sm" />
                        <span className="font-cond text-[10px] tracking-wider text-ink/50">
                          {r.user?.full_name || "Anonymous"}
                        </span>
                        <span className="font-cond text-[10px] tracking-wider text-ink/40 ml-auto">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      {r.text && (
                        <p className="mt-2 text-sm text-ink/80 font-body leading-relaxed">
                          {r.text}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="mt-8 max-w-2xl">
              <form onSubmit={handlePostComment} className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question or share a thought…"
                  className="flex-1 bg-off border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brick"
                />
                <Button type="submit" size="sm">Post</Button>
              </form>

              <ul className="space-y-4">
                {reviews.length === 0 && (
                  <li className="py-6 text-sm text-ink/50 font-body">
                    No comments yet — start the conversation.
                  </li>
                )}
                {reviews.map((r) => (
                  <li key={r._id || r.id} className="border-l-2 border-brick/40 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="font-cond text-[10px] tracking-[0.16em] uppercase text-ink">
                        {r.user?.full_name || "Anonymous"}
                      </span>
                      <span className="font-cond text-[10px] tracking-wider text-ink/40">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-ink/80 font-body leading-relaxed">
                      {r.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="font-display text-2xl sm:text-3xl">You may also like</h2>
              <Link
                href="/products"
                className="font-cond text-[11px] tracking-[0.18em] uppercase text-ink/60 hover:text-brick border-b border-ink/20 hover:border-brick pb-0.5"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} priority={i < 2} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Mobile sticky add-to-cart bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-paper border-t border-ink/15 px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm truncate">{product.title}</div>
              <div className="font-cond text-xs text-brick">{formatNaira(product.price ?? 0)}</div>
            </div>
            <Button
              onClick={handleAddToCart}
              size="md"
              disabled={outOfStock || addBusy}
              loading={addBusy}
              className="shrink-0"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag size={13} strokeWidth={1.5} />
                {outOfStock ? "Sold out" : "Add"}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Start a new order?"
        description={
          pendingConfirm
            ? `Your bag has items from ${pendingConfirm.currentMerchantName}. Adding this piece will clear your bag and start a new order with ${pendingConfirm.newMerchantName}. Continue?`
            : ""
        }
        confirmLabel="Clear and add"
        cancelLabel="Keep current bag"
        tone="danger"
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
      />
    </main>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="p-1"
        >
          <RatingStars value={n <= value ? 1 : 0} size="md" />
        </button>
      ))}
    </div>
  );
}
