"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMerchantStore } from "@/store/useMerchantStore";
import { toast } from "sonner";

export default function MerchantLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { login, register: onboarding, loading, error, clearError } = useMerchantStore();

  const { register, handleSubmit, reset, formState: { errors }, } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      business_name: "",
      description: "",
    },
  });

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    reset();
  };

  const onSubmit = async (data) => {
    if (isLogin) {
      const res = await login({ email: data.email, password: data.password, });
      if (res.success) {
        toast.success("Merchant logged in successfully.");
        router.push("/merchant/dashboard");
      } else {
        toast.error(res.error || "Authentication failed.");
      }
    } else {
      const res = await onboarding({
        name: data.name,
        email: data.email,
        password: data.password,
        business_name: data.business_name,
        description: data.description,
      });
    
      if (res.success) {
        toast.success("Merchant storefront registered successfully.");
        router.push("/merchant/dashboard");
      } else {
        toast.error(res.error || "Registration failed.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-ink flex flex-col justify-center items-center px-4 py-16 text-off">
      {/* Editorial Card Outer Frame - Dark mode */}
      <div className="w-full max-w-[440px] bg-ink border border-off/14 p-8 shadow-2xl relative">
        {/* Editorial Header Details */}
        <div className="flex justify-between items-baseline border-b border-off/10 pb-4 mb-6">
          <span className="font-cond text-[10px] tracking-[0.15em] text-brick uppercase font-semibold">
            August Visum — Merchant Deck
          </span>
          <span className="font-cond text-[10px] tracking-[0.1em] text-off/40 uppercase">
            Issue Nº 05
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl mb-2 text-off">
          {isLogin ? "Merchant Sign In" : "Onboard Storefront"}
        </h1>
        <p className="text-xs text-off/60 mb-6 font-body leading-relaxed">
          {isLogin
            ? "Enter your credentials to access the administrative control dashboard."
            : "Register your brand, list catalogs, and configure your public collection storefront."}
        </p>

        {/* /* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-off/70">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  placeholder="AUGUST ARCHIVES"
                  className="w-full bg-ink border border-off/20 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none text-off transition-colors"
                  {...register("business_name", {
                    required: !isLogin ? "Business name is required" : false,
                    minLength: { value: 3, message: "Business name must be at least 3 characters" },
                  })}
                />
                {errors.business_name && (
                  <span className="block mt-1 text-[11px] font-cond tracking-wide text-brick uppercase">
                    {errors.business_name.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-off/70">
                  Merchant Full Name
                </label>
                <input
                  type="text"
                  placeholder="Auguste Rodin"
                  className="w-full bg-ink border border-off/20 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none text-off transition-colors"
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
            </>
          )}

          <div>
            <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-off/70">
              Email Address
            </label>
            <input
              type="email"
              placeholder="merchant@visum.com"
              className="w-full bg-ink border border-off/20 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none text-off transition-colors"
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
            <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-off/70">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-ink border border-off/20 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none text-off transition-colors"
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

          {!isLogin && (
            <div>
              <label className="block font-cond text-[10px] tracking-wider uppercase mb-1.5 text-off/70">
                Short Brand Description
              </label>
              <textarea
                placeholder="High-end curated classics, knitwear, and modular silhouettes."
                rows={3}
                className="w-full bg-ink border border-off/20 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none text-off resize-none transition-colors"
                {...register("description")}
              />
            </div>
          )}

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
            className="w-full bg-paper text-ink font-cond text-xs tracking-[0.15em] py-4 uppercase hover:bg-brick hover:text-off transition-colors disabled:opacity-50 rounded-none cursor-pointer mt-2"
          >
            {loading ? "Onboarding..." : isLogin ? "Access Dashboard" : "Create Brand Store"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-6 border-t border-off/10 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            className="font-cond text-xs text-off/60 hover:text-brick tracking-widest uppercase transition-colors"
          >
            {isLogin ? "[ Onboard Brand Store ]" : "[ Have A Merchant Account? Sign In ]"}
          </button>
        </div>
      </div>

      {/* Decorative Brand Footer */}
      <span className="mt-8 font-cond text-[10px] tracking-[0.2em] uppercase text-off/30">
        © august visum — administrative deck
      </span>
    </main>
  );
}
