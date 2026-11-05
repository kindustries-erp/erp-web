import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoleStatusBadge } from "./RoleStatusBadge";

describe("RoleStatusBadge", () => {
  it("shows the active label for ACTIVE records", () => {
    render(<RoleStatusBadge status="ACTIVE" />);
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
  });

  it("shows the inactive label for INACTIVE records", () => {
    render(<RoleStatusBadge status="INACTIVE" />);
    expect(screen.getByText("Ngưng hoạt động")).toBeInTheDocument();
  });
});
