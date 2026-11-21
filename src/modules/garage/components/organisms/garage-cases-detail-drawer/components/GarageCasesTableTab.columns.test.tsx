import { describe, expect, it } from "vitest";
import { createGarageCasesColumns } from "./GarageCasesTableTab.columns";

const t = (_k: string, fb: string) => fb;

describe("createGarageCasesColumns thứ tự cột", () => {
  it("Biển số xe là cột dữ liệu đầu, trước Số phiếu", () => {
    const keys = createGarageCasesColumns({
      isPayable: false,
      showProfitMetrics: true,
      t,
    }).map((c) => c.key);
    expect(keys.slice(0, 3)).toEqual([
      "bienSoXe",
      "soChungTu",
      "ngayHoanThanh",
    ]);
    expect(keys).toContain("caseCount");
    expect(keys.slice(-3)).toEqual(["revenue", "cost", "profit"]);
  });

  it("không có cột lợi nhuận/số lệnh khi tắt chỉ số lợi nhuận", () => {
    const keys = createGarageCasesColumns({ isPayable: false, t }).map(
      (c) => c.key,
    );
    expect(keys[0]).toBe("bienSoXe");
    expect(keys).not.toContain("caseCount");
    expect(keys).not.toContain("profit");
  });

  it("dòng tổng cộng nằm ở cột đầu", () => {
    const [first] = createGarageCasesColumns({ isPayable: false, t });
    expect(first.summary).toMatchObject({ variant: "label" });
  });
});
