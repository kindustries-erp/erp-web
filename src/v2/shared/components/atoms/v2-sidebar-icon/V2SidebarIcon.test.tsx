import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "lucide-react";
import { V2SidebarIcon } from "./V2SidebarIcon";

describe("V2SidebarIcon Atom", () => {
  it("render đúng icon với kích thước w-4 h-4 và opacity-65", () => {
    render(<V2SidebarIcon icon={Home} />);
    const iconWrapper = screen.getByTestId("v2-sidebar-icon");
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).toHaveClass("w-4", "h-4", "opacity-65");
  });

  it("chuyển sang opacity-100 khi isActive=true", () => {
    render(<V2SidebarIcon icon={Home} isActive />);
    const iconWrapper = screen.getByTestId("v2-sidebar-icon");
    expect(iconWrapper).toHaveClass("opacity-100");
  });
});
