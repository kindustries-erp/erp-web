import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvoiceDebtStatusBadge } from "./InvoiceDebtStatusBadge";

describe("InvoiceDebtStatusBadge", () => {
  it("shows the active label for ACTIVE records", () => {
    render(<InvoiceDebtStatusBadge status="ACTIVE" />);
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
  });

  it("shows the inactive label for INACTIVE records", () => {
    render(<InvoiceDebtStatusBadge status="INACTIVE" />);
    expect(screen.getByText("Ngưng hoạt động")).toBeInTheDocument();
  });
});
