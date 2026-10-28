import React from "react";

export interface CaseTooltipItem {
  bienSoXe?: string;
  soChungTu?: string;
  id?: string;
  khachHangName?: string;
  ngayPhatSinh?: string;
  caseDate?: string;
  phaiThuBaoHiem?: number | string;
  phaiThuKhachHang?: number | string;
  chiPhi?: number | string;
  tienCoThue?: number | string;
}

export function renderGarageCaseTooltipContent(item: CaseTooltipItem) {
  const rawDateStr = item.ngayPhatSinh || item.caseDate;
  const date = rawDateStr
    ? new Date(rawDateStr).toLocaleDateString("vi-VN")
    : "";
  const ref = item.soChungTu || item.id || "";
  const plate = item.bienSoXe || "Không BKS";

  const thuBH = Number(item.phaiThuBaoHiem) || 0;
  const thuKH = Number(item.phaiThuKhachHang) || 0;
  const tra = Number(item.chiPhi) || 0;
  const hasAmounts = thuBH > 0 || thuKH > 0 || tra > 0;

  return (
    <div className="flex flex-col gap-1 min-w-[210px] text-xs p-0.5">
      <div className="font-semibold text-white flex items-center justify-between border-b border-white/20 pb-1">
        <span>{plate}</span>
        <span className="text-[11px] font-mono opacity-80">{ref}</span>
      </div>
      {item.khachHangName && (
        <div className="text-white/90 text-[11px] truncate">
          <span className="text-white/60">Khách hàng: </span>
          <span>{item.khachHangName}</span>
        </div>
      )}
      {date && (
        <div className="text-white/90 text-[11px]">
          <span className="text-white/60">Ngày: </span>
          <span>{date}</span>
        </div>
      )}
      {hasAmounts && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 border-t border-white/10 text-[11px] font-mono">
          <span className="text-white/70">Thu BH:</span>
          <span className="text-right text-emerald-300 font-medium">
            {thuBH.toLocaleString("vi-VN")}đ
          </span>
          <span className="text-white/70">Thu KH:</span>
          <span className="text-right text-sky-300 font-medium">
            {thuKH.toLocaleString("vi-VN")}đ
          </span>
          <span className="text-white/70">Phải chi:</span>
          <span className="text-right text-rose-300 font-medium">
            {tra.toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}
    </div>
  );
}

export function formatCaseToOption(item: any, isTargetRelated = false) {
  const date =
    item.ngayPhatSinh || item.caseDate
      ? new Date(item.ngayPhatSinh || item.caseDate).toLocaleDateString("vi-VN")
      : "";
  const ref = item.soChungTu || item.id || "";
  const plate = item.bienSoXe || "Không BKS";

  const tra = Number(item.chiPhi) || 0;
  const thu = Number(item.tienCoThue) || 0;
  const tooltipContent = renderGarageCaseTooltipContent(item);

  return {
    label: isTargetRelated ? `⭐ ${plate} - ${ref}` : `${plate} - ${ref}`,
    code: `Thu: ${thu.toLocaleString("vi-VN")}đ`,
    subCode: `Chi: ${tra.toLocaleString("vi-VN")}đ`,
    subLabel: item.khachHangName || "Không có thông tin",
    searchText: `${plate} ${ref} ${item.khachHangName || ""} ${date}`,
    tooltipContent,
    value: item.id,
    originalName: item.khachHangName || "",
    originalLicensePlate: item.bienSoXe || "",
    originalAmount: thu > 0 ? thu : tra > 0 ? tra : 0,
    isTargetRelated,
  };
}
