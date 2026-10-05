import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

function TestDialogWrapper({
  hideCloseButton = false,
  onOpenChange,
}: {
  hideCloseButton?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onOpenChange?.(v);
      }}
    >
      <DialogTrigger asChild>
        <button type="button">Mở modal</button>
      </DialogTrigger>
      <DialogContent hideCloseButton={hideCloseButton}>
        <DialogHeader>
          <DialogTitle>Tiêu đề Modal Test</DialogTitle>
          <DialogDescription>Mô tả chi tiết nội dung modal</DialogDescription>
        </DialogHeader>
        <div data-testid="dialog-body">Nội dung thân modal</div>
        <DialogFooter>
          <DialogClose asChild>
            <button type="button">Đóng lại</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("V2 Dialog Primitive", () => {
  it("renders open dialog content with title and description", () => {
    render(<TestDialogWrapper />);
    expect(screen.getByText("Tiêu đề Modal Test")).toBeInTheDocument();
    expect(
      screen.getByText("Mô tả chi tiết nội dung modal"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
  });

  it("renders accessible close button with aria-label by default", () => {
    render(<TestDialogWrapper />);
    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    expect(closeBtn).toBeInTheDocument();
  });

  it("hides close button when hideCloseButton is true", () => {
    render(<TestDialogWrapper hideCloseButton />);
    expect(
      screen.queryByRole("button", { name: "Close dialog" }),
    ).not.toBeInTheDocument();
  });

  it("closes dialog when DialogClose button is clicked", () => {
    const handleOpenChange = vi.fn();
    render(<TestDialogWrapper onOpenChange={handleOpenChange} />);
    const closeAction = screen.getByRole("button", { name: "Đóng lại" });
    fireEvent.click(closeAction);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
