"use client";

import React, { useState, useEffect } from "react";
import { QueueSummary, QueueStatus } from "@/types";
import { QueueCard } from "@/components/queues/queue-card";
import { CreateQueueModal } from "@/components/queues/create-queue-modal";
import { EditQueueModal } from "@/components/queues/edit-queue-modal";
import { AddCustomerModal } from "@/components/tokens/add-customer-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Layers, Filter } from "lucide-react";
import { toast } from "sonner";

export default function QueuesPage() {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<QueueSummary | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/queues", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.queues) {
        setQueues(data.queues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueues();
  };

  const handleDelete = async (queueId: string) => {
    if (!confirm("Are you sure you want to permanently delete this queue?")) return;
    try {
      const res = await fetch(`/api/queues/${queueId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete queue");
      toast.success("Queue deleted");
      fetchQueues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Queue Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure department queues, unique token numbering prefixes, and counter capacities.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="default" className="gap-2 font-semibold">
          <PlusCircle className="w-4 h-4" />
          Create New Queue
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search queue name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "PAUSED", "INACTIVE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-brand-gold text-brand-navy shadow-xs font-bold"
                  : "bg-brand-platinum text-brand-navy/70 hover:bg-brand-platinum/80 hover:text-brand-navy"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queues Grid */}
      {queues.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-border bg-card">
          <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No Queues Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            {search || statusFilter !== "ALL"
              ? "No queues match your search query."
              : "Create your first queue to start accepting customer tokens."}
          </p>
          <Button onClick={() => setCreateOpen(true)} variant="default">
            Create Queue
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {queues.map((q) => (
            <QueueCard
              key={q.id}
              queue={q}
              onEdit={(queue) => {
                setSelectedQueue(queue);
                setEditOpen(true);
              }}
              onDelete={handleDelete}
              onAddCustomer={(queue) => {
                setSelectedQueue(queue);
                setAddCustomerOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateQueueModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onQueueCreated={fetchQueues}
      />

      <EditQueueModal
        queue={selectedQueue}
        open={editOpen}
        onOpenChange={setEditOpen}
        onQueueUpdated={fetchQueues}
      />

      {selectedQueue && (
        <AddCustomerModal
          open={addCustomerOpen}
          onOpenChange={setAddCustomerOpen}
          queueId={selectedQueue.id}
          queueCode={selectedQueue.queueCode}
          nextTokenNumber={selectedQueue.nextTokenNumber}
          onCustomerAdded={fetchQueues}
        />
      )}
    </div>
  );
}
