import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QueueFlowLogo } from "@/components/ui/logo";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center dark:bg-slate-950">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center mb-2">
          <QueueFlowLogo size="lg" />
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 font-mono text-2xl font-bold dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page or queue terminal you are trying to access does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="default" asChild className="w-full sm:w-auto gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
