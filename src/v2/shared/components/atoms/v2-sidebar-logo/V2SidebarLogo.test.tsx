import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2SidebarLogo } from "./V2SidebarLogo";

describe("V2SidebarLogo Atom", () => {
  it("render đúng logo 4 ô vuông Liouni", () => {
    render(<V2SidebarLogo />);
    const logo = screen.getByTestId("v2-sidebar-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass("bg-primary");
  });
});
