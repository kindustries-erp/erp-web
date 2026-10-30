import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ImpersonationBanner } from "./V2ImpersonationBanner";

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

describe("V2ImpersonationBanner Molecule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when impersonation is inactive or null", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        impersonation: null,
      }),
    );

    const { container } = render(<V2ImpersonationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders banner with target user name and actor email when active", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        impersonation: { active: true, actor: { email: "admin@liouni.com" } },
        employee: { full_name: "Nguyễn Văn Test" },
        profile: { email: "test@liouni.com" },
        stopImpersonationAction: vi.fn(),
      }),
    );

    render(<V2ImpersonationBanner />);
    expect(screen.getByTestId("v2-impersonation-banner")).toBeDefined();
    expect(screen.getByText("Nguyễn Văn Test")).toBeDefined();
    expect(screen.getByText(/admin@liouni.com/)).toBeDefined();
    expect(screen.getByTestId("stop-impersonation-button")).toBeDefined();
  });

  it("calls stopImpersonationAction when clicking the stop button", () => {
    const stopMock = vi.fn();
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        impersonation: { active: true, actor: { email: "admin@liouni.com" } },
        employee: { full_name: "Nguyễn Văn Test" },
        profile: { email: "test@liouni.com" },
        stopImpersonationAction: stopMock,
      }),
    );

    render(<V2ImpersonationBanner />);
    const stopBtn = screen.getByTestId("stop-impersonation-button");
    fireEvent.click(stopBtn);

    expect(stopMock).toHaveBeenCalledWith("manual");
  });

  it("renders compact mode properly", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        impersonation: { active: true, actor: { email: "admin@liouni.com" } },
        employee: { full_name: "Nguyễn Văn Test" },
        stopImpersonationAction: vi.fn(),
      }),
    );

    render(<V2ImpersonationBanner compact />);
    expect(screen.getByTestId("v2-impersonation-banner")).toBeDefined();
    expect(screen.getByText("Nguyễn Văn Test")).toBeDefined();
    expect(screen.getByText("Thoát")).toBeDefined();
  });
});
