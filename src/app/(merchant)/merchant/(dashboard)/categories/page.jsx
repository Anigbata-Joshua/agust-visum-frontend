"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Tags as TagsIcon } from "lucide-react";
import { useMerchantStore } from "@/store/useMerchantStore";
import { productService } from "@/services/product.service";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/Motion";
import { toast } from "sonner";

export default function MerchantCategoriesPage() {
  const { merchant } = useMerchantStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const loadCategories = () => {
    setLoading(true);
    productService
      .listCategories({ merchant_id: merchant?._id || merchant?.id })
      .then((res) => setCategories(res.data?.categories ?? res.data ?? []))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load categories."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant?._id, merchant?.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await productService.createCategory({ name: name.trim() });
      toast.success("Category created.");
      setName("");
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create category.");
    }
  };

  const handleRename = async (id) => {
    if (!editingName.trim()) return;
    try {
      await productService.renameCategory(id, { name: editingName.trim() });
      toast.success("Category renamed.");
      setEditingId(null);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not rename category.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.removeCategory(id);
      toast.success("Category removed.");
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove category.");
    }
  };

  return (
    <div>
      <FadeIn className="mb-8 sm:mb-10">
        <span className="font-cond text-[11px] tracking-[0.22em] uppercase text-brick">
          Organisation
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2">Categories</h1>
        <p className="text-sm text-off/60 font-body mt-2">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} in your store.
        </p>
      </FadeIn>

      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-2 mb-8 max-w-xl"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-ink border border-off/20 px-3 py-2.5 text-sm outline-none focus:border-brick placeholder:text-off/40"
        />
        <Button type="submit" variant="primary" size="md">
          <span className="inline-flex items-center gap-1.5">
            <Plus size={14} strokeWidth={1.5} />
            Add
          </span>
        </Button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 !bg-off/10" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-off/15 p-10 text-center">
          <TagsIcon size={28} strokeWidth={1.2} className="mx-auto text-off/40 mb-3" />
          <p className="font-display text-xl">No categories yet.</p>
          <p className="text-sm text-off/55 font-body mt-1">
            Create your first category to start organising products.
          </p>
        </div>
      ) : (
        <ul className="border border-off/15 divide-y divide-off/10">
          {categories.map((c) => {
            const id = c._id || c.id;
            const isEditing = editingId === id;
            return (
              <li
                key={id}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                {isEditing ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 bg-ink border border-off/20 px-2 py-1.5 text-sm outline-none focus:border-brick"
                    autoFocus
                  />
                ) : (
                  <span className="font-display text-base">{c.name}</span>
                )}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRename(id)}
                        className="w-9 h-9 flex items-center justify-center text-off/60 hover:text-brick"
                        aria-label="Save"
                      >
                        <Check size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-9 h-9 flex items-center justify-center text-off/60 hover:text-brick"
                        aria-label="Cancel"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(id);
                          setEditingName(c.name);
                        }}
                        className="w-9 h-9 flex items-center justify-center text-off/60 hover:text-brick"
                        aria-label="Rename"
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
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
