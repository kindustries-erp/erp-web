import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { TableDateCell } from "../TableDateCell";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe("TableDateCell", () => {
  it("renders dash with text-muted-foreground when date is missing", () => {
    renderWithProviders(<TableDateCell date={null} />);
    const dash = screen.getByText("—");
    expect(dash).toBeInTheDocument();
    expect(dash).toHaveClass("text-muted-foreground");
  });

  it("renders datePart with text-foreground and timePart with text-muted-foreground", () => {
    // 2026-10-24T00:23:00Z -> formatted in GMT+7: 24/10/2026 07:23
    const isoString = "2026-10-24T00:23:00Z";
    const { container } = renderWithProviders(
      <TableDateCell date={isoString} />,
    );

    const dateSpan = container.querySelector(".text-foreground");
    expect(dateSpan).toBeInTheDocument();
    expect(dateSpan).toHaveClass("text-sm", "text-foreground");
    expect(dateSpan?.textContent).toBe("24/10/2026");

    const timeSpan = container.querySelector(".text-muted-foreground");
    expect(timeSpan).toBeInTheDocument();
    expect(timeSpan).toHaveClass("text-[11px]", "text-muted-foreground");
    expect(timeSpan?.textContent).toBe("07:23");
  });

  it("renders date-only format without timePart", () => {
    const isoString = "2026-10-24T00:23:00Z";
    const { container } = renderWithProviders(
      <TableDateCell date={isoString} format="date" />,
    );

    const dateSpan = container.querySelector(".text-foreground");
    expect(dateSpan).toBeInTheDocument();
    expect(dateSpan?.textContent).toBe("24/10/2026");

    const timeSpan = container.querySelector(".text-muted-foreground");
    expect(timeSpan).toBeNull();
  });
});
