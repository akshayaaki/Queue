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
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0]/40 via-background to-[#FAEDCD]/30 text-foreground selection:bg-[#FAEDCD] selection:text-[#586938]">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-border/60">
        <QueueFlowLogo size="default" />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="default" size="sm" asChild className="font-bold shadow-xs">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-palette-sage/30 border border-palette-sage/60 text-xs font-semibold text-[#2D3E1A] mb-8 shadow-xs dark:text-[#C5D5A0]">
          <Sparkles className="w-3.5 h-3.5 text-[#586938]" />
          <span>QueueFlow Enterprise 2.0 • Precision Queue Dispatch</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif text-foreground max-w-4xl mx-auto leading-[1.1]">
          Modern Queue Management,{" "}
          <span className="italic font-normal bg-gradient-to-r from-palette-ochre via-[#C6925B] to-palette-ochreDark bg-clip-text text-transparent">
            Perfected.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
          The full-stack queue management platform engineered for hospital clinics, enterprise lobbies, and high-volume counters.
          Atomic token generation, real-time live synchronization, and database-backed analytics.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button size="lg" variant="hero" asChild className="w-full sm:w-auto px-8 gap-2 font-bold text-base shadow-lg">
            <Link href="/login">
              <span>Launch Live Terminal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8 text-base">
            <Link href="/register">Create Manager Account</Link>
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-7 rounded-3xl border border-border bg-card/80 backdrop-blur-xs shadow-bespoke">
            <div className="w-10 h-10 rounded-2xl bg-palette-bisque text-palette-ochreDark flex items-center justify-center mb-4 border border-palette-ochre/30">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Atomic Token Allocation
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Database transactions prevent race conditions and duplicate numbering. Sequential token prefixing tailored to each department.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-card/80 backdrop-blur-xs shadow-bespoke">
            <div className="w-10 h-10 rounded-2xl bg-palette-celery text-[#2D3E1A] flex items-center justify-center mb-4 border border-palette-sage">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Multi-Tenant Manager Isolation
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Strict server-side verification ensures managers can only inspect and operate queues authorized to their account.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-card/80 backdrop-blur-xs shadow-bespoke">
            <div className="w-10 h-10 rounded-2xl bg-palette-parchment text-palette-ochreDark flex items-center justify-center mb-4 border border-palette-ochre/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Real Aggregated Telemetry
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Calculates wait times, service durations, and throughput from actual persisted audit events, with zero fake mock responses.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        QueueFlow Enterprise Queue Management System • Built with Next.js App Router, Prisma ORM, and Realtime SSE
      </footer>
    </div>
  );
}
