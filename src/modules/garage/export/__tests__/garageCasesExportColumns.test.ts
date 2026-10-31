import { beforeEach, describe, it, expect } from "vitest";
import {
  DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
  GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY,
  loadSavedGarageCasesExportColumns,
  saveGarageCasesExportColumns,
} from "../garageCasesExportColumns";

const LEGACY_KEY = "garage_cases_export_columns_v1";

describe("garageCasesExportColumns: lưu lựa chọn cột", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("không có lựa chọn đã lưu thì dùng mặc định có VAT", () => {
    expect(loadSavedGarageCasesExportColumns()).toEqual(
      DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
    );
  });

  it("chuyển v1 sang v2: chèn vatAmount ngay trước doanhThu, lưu v2 và giữ các cột khác", () => {
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify(["soChungTu", "doanhThu", "chiPhi"]),
    );

    expect(loadSavedGarageCasesExportColumns()).toEqual([
      "soChungTu",
      "vatAmount",
      "doanhThu",
      "chiPhi",
    ]);
    expect(
      JSON.parse(
        localStorage.getItem(GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY) ?? "[]",
      ),
    ).toEqual(["soChungTu", "vatAmount", "doanhThu", "chiPhi"]);
  });

  it("v1 không có doanhThu thì thêm vatAmount ở cuối", () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(["soChungTu"]));

    expect(loadSavedGarageCasesExportColumns()).toEqual([
      "soChungTu",
      "vatAmount",
    ]);
  });

  it("v1 đã có vatAmount thì không chèn thêm lần nữa", () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(["vatAmount", "doanhThu"]));

    expect(loadSavedGarageCasesExportColumns()).toEqual([
      "vatAmount",
      "doanhThu",
    ]);
  });

  it("đã có v2 thì đọc v2 và không chèn lại VAT người dùng đã bỏ tick", () => {
    saveGarageCasesExportColumns(["soChungTu", "doanhThu"]);
    localStorage.setItem(LEGACY_KEY, JSON.stringify(["soChungTu"]));

    expect(loadSavedGarageCasesExportColumns()).toEqual([
      "soChungTu",
      "doanhThu",
    ]);
  });

  it("dữ liệu v1 hỏng thì dùng mặc định", () => {
    localStorage.setItem(LEGACY_KEY, "{không phải json");

    expect(loadSavedGarageCasesExportColumns()).toEqual(
      DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
    );
  });
});
