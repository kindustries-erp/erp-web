import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BusinessPartnerStatusBadge } from "./BusinessPartnerStatusBadge";

describe("BusinessPartnerStatusBadge", () => {
  it("shows the active label for ACTIVE partners", () => {
    render(<BusinessPartnerStatusBadge status="ACTIVE" />);
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
  });

  it("shows the inactive label for INACTIVE partners", () => {
    render(<BusinessPartnerStatusBadge status="INACTIVE" />);
    expect(screen.getByText("Ngưng hoạt động")).toBeInTheDocument();
  });
});
