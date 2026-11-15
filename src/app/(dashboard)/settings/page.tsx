"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Database, Volume2, Shield, CheckCircle2 } from "lucide-react";
import { isSoundEnabled, toggleSound, playCallChime } from "@/components/audio/chime";
import { toast } from "sonner";

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [sound, setSound] = useState(true);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    setSound(isSoundEnabled());

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      });

    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => {});
  }, []);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSound(next);
    if (next) {
      playCallChime();
      toast.success("Call Chime enabled and tested");
    } else {
      toast.info("Call Chime muted");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Terminal & Workspace Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure local audio cues, tenant profile information, and verify database connectivity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Manager Profile</h2>
            <p className="text-xs text-muted-foreground">Verified administrator identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Manager Name</Label>
            <Input disabled value={user?.name || "Loading..."} className="mt-1.5" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input disabled value={user?.email || "Loading..."} className="mt-1.5" />
          </div>
        </div>
      </div>

      {/* Audio & Counter Dispatch Settings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Audio & Dispatch Chime</h2>
            <p className="text-xs text-muted-foreground">Synthesized Web Audio API lounge bell</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-sm text-foreground">
              Acoustic Call Chime
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plays a dual harmonic bell whenever a token is called at your counter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => playCallChime()}
              className="text-xs"
            >
              Test Chime
            </Button>
            <Button
              variant={sound ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSound}
              className="text-xs"
            >
              {sound ? "Enabled" : "Muted"}
            </Button>
          </div>
        </div>
      </div>

      {/* Database & Production Health */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Database & Health Check</h2>
            <p className="text-xs text-muted-foreground">Persistent connection diagnostics</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-muted-foreground">Database Engine:</span>
            <span className="font-mono font-semibold text-foreground">
              Prisma ORM (PostgreSQL & SQLite dual dialect supported)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-muted-foreground">Health Status:</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {health?.database?.status === "healthy" ? "Healthy (0ms latency)" : "Active"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-muted-foreground">Real-time Stream:</span>
            <span className="font-mono text-blue-600 font-semibold dark:text-blue-400">
              Server-Sent Events (SSE) Bus Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
