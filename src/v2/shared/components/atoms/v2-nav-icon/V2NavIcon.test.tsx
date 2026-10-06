import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "lucide-react";
import { V2NavIcon } from "./V2NavIcon";

describe("V2NavIcon Atom", () => {
  it("render đúng icon component", () => {
    render(<V2NavIcon icon={Home} />);
    const iconWrapper = screen.getByTestId("v2-nav-icon");
    expect(iconWrapper).toBeInTheDocument();
  });

  it("áp dụng class active khi isActive=true", () => {
    render(<V2NavIcon icon={Home} isActive />);
    const iconWrapper = screen.getByTestId("v2-nav-icon");
    expect(iconWrapper).toHaveClass("text-primary");
  });
});
