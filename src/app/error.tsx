"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QueueFlowLogo } from "@/components/ui/logo";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("QueueFlow Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center mb-2">
          <QueueFlowLogo size="lg" />
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while processing this queue operation.
          </p>
          {error?.message && (
            <p className="text-xs font-mono p-2 rounded-lg bg-card border border-border text-red-600 dark:text-red-400 break-words">
              {error.message}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
