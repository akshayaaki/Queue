type EventListener = (event: { type: string; queueId: string; data?: any; timestamp: number }) => void;

class RealtimeEventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  subscribe(queueId: string, listener: EventListener): () => void {
    if (!this.listeners.has(queueId)) {
      this.listeners.set(queueId, new Set());
    }
    this.listeners.get(queueId)!.add(listener);

    return () => {
      const set = this.listeners.get(queueId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(queueId);
        }
      }
    };
  }

  broadcast(queueId: string, event: { type: string; data?: any }) {
    const payload = {
      ...event,
      queueId,
      timestamp: Date.now(),
    };

    const set = this.listeners.get(queueId);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error("[RealtimeEventBus] Error dispatching to listener:", err);
        }
      });
    }

    // Also broadcast to global "all" channel if any listeners exist
    const globalSet = this.listeners.get("*");
    if (globalSet) {
      globalSet.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error("[RealtimeEventBus] Global listener error:", err);
        }
      });
    }
  }
}

// Global singleton across server invocations
declare global {
  // eslint-disable-next-line no-var
  var eventBusGlobal: RealtimeEventBus | undefined;
}

export const eventBus = globalThis.eventBusGlobal ?? new RealtimeEventBus();

if (process.env.NODE_ENV !== "production") {
  globalThis.eventBusGlobal = eventBus;
}

export default eventBus;
