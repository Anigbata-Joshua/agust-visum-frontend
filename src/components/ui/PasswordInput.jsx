"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password input with a visibility toggle. Accepts all the standard
 * `<input>` props (including a `register` spread from react-hook-form)
 * so it can be used as a drop-in replacement.
 */
export const PasswordInput = forwardRef(function PasswordInput(
  { className = "", ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`w-full bg-paper/50 border border-ink/10 px-4 py-3 pr-11 outline-none focus:border-brick font-body text-sm rounded-none transition-colors ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-ink/50 hover:text-ink transition-colors"
      >
        {visible ? (
          <EyeOff size={15} strokeWidth={1.5} />
        ) : (
          <Eye size={15} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
});

export default PasswordInput;
