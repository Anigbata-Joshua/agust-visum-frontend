"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNaira, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/storefront/RatingStars";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddToCart } from "@/hooks/useAddToCart";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { socialService } from "@/services/social.service";
import { memoGet } from "@/lib/cache";
import { toast } from "sonner";

export function ProductCard({ product, loading = false, priority = false }) {
  const { user, isAuthenticated } = useAuthStore();
  const { addToCart, confirmAdd, cancelAdd, pendingConfirm, busy } =
    useAddToCart();

  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [adding, setAdding] = useState(false);

  const id = product?._id || product?.id;
  const images = product?.images?.filter(Boolean) ?? [];
  const primary = images[0];
  const secondary = images[1];
  const title = product?.title || "";
  const price = product?.price ?? 0;
  const outOfStock = (product?.quantity ?? 1) <= 0;
  const isNew =
    product?.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    
    memoGet(`likes:${id}`, () => socialService.getLikes(id), { ttl: 60_000 })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.likes ?? [];
        const userId = user?._id || user?.id;
        setLikeCount(res?.data?.count ?? list.length);
        setLiked(!!userId && list.some((l) => (l.user?._id || l.user?.id || l.user) === userId));
      })
      .catch(() => {/* silent */});
    return () => {
      cancelled = true;
    };
  }, [id, user?._id, user?.id]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Sign in to save pieces to your wishlist.");
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => Math.max(0, c + (wasLiked ? -1 : 1)));
    try {
      if (wasLiked) await socialService.unlike(id);
      else await socialService.like(id);
    } catch (err) {
      setLiked(wasLiked);
      setLikeCount((c) => Math.max(0, c + (wasLiked ? 1 : -1)));
      toast.error(err.response?.data?.message || "Could not update wishlist.");
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setAdding(true);
    try {
      await addToCart({ product, quantity: 1 });
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex flex-col gap-3">
        <div className="aspect-[3/4] bg-ink/10 animate-pulse" />
        <div className="h-3 w-2/3 bg-ink/10 animate-pulse" />
        <div className="h-3 w-1/3 bg-ink/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/products/${id}`}
        aria-label={title}
        className="relative block aspect-[3/4] bg-stone overflow-hidden"
      >
        {primary && (
          <Image
            src={primary}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={cn(
              "object-cover transition-all duration-500",
              hovered ? "scale-105" : "scale-100"
            )}
          />
        )}
        {secondary && (
          <Image
            src={secondary}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              hovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <Badge>New</Badge>}
          {outOfStock && <Badge>Out of stock</Badge>}
        </div>

        <button
          onClick={handleToggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-paper/85 backdrop-blur-sm border border-ink/10 transition-colors",
            liked ? "text-brick" : "text-ink/70 hover:text-brick"
          )}
        >
          <Heart size={15} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
        </button>

        <button
          onClick={handleQuickAdd}
          disabled={outOfStock || adding || busy}
          aria-label="Add to bag"
          className={cn(
            "absolute bottom-2 right-2 w-9 h-9 flex items-center justify-center bg-ink text-off transition-all",
            "hover:bg-brick disabled:opacity-40 disabled:cursor-not-allowed",
            hovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 md:translate-y-2"
          )}
        >
          {adding ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus size={15} strokeWidth={1.5} />
          )}
        </button>

        <div className="md:hidden absolute bottom-0 inset-x-0 p-2">
          <button
            onClick={handleQuickAdd}
            disabled={outOfStock || adding || busy}
            className="w-full bg-ink text-off font-cond text-[10px] tracking-[0.16em] uppercase py-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            {outOfStock ? "Out of stock" : adding ? "Adding…" : "Quick add"}
          </button>
        </div>
      </Link>

      <div className="pt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/products/${id}`}
            className="font-display text-[15px] leading-snug line-clamp-2 hover:text-brick transition-colors"
          >
            {title}
          </Link>
          <span className="font-cond text-xs text-brick whitespace-nowrap">
            {formatNaira(price)}
          </span>
        </div>

        {(product.rating_average > 0 || likeCount > 0) && (
          <div className="flex items-center gap-2 mt-0.5">
            {product.rating_average > 0 && (
              <div className="flex items-center gap-1">
                <RatingStars value={Math.round(product.rating_average)} size="sm" />
                <span className="font-cond text-[10px] tracking-wider text-ink/50">
                  ({product.rating_count ?? ""})
                </span>
              </div>
            )}
            <AnimatePresence>
              {likeCount > 0 && (
                <motion.span
                  key={likeCount}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-cond text-[10px] tracking-wider text-ink/50 inline-flex items-center gap-1"
                >
                  · {likeCount} <Heart size={10} strokeWidth={1.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Start a new order?"
        description={
          pendingConfirm
            ? `Your bag has items from ${pendingConfirm.currentMerchantName}. Adding this will clear your bag and start a new order with ${pendingConfirm.newMerchantName}. Continue?`
            : ""
        }
        confirmLabel="Clear and add"
        cancelLabel="Keep current bag"
        tone="danger"
        onConfirm={confirmAdd}
        onCancel={cancelAdd}
      />
    </div>
  );
}

export default ProductCard;
