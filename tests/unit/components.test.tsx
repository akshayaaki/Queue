// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { QueueFlowLogo } from "@/components/ui/logo";

describe("UI Component Tests", () => {
  it("should render StatusBadge with correct labels and styles", () => {
    const { rerender } = render(<StatusBadge status="WAITING" />);
    expect(screen.getByText("Waiting")).toBeInTheDocument();

    rerender(<StatusBadge status="SERVING" />);
    expect(screen.getByText("Serving Now")).toBeInTheDocument();

    rerender(<StatusBadge status="CALLED" />);
    expect(screen.getByText("Called")).toBeInTheDocument();

    rerender(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();

    rerender(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();

    rerender(<StatusBadge status="SKIPPED" />);
    expect(screen.getByText("Skipped")).toBeInTheDocument();
  });

  it("should render QueueFlowLogo with brand title and glyph", () => {
    render(<QueueFlowLogo />);
    expect(screen.getByText("Queue")).toBeInTheDocument();
    expect(screen.getByText("Flow")).toBeInTheDocument();
    expect(screen.getByText(/Enterprise/i)).toBeInTheDocument();
  });
});
