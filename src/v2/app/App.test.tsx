import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2App } from "./App";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    accessToken: "mock-valid-jwt-token",
    employee: {
      full_name: "Kỹ Sư Trưởng",
    },
    profile: {
      email: "engineer@liouni.com",
      role: { name: "Quản trị viên" },
    },
  }),
}));

describe("V2App Root Component", () => {
  it("render thành công giao diện V2 kèm layout và welcome banner", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(<V2App />);

    expect(screen.getByTestId("v2-app-layout-desktop")).toBeInTheDocument();
    expect(
      screen.getByText("Khung Ứng Dụng Liouni ERP V2"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Kỹ Sư Trưởng").length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
