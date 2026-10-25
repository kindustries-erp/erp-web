import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet";

function TestSheetWrapper({
  side = "right",
  hideCloseButton = false,
  onOpenChange,
}: {
  side?: "top" | "bottom" | "left" | "right";
  hideCloseButton?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onOpenChange?.(v);
      }}
    >
      <SheetTrigger asChild>
        <button type="button">Mở Sheet</button>
      </SheetTrigger>
      <SheetContent side={side} hideCloseButton={hideCloseButton}>
        <SheetHeader>
          <SheetTitle>Tiêu đề Sheet Test</SheetTitle>
          <SheetDescription>Mô tả chi tiết nội dung sheet</SheetDescription>
        </SheetHeader>
        <div data-testid="sheet-body">Nội dung thân sheet</div>
        <SheetFooter>
          <SheetClose asChild>
            <button type="button">Đóng sheet</button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("V2 Sheet Primitive", () => {
  it("renders open sheet content with title and description", () => {
    render(<TestSheetWrapper />);
    expect(screen.getByText("Tiêu đề Sheet Test")).toBeInTheDocument();
    expect(
      screen.getByText("Mô tả chi tiết nội dung sheet"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("sheet-body")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveClass(
      "bg-[var(--drawer-bg,rgba(255,255,255,0.85))]",
      "backdrop-blur-[var(--drawer-blur,20px)]",
      "shadow-[var(--drawer-shadow,var(--panel-shadow,0_12px_30px_rgba(15,23,42,0.16)))]",
      "backdrop-saturate-[190%]",
      "backdrop-contrast-[102%]",
      "text-foreground",
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-v2-standard-drawer",
    );
    expect(document.querySelector("[data-v2-sheet-overlay]")).toHaveClass(
      "bg-[var(--overlay-bg,transparent)]",
      "backdrop-blur-[var(--overlay-blur,0px)]",
    );
  });

  it("renders accessible close button with aria-label by default", () => {
    render(<TestSheetWrapper />);
    const closeBtn = screen.getByRole("button", { name: "Close" });
    expect(closeBtn).toBeInTheDocument();
  });

  it("hides close button when hideCloseButton is true", () => {
    render(<TestSheetWrapper hideCloseButton />);
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("closes sheet when SheetClose button is clicked", () => {
    const handleOpenChange = vi.fn();
    render(<TestSheetWrapper onOpenChange={handleOpenChange} />);
    const closeAction = screen.getByRole("button", { name: "Đóng sheet" });
    fireEvent.click(closeAction);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders with side=bottom correctly", () => {
    render(<TestSheetWrapper side="bottom" />);
    expect(screen.getByText("Tiêu đề Sheet Test")).toBeInTheDocument();
  });
});
