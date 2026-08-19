export function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-ink text-off z-50 p-8">
      <button onClick={onClose} className="font-cond text-xs uppercase tracking-[0.1em]">
        Close
      </button>
    </div>
  );
}
