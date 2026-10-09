import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { createPortal } from "react-dom";
import {
  V2TabPanel,
  useV2ToolbarPortal,
} from "@/v2/shared/components/molecules/v2-tab-panel";
import { V2TabbedSpreadsheetPage } from "./V2TabbedSpreadsheetPage";

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

describe("V2TabbedSpreadsheetPage tabs and slots", () => {
  afterEach(() => vi.restoreAllMocks());

  const tabs = [
    { key: "in", label: "Mua vào" },
    { key: "out", label: "Bán ra" },
  ];
  const Probe = ({ name }: { name: string }) => {
    const slot = useV2ToolbarPortal();
    const bar = <span>{`toolbar-${name}`}</span>;
    return slot ? createPortal(bar, slot) : <i>{`inline-${name}`}</i>;
  };
  const page = (activeTab: string) => (
    <V2TabbedSpreadsheetPage title="Hóa đơn" tabs={tabs} activeTab={activeTab}>
      <V2TabPanel tabKey="in">
        <Probe name="in" />
      </V2TabPanel>
      <V2TabPanel tabKey="out">
        <Probe name="out" />
      </V2TabPanel>
    </V2TabbedSpreadsheetPage>
  );

  it("mỗi tab có slot riêng; chỉ slot tab active hiển thị, state tab ẩn được giữ", () => {
    mockViewport();
    const { container, rerender } = render(page("in"));
    const slotIn = container.querySelector('[data-toolbar-slot="in"]');
    const slotOut = container.querySelector('[data-toolbar-slot="out"]');
    expect(slotIn).toHaveTextContent("toolbar-in");
    expect(slotIn).toHaveClass("flex");
    expect(slotOut).toHaveClass("hidden");
    rerender(page("out"));
    expect(slotOut).toHaveTextContent("toolbar-out");
    expect(slotOut).toHaveClass("flex");
    expect(slotIn).toHaveClass("hidden");
    expect(slotIn).toHaveTextContent("toolbar-in");
  });

  it("không có tab: toolbar vẫn portal lên header qua slot mặc định", () => {
    mockViewport();
    const NoTabProbe = () => {
      const slot = useV2ToolbarPortal();
      return slot ? (
        createPortal(<span>toolbar-page</span>, slot)
      ) : (
        <i>inline</i>
      );
    };
    const { container } = render(
      <V2TabbedSpreadsheetPage title="T">
        <NoTabProbe />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.queryByText("inline")).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-toolbar-slot='__page__']"),
    ).toHaveTextContent("toolbar-page");
  });

  it("hideHeader: không có slot nên bảng rơi về inline", () => {
    mockViewport();
    render(
      <V2TabbedSpreadsheetPage title="T" tabs={tabs} activeTab="in" hideHeader>
        <V2TabPanel tabKey="in">
          <Probe name="in" />
        </V2TabPanel>
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.getByText("inline-in")).toBeInTheDocument();
  });

  it("tabVariant='page' dùng tab gạch chân", () => {
    mockViewport();
    render(
      <V2TabbedSpreadsheetPage
        title="T"
        tabs={tabs}
        activeTab="in"
        tabVariant="page"
      >
        <div />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.getByRole("tab", { name: "Mua vào" }).className).toContain(
      "border-primary",
    );
  });

  it("mặc định tabVariant là 'page' (tab gạch chân) khi không truyền prop", () => {
    mockViewport();
    render(
      <V2TabbedSpreadsheetPage title="T" tabs={tabs} activeTab="in">
        <div />
      </V2TabbedSpreadsheetPage>,
    );
    expect(screen.getByRole("tab", { name: "Mua vào" }).className).toContain(
      "border-primary",
    );
  });

  it("header dùng V2PageHeader: tiêu đề là h1 và icon nằm trong V2PageIcon", () => {
    render(
      <V2TabbedSpreadsheetPage
        title="Hóa đơn"
        icon={<svg data-testid="page-icon-svg" />}
      >
        <div />
      </V2TabbedSpreadsheetPage>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Hóa đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("page-icon-svg").parentElement).toHaveClass(
      "bg-primary/10",
    );
  });
});
