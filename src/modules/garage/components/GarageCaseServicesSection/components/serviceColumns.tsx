import React, { useMemo } from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import { GarageCaseClassificationBadge } from "@/modules/garage/components/GarageCaseClassificationBadge";
import type { KgaraCaseServiceRow } from "../types";
import type { useGarageCaseServicesList } from "@/modules/garage/hooks/useGarageCaseServicesList";

export const formatQtyOption = (val: string | number) => {
  const n = Number(val || 0);
  return isNaN(n) ? String(val) : n.toLocaleString("vi-VN");
};

export const formatAmtOption = (val: string | number) => {
  const n = Number(val || 0);
  return isNaN(n) ? String(val) : `${n.toLocaleString("vi-VN")} đ`;
};

export interface UseServiceColumnsOptions {
  t: TFunction<any, any>;
  listHook: ReturnType<typeof useGarageCaseServicesList>;
  fetchColumnOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }>;
  openCaseDetail: (caseCode: string, mode?: "view" | "edit") => void;
}

export function useServiceColumns({
  t,
  listHook,
  fetchColumnOptions,
  openCaseDetail,
}: UseServiceColumnsOptions): DataTableColumn<KgaraCaseServiceRow>[] {
  const getSortState = (key: string) => {
    if (listHook.tableState.sorts.includes(key)) return "asc" as const;
    if (listHook.tableState.sorts.includes(`-${key}`)) return "desc" as const;
    return "none" as const;
  };

  const createHeader = (
    key: string,
    title: string,
    align: "left" | "center" | "right" = "center",
    hideFilter = false,
    formatOptionLabel?: (l: string) => string,
    showBlank = false,
  ) => (
    <TableColumnHeaderFilter
      title={title}
      columnKey={key}
      queryKeyPrefix="garage-service-column-options"
      allFilters={listHook.tableState.columnFilters}
      sortState={getSortState(key)}
      onSortChange={(s) => listHook.tableState.setSort(key, s)}
      searchValue={listHook.tableState.columnSearch[key] || ""}
      onSearchChange={(v) => listHook.tableState.setColumnSearch(key, v)}
      selectedFilters={listHook.tableState.columnFilters[key] || []}
      onFilterChange={(v) => listHook.tableState.setColumnFilter(key, v)}
      fetchOptions={fetchColumnOptions}
      enableSelectAllMatching={true}
      showBlankOption={showBlank}
      isActive={
        !!listHook.tableState.columnFilters[key]?.length ||
        !!listHook.tableState.columnSearch[key]
      }
      align={align}
      hideFilter={hideFilter}
      formatOptionLabel={formatOptionLabel}
    />
  );

  return useMemo(
    () => [
      // 0. STT (45px, 1-based, center)
      {
        key: "index",
        label: "#",
        header: <span className="w-full block text-center">#</span>,
        size: 45,
        enableResizing: false,
        hideable: false,
        headerClassName: "text-center w-[45px] min-w-[45px]",
        className:
          "text-center w-[45px] min-w-[45px] font-mono text-xs text-muted-foreground",
        cell: (_: KgaraCaseServiceRow, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      // 1. Ngày tiếp nhận (130px, right)
      {
        key: "caseDate",
        label: t("cases.columns.caseDate", "Ngày tiếp nhận"),
        header: (
          <TableColumnHeaderFilter
            title={t("cases.columns.caseDate", "Ngày tiếp nhận")}
            sortState={getSortState("caseDate")}
            onSortChange={(s) => listHook.tableState.setSort("caseDate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(
              listHook.getDateRange("caseDate").from ||
              listHook.getDateRange("caseDate").to,
            )}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.getDateRange("caseDate").from}
                dateTo={listHook.getDateRange("caseDate").to}
                onChange={(from, to) => {
                  listHook.setDateRange("caseDate", from, to);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <TableDateCell date={r.caseDate} className="justify-end w-full" />
        ),
      },
      // 2. Ngày kết thúc (130px, right)
      {
        key: "completionDate",
        label: t("cases.columns.completionDate", "Ngày kết thúc"),
        header: (
          <TableColumnHeaderFilter
            title={t("cases.columns.completionDate", "Ngày kết thúc")}
            sortState={getSortState("completionDate")}
            onSortChange={(s) =>
              listHook.tableState.setSort("completionDate", s)
            }
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(
              listHook.getDateRange("completionDate").from ||
              listHook.getDateRange("completionDate").to,
            )}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.getDateRange("completionDate").from}
                dateTo={listHook.getDateRange("completionDate").to}
                onChange={(from, to) => {
                  listHook.setDateRange("completionDate", from, to);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <TableDateCell
            date={r.completionDate}
            className="justify-end w-full"
          />
        ),
      },
      // 3. Số phiếu DV (180px, left)
      {
        key: "soChungTu",
        label: t("cases.columns.caseCode", "Số chứng từ"),
        header: createHeader(
          "soChungTu",
          t("cases.columns.caseCode", "Số chứng từ"),
          "center",
        ),
        size: 180,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.soChungTu || "—"}
            enableCopy={true}
            tooltip={true}
            textClassName="font-medium text-primary text-left"
            onDetailClick={() =>
              openCaseDetail(r.soChungTu || r.hdPhieuDichVuId || "", "view")
            }
          />
        ),
      },
      // 4. Biển số xe (130px, left)
      {
        key: "bienSoXe",
        label: t("cases.columns.licensePlate", "Biển số xe"),
        header: createHeader(
          "bienSoXe",
          t("cases.columns.licensePlate", "Biển số xe"),
          "center",
        ),
        size: 130,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.bienSoXe || "—"}
            enableCopy={true}
            tooltip={true}
            textClassName="font-medium text-foreground text-left"
          />
        ),
      },
      // 5. Khách hàng (200px, left)
      {
        key: "khachHangName",
        label: t("cases.columns.customer", "Khách hàng"),
        header: createHeader(
          "khachHangName",
          t("cases.columns.customer", "Khách hàng"),
          "center",
        ),
        size: 200,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.khachHangName || "—"}
            tooltip={true}
            textClassName="text-left text-foreground"
          />
        ),
      },
      // 6. Phân loại dòng: PT/DV (100px, center)
      {
        key: "loaiSanPhamCode",
        label: t("services.columns.itemType", "Loại"),
        header: createHeader(
          "loaiSanPhamCode",
          t("services.columns.itemType", "Loại"),
          "center",
        ),
        size: 100,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => {
          const isPt = r.loaiSanPhamCode === "PT";
          return (
            <div className="w-full flex justify-center">
              <Badge
                variant="outline"
                className={
                  isPt
                    ? "text-[10px] font-medium w-[80px] justify-center bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 truncate"
                    : "text-[10px] font-medium w-[80px] justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 truncate"
                }
              >
                {isPt
                  ? t("services.typePt", "Phụ tùng")
                  : t("services.typeDv", "Dịch vụ")}
              </Badge>
            </div>
          );
        },
      },
      // 7. Mã hạng mục (140px, left)
      {
        key: "sanPhamCode",
        label: t("services.columns.itemCode", "Mã hạng mục"),
        header: createHeader(
          "sanPhamCode",
          t("services.columns.itemCode", "Mã hạng mục"),
          "center",
          false,
          undefined,
          true,
        ),
        size: 140,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.sanPhamCode || "—"}
            enableCopy={true}
            tooltip={true}
            textClassName="font-mono text-xs text-foreground text-left"
          />
        ),
      },
      // 8. Tên & Diễn giải (250px, left)
      {
        key: "sanPhamName",
        label: t("services.columns.itemName", "Tên & Diễn giải"),
        header: createHeader(
          "sanPhamName",
          t("services.columns.itemName", "Tên & Diễn giải"),
          "center",
        ),
        size: 250,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.noiDungChiTiet || r.sanPhamName || "—"}
            tooltip={true}
            textClassName="text-left text-foreground font-medium text-xs"
          />
        ),
      },
      // 9. ĐVT (80px, center)
      {
        key: "donViTinhText",
        label: t("services.columns.unit", "ĐVT"),
        header: createHeader(
          "donViTinhText",
          t("services.columns.unit", "ĐVT"),
          "center",
        ),
        size: 80,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="text-center w-full block text-xs">
            {r.donViTinhText || "—"}
          </span>
        ),
      },
      // 10. Số lượng (90px, right)
      {
        key: "soLuongHoaDon",
        label: t("services.columns.quantity", "Số lượng"),
        header: createHeader(
          "soLuongHoaDon",
          t("services.columns.quantity", "Số lượng"),
          "center",
          false,
          formatQtyOption,
        ),
        size: 90,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-semibold">
            {Number(r.soLuongHoaDon || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
      // 11. Đơn giá (120px, right)
      {
        key: "donGia",
        label: t("services.columns.unitPrice", "Đơn giá"),
        header: createHeader(
          "donGia",
          t("services.columns.unitPrice", "Đơn giá"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 120,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-medium">
            {money(r.donGia || 0)}
          </span>
        ),
      },
      // 12. Tiền trước thuế (130px, right)
      {
        key: "tienChuaThue",
        label: t("services.columns.preVatAmount", "Tiền trước thuế"),
        header: createHeader(
          "tienChuaThue",
          t("services.columns.preVatAmount", "Tiền trước thuế"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-semibold text-foreground">
            {money(r.tienChuaThue || 0)}
          </span>
        ),
      },
      // 13. Thuế VAT % (80px, center)
      {
        key: "thueSuat",
        label: t("services.columns.vatRate", "Thuế (%)"),
        header: createHeader(
          "thueSuat",
          t("services.columns.vatRate", "Thuế (%)"),
          "center",
        ),
        size: 80,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="text-center w-full block text-xs">
            {r.thueSuat ? `${r.thueSuat}%` : "0%"}
          </span>
        ),
      },
      // 14. Thành tiền sau thuế (140px, right)
      {
        key: "tienCoThue",
        label: t("services.columns.totalAmount", "Thành tiền"),
        header: createHeader(
          "tienCoThue",
          t("services.columns.totalAmount", "Thành tiền"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 140,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-bold text-primary">
            {money(r.tienCoThue || 0)}
          </span>
        ),
      },
      // 15. Tiền công DV (130px, right)
      {
        key: "tienDichVu",
        label: t("services.columns.laborCost", "Tiền công DV"),
        header: createHeader(
          "tienDichVu",
          t("services.columns.laborCost", "Tiền công DV"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-medium text-foreground">
            {money(r.tienDichVu || 0)}
          </span>
        ),
      },
      // 16. Tiền phụ tùng (130px, right)
      {
        key: "tienPhuTung",
        label: t("services.columns.partsRevenue", "Tiền phụ tùng"),
        header: createHeader(
          "tienPhuTung",
          t("services.columns.partsRevenue", "Tiền phụ tùng"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-medium text-foreground">
            {money(r.tienPhuTung || 0)}
          </span>
        ),
      },
      // 17. Giá vốn phụ tùng (130px, right)
      {
        key: "giaVonPhuTung",
        label: t("services.columns.partsCost", "Giá vốn PT"),
        header: createHeader(
          "giaVonPhuTung",
          t("services.columns.partsCost", "Giá vốn PT"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs font-medium text-amber-700 dark:text-amber-400">
            {money(r.giaVonPhuTung || 0)}
          </span>
        ),
      },
      // 18. Chiết khấu (110px, right)
      {
        key: "tienChietKhauCt",
        label: t("services.columns.discountAmount", "Chiết khấu"),
        header: createHeader(
          "tienChietKhauCt",
          t("services.columns.discountAmount", "Chiết khấu"),
          "center",
          false,
          formatAmtOption,
        ),
        size: 110,
        enableResizing: true,
        className: "text-right",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {money(r.tienChietKhauCt || 0)}
          </span>
        ),
      },
      // 19. Mã kho (110px, center)
      {
        key: "khoCode",
        label: t("services.columns.warehouseCode", "Mã kho"),
        header: createHeader(
          "khoCode",
          t("services.columns.warehouseCode", "Mã kho"),
          "center",
          false,
          undefined,
          true,
        ),
        size: 110,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => (
          <span className="text-center w-full block text-xs font-mono">
            {r.khoCode || "—"}
          </span>
        ),
      },
      // 20. Chi nhánh (130px, left)
      {
        key: "branchName",
        label: t("cases.columns.branchName", "Chi nhánh"),
        header: createHeader(
          "branchName",
          t("cases.columns.branchName", "Chi nhánh"),
          "center",
        ),
        size: 130,
        enableResizing: true,
        className: "text-left",
        cell: (r: KgaraCaseServiceRow) => (
          <TableText
            text={r.branchName || "—"}
            tooltip={true}
            textClassName="text-left text-xs"
          />
        ),
      },
      // 21. Trạng thái phiếu (130px, center)
      {
        key: "statusName",
        label: t("cases.columns.statusName", "Trạng thái"),
        header: createHeader(
          "statusName",
          t("cases.columns.statusName", "Trạng thái"),
          "center",
        ),
        size: 130,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => (
          <div className="w-full flex justify-center">
            <KgaraCaseStatusBadge status={r.statusName || ""} />
          </div>
        ),
      },
      // 22. Phân loại phiếu (140px, center)
      {
        key: "classification",
        label: t("cases.columns.classification", "Phân loại"),
        header: createHeader(
          "classification",
          t("cases.columns.classification", "Phân loại"),
          "center",
        ),
        size: 140,
        enableResizing: true,
        className: "text-center",
        cell: (r: KgaraCaseServiceRow) => (
          <div className="w-full flex justify-center">
            <GarageCaseClassificationBadge classification={r.classification} />
          </div>
        ),
      },
    ],
    [t, listHook, fetchColumnOptions, openCaseDetail],
  );
}
