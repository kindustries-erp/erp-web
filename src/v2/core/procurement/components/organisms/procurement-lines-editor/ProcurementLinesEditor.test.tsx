import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyProcurementLine } from "../../../form/procurementLine.form";
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
});
