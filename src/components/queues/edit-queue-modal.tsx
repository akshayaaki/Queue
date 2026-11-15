"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QueueSummary, QueueStatus } from "@/types";
import { Edit3, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EditQueueModalProps {
  queue: QueueSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQueueUpdated: () => void;
}

export function EditQueueModal({
  queue,
  open,
  onOpenChange,
  onQueueUpdated,
}: EditQueueModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<QueueStatus>("ACTIVE");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queue) {
      setName(queue.name);
      setDescription(queue.description || "");
      setStatus(queue.status);
      setCapacity(queue.capacity ? String(queue.capacity) : "");
    }
  }, [queue]);

  if (!queue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Queue name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/queues/${queue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          capacity: capacity ? parseInt(capacity, 10) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update queue");
      }

      toast.success("Queue updated successfully");
      onOpenChange(false);
      onQueueUpdated();
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
            <div className="flex items-center gap-2 text-blue-600">
              <Edit3 className="w-5 h-5" />
              <DialogTitle>Edit Queue: {queue.name}</DialogTitle>
            </div>
            <DialogDescription>
              Update queue details, active state, or counter capacity.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Queue Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="editStatus">Queue Status</Label>
                <select
                  id="editStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QueueStatus)}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600 mt-1.5 transition-all shadow-xs"
                >
                  <option value="ACTIVE">ACTIVE (Open)</option>
                  <option value="PAUSED">PAUSED (Hold intake)</option>
                  <option value="INACTIVE">INACTIVE (Closed)</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <Label htmlFor="editCapacity">Max Capacity (Optional)</Label>
                <Input
                  id="editCapacity"
                  type="number"
                  placeholder="Unlimited"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
