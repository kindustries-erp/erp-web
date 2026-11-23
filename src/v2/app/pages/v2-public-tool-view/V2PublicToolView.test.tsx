import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Calculator } from "lucide-react";
import { V2PublicToolView } from "./V2PublicToolView";
import type { V2PublicToolDef } from "@/v2/app/router/publicTools.config";

const DummyToolComponent: React.FC = () => (
  <div data-testid="dummy-tool-content">Dummy Tool Content</div>
);

const mockTool: V2PublicToolDef = {
  id: "tools-loans",
  path: "/loans-tool",
  sectionId: "tools",
  labelKey: "v2.nav.items.loans",
  fallback: "Khoản vay & Dòng tiền",
  icon: Calculator,
  component: DummyToolComponent,
};

describe("V2PublicToolView Component", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("render nội dung của tool trong layout V2", () => {
    render(<V2PublicToolView tool={mockTool} isLoggedIn={false} />);
    expect(screen.getByTestId("dummy-tool-content")).toBeInTheDocument();
  });

  it("render nút Đăng nhập khi khách chưa đăng nhập", () => {
    render(<V2PublicToolView tool={mockTool} isLoggedIn={false} />);
    const loginBtn = screen.getByRole("button", { name: /đăng nhập/i });
    expect(loginBtn).toBeInTheDocument();
  });

  it("render breadcrumbs chứa nhóm CÔNG CỤ và tên công cụ", () => {
    render(<V2PublicToolView tool={mockTool} isLoggedIn={false} />);
    expect(screen.getAllByText(/công cụ/i).length).toBeGreaterThan(0);
  });

  it("không hiển thị Bottom Nav trên Mobile khi chưa đăng nhập", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });
    render(<V2PublicToolView tool={mockTool} isLoggedIn={false} />);
    expect(screen.getByTestId("v2-app-layout-mobile")).toBeInTheDocument();
    expect(screen.queryByTestId("v2-bottom-nav")).not.toBeInTheDocument();
  });
});
