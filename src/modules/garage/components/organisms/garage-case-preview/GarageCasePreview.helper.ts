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

    const outsourceCost = Number(
      item.GCN ??
        item.gcn ??
        item.GiaCongNgoai ??
        item.giaCongNgoai ??
        item.ChiPhiThueNgoai ??
        item.chiPhiThueNgoai ??
        item.GiaChiNgoai ??
        (item.HTThanhToanThueNgoaiCode === "CN-GCN"
          ? (item.DonGiaThueNgoai ?? item.TienThueNgoai ?? 0)
          : 0),
    );

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
      outsourceCost,
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

  const discountAmount = Number(rawData?.TienChietKhau || 0);
  const discountRate = Number(rawData?.TyLeChietKhau || 0);
  const rawTienChuaThue = Number(rawData?.TienChuaThue || 0);
  const rawTongTienHang = Number(rawData?.TongTienHang || 0);

  let totalAmount = 0;
  let subtotalAfterDiscount = 0;

  if (
    rawTienChuaThue > 0 &&
    rawTongTienHang > 0 &&
    rawTienChuaThue > rawTongTienHang
  ) {
    totalAmount = rawTienChuaThue;
    subtotalAfterDiscount = rawTongTienHang;
  } else if (rawTienChuaThue > 0) {
    totalAmount = rawTienChuaThue;
    subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);
  } else if (rawTongTienHang > 0) {
    if (discountAmount > 0) {
      totalAmount = rawTongTienHang + discountAmount;
      subtotalAfterDiscount = rawTongTienHang;
    } else {
      totalAmount = rawTongTienHang;
      subtotalAfterDiscount = rawTongTienHang;
    }
  } else if (rev > 0) {
    totalAmount = rev;
    subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);
  }

  const deductibleAmount = Number(rawData?.TienKhauTruBaoHiem || 0);
  const sanctionAmount = Number(rawData?.TienChiPhiCheTai || 0);
  const afterSanctionAmount =
    rawData?.TienSauCheTai != null
      ? Number(rawData.TienSauCheTai)
      : Math.max(
          0,
          subtotalAfterDiscount - (deductibleAmount + sanctionAmount),
        );

  const vatAmount = Number(rawData?.TienThue || 0);
  const customerPay = Number(rawData?.TienThanhToanKH || 0);
  const insurancePay = Number(rawData?.TienThanhToanBH || 0);
  const totalPayable = Number(
    rawData?.TongTienThanhToan ||
      rawData?.TienCoThue ||
      caseData?.tienCoThue ||
      0,
  );

  const commissionGeneral = Number(rawData?.TienHoaHong || 0);
  const commissionGdv = Number(rawData?.TienHoaHongBaoHiem || 0);
  const gdvName = rawData?.GiamDinhVienName || null;
  const commissionMg = Number(
    grossProfit?.TienHoaHongMoiGioi ?? rawData?.TienHoaHongMoiGioi ?? 0,
  );
  const brokerName = rawData?.NguoiMoiGioiName || null;

  const partsCostInside = Number(
    grossProfit?.GiaVonPhuTung ?? caseData?.giaVonPhuTung ?? 0,
  );
  const partsCostOutside = Number(
    grossProfit?.ChiPhiMuaNgoai ?? rawData?.ChiPhiPhuTungNgoaiPhieu ?? 0,
  );

  const journalItems =
    grossProfit?.journal_items || grossProfit?.rawData?.journal_items || [];
  let journalOutsourceCost = 0;
  let journalCommissionCost = 0;
  let journalDiscountCost = 0;
  let journalPartsCost = 0;

  if (Array.isArray(journalItems) && journalItems.length > 0) {
    for (const item of journalItems) {
      const tkNo = String(item.TaiKhoanNoCode || item.TaiKhoanNo || "");
      const val = Number(item.ChiPhi || item.ChiPhiVon || item.GiaTriTien || 0);
      if (tkNo === "1541") journalPartsCost += val;
      else if (tkNo === "1542") journalOutsourceCost += val;
      else if (tkNo === "1543") journalCommissionCost += val;
      else if (tkNo === "521") journalDiscountCost += val;
    }
  }

  const outsourceLaborCost = Number(
    caseData?.costBreakdown?.outsourceCost ??
      grossProfit?.costBreakdown?.outsourceCost ??
      (journalOutsourceCost > 0 ? journalOutsourceCost : undefined) ??
      grossProfit?.ChiPhiGiaCongNgoai ??
      rawData?.ChiPhiGiaCongThueNgoai ??
      0,
  );

  const effectivePartsInside = partsCostInside || journalPartsCost;
  const totalCommissions = commissionGeneral + commissionGdv + commissionMg;
  const totalEstimatedCost =
    effectivePartsInside + partsCostOutside + outsourceLaborCost;

  const estimatedProfitPreTax =
    subtotalAfterDiscount > 0
      ? subtotalAfterDiscount - totalCommissions - totalEstimatedCost
      : profit;

  const estimatedProfitAfterTax = estimatedProfitPreTax + vatAmount;

  const hasData = rev > 0 || cost > 0 || grossProfit != null;

  const costBreakdown: any = caseData?.costBreakdown ??
    grossProfit?.costBreakdown ?? {
      warehousePartsCost: effectivePartsInside,
      inventoryPartCost: effectivePartsInside,
      externalCost: partsCostOutside,
      outsourceCost: outsourceLaborCost,
      commissionCost: commissionMg + commissionGdv || journalCommissionCost,
      discountCost: journalDiscountCost || discountAmount,
      otherCost: 0,
      totalCost: cost || totalEstimatedCost,
    };

  return {
    revenue: rev,
    totalCost: cost,
    partCost: effectivePartsInside,
    grossProfit: profit,
    profitMargin: margin,
    hasProfitData: hasData,
    costBreakdown,
    totalAmount,
    discountAmount,
    discountRate,
    subtotalAfterDiscount,
    deductibleAmount,
    sanctionAmount,
    afterSanctionAmount,
    customerPay,
    insurancePay,
    vatAmount,
    totalPayable,
    commissionGeneral,
    commissionGdv,
    gdvName,
    commissionMg,
    brokerName,
    partsCostInside: effectivePartsInside,
    partsCostOutside,
    outsourceLaborCost,
    estimatedProfitPreTax,
    estimatedProfitAfterTax,
    isInsurance: Boolean(
      rawData?.XeLamBaoHiem || insurancePay > 0 || deductibleAmount > 0,
    ),
  };
};
