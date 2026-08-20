// Cloudinary-backed uploader — wire to productService.uploadImage
export function ImageUploader({ onUpload }) {
  return (
    <label className="border border-dashed border-ink/30 flex items-center justify-center h-40 cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload?.(e.target.files?.[0])}
      />
      <span className="font-cond text-xs uppercase tracking-[0.1em]">Upload Image</span>
    </label>
  );
}
