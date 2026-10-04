import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "./tooltip";

function TestTooltipWrapper({
  content = "Thông tin chi tiết",
  delayDuration = 0,
}: {
  content?: string;
  delayDuration?: number;
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Hover vào tôi</button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{content}</span>
          <TooltipArrow data-testid="tooltip-arrow" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("V2 Tooltip Primitive", () => {
  it("renders trigger and displays tooltip content on focus/hover", async () => {
    render(<TestTooltipWrapper content="Tooltip hiển thị thành công" />);
    const trigger = screen.getByText("Hover vào tôi");
    expect(trigger).toBeInTheDocument();

    fireEvent.focus(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Tooltip hiển thị thành công");
      expect(screen.getByTestId("tooltip-arrow")).toBeInTheDocument();
    });
  });

  it("hides tooltip content on blur", async () => {
    render(<TestTooltipWrapper content="Tooltip ẩn khi blur" />);
    const trigger = screen.getByText("Hover vào tôi");

    fireEvent.focus(trigger);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    fireEvent.blur(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
