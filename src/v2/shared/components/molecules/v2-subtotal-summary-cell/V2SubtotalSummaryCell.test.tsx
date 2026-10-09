import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2SubtotalSummaryCell } from "./V2SubtotalSummaryCell";
import { OPEN_DELAY_MS } from "./V2SubtotalSummaryCell.hook";

const trigger = () =>
  screen.getByRole("button", { name: "Xem chi tiết số liệu" });

describe("V2SubtotalSummaryCell", () => {
  beforeEach(() => {
    useAppStore.setState({ locale: "vi" });
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("hiển thị giá trị trang hiện tại theo định dạng số lượng có đơn vị", () => {
    render(
      <V2SubtotalSummaryCell
        variant="qty"
        pageValue={1200}
        totalValue={5000}
        unit="kg"
      />,
    );
    expect(trigger()).toHaveTextContent("1.200 kg");
  });

  it("displayMode=total hiển thị tổng toàn bộ", () => {
    render(
      <V2SubtotalSummaryCell
        variant="amount"
        pageValue={1500}
        totalValue={9000}
        displayMode="total"
      />,
    );
    expect(trigger()).toHaveTextContent("9.000 đ");
  });

  it("hover đủ delay thì mở popover, không mở sớm hơn", () => {
    vi.useFakeTimers();
    render(
      <V2SubtotalSummaryCell variant="count" pageValue={3} totalValue={10} />,
    );
    fireEvent.pointerEnter(trigger());
    act(() => vi.advanceTimersByTime(OPEN_DELAY_MS - 1));
    expect(screen.queryByText("Tổng toàn bộ")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Tổng toàn bộ")).toBeInTheDocument();
  });

  it("click mở popover", () => {
    render(
      <V2SubtotalSummaryCell variant="qty" pageValue={1} totalValue={2} />,
    );
    fireEvent.click(trigger());
    expect(screen.getByText("Tổng toàn bộ")).toBeInTheDocument();
  });

  it("focus bằng bàn phím mở popover", () => {
    render(
      <V2SubtotalSummaryCell variant="qty" pageValue={1} totalValue={2} />,
    );
    fireEvent.focus(trigger());
    expect(screen.getByText("Tổng toàn bộ")).toBeInTheDocument();
  });

  it("Esc đóng popover kể cả khi trigger đang focus", () => {
    render(
      <V2SubtotalSummaryCell variant="qty" pageValue={1} totalValue={2} />,
    );
    fireEvent.focus(trigger());
    expect(screen.getByText("Tổng toàn bộ")).toBeInTheDocument();
    fireEvent.keyDown(trigger(), { key: "Escape" });
    expect(screen.queryByText("Tổng toàn bộ")).toBeNull();
  });

  it("nhiều trang: hiện trang x/y, lũy kế và tổng toàn bộ", () => {
    render(
      <V2SubtotalSummaryCell
        variant="count"
        pageValue={20}
        totalValue={100}
        page={2}
        totalPages={5}
        cumulativeValue={40}
      />,
    );
    fireEvent.click(trigger());
    expect(screen.getByText("Trang 2/5")).toBeInTheDocument();
    expect(screen.getByText("Lũy kế (T1 → T2)")).toBeInTheDocument();
    expect(screen.getByText("Tổng toàn bộ (5 trang)")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  });

  it("popover rộng 320px, nhãn co được còn giá trị không xuống dòng", () => {
    render(
      <V2SubtotalSummaryCell
        variant="amount"
        pageValue={96000000}
        totalValue={1290000000}
        page={1}
        totalPages={12}
      />,
    );
    fireEvent.click(trigger());
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.className).toContain("w-[320px]");
    const label = screen.getByText("Tổng toàn bộ (12 trang)");
    expect(label).toHaveClass("truncate", "min-w-0");
    expect(screen.getByText("1.290.000.000 đ")).toHaveClass(
      "shrink-0",
      "whitespace-nowrap",
    );
  });
});
