import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { V2TablePagination } from "./V2TablePagination";

const renderPagination = (
  overrides: Partial<React.ComponentProps<typeof V2TablePagination>> = {},
) => {
  const props = {
    page: 1,
    pageSize: 20,
    total: 95,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides,
  };
  render(<V2TablePagination {...props} />);
  return props;
};

const pageButtons = () =>
  within(screen.getByRole("navigation"))
    .getAllByRole("button")
    .map((b) => b.textContent ?? "")
    .filter((text) => /^\d+$/.test(text));

describe("V2TablePagination", () => {
  beforeEach(() => useAppStore.setState({ locale: "vi" }));

  it("matches the V1 layout: rows selector, range and page numbers", () => {
    renderPagination({ total: 400, page: 5 });
    expect(screen.getByText("Hiển thị")).toBeInTheDocument();
    expect(screen.getByText("hàng/trang")).toBeInTheDocument();
    expect(screen.getByText("81–100 / 400")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows a window of pages with first/last and gaps", () => {
    renderPagination({ total: 400, page: 10 });
    expect(pageButtons()).toEqual(["1", "8", "9", "10", "11", "12", "20"]);
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("navigates with arrows and numbers", () => {
    const props = renderPagination({ page: 3 });
    fireEvent.click(screen.getByLabelText("Trang sau"));
    expect(props.onPageChange).toHaveBeenLastCalledWith(4);
    fireEvent.click(screen.getByLabelText("Trang trước"));
    expect(props.onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(props.onPageChange).toHaveBeenLastCalledWith(5);
  });

  it("disables previous on the first page and next on the last", () => {
    renderPagination({ page: 1 });
    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    expect(screen.getByLabelText("Trang sau")).not.toBeDisabled();
  });

  it("clamps an out of range page", () => {
    renderPagination({ page: 9 });
    expect(screen.getByText("81–95 / 95")).toBeInTheDocument();
    expect(screen.getByLabelText("Trang sau")).toBeDisabled();
  });

  it("handles an empty result set", () => {
    renderPagination({ total: 0 });
    expect(screen.getByText("0–0 / 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    expect(screen.getByLabelText("Trang sau")).toBeDisabled();
  });

  it("changes the page size from the selector and marks the current size", () => {
    const props = renderPagination();
    fireEvent.click(
      screen.getByRole("button", { name: /Hiển thị 20 hàng\/trang/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "50" }));
    expect(props.onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
