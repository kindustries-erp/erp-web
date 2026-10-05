import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2Dropdown } from "./V2Dropdown";
import type { V2DropdownGroup } from "./V2Dropdown.type";
import * as useViewportModule from "@/v2/shared/hooks/useViewport";

const MOCK_GROUPS: V2DropdownGroup[] = [
  {
    groupLabel: "ĐỒNG BỘ",
    items: [
      {
        key: "sync-gdt",
        label: "Đồng bộ từ GDT",
        onClick: vi.fn(),
      },
    ],
  },
  {
    groupLabel: "XUẤT DỮ LIỆU",
    items: [
      {
        key: "export-excel",
        label: "Xuất Excel hóa đơn",
        onClick: vi.fn(),
      },
    ],
  },
];

describe("V2Dropdown Molecule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Desktop dropdown and handles group items", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    render(
      <V2Dropdown
        groups={MOCK_GROUPS}
        trigger={<button type="button">Thao tác</button>}
      />,
    );

    const trigger = screen.getByText("Thao tác");
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText("ĐỒNG BỘ")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByText("ĐỒNG BỘ")).toBeInTheDocument();
    expect(screen.getByText("Đồng bộ từ GDT")).toBeInTheDocument();
    expect(screen.getByText("XUẤT DỮ LIỆU")).toBeInTheDocument();
    expect(screen.getByText("Xuất Excel hóa đơn")).toBeInTheDocument();

    const syncBtn = screen.getByText("Đồng bộ từ GDT");
    fireEvent.click(syncBtn);
    expect(MOCK_GROUPS[0].items[0].onClick).toHaveBeenCalledTimes(1);
  });

  it("renders Mobile Bottom Sheet when isMobile is true", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2Dropdown
        groups={MOCK_GROUPS}
        title="Tác vụ hóa đơn"
        trigger={<button type="button">Thao tác</button>}
      />,
    );

    const trigger = screen.getByText("Thao tác");
    fireEvent.click(trigger);

    expect(
      screen.getByTestId("v2-dropdown-mobile-grab-handle"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tác vụ hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("ĐỒNG BỘ")).toBeInTheDocument();
    expect(screen.getByText("Đồng bộ từ GDT")).toBeInTheDocument();

    const syncBtn = screen.getByText("Đồng bộ từ GDT");
    fireEvent.click(syncBtn);
    expect(MOCK_GROUPS[0].items[0].onClick).toHaveBeenCalledTimes(1);
  });
});
