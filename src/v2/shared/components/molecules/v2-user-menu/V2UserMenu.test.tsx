import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2UserMenu } from "./V2UserMenu";

(
  globalThis as unknown as { __APP_BUILD_VERSION__: string }
).__APP_BUILD_VERSION__ = "2026-11-06-15-00-00";

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    logoutAction: vi.fn(),
    employee: { full_name: "Nguyễn Văn A", email: "admin@liouni.com" },
  })),
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: vi.fn(() => ({
    appTheme: "classic-dark",
    setAppTheme: vi.fn(),
    locale: "vi",
    setLocale: vi.fn(),
  })),
}));

describe("V2UserMenu Molecule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger element on desktop", () => {
    render(
      <V2UserMenu>
        <button type="button">Trigger User</button>
      </V2UserMenu>,
    );

    expect(
      screen.getByRole("button", { name: "Trigger User" }),
    ).toBeInTheDocument();
  });

  it("opens mobile bottom sheet on mobile viewport when trigger clicked", async () => {
    const { useViewport } = await import("@/v2/shared/hooks/useViewport");
    vi.mocked(useViewport).mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375,
      height: 667,
    });

    const handleProfile = vi.fn();
    render(
      <V2UserMenu onOpenProfile={handleProfile}>
        <div data-testid="mobile-avatar">Avatar</div>
      </V2UserMenu>,
    );

    const trigger = screen.getByTestId("mobile-avatar");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("admin@liouni.com")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ cá nhân")).toBeInTheDocument();
    expect(screen.getByText("Đăng xuất")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hồ sơ cá nhân"));
    expect(handleProfile).toHaveBeenCalled();
  });
});
