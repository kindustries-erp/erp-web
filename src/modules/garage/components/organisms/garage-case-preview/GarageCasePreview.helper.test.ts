import { describe, expect, it } from "vitest";
import {
  calculateProfitSummary,
  formatNumber,
  parseQuoteLines,
} from "./GarageCasePreview.helper";
import { buildFinancialItems } from "./GarageCaseFinancial.helper";

describe("GarageCasePreview.helper", () => {
  it("formatNumber formats null, string, and numbers", () => {
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
    expect(formatNumber(1500000)).toBe("1.500.000");
    expect(formatNumber("2500000")).toBe("2.500.000");
  });

  it("parseQuoteLines separates parts and services", () => {
    const rawData = {
      ListPhieuDichVuChiTiet: [
        {
          SanPhamCode: "PT001",
          NoiDungChiTiet: "Lọc nhớt",
          LoaiSanPhamCode: "PT",
          LoaiChiTiet: 1,
          SoLuongHoaDon: 2,
          DonGia: 100000,
          TyLeChietKhauCt: 10,
          TienChuaThue: 180000,
          ThueSuat: 10,
          GiaVonPhuTung: 70000,
        },
        {
          SanPhamCode: "DV001",
          NoiDungChiTiet: "Công thay nhớt",
          LoaiSanPhamCode: "DV",
          LoaiChiTiet: 2,
          SoLuongHoaDon: 1,
          DonGia: 150000,
          TyLeChietKhauCt: 0,
          TienChuaThue: 150000,
          ThueSuat: 10,
          NhanVienKyThuatName: "Nguyễn Văn A",
        },
      ],
    };

    const { parts, services, allLines } = parseQuoteLines(rawData);
    expect(allLines).toHaveLength(2);
    expect(parts).toHaveLength(1);
    expect(parts[0].itemType).toBe("PT");
    expect(parts[0].name).toBe("Lọc nhớt");
    expect(parts[0].unitCost).toBe(70000);
    expect(parts[0].totalCost).toBe(140000); // 70000 * 2
    expect(parts[0].costAllocationType).toBeUndefined();

    expect(services).toHaveLength(1);
    expect(services[0].itemType).toBe("DV");
    expect(services[0].name).toBe("Công thay nhớt");
    expect(services[0].technicianName).toBe("Nguyễn Văn A");
  });

  it("buildFinancialItems builds financial breakdown lines with commissions and insurance", () => {
    const rawData = {
      TongTienHang: 1000000,
      TienChietKhau: 50000,
      TienFeedback: 20000,
      ThueSuat: 10,
      TienThue: 93000,
      TongTienThanhToan: 1023000,
      TienThanhToanKH: 500000,
      TienThanhToanBH: 523000,
      TyLeHoaHongBaoHiem: 5,
      TienHoaHongBaoHiem: 25000,
      TyLeHoaHongMoiGioi: 2,
      TienHoaHongMoiGioi: 10000,
      TienDaThanhToan: 500000,
      TienConPhaiThanhToan: 523000,
    };
    const caseData = {};
    const grossProfit = {
      GiaVonPhuTung: 400000,
      ChiPhi: 450000,
      LoiNhuan: 550000,
      BienLoiNhuan: 55,
    };

    const items = buildFinancialItems(rawData, caseData, grossProfit);
    expect(items.length).toBeGreaterThanOrEqual(14);

    const hhBh = items.find((i) => i.id === "hh-bao-hiem");
    expect(hhBh?.amount).toBe(25000);
    expect(hhBh?.rate).toBe(5);

    const bhPay = items.find((i) => i.id === "bh-thanh-toan");
    expect(bhPay?.amount).toBe(523000);

    const profitItem = items.find((i) => i.id === "loi-nhuan-gop");
    expect(profitItem?.amount).toBe(550000);
  });

  it("calculateProfitSummary calculates correct metrics", () => {
    const summary = calculateProfitSummary(
      { doanhThu: 1000000, chiPhi: 600000, loiNhuan: 400000 },
      {},
      { BienLoiNhuan: 40, GiaVonPhuTung: 350000 },
    );
    expect(summary.revenue).toBe(1000000);
    expect(summary.totalCost).toBe(600000);
    expect(summary.grossProfit).toBe(400000);
    expect(summary.profitMargin).toBe(40);
    expect(summary.partCost).toBe(350000);
    expect(summary.hasProfitData).toBe(true);
  });
});
