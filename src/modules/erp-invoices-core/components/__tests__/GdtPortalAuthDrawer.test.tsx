import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GdtPortalAuthDrawer } from "../GdtPortalAuthDrawer";

vi.mock("../GdtPortalAuthForm", () => ({
  GdtPortalAuthForm: () => (
    <div data-testid="gdt-portal-auth-form">Auth Form</div>
  ),
}));

describe("GdtPortalAuthDrawer", () => {
  it("renders drawer when open", () => {
    render(<GdtPortalAuthDrawer open={true} onClose={vi.fn()} />);

    expect(
      screen.getByText("Đăng nhập Cổng Hóa đơn điện tử (GDT)"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("gdt-portal-auth-form")).toBeInTheDocument();
  });
});
