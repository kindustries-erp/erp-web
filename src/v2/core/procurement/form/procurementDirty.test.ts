import { describe, expect, it } from "vitest";
import { isProcurementFormDirty } from "./procurementDirty";

describe("isProcurementFormDirty", () => {
  it("không dirty khi form trùng bản gốc", () => {
    expect(
      isProcurementFormDirty(
        { a: 1, lines: [{ q: 2 }] },
        { a: 1, lines: [{ q: 2 }] },
      ),
    ).toBe(false);
  });

  it("dirty khi đổi đầu đề hoặc dòng hàng", () => {
    expect(isProcurementFormDirty({ a: 2 }, { a: 1 })).toBe(true);
    expect(
      isProcurementFormDirty({ lines: [{ q: 3 }] }, { lines: [{ q: 2 }] }),
    ).toBe(true);
  });
});
