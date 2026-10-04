import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2SidebarHeader } from "./V2SidebarHeader";

describe("V2SidebarHeader Molecule", () => {
  it("render logo, appName và nút toggle", () => {
    const handleToggle = vi.fn();
    render(<V2SidebarHeader appName="ERP CORE" onToggle={handleToggle} />);

    expect(screen.getByTestId("v2-sidebar-logo")).toBeInTheDocument();
    expect(screen.getByText("ERP CORE")).toBeInTheDocument();
    const toggleBtn = screen.getByTestId("v2-sidebar-toggle-btn");
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("ẩn tên ứng dụng khi isCollapsed=true", () => {
    render(<V2SidebarHeader appName="ERP CORE" isCollapsed={true} />);
    expect(screen.queryByText("ERP CORE")).not.toBeInTheDocument();
    expect(screen.getByTestId("v2-sidebar-logo")).toBeInTheDocument();
  });
});
