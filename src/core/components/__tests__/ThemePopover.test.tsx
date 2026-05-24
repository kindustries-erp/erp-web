import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemePopover } from "@/core/components/layout/ThemePopover";

const mockSetAppTheme = vi.fn();
let mockAppTheme = "shell";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    appTheme: mockAppTheme,
    setAppTheme: mockSetAppTheme,
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const map: Record<string, string> = {
      "nav.bottom.themeStyle": "Theme",
      "nav.bottom.themeShell": "Shell",
      "nav.bottom.themeClassic": "Classic",
    };
    return map[key] ?? key;
  },
}));

describe("ThemePopover", () => {
  beforeEach(() => {
    mockSetAppTheme.mockClear();
    mockAppTheme = "shell";
  });

  it("renders trigger button", () => {
    render(
      <ThemePopover>
        <button>Theme</button>
      </ThemePopover>,
    );
    expect(screen.getByRole("button", { name: "Theme" })).toBeInTheDocument();
  });

  it("shows theme options when clicked", () => {
    render(
      <ThemePopover>
        <button>Theme</button>
      </ThemePopover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Theme" }));

    expect(screen.getByText("Shell")).toBeInTheDocument();
    expect(screen.getByText("Classic")).toBeInTheDocument();
  });

  it("calls setAppTheme when an option is clicked", () => {
    render(
      <ThemePopover>
        <button>Theme</button>
      </ThemePopover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Theme" }));
    fireEvent.click(screen.getByText("Classic"));

    expect(mockSetAppTheme).toHaveBeenCalledWith("classic");
  });

  it("shows checkmark on active theme", () => {
    mockAppTheme = "shell";
    render(
      <ThemePopover>
        <button>Theme</button>
      </ThemePopover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Theme" }));

    // Shell button should have the checkmark SVG (polyline element)
    const shellButton = screen.getByText("Shell").closest("button")!;
    expect(shellButton.querySelector("polyline")).not.toBeNull();

    // Classic button should NOT have checkmark
    const classicButton = screen.getByText("Classic").closest("button")!;
    expect(classicButton.querySelector("polyline")).toBeNull();
  });
});
