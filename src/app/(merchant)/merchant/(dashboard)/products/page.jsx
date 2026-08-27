"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Image as ImageIcon, Package, Link2, X, Lock } from "lucide-react";
import { useMerchantStore } from "@/store/useMerchantStore";
import { productService } from "@/services/product.service";
import { formatNaira, cn } from "@/lib/utils";
import { ImageUploader } from "@/components/merchant/ImageUploader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { FadeIn } from "@/components/ui/Motion";
import { toast } from "sonner";

export default function MerchantProductsPage() {
    const { merchant } = useMerchantStore();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [urlDraft, setUrlDraft] = useState("");

    const isApproved =
        String(merchant?.status || "").toLowerCase() === "approved";

    const { register, handleSubmit, reset } = useForm({
        defaultValues: { title: "", price: "", quantity: "1", descp: "", category_id: "" },
    });

    const loadProducts = () => {
        setLoading(true);
        productService
            .list({ merchant_id: merchant?._id || merchant?.id })
            .then((res) => setProducts(res.data?.products ?? []))
            .catch((err) => toast.error(err.response?.data?.message || "Could not load products."))
            .finally(() => setLoading(false));
    };

    const loadCategories = () => {
        productService
            .listCategories({ merchant_id: merchant?._id || merchant?.id })
            .then((res) => setCategories(res.data?.categories ?? []))
            .catch(() => setCategories([]));
    };

    useEffect(() => {
        loadProducts();
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merchant?._id, merchant?.id]);

    const onSubmit = async (data) => {
        if (!data.category_id) {
            toast.error("Please select a category — create one first if you haven't yet.");
            return;
        }
        const payload = {
            title: data.title,
            price: Number(data.price),
            quantity: Math.max(0, Math.floor(Number(data.quantity) || 0)),
            descp: data.descp,
            category_id: data.category_id,
        };
        // Include any image URLs the merchant pasted in the form.
        if (imageUrls.length > 0) {
            payload.images = imageUrls;
        }
        try {
            if (editingId) {
                await productService.update(editingId, payload);
                toast.success("Product updated.");
            } else {
                await productService.create(payload);
                toast.success("Product created.");
            }
            reset({ title: "", price: "", quantity: "1", descp: "", category_id: "" });
            setEditingId(null);
            setShowForm(false);
            setImageUrls([]);
            setUrlDraft("");
            loadProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save product.");
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id || product.id);
        reset({
            title: product.title,
            price: product.price,
            quantity: product.quantity,
            descp: product.descp || "",
            category_id: product.category?._id || product.category?.id || product.category || "",
        });
        setImageUrls(Array.isArray(product.images) ? [...product.images] : []);
        setUrlDraft("");
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        reset({ title: "", price: "", quantity: "1", descp: "", category_id: "" });
        setShowForm(false);
        setImageUrls([]);
        setUrlDraft("");
    };

    const handleDelete = async (id) => {
        try {
            await productService.remove(id);
            toast.success("Product removed.");
            loadProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not remove product.");
        }
    };

    const handleUpload = async (id, files) => {
        if (!files?.length) return;
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        try {
            await productService.uploadImages(id, formData);
            toast.success(files.length > 1 ? "Images uploaded." : "Image uploaded.");
            loadProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed.");
        }
    };

    const handleAddUrl = () => {
        const trimmed = urlDraft.trim();
        if (!trimmed) return;
        try {
            const u = new URL(trimmed);
            if (!/^https?:$/.test(u.protocol)) throw new Error("protocol");
        } catch {
            toast.error("That doesn't look like a valid URL.");
            return;
        }
        if (imageUrls.includes(trimmed)) {
            toast.error("Already added.");
            return;
        }
        setImageUrls((arr) => [...arr, trimmed]);
        setUrlDraft("");
    };

    const handleRemoveUrl = (url) => {
        setImageUrls((arr) => arr.filter((u) => u !== url));
    };

    const handleToggleAdd = () => {
        if (!isApproved) {
            toast.error(
                "Your storefront is pending review — you can add products once your application is approved."
            );
            return;
        }
        setShowForm((v) => !v);
    };

    return (
        <div>
            <FadeIn className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
                <div>
                    <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
                        Catalog
                    </span>
                    <h1 className="font-display text-3xl sm:text-4xl mt-2">Products</h1>
                    <p className="text-sm text-off/60 font-body mt-2">
                        {products.length} piece{products.length === 1 ? "" : "s"} live in your catalog.
                    </p>
                </div>
                <Button
                    onClick={handleToggleAdd}
                    variant="primary"
                    size="md"
                    disabled={!isApproved && !showForm}
                    title={!isApproved ? "Pending review — can't add products yet" : undefined}
                >
                    <span className="inline-flex items-center gap-1.5">
                        {isApproved ? (
                            <Plus size={14} strokeWidth={1.5} />
                        ) : (
                            <Lock size={12} strokeWidth={1.5} />
                        )}
                        {showForm
                            ? "Close"
                            : editingId
                                ? "Editing…"
                                : isApproved
                                    ? "Add product"
                                    : "Awaiting approval"}
                    </span>
                </Button>
            </FadeIn>

            {!isApproved && (
                <div className="border border-off/20 p-4 text-sm text-off/70 font-body mb-6 flex items-start gap-3">
                    <Lock size={14} strokeWidth={1.5} className="text-brick mt-0.5 shrink-0" />
                    <span>
                        Your storefront is <strong className="text-off">{merchant?.status || "pending review"}</strong>.
                        Product creation is disabled until your application is approved.
                    </span>
                </div>
            )}

            {categories.length === 0 && (
                <div className="border border-brick/40 bg-brick/10 p-4 text-sm text-brick font-body mb-6">
                    You need at least one category before you can add products.{" "}
                    <a href="/merchant/categories" className="underline">
                        Create one here.
                    </a>
                </div>
            )}

            {showForm && (
                <FadeIn className="border border-off/15 p-5 sm:p-6 mb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-6 gap-3">
                        <input
                            {...register("title", { required: true })}
                            placeholder="Product title"
                            className="md:col-span-2 bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-off/40"
                        />
                        <input
                            {...register("price", { required: true })}
                            type="number"
                            step="0.01"
                            placeholder="Price (₦)"
                            className="bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-off/40"
                        />
                        <input
                            {...register("quantity", {
                                required: true,
                                min: { value: 0, message: "Quantity can't be negative" },
                                valueAsNumber: true,
                            })}
                            type="number"
                            min="0"
                            placeholder="Quantity"
                            className="bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-off/40"
                        />
                        <select
                            {...register("category_id", { required: true })}
                            className="bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick"
                        >
                            <option value="">Category…</option>
                            {categories.map((c) => (
                                <option key={c._id || c.id} value={c._id || c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <input
                            {...register("descp")}
                            placeholder="Description"
                            className="md:col-span-5 bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-off/40"
                        />

                        {/* Image URL input — POST /products accepts images: string[] */}
                        <div className="md:col-span-6 border border-off/15 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 size={13} strokeWidth={1.5} className="text-brick" />
                                <span className="font-cond text-[10px] tracking-[0.18em] uppercase text-off/70">
                                    Image URLs (optional)
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={urlDraft}
                                    onChange={(e) => setUrlDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddUrl();
                                        }
                                    }}
                                    placeholder="https://…"
                                    className="flex-1 bg-ink border border-off/20 px-3 py-2 text-xs outline-none focus:border-brick placeholder:text-off/40"
                                />
                                <Button type="button" size="sm" variant="ghost" onClick={handleAddUrl}>
                                    Add URL
                                </Button>
                            </div>
                            {imageUrls.length > 0 && (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {imageUrls.map((u) => (
                                        <li
                                            key={u}
                                            className="inline-flex items-center gap-1.5 border border-off/20 px-2 py-1 text-[11px] text-off/80"
                                        >
                                            <img
                                                src={u}
                                                alt=""
                                                className="w-6 h-6 object-cover"
                                            />
                                            <span className="max-w-[160px] truncate">{u}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUrl(u)}
                                                aria-label="Remove URL"
                                                className="text-off/50 hover:text-brick"
                                            >
                                                <X size={11} strokeWidth={1.5} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="md:col-span-6 flex gap-2">
                            <Button type="submit" variant="primary" size="md">
                                {editingId ? "Update product" : "Add product"}
                            </Button>
                            {editingId && (
                                <Button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    variant="ghost"
                                    size="md"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </FadeIn>
            )}

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 !bg-off/10" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="border border-off/15 p-10 text-center">
                    <Package size={28} strokeWidth={1.2} className="mx-auto text-off/40 mb-3" />
                    <p className="font-display text-xl">No products yet.</p>
                    <p className="text-sm text-off/55 font-body mt-1">
                        Add your first piece to start building the catalog.
                    </p>
                </div>
            ) : (
                <ul className="grid sm:grid-cols-2 gap-3">
                    {products.map((p) => {
                        const id = p._id || p.id;
                        const cover = p.images?.[0];
                        return (
                            <li
                                key={id}
                                className="border border-off/15 p-4 flex gap-4 hover:border-off/30 transition-colors"
                            >
                                <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-stone shrink-0 overflow-hidden flex items-center justify-center">
                                    {cover ? (
                                        <Image src={cover} alt={p.title} fill sizes="96px" className="object-cover" />
                                    ) : (
                                        <ImageIcon size={20} strokeWidth={1.5} className="text-off/30" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-display text-base sm:text-lg truncate">
                                                {p.title}
                                            </div>
                                            <div className="font-cond text-xs text-brick mt-0.5">
                                                {formatNaira(p.price ?? 0)}
                                            </div>
                                            <div className="font-cond text-[10px] tracking-wider text-off/50 mt-1">
                                                Qty: {p.quantity ?? 0} · {p.category?.name || "Uncategorised"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                                        <div className="w-32">
                                            <ImageUploader onUpload={(files) => handleUpload(id, files)} />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="w-9 h-9 flex items-center justify-center text-off/60 hover:text-brick"
                                                aria-label="Edit"
                                            >
                                                <Edit2 size={14} strokeWidth={1.5} />
                                            </button>
                                            <button
                                            
                                                onClick={() => handleDelete(id)}
                                                className="w-9 h-9 flex items-center justify-center text-off/60 hover:text-brick"
                                                aria-label="Delete"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
