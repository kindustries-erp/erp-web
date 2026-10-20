import { describe, expect, it } from "vitest";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import { headerFilter } from "./v2HeaderFilterBuilder";

describe("headerFilter", () => {
  it("builds a text filter and forwards options", () => {
    const result = headerFilter("Mã", { showBlankOption: true });
    expect(result).toEqual({
      label: "Mã",
      filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    });
  });

  it("builds a date filter without option controls", () => {
    expect(headerFilter.date("Ngày")).toEqual({
      label: "Ngày",
      filter: { valueType: ColumnValueType.DATE },
    });
  });

  it("formats amount and quantity option labels with thousand separators", () => {
    const amount = headerFilter.amount("Tiền").filter;
    const qty = headerFilter.qty("SL").filter;
    expect(amount?.valueType).toBe(ColumnValueType.NUMBER);
    expect(amount?.formatOptionLabel?.("10000000")).toBe("10.000.000 đ");
    expect(qty?.formatOptionLabel?.("1250")).toBe("1.250");
  });

  it("lets callers override the default option formatter", () => {
    const filter = headerFilter.amount("Tiền", {
      formatOptionLabel: (v) => `#${v}`,
    }).filter;
    expect(filter?.formatOptionLabel?.("5")).toBe("#5");
  });

  it("carries static options for select columns", () => {
    const options = [{ value: "DRAFT", label: "Nháp" }];
    expect(headerFilter.select("Trạng thái", options).filter).toEqual({
      valueType: ColumnValueType.SELECT,
      filterOptions: options,
    });
  });
});
