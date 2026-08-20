"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { login, register: signUp, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    reset();
  };

  const onSubmit = async (data) => {
    if (isLogin) {
      const res = await login({ email: data.email, password: data.password });
      if (res.success) {
        toast.success("Welcome back to August Visum.");
        router.push("/");
      } else {
        toast.error(res.error || "Authentication failed.");
      }
    } else {
      const res = await signUp({ name: data.name, email: data.email, password: data.password });
      if (res.success) {
        toast.success("Account created successfully.");
        router.push("/");
      } else {
        toast.error(res.error || "Registration failed.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col justify-center items-center px-4 py-16">
      {/* Editorial Card Outer Frame */}
      <div className="w-full max-w-[420px] bg-off border border-ink/10 p-8 shadow-2xl relative">
        {/* Editorial Header Details */}
        <div className="flex justify-between items-baseline border-b border-ink/10 pb-4 mb-6">
          <span className="font-cond text-[10px] tracking-[0.15em] text-brick uppercase font-semibold">
            August Visum — Auth
          </span>
          <span className="font-cond text-[10px] tracking-[0.1em] text-ink/40 uppercase">
            Issue Nº 05
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl mb-2 text-ink">
          {isLogin ? "Sign In" : "Register"}
        </h1>
        <p className="text-xs text-ink/60 mb-6 font-body leading-relaxed">
          {isLogin
            ? "Enter your credentials to access your customer profile and orders."
            : "Create a storefront profile to begin curating and checking out your pieces."}
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-ink/70">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Auguste Rodin"
                className="w-full bg-paper/50 border border-ink/10 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none transition-colors"
                {...register("name", {
                  required: !isLogin ? "Name is required" : false,
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
              />
              {errors.name && (
                <span className="block mt-1 text-[11px] font-cond tracking-wide text-brick uppercase">
                  {errors.name.message}
                </span>
              )}
            </div>
          )}

          <div>
            <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-ink/70">
              Email Address
            </label>
            <input
              type="email"
              placeholder="classicist@visum.com"
              className="w-full bg-paper/50 border border-ink/10 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none transition-colors"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="block mt-1 text-[11px] font-cond tracking-wide text-brick uppercase">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-ink/70">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-paper/50 border border-ink/10 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none transition-colors"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {errors.password && (
              <span className="block mt-1 text-[11px] font-cond tracking-wide text-brick uppercase">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="bg-brick/10 border border-brick/20 px-4 py-3 text-brick text-xs font-cond tracking-wide uppercase">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-off font-cond text-xs tracking-[0.15em] py-4 uppercase hover:bg-brick transition-colors disabled:opacity-50 rounded-none cursor-pointer mt-2"
          >
            {loading ? "Authorizing..." : isLogin ? "Access Account" : "Confirm Profile"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-6 border-t border-ink/10 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            className="font-cond text-xs text-ink/60 hover:text-brick tracking-widest uppercase transition-colors"
          >
            {isLogin ? "[ Create An Account ]" : "[ Have An Account? Sign In ]"}
          </button>
        </div>
      </div>

      {/* Decorative Brand Footer */}
      <span className="mt-8 font-cond text-[10px] tracking-[0.2em] uppercase text-ink/40">
        © august visum — all rights reserved
      </span>
    </main>
  );
}
