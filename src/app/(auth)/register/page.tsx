"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QueueFlowLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your work email");
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || email.split("@")[0],
          email: email.trim(),
          password: password || "password123",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success(`Account ready for ${data.user.name}!`);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
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
            Register Manager Account
          </h2>
          <p className="text-xs text-brand-navy/60 mt-1 dark:text-brand-platinum/60">
            Create your administrative workspace to deploy queues and call customers.
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-brand-platinum bg-white p-7 sm:p-8 shadow-card relative overflow-hidden dark:border-brand-navyLight dark:bg-brand-navyDark">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 dark:text-brand-platinum/40" />
                <Input
                  id="name"
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Work Email</Label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 dark:text-brand-platinum/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jordan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 dark:text-brand-platinum/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm</Label>
                <div className="relative mt-1.5">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 dark:text-brand-platinum/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="p-3 rounded-xl bg-brand-gold/15 border border-brand-gold/40 text-[11px] font-semibold text-brand-navy flex items-center gap-2 dark:text-brand-gold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-brand-gold" />
                <span>Default service queue will be provisioned automatically.</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={loading}
              className="w-full mt-3 font-bold shadow-gold"
            >
              {loading ? "Creating Account..." : "Create Manager Workspace"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-brand-navy/60 mt-6 dark:text-brand-platinum/60">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-navy hover:text-brand-gold hover:underline dark:text-brand-gold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
