import { describe, expect, it } from "vitest";
import {
  buildVehicleInfoRows,
  formatModelYear,
  formatPayer,
  formatVehicleBrand,
  formatVehicleModel,
} from "./garageCaseVehicle.helper";
import { GARAGE_CASE_VEHICLE_COLUMNS } from "./garageCaseVehicle.columns";

describe("garageCaseVehicle.helper", () => {
  it("ưu tiên tên, thiếu thì dùng mã, rỗng trả null", () => {
    expect(
      formatVehicleBrand({ hangXeName: " VinFast ", hangXeCode: "VF" }),
    ).toBe("VinFast");
    expect(formatVehicleBrand({ hangXeName: "", hangXeCode: "VF" })).toBe("VF");
    expect(
      formatVehicleModel({ dongXeName: null, dongXeCode: null }),
    ).toBeNull();
    expect(formatPayer({ doiTuongThanhToanCode: "KH01" })).toBe("KH01");
  });

  it("chỉ nhận năm sản xuất 1900-2099", () => {
    expect(formatModelYear({ namSanXuat: 2023 })).toBe("2023");
    expect(formatModelYear({ namSanXuat: 0 })).toBeNull();
    expect(formatModelYear({ namSanXuat: 2150 })).toBeNull();
    expect(formatModelYear({ namSanXuat: null })).toBeNull();
  });

  it("buildVehicleInfoRows trả đủ 5 dòng theo cấu hình, mã phụ khác tên", () => {
    const rows = buildVehicleInfoRows({
      soKhung: "RLV123",
      hangXeName: "VinFast",
      hangXeCode: "VF",
      dongXeName: "VF8",
      dongXeCode: "VF8",
      namSanXuat: 2024,
      doiTuongThanhToanName: "Cty A",
      doiTuongThanhToanCode: "A01",
    });
    expect(rows.map((r) => r.key)).toEqual(
      GARAGE_CASE_VEHICLE_COLUMNS.map((c) => c.key),
    );
    expect(rows.find((r) => r.key === "hangXe")).toMatchObject({
      value: "VinFast",
      code: "VF",
    });
    expect(rows.find((r) => r.key === "dongXe")?.code).toBeNull();
    expect(rows.find((r) => r.key === "doiTuongThanhToan")?.code).toBe("A01");
  });

  it("mặc định ẩn toàn bộ cột", () => {
    expect(GARAGE_CASE_VEHICLE_COLUMNS.every((c) => !c.defaultVisible)).toBe(
      true,
    );
  });
});
