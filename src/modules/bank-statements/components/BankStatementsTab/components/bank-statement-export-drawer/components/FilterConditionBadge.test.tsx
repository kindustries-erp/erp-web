import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterConditionBadge } from "./FilterConditionBadge";

describe("FilterConditionBadge", () => {
  it("renders label and value correctly", () => {
    render(<FilterConditionBadge label="Nội dung" value="TT POS" />);

    expect(screen.getByText("Nội dung:")).toBeInTheDocument();
    expect(screen.getByText("TT POS")).toBeInTheDocument();
  });

  it("renders fallback dash when value is empty", () => {
    render(<FilterConditionBadge label="Số tiền" value="" />);

    expect(screen.getByText("Số tiền:")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("applies neutral styling classes without blue colors", () => {
    const { container } = render(
      <FilterConditionBadge label="Chi nhánh" value="Nam Sài Gòn" />,
    );

    const badge = container.querySelector(
      '[data-testid="filter-condition-badge"]',
    );
    expect(badge).toBeInTheDocument();
    expect(badge?.className).not.toMatch(/(blue|sky|cyan)/i);
  });
});
