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
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <QueueFlowLogo size="default" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900 font-medium">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="default" size="sm" asChild className="font-semibold shadow-xs">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700 mb-6 shadow-xs dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>QueueFlow 2.0 • Precision Multi-Tenant Queue Dispatch</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08] dark:text-white">
          Intelligent queue dispatch for{" "}
          <span className="text-blue-600">modern teams.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed dark:text-slate-400">
          Engineered for clinics, government counters, enterprise service desks, and high-volume lobbies.
          Atomic token sequencing, zero duplicate allocations, and real-time counter metrics.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <Button size="lg" variant="default" asChild className="w-full sm:w-auto px-8 gap-2 font-semibold text-base shadow-sm">
            <Link href="/register">
              <span>Start Managing Queues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8 text-base font-semibold">
            <Link href="/login">Sign In to Counter</Link>
          </Button>
        </div>

        {/* Live Interface Mockup / Preview Banner */}
        <div className="mt-14 p-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-card max-w-4xl mx-auto dark:border-slate-800 dark:bg-slate-900/40">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs text-left dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  Q1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Main Service Desk</h3>
                  <p className="text-xs text-slate-500">Live Counter • Auto Sequential Dispatch</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Terminal Online
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5" />
                  4 In Queue
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Currently Serving</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-blue-600">Q-104</span>
                  <span className="text-xs text-slate-500">Counter 2</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 dark:text-slate-400">Duration: 4m 12s</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next in Line</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">Q-105</span>
                  <span className="text-xs text-amber-600 font-medium">Estimated wait: 2m</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 dark:text-slate-400">Customer verified</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Throughput</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-600">142</span>
                  <span className="text-xs text-slate-500">served</span>
                </div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  98.6% completion
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Atomic Token Allocation
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed dark:text-slate-400">
              Database transactions prevent race conditions, skips, and duplicate numbering across simultaneous counter terminals.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Tenant Isolation
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed dark:text-slate-400">
              Role-based session isolation guarantees managers only access, inspect, and dispatch tokens within their owned queues.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Real Aggregated Telemetry
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed dark:text-slate-400">
              Accurate wait durations, service times, and queue throughput computed directly from persisted audit events.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
        QueueFlow Enterprise Queue Management System • Built with Next.js App Router, Prisma ORM, and Realtime SSE
      </footer>
    </div>
  );
}
