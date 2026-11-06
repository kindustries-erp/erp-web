import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  emptyProcurementLine,
  procurementLineFromDetail,
} from "../../../form/procurementLine.form";
import { ProcurementLinesEditor } from "./ProcurementLinesEditor";

describe("ProcurementLinesEditor", () => {
  it("thêm một dòng trống khi bấm Thêm dòng", () => {
    const onChange = vi.fn();
    const lines = [emptyProcurementLine()];
    render(
      <ProcurementLinesEditor
        lines={lines}
        onChange={onChange}
        viewing={false}
        priceLabel="Đơn giá"
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /thêm dòng|add line/i }),
    );
    expect(onChange).toHaveBeenCalledWith([
      lines[0],
      expect.objectContaining({ itemName: "", qty: "1" }),
    ]);
  });

  it("không cho xóa dòng cuối cùng", () => {
    render(
      <ProcurementLinesEditor
        lines={[emptyProcurementLine()]}
        onChange={vi.fn()}
        viewing={false}
        priceLabel="Đơn giá"
      />,
    );
    expect(
      screen.getByRole("button", { name: /xóa dòng|remove line/i }),
    ).toHaveProperty("disabled", true);
  });

  it("chế độ xem không hiện nút thêm hoặc xóa", () => {
    render(
      <ProcurementLinesEditor
        lines={[emptyProcurementLine()]}
        onChange={vi.fn()}
        viewing
        priceLabel="Đơn giá"
      />,
    );
    expect(
      screen.queryByRole("button", { name: /thêm dòng|add line/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /xóa dòng|remove line/i }),
    ).toBeNull();
  });

  it("mở dòng có số từ API không làm vỡ bảng", () => {
    const line = procurementLineFromDetail({
      id: "l1",
      lineType: "GOODS",
      itemName: "Dầu nhớt",
      qtyOrdered: 2,
      unitPrice: 150000,
    });
    render(
      <ProcurementLinesEditor
        lines={[line]}
        onChange={vi.fn()}
        viewing={false}
        priceLabel="Đơn giá"
      />,
    );
    expect(screen.getByDisplayValue("Dầu nhớt")).toBeTruthy();
  });

  it("render đúng các cột theo array config", () => {
    const line = procurementLineFromDetail({
      id: "l2",
      lineType: "SERVICE",
      itemCode: "DV-001",
      itemName: "Công thay thế",
      qtyOrdered: 1,
      unitPrice: 200000,
    });
    render(
      <ProcurementLinesEditor
        lines={[line]}
        onChange={vi.fn()}
        viewing
        priceLabel="Đơn giá dự kiến"
      />,
    );
    expect(screen.getByText("Loại")).toBeInTheDocument();
    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Đơn giá dự kiến")).toBeInTheDocument();
    expect(screen.getByText("DV-001")).toBeInTheDocument();
    expect(screen.getByText("Công thay thế")).toBeInTheDocument();
  });
});
