import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2SpreadsheetPageTemplate } from "./V2SpreadsheetPageTemplate";

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

describe("V2SpreadsheetPageTemplate", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the header with title, description, icon and actions", () => {
    render(
      <V2SpreadsheetPageTemplate
        title="Đơn bán hàng"
        description="Quản lý đơn hàng"
        icon={<svg data-testid="icon" />}
        actions={<button type="button">Tạo mới</button>}
      >
        <div>nội dung bảng</div>
      </V2SpreadsheetPageTemplate>,
    );
    expect(
      screen.getByRole("heading", { name: "Đơn bán hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quản lý đơn hàng")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeInTheDocument();
  });

  it("gives the content a bounded flexible region so the table can scroll", () => {
    const { container } = render(
      <V2SpreadsheetPageTemplate title="T">
        <div data-testid="content" />
      </V2SpreadsheetPageTemplate>,
    );
    expect(container.firstElementChild).toHaveClass(
      "h-full",
      "min-h-0",
      "flex-col",
    );
    expect(screen.getByTestId("content").parentElement).toHaveClass(
      "flex-1",
      "min-h-0",
    );
  });

  it("can hide the header", () => {
    render(
      <V2SpreadsheetPageTemplate title="Ẩn" hideHeader>
        <div>nội dung</div>
      </V2SpreadsheetPageTemplate>,
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("nội dung")).toBeInTheDocument();
  });

  it("renders tabs and reports tab changes", () => {
    mockViewport();
    const onTabChange = vi.fn();
    render(
      <V2SpreadsheetPageTemplate
        title="T"
        tabs={[
          { key: "all", label: "Tất cả" },
          { key: "draft", label: "Nháp" },
        ]}
        activeTab="all"
        onTabChange={onTabChange}
      >
        <div />
      </V2SpreadsheetPageTemplate>,
    );
    fireEvent.click(screen.getByText("Nháp"));
    expect(onTabChange).toHaveBeenCalledWith("draft");
  });
});
