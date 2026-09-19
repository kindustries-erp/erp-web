import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubtotalSummaryCell } from "../DataTable/SubtotalSummaryCell";

describe("SubtotalSummaryCell component", () => {
  it("renders trigger value for qty variant with formatted quantity", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        subtotalQty={2905}
        grandTotalQty={281698}
        itemCount={241}
        page={1}
        totalPages={5}
        currentPageCount={50}
        totalCount={241}
      />,
    );

    // Trigger should show 2.905 (subtotal in default subtotal mode)
    expect(screen.getByText("2.905")).toBeInTheDocument();
  });

  it("renders popover with ratio format (150/10.000 style) in multi-page mode when clicked", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Tồn kho"
        itemTitle="Mặt hàng"
        itemUnit="SKU"
        subtotalQty={2905}
        grandTotalQty={281698}
        itemCount={241}
        page={1}
        totalPages={5}
        currentPageCount={50}
        totalCount={241}
      />,
    );

    // Click trigger to open popover
    const trigger = screen.getByText("2.905");
    fireEvent.click(trigger);

    // Popover header with metric title
    expect(screen.getByText("SL Tồn kho")).toBeInTheDocument();
    expect(screen.getAllByText("Trang 1/5").length).toBeGreaterThan(0);

    // Metric Quantity Ratio (Subtotal / Total)
    expect(screen.getAllByText(/2\.905/).length).toBeGreaterThan(0);
    expect(screen.getByText(/281\.698/)).toBeInTheDocument();
    expect(screen.getByText(/Tổng toàn bộ/)).toBeInTheDocument();
  });

  it("renders clean single-page summary with unified layout and progress bar", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Nhập kho"
        grandTotalQty={5}
        subtotalQty={5}
        page={1}
        totalPages={1}
      />,
    );

    const trigger = screen.getByText("5");
    fireEvent.click(trigger);

    // Header badge
    expect(screen.getAllByText("Trang 1/1").length).toBeGreaterThan(0);

    // Unified layout items
    expect(screen.getByText(/SL Nhập kho/)).toBeInTheDocument();
    expect(screen.getByText(/đơn vị/)).toBeInTheDocument();
  });

  it("renders PO reconciliation progress and status badge in Goods Receipt", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Thực nhận"
        grandTotalQty={5}
        grandTotalOrderedQty={5}
        page={1}
        totalPages={1}
      />,
    );

    const trigger = screen.getByText("5");
    fireEvent.click(trigger);

    // PO fulfillment comparison card
    expect(
      screen.getByText("Tiến độ nhập theo Đơn đặt (PO)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Đủ 100%")).toBeInTheDocument();
    expect(screen.getByText("/ 5 đặt hàng")).toBeInTheDocument();
  });

  it("renders adjustment positive/negative breakdown in Inventory Adjustment", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Chênh lệch"
        grandTotalQty={8}
        positiveQty={10}
        negativeQty={2}
        page={1}
        totalPages={1}
        showSign={true}
      />,
    );

    const trigger = screen.getByText("+8");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Adjustment breakdown
    expect(
      screen.getByText("Chi tiết chênh lệch điều chỉnh"),
    ).toBeInTheDocument();
    expect(screen.getByText("+10")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
  });

  it("handles 12-digit large numbers with thousand separators correctly", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Tồn kho"
        subtotalQty={123456789012}
        grandTotalQty={987654321098}
        page={1}
        totalPages={10}
      />,
    );

    const trigger = screen.getByText("123.456.789.012");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Verify formatted values in popover
    expect(screen.getByText(/987\.654\.321\.098/)).toBeInTheDocument();
    expect(screen.getByText(/Tổng toàn bộ/)).toBeInTheDocument();
  });

  it("renders amount variant cleanly with currency format and no 0 quantity units", () => {
    render(
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle="Tổng phát sinh Nợ"
        subtotalAmount={568750000}
        grandTotalAmount={568750000}
        page={1}
        totalPages={1}
      />,
    );

    // Trigger shows formatted currency
    const trigger = screen.getByText(/568\.750\.000/);
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Unified layout content
    expect(screen.getByText("Tổng phát sinh Nợ")).toBeInTheDocument();
    expect(screen.getAllByText(/568\.750\.000/).length).toBeGreaterThan(1);
    expect(screen.queryByText(/0 đơn vị/)).not.toBeInTheDocument();
  });

  it("renders accounting balance reconciliation card when showAccountingBalance is true", () => {
    render(
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle="Tổng phát sinh Nợ"
        itemTitle="Bút toán"
        itemUnit="dòng"
        subtotalAmount={568750000}
        grandTotalAmount={568750000}
        balanceDebit={568750000}
        balanceCredit={568750000}
        showAccountingBalance={true}
        itemCount={4}
        page={1}
        totalPages={1}
        currentPageCount={4}
        totalCount={4}
      />,
    );

    const trigger = screen.getByText(/568\.750\.000/);
    fireEvent.click(trigger);

    // Reconciliation card
    expect(screen.getByText("Đối soát Cân đối Kế toán")).toBeInTheDocument();
    expect(screen.getByText("Cân đối Nợ - Có")).toBeInTheDocument();
    expect(screen.getAllByText(/568\.750\.000/).length).toBeGreaterThan(2);
  });

  it("renders cumulative amount row and dual ratio in multi-page mode", () => {
    render(
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle="Tiền vào (Thu)"
        subtotalAmount={939237898}
        cumulativeAmount={1602888071}
        grandTotalAmount={31000000000}
        page={2}
        totalPages={33}
      />,
    );

    const trigger = screen.getByText(/939\.237\.898/);
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Popover contains Subtotal (Page 2), Cumulative (T1 -> T2), and Grand Total
    expect(screen.getByText("Tiền vào (Thu)")).toBeInTheDocument();
    expect(screen.getAllByText("Trang 2/33").length).toBeGreaterThan(0);
    expect(screen.getByText(/Lũy kế \(T1 → T2\):/)).toBeInTheDocument();
    expect(screen.getByText(/1\.602\.888\.071/)).toBeInTheDocument();
    expect(screen.getByText(/31\.000\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText("5.2%")).toBeInTheDocument();
  });

  it("renders cumulative qty row and dual ratio in multi-page mode", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Tồn kho"
        subtotalQty={100}
        cumulativeQty={250}
        grandTotalQty={1000}
        page={2}
        totalPages={10}
      />,
    );

    const trigger = screen.getByText("100");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    expect(screen.getByText(/Lũy kế \(T1 → T2\):/)).toBeInTheDocument();
    expect(screen.getByText(/250 đơn vị/)).toBeInTheDocument();
    expect(screen.getByText(/1\.000 đơn vị/)).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
