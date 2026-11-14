"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQueueCreated: () => void;
}

export function CreateQueueModal({
  open,
  onOpenChange,
  onQueueCreated,
}: CreateQueueModalProps) {
  const [name, setName] = useState("");
  const [queueCode, setQueueCode] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Queue name is required");
      return;
    }
    if (!queueCode.trim() || queueCode.trim().length < 2) {
      setError("Queue code must be at least 2 characters (e.g. GEN, BIL)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          queueCode: queueCode.trim().toUpperCase(),
          description: description.trim() || null,
          capacity: capacity ? parseInt(capacity, 10) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create queue");
      }

      toast.success(`Queue "${data.queue.name}" (${data.queue.queueCode}) created!`);
      setName("");
      setQueueCode("");
      setDescription("");
      setCapacity("");
      onOpenChange(false);
      onQueueCreated();
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
              <Layers className="w-5 h-5" />
              <DialogTitle>Create New Queue</DialogTitle>
            </div>
            <DialogDescription>
              Set up a distinct operational counter or service line for customer management.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="queueName">
                Queue Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="queueName"
                placeholder="e.g. VIP Concierge or Billing Counter"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Auto-suggest code from first 3 letters if not typed
                  if (!queueCode && e.target.value.length >= 3) {
                    setQueueCode(e.target.value.slice(0, 3).toUpperCase());
                  }
                }}
                required
                className="mt-1.5"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="queueCode">
                  Queue Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="queueCode"
                  placeholder="e.g. VIP, BIL, MED"
                  maxLength={6}
                  value={queueCode}
                  onChange={(e) => setQueueCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  required
                  className="mt-1.5 uppercase font-mono"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Prefix for tokens: {queueCode ? `${queueCode}-001` : "XXX-001"}
                </span>
              </div>

              <div>
                <Label htmlFor="capacity">Max Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Unlimited"
                  min={1}
                  max={1000}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="queueDescription">Description (Optional)</Label>
              <Textarea
                id="queueDescription"
                placeholder="Purpose of this service queue, counter assignment, or intake notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              {loading ? "Creating Queue..." : "Create Queue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
