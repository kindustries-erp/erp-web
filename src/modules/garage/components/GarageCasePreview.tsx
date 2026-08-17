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
    : "---";

  return (
    <div className="w-full bg-slate-100 py-8 px-4 flex justify-center font-sans text-[13px] leading-relaxed text-slate-900">
      <div className="w-full max-w-4xl bg-white p-10 shadow-lg ring-1 ring-slate-900/5 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 space-y-1">
            <h2 className="text-base font-bold uppercase text-emerald-800">
              CÔNG TY CỔ PHẦN GREENWAY AUTOMOTIVES
            </h2>
            <p>CN1: 66 Phổ Quang, Phường Tân Sơn Hòa, TP. Hồ Chí Minh</p>
            <p>CN2: 554 Lê Văn Lương, Phường Tân Hưng, TP. Hồ Chí Minh</p>
            <p className="pt-2 font-medium">
              Hotline: 0853.64.65.66 & 0858.64.65.66
            </p>
          </div>
          <div className="flex-shrink-0 text-right ml-4">
            <h1 className="text-4xl font-black text-emerald-600 uppercase tracking-tighter">
              GREENWAY
            </h1>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-800 mt-1 uppercase">
              Luxury Cars | Services
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            LỢI NHUẬN DỰ KIẾN
          </h1>
          <p className="italic text-sm">
            Số:{" "}
            <span className="font-semibold">
              {caseData?.soChungTu || rawData?.SoPhieu || "---"}
            </span>
          </p>
          <p className="italic text-sm text-right mt-[-20px]">Ngày {dateStr}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p>
              Tên khách hàng:{" "}
              <span className="uppercase font-medium">
                {rawData?.KhachHangName || "---"}
              </span>
            </p>
            <p>Địa chỉ: {rawData?.DiaChiKhachHang || "---"}</p>
            <p>MST: {rawData?.MaSoThue || "---"}</p>
            <p>Tên lái xe: {rawData?.TenNguoiLienHe || "---"}</p>
            <p>Số điện thoại: {rawData?.DienThoaiKhachHang || "---"}</p>
            <p>Yêu cầu sửa chữa: {rawData?.YeuCauDichVu || "---"}</p>
          </div>
          <div className="space-y-1 pl-4">
            <div className="flex">
              <span className="w-24 inline-block">Biển số xe:</span>
              <span className="font-bold">{caseData?.bienSoXe || "---"}</span>
            </div>
            <div className="flex">
              <span className="w-24 inline-block">Thương hiệu:</span>
              <span>{rawData?.HangXeName || "---"}</span>
              <span className="ml-4 w-20 inline-block">Năm SX:</span>
              <span>{rawData?.NamSanXuat || "---"}</span>
            </div>
            <div className="flex">
              <span className="w-24 inline-block">Dòng xe:</span>
              <span>{rawData?.DongXeName || "---"}</span>
              <span className="ml-4 w-20 inline-block">Số KM:</span>
              <span>
                {formatNumber(rawData?.SoKM || rawData?.SoKMTruoc || 0)}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 inline-block">Số máy:</span>
              <span>{rawData?.SoMay || "---"}</span>
            </div>
            <div className="flex">
              <span className="w-24 inline-block">Số VIN:</span>
              <span>{rawData?.SoKhung || "---"}</span>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="mb-6 space-y-4">
          {/* Vật tư phụ tùng */}
          <div>
            <h3 className="font-bold border border-black border-b-0 px-2 py-1 bg-gray-50 uppercase">
              Vật tư phụ tùng
            </h3>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-1">STT</th>
                  <th className="border border-black p-1">Mã PT/VT</th>
                  <th className="border border-black p-1 text-left">
                    Tên PT/VT
                  </th>
                  <th className="border border-black p-1">SL</th>
                  <th className="border border-black p-1">ĐG</th>
                  <th className="border border-black p-1">%GG</th>
                  <th className="border border-black p-1 text-right">
                    Thành Tiền
                  </th>
                  <th className="border border-black p-1">Thuế</th>
                  <th className="border border-black p-1 text-right">ĐG Vốn</th>
                  <th className="border border-black p-1 text-right">
                    TT ĐG Vốn
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{i + 1}</td>
                    <td className="border border-black p-1">
                      {p.SanPhamCode ||
                        p.MaChiTiet ||
                        p.MaSanPham ||
                        p.MaPhuTung ||
                        "---"}
                    </td>
                    <td className="border border-black p-1 text-left">
                      {p.NoiDungChiTiet}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(p.SoLuongHoaDon)}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(p.DonGia)}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(
                        p.TyLeChietKhauCt || p.TyLeChietKhauCT || 0,
                      )}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(p.TienChuaThue || 0)}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(p.ThueSuat || 0)}%
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(p.GiaVonPhuTung || 0)}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(
                        (p.GiaVonPhuTung || 0) * (p.SoLuongHoaDon || 0),
                      )}
                    </td>
                  </tr>
                ))}
                {parts.length > 0 && (
                  <tr className="font-semibold">
                    <td
                      colSpan={6}
                      className="border border-black p-1 text-right"
                    ></td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(
                        parts.reduce(
                          (sum: number, p: any) => sum + (p.TienChuaThue || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td colSpan={2} className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-right">
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
                      className="border border-black p-4 text-gray-500"
                    >
                      Không có vật tư phụ tùng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Nhân công - Dịch vụ */}
          <div>
            <h3 className="font-bold border border-black border-b-0 px-2 py-1 bg-gray-50 uppercase">
              Nhân công - Dịch vụ
            </h3>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-1">STT</th>
                  <th className="border border-black p-1">Mã C/V</th>
                  <th className="border border-black p-1 text-left w-1/3">
                    Tên công việc
                  </th>
                  <th className="border border-black p-1">SL</th>
                  <th className="border border-black p-1">ĐG</th>
                  <th className="border border-black p-1">%GG</th>
                  <th className="border border-black p-1 text-right">
                    Thành Tiền
                  </th>
                  <th className="border border-black p-1">Thuế</th>
                  <th className="border border-black p-1">GCN</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{i + 1}</td>
                    <td className="border border-black p-1">
                      {s.SanPhamCode ||
                        s.MaChiTiet ||
                        s.MaSanPham ||
                        s.MaDichVu ||
                        s.MaCongViec ||
                        "---"}
                    </td>
                    <td className="border border-black p-1 text-left">
                      {s.NoiDungChiTiet}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(s.SoLuongHoaDon)}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(s.DonGia)}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(
                        s.TyLeChietKhauCt || s.TyLeChietKhauCT || 0,
                      )}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(s.TienChuaThue || 0)}
                    </td>
                    <td className="border border-black p-1">
                      {formatNumber(s.ThueSuat || 0)}%
                    </td>
                    <td className="border border-black p-1">
                      {s.NhanVienKyThuatName || "---"}
                    </td>
                  </tr>
                ))}
                {services.length > 0 && (
                  <tr className="font-semibold">
                    <td
                      colSpan={6}
                      className="border border-black p-1 text-right"
                    ></td>
                    <td className="border border-black p-1 text-right">
                      {formatNumber(
                        services.reduce(
                          (sum: number, s: any) => sum + (s.TienChuaThue || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td colSpan={2} className="border border-black p-1"></td>
                  </tr>
                )}
                {services.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border border-black p-4 text-gray-500"
                    >
                      Không có nhân công - dịch vụ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summaries */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between py-1">
              <span className="font-medium">Tổng thành tiền (chưa thuế)</span>
              <span className="font-bold">
                {formatNumber(rawData?.TongTienHang || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Chiết khấu</span>
              <span className="font-bold">
                {formatNumber(rawData?.TienChietKhau || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Tổng tiền sau Chiết Khấu</span>
              <span className="font-bold">
                {formatNumber(rawData?.TienChuaThue || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Chi phí khấu trừ + chế tài</span>
              <span className="font-bold">
                {formatNumber(
                  (rawData?.TienKhauTruBaoHiem || 0) +
                    (rawData?.TienChiPhiCheTai || 0),
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Chi phí sau chế tài</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Thuế VAT</span>
              <span className="font-bold">
                {formatNumber(rawData?.TienThue || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Khách hàng TT</span>
              <span className="font-bold">
                {formatNumber(rawData?.TienThanhToanKH || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Bảo Hiểm TT</span>
              <span className="font-bold">
                {formatNumber(rawData?.TienThanhToanBH || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">Tổng tiền thanh toán</span>
              <span className="font-bold">
                {formatNumber(
                  rawData?.TongTienThanhToan || caseData?.tienCoThue || 0,
                )}
              </span>
            </div>

            {/* Gross profit data if available */}
            {grossProfit && (
              <>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-emerald-700">
                    Chi phí hoa hồng
                  </span>
                  <span className="font-bold">
                    {formatNumber(grossProfit.ChiPhiHoaHong || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-emerald-700">
                    Chi phí hoa hồng GĐV
                  </span>
                  <span className="font-bold">
                    {formatNumber(grossProfit.ChiPhiHoaHongGDV || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-emerald-700">
                    Chi phí hoa hồng MG
                  </span>
                  <span className="font-bold">
                    {formatNumber(grossProfit.ChiPhiHoaHongMG || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 pl-4 text-sm text-gray-600">
                  <span className="italic">Chi phí phụ tùng trong phiếu</span>
                  <span>{formatNumber(grossProfit.TongGiaVon || 0)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-emerald-700">
                    Lãi tạm tính
                  </span>
                  <span className="font-bold">
                    {formatNumber(grossProfit.LoiNhuan || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-emerald-700">
                    Lãi tạm tính có thuế
                  </span>
                  <span className="font-bold">
                    {formatNumber(grossProfit.LoiNhuanCoThue || 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-4 text-center font-bold pb-8">
          <div>Giám Đốc</div>
          <div>Kế Toán Dịch Vụ</div>
          <div>TPDV</div>
          <div>Cố Vấn Dịch Vụ</div>
        </div>
      </div>
    </div>
  );
}
