import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { garageApi } from "../../../api/garageApi";
import { useAppStore } from "@/core/config/appStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export function renderGarageCaseTooltipContent(item: {
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
}) {
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

export const useGarageCaseCombobox = (propsBranchId?: string) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  const branchId = propsBranchId || currentBranchId;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const hasPermission = useHasPermission("garage", "read");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["garage-cases-infinite", branchId, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        garageApi.getCases(
          "", // Do not filter by ERP branch ID since Kgara uses external branch IDs
          pageParam,
          20, // pageSize
          debouncedSearch,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.data?.length === 20) {
          return allPages.length + 1;
        }
        return undefined;
      },
      enabled: hasPermission,
    });

  const options =
    data?.pages
      ?.flatMap((page) => page?.data || [])
      ?.map((item: any) => {
        const date =
          item.ngayPhatSinh || item.caseDate
            ? new Date(item.ngayPhatSinh || item.caseDate).toLocaleDateString(
                "vi-VN",
              )
            : "";
        const ref = item.soChungTu || item.id;
        const plate = item.bienSoXe || "Không BKS";

        // Tiền thu BH, Tiền thu KH, Phải chi, Tổng thu
        const tra = Number(item.chiPhi) || 0;
        const thu = Number(item.tienCoThue) || 0;

        const tooltipContent = renderGarageCaseTooltipContent(item);

        return {
          label: `${plate} - ${ref}`,
          code: `Thu: ${thu.toLocaleString("vi-VN")}đ`,
          subCode: `Chi: ${tra.toLocaleString("vi-VN")}đ`,
          subLabel: item.khachHangName || "Không có thông tin",
          searchText: `${plate} ${ref} ${item.khachHangName || ""} ${date}`,
          tooltipContent,
          value: item.id,
          originalName: item.khachHangName || "",
          originalLicensePlate: item.bienSoXe || "",
        };
      }) || [];

  return {
    options,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    setSearch,
  };
};
