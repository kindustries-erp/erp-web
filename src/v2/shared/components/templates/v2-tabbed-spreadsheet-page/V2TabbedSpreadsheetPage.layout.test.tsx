import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { createPortal } from "react-dom";
import { useV2ToolbarPortal } from "@/v2/shared/components/molecules/v2-tab-panel";
import { V2TabbedSpreadsheetPage } from "./V2TabbedSpreadsheetPage";

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

describe("V2TabbedSpreadsheetPage layout", () => {
  afterEach(() => vi.restoreAllMocks());

  const layoutTabs = [
    { key: "in", label: "Mua vào" },
    { key: "out", label: "Bán ra" },
  ];
  const LayoutProbe = () => {
    const slot = useV2ToolbarPortal();
    return slot ? createPortal(<span>toolbar-page</span>, slot) : <i>inline</i>;
  };

  it("mặc định là tabbed: có tab bar khi truyền tabs", () => {
    mockViewport();
    render(
      <V2TabbedSpreadsheetPage title="T" tabs={layoutTabs} activeTab="in">
        <div />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.getByRole("tab", { name: "Mua vào" })).toBeInTheDocument();
  });

  it("layout fullpage: không có tab bar dù có tabs", () => {
    mockViewport();
    render(
      <V2TabbedSpreadsheetPage
        title="T"
        layout="fullpage"
        tabs={layoutTabs}
        activeTab="in"
      >
        <div />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("layout fullpage: toolbar vẫn portal lên header", () => {
    const { container } = render(
      <V2TabbedSpreadsheetPage title="T" layout="fullpage">
        <LayoutProbe />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.queryByText("inline")).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-toolbar-slot='__page__']"),
    ).toHaveTextContent("toolbar-page");
  });

  it("tabbed không truyền tabs: rơi về fullpage, không có tab bar", () => {
    const { container } = render(
      <V2TabbedSpreadsheetPage title="T">
        <LayoutProbe />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-toolbar-slot='__page__']"),
    ).toHaveTextContent("toolbar-page");
  });
});
