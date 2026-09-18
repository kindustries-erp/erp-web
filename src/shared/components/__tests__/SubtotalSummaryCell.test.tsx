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

    // Popover header
    expect(screen.getByText("Tổng quan số liệu")).toBeInTheDocument();
    expect(screen.getAllByText("Trang 1/5").length).toBeGreaterThan(0);

    // Box 1: Item Ratio
    expect(screen.getByText("Mặt hàng")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("241")).toBeInTheDocument();
    expect(screen.getByText("SKU")).toBeInTheDocument();

    // Box 2: Quantity Ratio
    expect(screen.getByText("SL Tồn kho")).toBeInTheDocument();
    expect(screen.getByText("281.698")).toBeInTheDocument();
  });

  it("renders clean single-page summary with unified 2-row layout and progress bar", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Nhập kho"
        itemTitle="Dòng nhập kho"
        itemUnit="dòng"
        grandTotalQty={5}
        itemCount={1}
        page={1}
        totalPages={1}
        currentPageCount={1}
        totalCount={1}
      />,
    );

    const trigger = screen.getByText("5");
    fireEvent.click(trigger);

    // Header badge
    expect(screen.getAllByText("Trang 1/1").length).toBeGreaterThan(0);

    // Box 1 (Unified 2-row)
    expect(screen.getByText("Dòng nhập kho")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getByText("dòng")).toBeInTheDocument();

    // Box 2 (Unified 2-row)
    expect(screen.getByText("SL Nhập kho")).toBeInTheDocument();
    expect(screen.getByText("đơn vị")).toBeInTheDocument();
  });

  it("renders PO reconciliation progress and status badge in Goods Receipt", () => {
    render(
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle="SL Thực nhận"
        itemTitle="Dòng nhập kho"
        itemUnit="dòng"
        grandTotalQty={5}
        grandTotalOrderedQty={5}
        itemCount={1}
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
        itemTitle="Dòng điều chỉnh"
        itemUnit="dòng"
        grandTotalQty={8}
        positiveQty={10}
        negativeQty={2}
        itemCount={2}
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
        itemTitle="Mặt hàng"
        itemUnit="SKU"
        subtotalQty={123456789012}
        grandTotalQty={987654321098}
        subtotalAmount={500000000000}
        grandTotalAmount={999000000000}
        itemCount={120000}
        page={1}
        totalPages={10}
        currentPageCount={12000}
        totalCount={120000}
      />,
    );

    const trigger = screen.getByText("123.456.789.012");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Verify formatted values in popover
    expect(screen.getByText("987.654.321.098")).toBeInTheDocument();
    expect(screen.getByText("12.000")).toBeInTheDocument();
    expect(screen.getByText("120.000")).toBeInTheDocument();
  });

  it("renders amount variant cleanly with currency format and no 0 quantity units", () => {
    render(
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle="Tổng phát sinh Nợ"
        itemTitle="Bút toán"
        itemUnit="dòng"
        subtotalAmount={568750000}
        grandTotalAmount={568750000}
        itemCount={4}
        page={1}
        totalPages={1}
        currentPageCount={4}
        totalCount={4}
      />,
    );

    // Trigger shows formatted currency
    const trigger = screen.getByText(/568\.750\.000/);
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Box 1: Bút toán
    expect(screen.getByText("Bút toán")).toBeInTheDocument();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getByText("dòng")).toBeInTheDocument();

    // Box 2: Tổng phát sinh Nợ with currency format, NOT 0 đơn vị
    expect(screen.getByText("Tổng phát sinh Nợ")).toBeInTheDocument();
    expect(screen.getAllByText(/568\.750\.000/).length).toBeGreaterThan(1);
    expect(screen.queryByText("0 / 0 đơn vị")).not.toBeInTheDocument();
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
});
