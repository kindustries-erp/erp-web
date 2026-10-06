import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCasePreview } from "./GarageCasePreview";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def?: any) => {
      if (typeof def === "string") return def;
      if (
        def &&
        typeof def === "object" &&
        typeof def.defaultValue === "string"
      ) {
        return def.defaultValue
          .replace("{{date}}", def.date || "")
          .replace("{{count}}", def.count != null ? String(def.count) : "");
      }
      return _key;
    },
  }),
}));

const mockCaseData = {
  soChungTu: "SC-TEST-001",
  ngayPhatSinh: "2026-10-05T08:00:00.000Z",
  khachHangName: "Khách hàng Test",
  bienSoXe: "51K-99999",
  tienCoThue: 2500000,
  rawData: {
    SoPhieu: "SC-TEST-001",
    KhachHangName: "Khách hàng Test",
    TongTienHang: 2000000,
    TienThue: 200000,
    TongTienThanhToan: 2200000,
    TienThanhToanKH: 2200000,
    ListPhieuDichVuChiTiet: [
      {
        Id: "line-1",
        LoaiSanPhamCode: "PT",
        SanPhamCode: "PT-01",
        NoiDungChiTiet: "Lọc gió động cơ",
        SoLuongHoaDon: 1,
        DonGia: 500000,
        TienChuaThue: 500000,
        GiaVonPhuTung: 300000,
      },
      {
        Id: "line-2",
        LoaiSanPhamCode: "DV",
        SanPhamCode: "DV-01",
        NoiDungChiTiet: "Bảo dưỡng định kỳ",
        SoLuongHoaDon: 1,
        DonGia: 1500000,
        TienChuaThue: 1500000,
      },
    ],
  },
};

describe("GarageCasePreview Organism", () => {
  it("renders in DOCUMENT mode", () => {
    render(<GarageCasePreview caseData={mockCaseData} />);

    expect(
      screen.getByText("Sổ báo giá & Lợi nhuận dự kiến"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("CÔNG TY CỔ PHẦN GREENWAY AUTOMOTIVES"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bảo dưỡng định kỳ")).toBeInTheDocument();
    expect(screen.getByText("Lọc gió động cơ")).toBeInTheDocument();
  });
});
