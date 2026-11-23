import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderVatCell } from "./GarageCasesTableTab.cells";
import { groupCasesByVehicle } from "./GarageCasesTableTab.helper";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

const row = (p: Partial<GarageCaseDetailRow>) => p as GarageCaseDetailRow;
const t = (_k: string, fb: string) => `T:${fb}`;

describe("renderVatCell", () => {
  it("hasInvoice không có số hóa đơn: badge i18n, không có #", () => {
    render(<>{renderVatCell(row({ hasInvoice: true }), t)}</>);
    expect(screen.getByText("T:Đã xuất")).toBeTruthy();
    expect(screen.queryByText(/#/)).toBeNull();
  });

  it("có số hóa đơn thật: hiện #số", () => {
    render(<>{renderVatCell(row({ invoiceNo: "INV-1" }), t)}</>);
    expect(screen.getByText("#INV-1")).toBeTruthy();
  });

  it("không hóa đơn: dấu gạch", () => {
    render(<>{renderVatCell(row({}), t)}</>);
    expect(screen.getByText("—")).toBeTruthy();
  });
});

describe("groupCasesByVehicle", () => {
  it("lấy ngày hoàn thành mới nhất theo timestamp và gộp hasInvoice", () => {
    const rows = [
      row({
        rowKey: "a",
        vehicleKey: "V1",
        ngayHoanThanh: "2026-11-09T10:00:00Z",
      }),
      row({
        rowKey: "b",
        vehicleKey: "V1",
        ngayHoanThanh: "2026-11-10T01:00:00+07:00",
        hasInvoice: true,
      }),
    ];
    const [g] = groupCasesByVehicle(rows);
    expect(g.ngayHoanThanh).toBe("2026-11-10T01:00:00+07:00");
    expect(g.hasInvoice).toBe(true);
    expect(g.invoiceNo).toBeUndefined();
  });
});
