"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
      // Optional: Auto login logic or redirect to check email page
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-screen flex-col px-6 pt-[15vh] bg-background text-foreground"
    >
      <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
        <header>
          <h1 className="text-[20px] font-medium text-[#333333] font-sans">
            Join Polaroida
          </h1>
        </header>

        {success ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Success! Please check your email to confirm your account.
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border-b border-[#CCCCCC] bg-transparent py-3 text-[16px] text-foreground outline-none transition-colors focus:border-foreground placeholder:text-[#999999]"
                required
              />
            </div>
            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border-b border-[#CCCCCC] bg-transparent py-3 text-[16px] text-foreground outline-none transition-colors focus:border-foreground placeholder:text-[#999999]"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-4 flex w-full items-center justify-center rounded-sm bg-accent py-3.5 text-[16px] font-bold text-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-4 text-center">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-sm border border-[#E5E5E5] bg-white py-3.5 text-[16px] font-medium text-[#333333] transition-colors hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Or continue with Google
          </button>

          <p className="text-[14px] text-[#555555]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </motion.main>
  );
}
