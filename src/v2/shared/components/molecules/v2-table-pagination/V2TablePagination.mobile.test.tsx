import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2TablePagination } from "./V2TablePagination";
import { V2TablePaginationVariant } from "./V2TablePagination.type";

const renderMobilePagination = (
  overrides: Partial<React.ComponentProps<typeof V2TablePagination>> = {},
) => {
  const props = {
    page: 1,
    pageSize: 20,
    total: 95,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    variant: V2TablePaginationVariant.MOBILE,
    ...overrides,
  };
  render(<V2TablePagination {...props} />);
  return props;
};

describe("V2TablePagination (Mobile)", () => {
  beforeEach(() => {
    useV2LocaleStore.setState({ locale: "vi" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders compact bar with page indicator, range info and prev/next buttons", () => {
    renderMobilePagination({ page: 2, total: 95 });
    expect(screen.getByText("Trang 2 / 5")).toBeInTheDocument();
    expect(screen.getByText("21–40 / 95")).toBeInTheDocument();
    expect(screen.getByLabelText("Trang trước")).not.toBeDisabled();
    expect(screen.getByLabelText("Trang sau")).not.toBeDisabled();
  });

  it("navigates with prev/next buttons and disables at boundaries", () => {
    const props = renderMobilePagination({ page: 1, total: 95 });
    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Trang sau"));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });

  it("handles empty dataset gracefully", () => {
    renderMobilePagination({ total: 0 });
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(screen.getByText("0–0 / 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    expect(screen.getByLabelText("Trang sau")).toBeDisabled();
  });

  it("opens bottom sheet on trigger click and selects page size", () => {
    const props = renderMobilePagination({ page: 1, pageSize: 20, total: 95 });
    fireEvent.click(screen.getByTestId("v2-table-pagination-trigger"));

    const sheet = screen.getByTestId("v2-bottom-sheet-content");
    expect(within(sheet).getByText("Phân trang dữ liệu")).toBeInTheDocument();
    expect(within(sheet).getByText("Số dòng mỗi trang")).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole("button", { name: "50" }));
    expect(props.onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("selects a page from the bottom sheet grid and closes the sheet", () => {
    const props = renderMobilePagination({ page: 1, pageSize: 20, total: 95 });
    fireEvent.click(screen.getByTestId("v2-table-pagination-trigger"));

    const sheet = screen.getByTestId("v2-bottom-sheet-content");
    fireEvent.click(within(sheet).getByRole("button", { name: "4" }));

    expect(props.onPageChange).toHaveBeenCalledWith(4);
    expect(
      screen.queryByTestId("v2-bottom-sheet-content"),
    ).not.toBeInTheDocument();
  });

  it("jumps to first and last page from the bottom sheet", () => {
    const props = renderMobilePagination({ page: 3, pageSize: 20, total: 95 });
    fireEvent.click(screen.getByTestId("v2-table-pagination-trigger"));

    const sheet = screen.getByTestId("v2-bottom-sheet-content");
    fireEvent.click(within(sheet).getByRole("button", { name: /Trang cuối/ }));
    expect(props.onPageChange).toHaveBeenLastCalledWith(5);

    fireEvent.click(screen.getByTestId("v2-table-pagination-trigger"));
    const reopened = screen.getByTestId("v2-bottom-sheet-content");
    fireEvent.click(
      within(reopened).getByRole("button", { name: /Trang đầu/ }),
    );
    expect(props.onPageChange).toHaveBeenLastCalledWith(1);
  });

  it("supports direct page input jump when totalPages > 20", () => {
    const props = renderMobilePagination({
      page: 5,
      pageSize: 20,
      total: 1000,
    });
    fireEvent.click(screen.getByTestId("v2-table-pagination-trigger"));

    const sheet = screen.getByTestId("v2-bottom-sheet-content");
    const input = within(sheet).getByLabelText("Đi đến trang");
    fireEvent.change(input, { target: { value: "35" } });
    fireEvent.click(within(sheet).getByRole("button", { name: "Đi đến" }));

    expect(props.onPageChange).toHaveBeenCalledWith(35);
    expect(
      screen.queryByTestId("v2-bottom-sheet-content"),
    ).not.toBeInTheDocument();
  });

  it("auto-selects mobile variant when useViewport reports isMobile", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    render(
      <V2TablePagination
        page={1}
        pageSize={20}
        total={95}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(
      screen.getByTestId("v2-table-pagination-mobile"),
    ).toBeInTheDocument();
  });
});
