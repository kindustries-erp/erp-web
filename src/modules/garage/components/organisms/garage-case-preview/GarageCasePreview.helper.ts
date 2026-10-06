import type {
  QuoteLineItem,
  QuoteProfitSummaryData,
} from "./GarageCasePreview.type";

export { buildFinancialItems } from "./GarageCaseFinancial.helper";

export const formatNumber = (
  val: string | number | null | undefined,
): string => {
  if (val == null) return "0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
};

export const parseQuoteLines = (
  rawData: any,
): {
  parts: QuoteLineItem[];
  services: QuoteLineItem[];
  allLines: QuoteLineItem[];
} => {
  const rawList = Array.isArray(rawData?.ListPhieuDichVuChiTiet)
    ? rawData.ListPhieuDichVuChiTiet
    : [];

  const allLines: QuoteLineItem[] = rawList.map((item: any, idx: number) => {
    const isService =
      item.LoaiSanPhamCode === "DV" ||
      item.LoaiChiTiet === 2 ||
      item.LoaiChiTiet === 3 ||
      item.NhomInName?.toLowerCase().includes("nhân công") ||
      item.NhomInName?.toLowerCase().includes("dịch vụ");

    const qty = Number(item.SoLuongHoaDon || 0);
    const unitPrice = Number(item.DonGia || 0);
    const discountRate = Number(
      item.TyLeChietKhauCt || item.TyLeChietKhauCT || 0,
    );
    const amount = Number(
      item.TienChuaThue ?? unitPrice * qty * (1 - discountRate / 100),
    );
    const taxRate = Number(item.ThueSuat || 0);
    const unitCost = Number(item.GiaVonPhuTung ?? item.giaVonPhuTung ?? 0);
    const totalCost = Number(item.TongVon ?? item.tongVon ?? unitCost * qty);

    return {
      id: item.Id || item.MaChiTiet || `line-${idx}`,
      itemType: isService ? "DV" : "PT",
      code:
        item.SanPhamCode ||
        item.MaChiTiet ||
        item.MaSanPham ||
        item.MaPhuTung ||
        item.MaDichVu ||
        item.MaCongViec ||
        "---",
      name: item.NoiDungChiTiet || "---",
      quantity: qty,
      unitPrice,
      discountRate,
      amount,
      taxRate,
      unitCost,
      totalCost,
      technicianName: item.NhanVienKyThuatName || undefined,
      isInsurance: Boolean(item.CoBaoHiemChiTiet),
      insuranceApprovedAmount: Number(item.TienBaoHiemDuyet || 0),
      costAllocationType:
        item.CostAllocationType || item.costAllocationType || undefined,
    };
  });

  const parts = allLines.filter((l) => l.itemType === "PT");
  const services = allLines.filter((l) => l.itemType === "DV");

  return { parts, services, allLines };
};

export const calculateProfitSummary = (
  caseData: any,
  rawData: any,
  grossProfit?: any,
): QuoteProfitSummaryData => {
  const rev = Number(
    grossProfit?.DoanhThu ??
      caseData?.doanhThu ??
      rawData?.DoanhThu ??
      rawData?.TongTienHang ??
      0,
  );
  const cost = Number(
    grossProfit?.ChiPhi ?? caseData?.chiPhi ?? rawData?.ChiPhi ?? 0,
  );
  const profit = Number(
    grossProfit?.LoiNhuan ??
      caseData?.loiNhuan ??
      rawData?.LoiNhuan ??
      rev - cost,
  );
  const margin =
    grossProfit?.BienLoiNhuan != null
      ? Number(grossProfit.BienLoiNhuan)
      : rev > 0
        ? Number(((profit / rev) * 100).toFixed(1))
        : 0;

  const hasData = rev > 0 || cost > 0 || grossProfit != null;

  const costBreakdown = caseData?.costBreakdown ??
    grossProfit?.costBreakdown ?? {
      warehousePartsCost: Number(
        grossProfit?.GiaVonPhuTung ?? caseData?.giaVonPhuTung ?? 0,
      ),
      inventoryPartCost: Number(
        grossProfit?.GiaVonPhuTung ?? caseData?.giaVonPhuTung ?? 0,
      ),
      externalCost: Number(grossProfit?.ChiPhiMuaNgoai ?? 0),
      outsourceCost: Number(grossProfit?.ChiPhiMuaNgoai ?? 0),
      commissionCost: Number(
        grossProfit?.TienHoaHongMoiGioi ?? rawData?.TienHoaHongMoiGioi ?? 0,
      ),
      otherCost: 0,
      totalCost: cost,
    };

  return {
    revenue: rev,
    totalCost: cost,
    partCost: Number(grossProfit?.GiaVonPhuTung || 0),
    grossProfit: profit,
    profitMargin: margin,
    hasProfitData: hasData,
    costBreakdown,
  };
};
