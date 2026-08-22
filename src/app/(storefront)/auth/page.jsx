"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "sonner";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthShell><div /></AuthShell>}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const search = useSearchParams();
  const { login, register: signUp, loading, error, clearError } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", password: "", phone: "" },
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
        const returnTo = search?.get("return") || "/";
        router.push(returnTo);
      } else {
        toast.error(res.error || "Authentication failed.");
      }
    } else {
      const res = await signUp({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      if (res.success) {
        toast.success("Account created successfully.");
        router.push("/");
      } else {
        toast.error(res.error || "Registration failed.");
      }
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-[440px] mx-auto bg-off border border-ink/10 p-8 shadow-2xl relative">
          <div className="flex justify-between items-baseline border-b border-ink/10 pb-4 mb-6">
            <span className="font-cond text-[10px] tracking-[0.18em] text-brick uppercase font-semibold">
              August Visum — Auth
            </span>
            <span className="font-cond text-[10px] tracking-[0.1em] text-ink/40 uppercase">
              Issue Nº 05
            </span>
          </div>

          <h1 className="font-display text-4xl mb-2 text-ink">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-xs text-ink/60 mb-6 font-body leading-relaxed">
            {isLogin
              ? "Enter your credentials to access your customer profile and orders."
              : "Create a profile to begin curating and checking out your pieces."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <>
                <FormField
                  label="Full Name"
                  error={errors.name?.message}
                  input={
                    <input
                      type="text"
                      placeholder="Auguste Rodin"
                      className="w-full bg-paper/50 border border-ink/10 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none transition-colors"
                      {...register("name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                      })}
                    />
                  }
                />
                <FormField
                  label="Phone Number"
                  error={errors.phone?.message}
                  input={
                    <input
                      type="tel"
                      placeholder="0901234567"
                      className="w-full bg-paper/50 border border-ink/10 px-4 py-3 outline-none focus:border-brick font-body text-sm rounded-none transition-colors"
                      {...register("phone", {
                        required: "Phone number is required",
                      })}
                    />
                  }
                />
              </>
            )}

            <FormField
              label="Email Address"
              error={errors.email?.message}
              input={
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
              }
            />

            <FormField
              label="Password"
              error={errors.password?.message}
              input={
                <PasswordInput
                  placeholder="••••••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
              }
            />

            {error && (
              <div className="bg-brick/10 border border-brick/20 px-4 py-3 text-brick text-xs font-cond tracking-wide uppercase">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              loading={loading}
              className="mt-2"
            >
              {isLogin ? "Access Account" : "Confirm Profile"}
            </Button>
          </form>

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
        <p className="text-center mt-6 text-[11px] text-ink/40 font-cond tracking-[0.18em] uppercase">
          © August Visum — all rights reserved
        </p>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <main className="min-h-screen bg-paper flex flex-col justify-center items-center px-4 py-16">
      <Container size="narrow" className="w-full">
        {children}
      </Container>
    </main>
  );
}

function FormField({ label, input, error }) {
  return (
    <div>
      <label className="block font-cond text-[10px] tracking-[0.18em] uppercase mb-1.5 text-ink/70">
        {label}
      </label>
      {input}
      {error && (
        <span className="block mt-1 text-[11px] font-cond tracking-wide text-brick uppercase">
          {error}
        </span>
      )}
    </div>
  );
}
