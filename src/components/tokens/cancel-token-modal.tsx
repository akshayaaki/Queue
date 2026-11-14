"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, AlertTriangle } from "lucide-react";
import { TokenItem } from "@/types";
import { toast } from "sonner";

interface CancelTokenModalProps {
  token: TokenItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function CancelTokenModal({
  token,
  open,
  onOpenChange,
  onCancelled,
}: CancelTokenModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tokens/${token.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cancel token");
      }

      toast.success(`Token ${token.tokenNumber} was cancelled.`);
      setReason("");
      onOpenChange(false);
      onCancelled();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <DialogTitle>Cancel Token {token.tokenNumber}</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel the queue token for{" "}
            <strong className="text-foreground">{token.customerName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 mb-4 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <p>
            This action will remove the customer from the active waiting queue.
            The record and audit history will be preserved for analytical reporting.
          </p>
        </div>

        <div>
          <Label htmlFor="cancelReason">Cancellation Reason (Optional)</Label>
          <Textarea
            id="cancelReason"
            placeholder="e.g. Customer left premises, duplicate token, resolved elsewhere..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1.5"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep Token
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
