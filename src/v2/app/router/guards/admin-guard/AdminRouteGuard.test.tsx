import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminRouteGuard } from "./AdminRouteGuard";

const mockUseAuthStore = vi.fn();

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

describe("AdminRouteGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when profile email is admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ profile: { email: "admin@liouni.com" } }),
    );

    render(
      <AdminRouteGuard>
        <div>Admin Protected Content</div>
      </AdminRouteGuard>,
    );

    expect(screen.getByText("Admin Protected Content")).toBeDefined();
  });

  it("renders children when employee email is admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ employee: { email: "admin@liouni.com" } }),
    );

    render(
      <AdminRouteGuard>
        <div>Admin Protected Content</div>
      </AdminRouteGuard>,
    );

    expect(screen.getByText("Admin Protected Content")).toBeDefined();
  });

  it("renders forbidden screen when user is not admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        profile: { email: "user@liouni.com" },
        employee: { email: "user@liouni.com" },
      }),
    );

    render(
      <AdminRouteGuard>
        <div>Admin Protected Content</div>
      </AdminRouteGuard>,
    );

    expect(screen.queryByText("Admin Protected Content")).toBeNull();
    expect(screen.getByTestId("admin-guard-forbidden")).toBeDefined();
    expect(screen.getByText("Khu vực giới hạn Quản trị")).toBeDefined();
  });

  it("navigates back to /v2 when clicking back button", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ profile: { email: "user@liouni.com" } }),
    );

    render(
      <AdminRouteGuard>
        <div>Admin Content</div>
      </AdminRouteGuard>,
    );

    const button = screen.getByText("Quay lại không gian làm việc");
    fireEvent.click(button);
    expect(window.location.pathname).toBe("/v2");
  });
});
