import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { V2PageTabsContext } from "./V2PageTabs.context";
import { V2TabPanel } from "./V2TabPanel";

const inPage = (activeTab: string, ui: React.ReactElement) => (
  <V2PageTabsContext.Provider value={{ activeTab, slots: {} }}>
    {ui}
  </V2PageTabsContext.Provider>
);

describe("V2TabPanel", () => {
  it("render children bình thường khi ngoài template", () => {
    render(<V2TabPanel tabKey="a">nội dung A</V2TabPanel>);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("nội dung A");
  });

  it("lazy: không mount tab chưa từng mở", () => {
    render(inPage("a", <V2TabPanel tabKey="b">B</V2TabPanel>));
    expect(screen.queryByText("B")).toBeNull();
  });

  it("keepAlive: sau khi mở rồi chuyển tab thì giữ mounted và ẩn", () => {
    const { rerender } = render(
      inPage("a", <V2TabPanel tabKey="a">A</V2TabPanel>),
    );
    expect(screen.getByRole("tabpanel")).not.toHaveClass("hidden");
    rerender(inPage("b", <V2TabPanel tabKey="a">A</V2TabPanel>));
    const panel = screen.getByText("A").closest("[role=tabpanel]");
    expect(panel).toHaveClass("hidden");
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("keepAlive=false: unmount khi rời tab", () => {
    const { rerender } = render(
      inPage(
        "a",
        <V2TabPanel tabKey="a" keepAlive={false}>
          A
        </V2TabPanel>,
      ),
    );
    rerender(
      inPage(
        "b",
        <V2TabPanel tabKey="a" keepAlive={false}>
          A
        </V2TabPanel>,
      ),
    );
    expect(screen.queryByText("A")).toBeNull();
  });

  it("lazy=false: mount ngay cả khi chưa active", () => {
    render(
      inPage(
        "a",
        <V2TabPanel tabKey="b" lazy={false}>
          B
        </V2TabPanel>,
      ),
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
