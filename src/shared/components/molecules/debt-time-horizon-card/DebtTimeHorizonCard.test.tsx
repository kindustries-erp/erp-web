import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Calendar } from "lucide-react";
import { DebtTimeHorizonCard } from "./DebtTimeHorizonCard";

describe("DebtTimeHorizonCard", () => {
  it("renders card with title, badge and amounts", () => {
    const onClick = vi.fn();
    render(
      <DebtTimeHorizonCard
        title="7 ngày tới"
        badge="T+7"
        icon={Calendar}
        inLabel="Phải thu"
        inAmount={10000000}
        outLabel="Phải trả"
        outAmount={4000000}
        netLabel="Chênh lệch"
        netAmount={6000000}
        onClick={onClick}
      />,
    );

    expect(screen.getByText("7 ngày tới")).toBeInTheDocument();
    expect(screen.getByText("T+7")).toBeInTheDocument();
    expect(screen.getByText("+10.000.000 ₫")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
