import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2WorkspaceMode } from "@/v2/shared/types";
import { V2WorkspaceModeToggle } from "./V2WorkspaceModeToggle";

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

describe("V2WorkspaceModeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing if the user email is not admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        profile: { email: "staff@liouni.com" },
        employee: { email: "staff@liouni.com" },
      }),
    );

    const { container } = render(<V2WorkspaceModeToggle />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the toggle button when user profile email is admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ profile: { email: "admin@liouni.com" } }),
    );

    render(<V2WorkspaceModeToggle />);
    const button = screen.getByTestId("workspace-mode-toggle");
    expect(button).toBeDefined();
  });

  it("renders the toggle button when employee email is admin@liouni.com", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ employee: { email: "admin@liouni.com" } }),
    );

    render(<V2WorkspaceModeToggle />);
    const button = screen.getByTestId("workspace-mode-toggle");
    expect(button).toBeDefined();
  });

  it("triggers onModeChange with V2WorkspaceMode when clicked", () => {
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ profile: { email: "admin@liouni.com" } }),
    );

    const onModeChange = vi.fn();
    render(<V2WorkspaceModeToggle onModeChange={onModeChange} />);

    const button = screen.getByTestId("workspace-mode-toggle");
    fireEvent.click(button);

    expect(onModeChange).toHaveBeenCalledWith(V2WorkspaceMode.ADMIN);
  });
});
