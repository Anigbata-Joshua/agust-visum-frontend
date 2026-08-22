"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password input variant for the dark merchant pages.
 * Same API as `PasswordInput` — just different surface colors.
 */
export const DarkPasswordInput = forwardRef(function DarkPasswordInput(
  { className = "", ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`w-full bg-ink border border-off/20 px-4 py-3 pr-11 outline-none focus:border-brick font-body text-sm rounded-none text-off transition-colors ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-off/50 hover:text-off transition-colors"
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

export default DarkPasswordInput;
