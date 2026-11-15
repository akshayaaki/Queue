import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { QueueFlowLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-brand-forest selection:bg-brand-sage/30 selection:text-brand-forest dark:bg-brand-forest dark:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-stone bg-white/95 backdrop-blur-md dark:border-brand-pine dark:bg-brand-forest/95">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <QueueFlowLogo size="default" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-brand-forest hover:text-black font-bold dark:text-white">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="default" size="sm" asChild className="font-bold shadow-xs">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sage/25 border border-brand-sage text-xs font-bold text-brand-forest mb-6 shadow-xs dark:text-brand-stone dark:bg-brand-sage/20">
          <Sparkles className="w-3.5 h-3.5 text-brand-fern" />
          <span>QueueFlow 2.0 • Precision Queue Dispatch Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-brand-forest max-w-4xl mx-auto leading-[1.08] dark:text-white">
          Intelligent queue dispatch for{" "}
          <span className="text-brand-fern">modern teams.</span>
        </h1>

        <p className="text-base sm:text-lg text-brand-forest/75 max-w-2xl mx-auto mt-6 leading-relaxed dark:text-brand-stone/75">
          Engineered for clinics, government counters, enterprise service desks, and high-volume lobbies.
          Atomic token sequencing, zero duplicate allocations, and real-time counter metrics.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <Button size="lg" variant="hero" asChild className="w-full sm:w-auto px-8 gap-2 font-bold text-base shadow-pine">
            <Link href="/register">
              <span>Start Managing Queues</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8 text-base font-bold">
            <Link href="/login">Sign In to Counter</Link>
          </Button>
        </div>

        {/* Live Interface Mockup / Preview Banner */}
        <div className="mt-14 p-2.5 rounded-2xl border border-brand-stone bg-brand-platinumLight/60 shadow-card max-w-4xl mx-auto dark:border-brand-pine dark:bg-brand-forest">
          <div className="rounded-xl border border-brand-stone bg-white p-6 shadow-xs text-left dark:border-brand-pine dark:bg-brand-forest">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-brand-stone gap-4 dark:border-brand-pine">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest flex items-center justify-center text-brand-stone font-black text-sm shadow-xs border border-brand-pine">
                  Q1
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-brand-forest dark:text-white">Main Service Desk</h3>
                  <p className="text-xs text-brand-forest/60 dark:text-brand-stone/60">Live Counter • Auto Sequential Dispatch</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-fern/15 text-brand-forest border border-brand-fern/40">
                  <span className="w-2 h-2 rounded-full bg-brand-fern animate-pulse" />
                  Terminal Online
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-stone/40 text-brand-forest dark:bg-brand-pine dark:text-brand-stone">
                  <Users className="w-3.5 h-3.5 text-brand-fern" />
                  4 In Queue
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              <div className="p-4 rounded-xl border border-brand-stone bg-brand-platinumLight/60 dark:border-brand-pine dark:bg-brand-forest">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/60 dark:text-brand-stone/60">Currently Serving</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-brand-fern">Q-104</span>
                  <span className="text-xs text-brand-forest/60 dark:text-brand-stone/60">Counter 2</span>
                </div>
                <div className="text-xs text-brand-forest/70 mt-1 dark:text-brand-stone/70">Duration: 4m 12s</div>
              </div>

              <div className="p-4 rounded-xl border border-brand-stone bg-brand-platinumLight/60 dark:border-brand-pine dark:bg-brand-forest">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/60 dark:text-brand-stone/60">Next in Line</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-brand-forest dark:text-white">Q-105</span>
                  <span className="text-xs text-brand-fern font-bold">Estimated wait: 2m</span>
                </div>
                <div className="text-xs text-brand-forest/70 mt-1 dark:text-brand-stone/70">Customer verified</div>
              </div>

              <div className="p-4 rounded-xl border border-brand-stone bg-brand-platinumLight/60 dark:border-brand-pine dark:bg-brand-forest">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/60 dark:text-brand-stone/60">Today's Throughput</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-brand-forest dark:text-white">142</span>
                  <span className="text-xs text-brand-forest/60 dark:text-brand-stone/60">served</span>
                </div>
                <div className="text-xs text-brand-fern mt-1 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  98.6% completion
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-7 rounded-2xl border border-brand-stone bg-white shadow-card hover:border-brand-fern/60 transition-all dark:border-brand-pine dark:bg-brand-forest">
            <div className="w-10 h-10 rounded-xl bg-brand-sage/20 text-brand-forest flex items-center justify-center mb-4 border border-brand-sage dark:text-brand-stone">
              <Zap className="w-5 h-5 text-brand-fern" />
            </div>
            <h3 className="text-base font-extrabold text-brand-forest dark:text-white">
              Atomic Token Allocation
            </h3>
            <p className="text-xs text-brand-forest/70 mt-2 leading-relaxed dark:text-brand-stone/70">
              Database transactions prevent race conditions, skips, and duplicate numbering across simultaneous counter terminals.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-brand-stone bg-white shadow-card hover:border-brand-fern/60 transition-all dark:border-brand-pine dark:bg-brand-forest">
            <div className="w-10 h-10 rounded-xl bg-brand-forest text-brand-stone flex items-center justify-center mb-4 border border-brand-pine">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-brand-forest dark:text-white">
              Multi-Tenant Isolation
            </h3>
            <p className="text-xs text-brand-forest/70 mt-2 leading-relaxed dark:text-brand-stone/70">
              Role-based session isolation guarantees managers only access, inspect, and dispatch tokens within their owned queues.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-brand-stone bg-white shadow-card hover:border-brand-fern/60 transition-all dark:border-brand-pine dark:bg-brand-forest">
            <div className="w-10 h-10 rounded-xl bg-brand-stone/40 text-brand-forest flex items-center justify-center mb-4 border border-brand-stone">
              <BarChart3 className="w-5 h-5 text-brand-fern" />
            </div>
            <h3 className="text-base font-extrabold text-brand-forest dark:text-white">
              Real Aggregated Telemetry
            </h3>
            <p className="text-xs text-brand-forest/70 mt-2 leading-relaxed dark:text-brand-stone/70">
              Accurate wait durations, service times, and queue throughput computed directly from persisted audit events.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-stone py-8 text-center text-xs text-brand-forest/60 dark:border-brand-pine dark:text-brand-stone/60">
        QueueFlow Pro • Built with Next.js App Router, Prisma ORM, and Realtime SSE
      </footer>
    </div>
  );
}
