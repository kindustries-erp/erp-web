import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2BranchBadge } from "./V2BranchBadge";

describe("V2BranchBadge Molecule", () => {
  it("renders branch name and company info", () => {
    const handleClick = vi.fn();
    render(
      <V2BranchBadge
        branchName="Chi nhánh Quận 7"
        companyName="Enterprise Industries"
        onClick={handleClick}
      />,
    );

    expect(screen.getByText("Chi nhánh Quận 7")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Industries")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Chi nhánh: Chi nhánh Quận 7" }),
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
