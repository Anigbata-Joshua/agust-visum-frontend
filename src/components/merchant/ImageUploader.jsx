"use client";

// Cloudinary-backed uploader — wire to productService.uploadImages (max 5 files)
export function ImageUploader({ onUpload, max = 5 }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, max);
    if (files.length) onUpload?.(files);
    e.target.value = "";
  };

  return (
    <label className="border border-dashed border-ink/30 flex items-center justify-center h-40 cursor-pointer">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <span className="font-cond text-xs uppercase tracking-[0.1em]">Upload Images (max {max})</span>
    </label>
  );
}
