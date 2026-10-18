import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionGuard } from "./PermissionGuard";

const allowed = { current: true };

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => allowed.current,
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (key: string) => key }),
}));

describe("PermissionGuard", () => {
  beforeEach(() => {
    allowed.current = true;
  });

  it("renders children when the user has permission", () => {
    render(
      <PermissionGuard permission={{ collection: "erp_invoices" }}>
        <div>nội dung trang</div>
      </PermissionGuard>,
    );
    expect(screen.getByText("nội dung trang")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the forbidden message when permission is missing", () => {
    allowed.current = false;
    render(
      <PermissionGuard permission={{ collection: "erp_invoices" }}>
        <div>nội dung trang</div>
      </PermissionGuard>,
    );
    expect(screen.queryByText("nội dung trang")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("v2.guard.forbidden");
  });

  it("renders a custom fallback instead of the default message", () => {
    allowed.current = false;
    render(
      <PermissionGuard
        permission={{ collection: "erp_invoices" }}
        fallback={<div>trang thay thế</div>}
      >
        <div>nội dung trang</div>
      </PermissionGuard>,
    );
    expect(screen.getByText("trang thay thế")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
