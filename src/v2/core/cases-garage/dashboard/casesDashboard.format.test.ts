import { describe, expect, it } from "vitest";
import { formatNumber } from "@/v2/shared/utils/v2TableFormat";
import {
  formatRatePercent,
  formatVehicleCaseCounts,
} from "./casesDashboard.format";

describe("casesDashboard.format", () => {
  it("nhãn 'N xe · M lệnh' dùng đơn vị truyền vào và định dạng số", () => {
    expect(
      formatVehicleCaseCounts(1234, 5, { vehicles: "xe", cases: "lệnh" }),
    ).toBe(`${formatNumber(1234)} xe · ${formatNumber(5)} lệnh`);
  });

  it("tỷ lệ hiển thị kèm dấu phần trăm", () => {
    expect(formatRatePercent(33.3)).toBe("33.3%");
    expect(formatRatePercent(0)).toBe("0%");
  });
});
