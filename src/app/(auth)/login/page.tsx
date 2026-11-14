"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QueueFlowLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-[#FEFAE0]/40 via-background to-[#FAEDCD]/30 dark:from-[#1A1612] dark:to-[#141210]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <QueueFlowLogo size="lg" />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif mt-5">
            Manager Access Portal
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to manage live counters, assign tokens, and view analytics.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-8 shadow-bespoke relative overflow-hidden">
          {/* Subtle top accent gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-palette-sage via-palette-bisque to-palette-ochre" />

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
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@queueflow.com"
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
                    toast.info("Password reset instructions sent if configured. (Demo pass: password123)");
                  }}
                  className="text-xs text-palette-ochreDark hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-palette-ochre focus:ring-palette-ochre"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={loading}
              className="w-full mt-2 font-bold shadow-md"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Quick Demo Credentials Fill for Interview/Evaluation */}
          <div className="mt-6 pt-5 border-t border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center mb-2.5">
              Quick One-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("alex@queueflow.com")}
                className="p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-palette-bisque/50 hover:border-palette-ochre/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-foreground truncate">Alex Vance</div>
                <div className="text-[10px] text-muted-foreground truncate">General Desk</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("sarah@queueflow.com")}
                className="p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-palette-bisque/50 hover:border-palette-ochre/40 text-left transition-all text-xs"
              >
                <div className="font-semibold text-foreground truncate">Dr. Sarah Chen</div>
                <div className="text-[10px] text-muted-foreground truncate">Clinical Desk</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Don't have an enterprise account?{" "}
          <Link href="/register" className="font-bold text-palette-ochreDark hover:underline">
            Register Manager
          </Link>
        </p>
      </div>
    </div>
  );
}
