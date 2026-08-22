import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SystemChangelogDrawer } from "../SystemChangelogDrawer";

const mockOnClose = vi.fn();
let mockLocale = "vi";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector?: (state: any) => any) => {
    const state = {
      locale: mockLocale,
      appTheme: "classic",
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/core/store/useEnvStore", () => ({
  useEnvStore: () => ({
    env: "greenway-production",
    isProduction: true,
  }),
}));

vi.mock("@/shared/utils", () => ({
  getBuildVersionLabel: () => "20260822.188926",
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@/core/hooks/useChangelogInfinite", () => ({
  useChangelogInfinite: () => ({
    data: {
      pages: [
        {
          items: [
            {
              version: "v2026.08.22",
              date: "22/08/2026",
              tag: "Core & UX",
              isLatest: true,
              titleVi:
                "Nâng cấp cơ chế Cache-Busting, Tự động Cập nhật & Changelog Drawer",
              titleEn: "Enhanced Cache-Busting, Auto-Update & Changelog Drawer",
              items: [
                {
                  type: "feature",
                  textVi: "Ra mắt Drawer Nhật ký phát hành",
                  textEn: "Launched Release Changelog Timeline Drawer",
                },
              ],
            },
          ],
          meta: {
            page: 1,
            limit: 6,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
          },
        },
      ],
    },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));

describe("SystemChangelogDrawer", () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockLocale = "vi";
  });

  it("renders drawer with build version and release timeline when open is true", () => {
    render(<SystemChangelogDrawer open={true} onClose={mockOnClose} />);

    expect(
      screen.getByText("Nhật ký phát hành & Phiên bản"),
    ).toBeInTheDocument();
    expect(screen.getByText("20260822.188926")).toBeInTheDocument();
    expect(screen.getByText(/greenway-production/i)).toBeInTheDocument();
    expect(screen.getByText("v2026.08.22")).toBeInTheDocument();
  });

  it("renders English content when locale is en", () => {
    mockLocale = "en";
    render(<SystemChangelogDrawer open={true} onClose={mockOnClose} />);

    expect(screen.getByText("Release Changelog & Version")).toBeInTheDocument();
    expect(screen.getByText("Release Timeline")).toBeInTheDocument();
    expect(screen.getByText(/Enhanced Cache-Busting/i)).toBeInTheDocument();
  });

  it("triggers force reload and page reload when button is clicked", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: reloadMock },
    });

    render(<SystemChangelogDrawer open={true} onClose={mockOnClose} />);

    const reloadButtons = screen.getAllByRole("button", {
      name: /Xóa Cache & Tải lại sạch/i,
    });
    expect(reloadButtons.length).toBeGreaterThan(0);

    fireEvent.click(reloadButtons[0]);
    expect(reloadMock).toHaveBeenCalled();
  });
});
