import React, { useMemo } from "react";
import { format } from "date-fns";

interface Props {
  caseData: any;
  grossProfit?: any;
}

export function GarageCasePreview({ caseData, grossProfit }: Props) {
  const { rawData } = caseData || {};

  const formatNumber = (val: string | number | null | undefined) => {
    if (val == null) return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const services = useMemo(() => {
    if (!rawData?.ListPhieuDichVuChiTiet) return [];
    return rawData.ListPhieuDichVuChiTiet.filter(
      (item: any) =>
        item.LoaiSanPhamCode === "DV" ||
        item.LoaiChiTiet === 2 ||
        item.LoaiChiTiet === 3 ||
        item.NhomInName?.toLowerCase().includes("nhân công") ||
        item.NhomInName?.toLowerCase().includes("dịch vụ"),
    );
  }, [rawData]);

  const parts = useMemo(() => {
    if (!rawData?.ListPhieuDichVuChiTiet) return [];
    return rawData.ListPhieuDichVuChiTiet.filter(
      (item: any) =>
        item.LoaiSanPhamCode === "PT" ||
        item.LoaiChiTiet === 1 ||
        item.LoaiChiTiet === 4 ||
        item.NhomInName?.toLowerCase().includes("vật tư") ||
        item.NhomInName?.toLowerCase().includes("phụ tùng"),
    );
  }, [rawData]);

  const dateStr = rawData?.NgayTiepNhan
    ? format(new Date(rawData.NgayTiepNhan), "dd 'tháng' MM 'năm' yyyy")
    : caseData?.ngayPhatSinh
      ? format(new Date(caseData.ngayPhatSinh), "dd 'tháng' MM 'năm' yyyy")
      : "---";

  return (
    <div className="w-full text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm relative overflow-hidden rounded-xl">
        {/* Decorative Top Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 mt-1">
          <div className="flex-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
            <h2 className="text-sm font-bold uppercase text-emerald-700 dark:text-emerald-400">
              CÔNG TY CỔ PHẦN GREENWAY AUTOMOTIVES
            </h2>
            <p>CN1: 66 Phổ Quang, Phường Tân Sơn Hòa, TP. Hồ Chí Minh</p>
            <p>CN2: 554 Lê Văn Lương, Phường Tân Hưng, TP. Hồ Chí Minh</p>
            <p className="pt-1 font-medium text-slate-700 dark:text-slate-300">
              Hotline: 0853.64.65.66 & 0858.64.65.66
            </p>
          </div>
          <div className="flex-shrink-0 text-right ml-4">
            <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">
              GREENWAY
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-emerald-800 dark:text-emerald-400 uppercase">
              Luxury Cars | Services
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 border-t border-b border-slate-100 dark:border-slate-800 py-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg">
          <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            SỔ BÁO GIÁ & LỢI NHUẬN DỰ KIẾN
          </h1>
          <div className="flex justify-center items-center gap-6 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Số phiếu:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {caseData?.soChungTu || rawData?.SoPhieu || "---"}
              </strong>
            </span>
            <span>•</span>
            <span>Ngày {dateStr}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Khách hàng:</span>
              <span className="font-semibold uppercase text-slate-900 dark:text-slate-100">
                {rawData?.KhachHangName || caseData?.khachHangName || "---"}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Địa chỉ:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate">
                {rawData?.DiaChiKhachHang || "---"}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Mã số thuế:</span>
              <span>{rawData?.MaSoThue || "---"}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Điện thoại:</span>
              <span>{rawData?.DienThoaiKhachHang || "---"}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Yêu cầu DV:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {rawData?.YeuCauDichVu || "---"}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-4">
            <div className="flex">
              <span className="w-24 text-slate-500 shrink-0">Biển số xe:</span>
              <span className="font-bold text-primary">
                {caseData?.bienSoXe || "---"}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 shrink-0">Hãng / Dòng:</span>
              <span>
                {rawData?.HangXeName || "---"} {rawData?.DongXeName || ""}
                {rawData?.NamSanXuat ? ` (${rawData.NamSanXuat})` : ""}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 shrink-0">Số KM:</span>
              <span className="font-medium">
                {formatNumber(rawData?.SoKM || rawData?.SoKMTruoc || 0)} km
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 shrink-0">Số VIN:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {rawData?.SoKhung || caseData?.soKhung || "---"}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-500 shrink-0">Số máy:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {rawData?.SoMay || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="mb-6 space-y-6">
          {/* Vật tư phụ tùng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                1. Vật tư & Phụ tùng ({parts.length})
              </h3>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
              <table className="w-full border-collapse text-xs text-center">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2 w-10">STT</th>
                    <th className="p-2 w-28 text-left">Mã PT/VT</th>
                    <th className="p-2 text-left">Tên phụ tùng / vật tư</th>
                    <th className="p-2 w-12">SL</th>
                    <th className="p-2 w-20 text-right">Đơn giá</th>
                    <th className="p-2 w-12">%GG</th>
                    <th className="p-2 w-24 text-right">Thành tiền</th>
                    <th className="p-2 w-12">Thuế</th>
                    <th className="p-2 w-20 text-right">ĐG vốn</th>
                    <th className="p-2 w-24 text-right">Tổng vốn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parts.map((p: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-2 text-slate-400">{i + 1}</td>
                      <td className="p-2 text-left font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {p.SanPhamCode ||
                          p.MaChiTiet ||
                          p.MaSanPham ||
                          p.MaPhuTung ||
                          "---"}
                      </td>
                      <td className="p-2 text-left font-medium text-slate-800 dark:text-slate-200">
                        {p.NoiDungChiTiet}
                      </td>
                      <td className="p-2 font-medium">
                        {formatNumber(p.SoLuongHoaDon)}
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        {formatNumber(p.DonGia)}
                      </td>
                      <td className="p-2 text-slate-500">
                        {formatNumber(
                          p.TyLeChietKhauCt || p.TyLeChietKhauCT || 0,
                        )}
                        %
                      </td>
                      <td className="p-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatNumber(p.TienChuaThue || 0)}
                      </td>
                      <td className="p-2 text-slate-500">
                        {formatNumber(p.ThueSuat || 0)}%
                      </td>
                      <td className="p-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                        {formatNumber(p.GiaVonPhuTung || 0)}
                      </td>
                      <td className="p-2 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
                        {formatNumber(
                          (p.GiaVonPhuTung || 0) * (p.SoLuongHoaDon || 0),
                        )}
                      </td>
                    </tr>
                  ))}
                  {parts.length > 0 && (
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                      <td colSpan={6} className="p-2 text-right text-slate-600">
                        Cộng phụ tùng:
                      </td>
                      <td className="p-2 text-right tabular-nums text-primary font-bold">
                        {formatNumber(
                          parts.reduce(
                            (sum: number, p: any) =>
                              sum + (p.TienChuaThue || 0),
                            0,
                          ),
                        )}
                      </td>
                      <td colSpan={2} className="p-2"></td>
                      <td className="p-2 text-right tabular-nums text-slate-700 dark:text-slate-300 font-bold">
                        {formatNumber(
                          parts.reduce(
                            (sum: number, p: any) =>
                              sum +
                              (p.GiaVonPhuTung || 0) * (p.SoLuongHoaDon || 0),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  )}
                  {parts.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-4 text-center text-slate-400 italic"
                      >
                        Không có vật tư phụ tùng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nhân công - Dịch vụ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                2. Nhân công & Dịch vụ ({services.length})
              </h3>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
              <table className="w-full border-collapse text-xs text-center">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2 w-10">STT</th>
                    <th className="p-2 w-28 text-left">Mã C/V</th>
                    <th className="p-2 text-left">Tên công việc / Dịch vụ</th>
                    <th className="p-2 w-12">SL</th>
                    <th className="p-2 w-20 text-right">Đơn giá</th>
                    <th className="p-2 w-12">%GG</th>
                    <th className="p-2 w-24 text-right">Thành tiền</th>
                    <th className="p-2 w-12">Thuế</th>
                    <th className="p-2 w-28 text-left">Kỹ thuật viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {services.map((s: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-2 text-slate-400">{i + 1}</td>
                      <td className="p-2 text-left font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {s.SanPhamCode ||
                          s.MaChiTiet ||
                          s.MaSanPham ||
                          s.MaDichVu ||
                          s.MaCongViec ||
                          "---"}
                      </td>
                      <td className="p-2 text-left font-medium text-slate-800 dark:text-slate-200">
                        {s.NoiDungChiTiet}
                      </td>
                      <td className="p-2 font-medium">
                        {formatNumber(s.SoLuongHoaDon)}
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        {formatNumber(s.DonGia)}
                      </td>
                      <td className="p-2 text-slate-500">
                        {formatNumber(
                          s.TyLeChietKhauCt || s.TyLeChietKhauCT || 0,
                        )}
                        %
                      </td>
                      <td className="p-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatNumber(s.TienChuaThue || 0)}
                      </td>
                      <td className="p-2 text-slate-500">
                        {formatNumber(s.ThueSuat || 0)}%
                      </td>
                      <td className="p-2 text-left text-slate-600 dark:text-slate-400 truncate">
                        {s.NhanVienKyThuatName || "---"}
                      </td>
                    </tr>
                  ))}
                  {services.length > 0 && (
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                      <td colSpan={6} className="p-2 text-right text-slate-600">
                        Cộng nhân công:
                      </td>
                      <td className="p-2 text-right tabular-nums text-primary font-bold">
                        {formatNumber(
                          services.reduce(
                            (sum: number, s: any) =>
                              sum + (s.TienChuaThue || 0),
                            0,
                          ),
                        )}
                      </td>
                      <td colSpan={2} className="p-2"></td>
                    </tr>
                  )}
                  {services.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-4 text-center text-slate-400 italic"
                      >
                        Không có nhân công - dịch vụ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-7/12 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600 dark:text-slate-400">
                Tổng thành tiền (chưa thuế)
              </span>
              <span className="font-medium tabular-nums">
                {formatNumber(rawData?.TongTienHang || 0)} ₫
              </span>
            </div>
            {Number(rawData?.TienChietKhau || 0) > 0 && (
              <div className="flex justify-between py-0.5 text-rose-600">
                <span>Chiết khấu</span>
                <span className="font-medium tabular-nums">
                  -{formatNumber(rawData?.TienChietKhau || 0)} ₫
                </span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600 dark:text-slate-400">
                Thuế VAT
              </span>
              <span className="font-medium tabular-nums">
                {formatNumber(rawData?.TienThue || 0)} ₫
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
              <span className="text-slate-900 dark:text-slate-100">
                Tổng tiền thanh toán
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatNumber(
                  rawData?.TongTienThanhToan || caseData?.tienCoThue || 0,
                )}{" "}
                ₫
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              <div>
                <span className="text-slate-500">Khách hàng TT:</span>{" "}
                <span className="font-medium">
                  {formatNumber(rawData?.TienThanhToanKH || 0)} ₫
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Bảo hiểm TT:</span>{" "}
                <span className="font-medium">
                  {formatNumber(rawData?.TienThanhToanBH || 0)} ₫
                </span>
              </div>
            </div>

            {/* Gross profit data if available */}
            {grossProfit && (
              <div className="mt-3 pt-2.5 border-t border-dashed border-emerald-300 dark:border-emerald-700 space-y-1">
                <div className="flex justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                  <span>Giá vốn phụ tùng</span>
                  <span className="tabular-nums">
                    {formatNumber(grossProfit.TongGiaVon || 0)} ₫
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Lợi nhuận gộp (tạm tính)</span>
                  <span className="tabular-nums">
                    {formatNumber(grossProfit.LoiNhuan || 0)} ₫
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="uppercase">Giám Đốc</p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>
          </div>
          <div>
            <p className="uppercase">Kế Toán DV</p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>
          </div>
          <div>
            <p className="uppercase">Trưởng Phòng DV</p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>
          </div>
          <div>
            <p className="uppercase">Cố Vấn DV</p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
