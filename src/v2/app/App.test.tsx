import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2App } from "./App";

vi.mock("@/modules/auth/domain/authStore", () => {
  const state = {
    accessToken: "mock-valid-jwt-token",
    effectivePermissions: [{ collection: "*", actions: ["*"] }],
    employee: {
      full_name: "Kỹ Sư Trưởng",
    },
    profile: {
      email: "engineer@example.com",
      role: { name: "Quản trị viên" },
    },
  };

  return {
    useAuthStore: (selector?: (value: typeof state) => unknown) =>
      selector ? selector(state) : state,
  };
});

describe("V2App Root Component", () => {
  it("render thành công giao diện V2 kèm layout và welcome banner", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(<V2App />);

    expect(screen.getByTestId("v2-app-layout-desktop")).toBeInTheDocument();
    expect(screen.getByText("Khung Ứng Dụng ERP V2")).toBeInTheDocument();
    expect(screen.getAllByText("Kỹ Sư Trưởng").length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
