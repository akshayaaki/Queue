import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "QueueFlow | Production Queue Management System",
  description:
    "Enterprise-grade queue and customer flow management system with real-time synchronization, atomic token dispatch, and live operational analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "rounded-xl font-sans text-xs border border-border shadow-lg",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
