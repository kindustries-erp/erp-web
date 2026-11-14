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

  it("nhập ghi chú cho từng dòng và gửi vào trường description", () => {
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
    fireEvent.change(screen.getByLabelText("Ghi chú"), {
      target: { value: "Giao trước 12h" },
    });
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        key: lines[0].key,
        description: "Giao trước 12h",
      }),
    ]);
  });

  it("chế độ xem hiện ghi chú dạng văn bản", () => {
    const line = {
      ...emptyProcurementLine(),
      itemName: "Lọc dầu",
      description: "Hàng hãng chính",
    };
    render(
      <ProcurementLinesEditor
        lines={[line]}
        onChange={vi.fn()}
        viewing
        priceLabel="Đơn giá"
      />,
    );
    expect(screen.getByText("Hàng hãng chính")).toBeInTheDocument();
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

  it("hiển thị số dòng trong DrawerSection count và cho phép tùy biến title, addButtonLabel", () => {
    const lines = [emptyProcurementLine(), emptyProcurementLine()];
    render(
      <ProcurementLinesEditor
        lines={lines}
        onChange={vi.fn()}
        viewing={false}
        priceLabel="Đơn giá"
        title="Chi tiết vật tư đề nghị"
        addButtonLabel="Thêm vật tư"
      />,
    );
    expect(screen.getByText("Chi tiết vật tư đề nghị")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /thêm vật tư/i }),
    ).toBeInTheDocument();
  });

  it("hiện cột Đã nhận và Còn lại khi showReceived (nhập nhiều đợt)", () => {
    const lines = [
      {
        ...emptyProcurementLine(),
        itemName: "Lọc dầu",
        qty: "5",
        price: "100",
        qtyFulfilled: "2",
      },
    ];
    render(
      <ProcurementLinesEditor
        lines={lines}
        onChange={vi.fn()}
        viewing
        showReceived
        priceLabel="Đơn giá"
      />,
    );
    expect(screen.getByText("Đã nhận")).toBeDefined();
    expect(screen.getByText("Còn lại")).toBeDefined();
    // Đã nhận 2, còn lại 5 - 2 = 3 (cũng có ở dòng tổng cộng)
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("không có cột Đã nhận khi không bật showReceived", () => {
    render(
      <ProcurementLinesEditor
        lines={[emptyProcurementLine()]}
        onChange={vi.fn()}
        viewing
        priceLabel="Đơn giá"
      />,
    );
    expect(screen.queryByText("Đã nhận")).toBeNull();
  });
});
