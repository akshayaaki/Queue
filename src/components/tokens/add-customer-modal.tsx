"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueId: string;
  queueCode: string;
  nextTokenNumber: number;
  onCustomerAdded: () => void;
}

export function AddCustomerModal({
  open,
  onOpenChange,
  queueId,
  queueCode,
  nextTokenNumber,
  onCustomerAdded,
}: AddCustomerModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewToken = `${queueCode.toUpperCase()}-${String(nextTokenNumber).padStart(3, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/queues/${queueId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add customer");
      }

      toast.success(`Token ${data.token.tokenNumber} created for ${data.token.customerName}!`);
      setCustomerName("");
      setPhone("");
      setEmail("");
      setNotes("");
      onOpenChange(false);
      onCustomerAdded();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-palette-ochreDark">
              <UserPlus className="w-5 h-5" />
              <DialogTitle>Add Customer to Queue</DialogTitle>
            </div>
            <DialogDescription>
              Assign the next sequential queue token to an arriving visitor or customer.
            </DialogDescription>
          </DialogHeader>

          {/* Token Preview Banner */}
          <div className="mb-5 p-3.5 rounded-xl bg-palette-parchment border border-palette-ochre/30 flex items-center justify-between dark:bg-[#2B231A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-palette-ochreDark" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Token Preview
              </span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-palette-bisque text-palette-charcoal font-mono font-bold text-sm border border-palette-ochre/40 shadow-xs dark:bg-palette-ochre/20 dark:text-palette-ochre">
              {previewToken}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="mt-1.5"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Service Notes / Reason (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Reason for visit, reference numbers, or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? "Issuing Token..." : "Issue Token"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
