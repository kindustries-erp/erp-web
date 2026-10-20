import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
} from "./popover";

function TestPopoverWrapper({
  defaultOpen = false,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onOpenChange?.(v);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button">Mở Popover</button>
      </PopoverTrigger>
      <PopoverContent>
        <div data-testid="popover-content">Nội dung Popover Test</div>
        <PopoverClose asChild>
          <button type="button">Đóng Popover</button>
        </PopoverClose>
        <PopoverArrow data-testid="popover-arrow" />
      </PopoverContent>
    </Popover>
  );
}

describe("V2 Popover Primitive", () => {
  it("renders trigger button initially and content when opened", () => {
    render(<TestPopoverWrapper defaultOpen={false} />);
    expect(screen.getByText("Mở Popover")).toBeInTheDocument();
    expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Mở Popover"));
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    expect(screen.getByTestId("popover-arrow")).toBeInTheDocument();
  });

  it("calls onOpenChange when trigger is clicked", () => {
    const handleOpenChange = vi.fn();
    render(<TestPopoverWrapper onOpenChange={handleOpenChange} />);

    fireEvent.click(screen.getByText("Mở Popover"));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes popover when PopoverClose is clicked", () => {
    const handleOpenChange = vi.fn();
    render(
      <TestPopoverWrapper defaultOpen={true} onOpenChange={handleOpenChange} />,
    );

    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    const closeBtn = screen.getByText("Đóng Popover");
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
