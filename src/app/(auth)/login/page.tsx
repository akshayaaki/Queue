"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QueueFlowLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password || "password123" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-brand-platinumLight/60 dark:bg-brand-navy">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <QueueFlowLogo size="lg" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-brand-navy mt-5 dark:text-white">
            Manager Access Portal
          </h2>
          <p className="text-xs text-brand-navy/60 mt-1 dark:text-brand-platinum/60">
            Sign in to manage live counters, assign tokens, and view analytics.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-brand-stone bg-white p-7 sm:p-8 shadow-card relative overflow-hidden dark:border-brand-pine dark:bg-brand-forest">
          {/* Universal Access Notice */}
          <div className="mb-5 p-3 rounded-xl bg-brand-sage/25 border border-brand-sage text-[11px] font-semibold text-brand-forest flex items-center gap-2 dark:text-brand-stone">
            <Sparkles className="w-4 h-4 text-brand-fern shrink-0" />
            <span>Universal Login Enabled • Enter any email and password.</span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Manager Email</Label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-forest/40 dark:text-brand-stone/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Universal access is active. Any password will log you in.");
                  }}
                  className="text-xs text-brand-forest/70 hover:text-brand-fern font-bold transition-colors dark:text-brand-stone/70 dark:hover:text-brand-sage"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-forest/40 dark:text-brand-stone/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-forest/40 hover:text-brand-forest dark:text-brand-stone/40 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-brand-forest/70 dark:text-brand-stone/70 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-brand-stone text-brand-pine focus:ring-brand-pine"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={loading}
              className="w-full mt-2 font-bold shadow-pine"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-brand-forest/60 mt-6 dark:text-brand-stone/60">
          Want a new manager workspace?{" "}
          <Link href="/register" className="font-bold text-brand-forest hover:text-brand-fern hover:underline dark:text-brand-sage">
            Register Manager
          </Link>
        </p>
      </div>
    </div>
  );
}
