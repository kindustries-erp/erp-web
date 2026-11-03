import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2PageLayout } from "./V2PageLayout";
import { V2MobileTabMode } from "@/v2/shared/types";
import { useViewport } from "@/v2/shared/hooks/useViewport";

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: vi.fn(() => ({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("V2PageLayout", () => {
  it("renders title, description and actions", () => {
    render(
      <V2PageLayout
        title="Tiêu đề trang"
        desc="Mô tả chi tiết"
        actions={<button type="button">Action Button</button>}
      >
        <div>Nội dung trang</div>
      </V2PageLayout>,
    );

    expect(screen.getByText("Tiêu đề trang")).toBeInTheDocument();
    expect(screen.getByText("Mô tả chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Action Button")).toBeInTheDocument();
    expect(screen.getByText("Nội dung trang")).toBeInTheDocument();
  });

  it("renders V2TabCombobox for mobile by default (DROPDOWN mode)", () => {
    vi.mocked(useViewport).mockReturnValueOnce({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    const tabs = [
      { value: "overview", label: "Tổng quan" },
      { value: "cases", label: "Hoạt động" },
    ];

    render(
      <V2PageLayout title="Trang có tab" tabs={tabs} activeTab="overview">
        <div>Content</div>
      </V2PageLayout>,
    );

    expect(screen.getByTestId("v2-tab-combobox")).toBeInTheDocument();
  });

  it("does not render V2TabCombobox when mobileTabMode is SCROLL", () => {
    const tabs = [
      { value: "overview", label: "Tổng quan" },
      { value: "cases", label: "Hoạt động" },
    ];

    render(
      <V2PageLayout
        title="Trang cuộn tab"
        tabs={tabs}
        activeTab="overview"
        mobileTabMode={V2MobileTabMode.SCROLL}
      >
        <div>Content</div>
      </V2PageLayout>,
    );

    expect(screen.queryByTestId("v2-tab-combobox")).toBeNull();
  });

  it("hides header when hideHeader is true", () => {
    render(
      <V2PageLayout title="Ẩn Header" hideHeader>
        <div>Content</div>
      </V2PageLayout>,
    );

    expect(screen.queryByText("Ẩn Header")).toBeNull();
  });

  it("hides tabs when hideTabs is true", () => {
    const tabs = [{ value: "overview", label: "Tổng quan" }];

    render(
      <V2PageLayout title="Ẩn Tabs" tabs={tabs} hideTabs>
        <div>Content</div>
      </V2PageLayout>,
    );

    expect(screen.queryByTestId("v2-tab-combobox")).toBeNull();
  });
});
