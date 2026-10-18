import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2SidebarSection } from "./V2SidebarSection";

describe("V2SidebarSection Molecule", () => {
  it("render đúng tiêu đề in hoa và children", () => {
    render(
      <V2SidebarSection label="Bán hàng">
        <div>Item 1</div>
      </V2SidebarSection>,
    );

    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("cho phép click thu gọn/mở rộng section", () => {
    render(
      <V2SidebarSection label="Mua hàng">
        <div>Item Mua Hàng</div>
      </V2SidebarSection>,
    );

    const header = screen.getByTestId("v2-sidebar-section-header");
    fireEvent.click(header);
    const body = screen.getByTestId("v2-sidebar-section-body");
    expect(body).toHaveStyle({ gridTemplateRows: "0fr" });
  });
});
