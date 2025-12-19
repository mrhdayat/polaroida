"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background text-foreground overflow-hidden px-6">
      {/* Branding Icon - Top Left */}
      <div className="absolute top-6 left-6">
        <Camera size={20} strokeWidth={2} className="text-foreground" />
      </div>

      {/* Main Content Container */}
      <div className="flex w-full flex-col items-center mt-[40vh]">
        {/* Logo/Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center text-[40px] font-black tracking-[0.05em] leading-tight text-foreground"
        >
          Polaroida
        </motion.h1>

        {/* Actions */}
        <div className="mt-12 flex w-full max-w-[280px] flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-sm border border-foreground bg-transparent py-3 text-base font-normal text-foreground transition-all duration-200 active:scale-95 hover:bg-foreground/5"
            >
              Login
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-sm border border-foreground bg-transparent py-3 text-base font-normal text-foreground transition-all duration-200 active:scale-95 hover:bg-foreground/5"
            >
              Register
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
