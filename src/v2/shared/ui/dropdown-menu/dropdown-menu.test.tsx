import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu";

function TestDropdownMenuWrapper({
  defaultOpen = false,
  onItemClick,
}: {
  defaultOpen?: boolean;
  onItemClick?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button">Thao tác</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>ĐỒNG BỘ</DropdownMenuLabel>
          <DropdownMenuItem data-testid="item-sync" onClick={onItemClick}>
            Đồng bộ từ GDT
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>XUẤT DỮ LIỆU</DropdownMenuLabel>
          <DropdownMenuItem data-testid="item-export">
            Xuất Excel hóa đơn
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("V2 DropdownMenu Primitive", () => {
  it("renders trigger button and reveals content on click", () => {
    render(<TestDropdownMenuWrapper defaultOpen={false} />);
    expect(screen.getByText("Thao tác")).toBeInTheDocument();
    expect(screen.queryByText("ĐỒNG BỘ")).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText("Thao tác"), {
      button: 0,
      ctrlKey: false,
    });
    expect(screen.getByText("ĐỒNG BỘ")).toBeInTheDocument();

    expect(screen.getByText("Đồng bộ từ GDT")).toBeInTheDocument();
    expect(screen.getByText("XUẤT DỮ LIỆU")).toBeInTheDocument();
    expect(screen.getByText("Xuất Excel hóa đơn")).toBeInTheDocument();
  });

  it("handles item clicks properly", () => {
    const handleClick = vi.fn();
    render(
      <TestDropdownMenuWrapper defaultOpen={true} onItemClick={handleClick} />,
    );

    const syncItem = screen.getByTestId("item-sync");
    fireEvent.click(syncItem);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
