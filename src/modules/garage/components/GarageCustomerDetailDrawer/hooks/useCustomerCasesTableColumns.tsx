import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { KgaraCaseStatusBadge } from "../../KgaraCaseStatusBadge";
import { CustomerCaseActionsCell } from "../components/CustomerCaseActionsCell";
import { CustomerCaseAgingBadgeCell } from "../components/CustomerCaseAgingBadgeCell";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Car } from "lucide-react";

export interface UseCustomerCasesTableColumnsProps {
  headerFilter: any;
  page: number;
  pageSize: number;
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal: (c: any) => void;
  onOpenInvoiceLinkingModal: (c: any) => void;
}

export function useCustomerCasesTableColumns({
  headerFilter,
  page,
  pageSize,
  onOpenCaseDetail,
  onOpenSettlementModal,
  onOpenInvoiceLinkingModal,
}: UseCustomerCasesTableColumnsProps) {
  const { t } = useTranslation(["garage", "common"]);

  return useMemo<DataTableColumn<any>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_: any, idx: number) => (page - 1) * pageSize + idx + 1,
      },
      {
        key: "soChungTu",
        header: headerFilter(
          "soChungTu",
          t("customers.drawer.caseCode", "Số chứng từ"),
        ),
        size: 150,
        minSize: 130,
        enableResizing: true,
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || row.id}
            onDetailClick={() =>
              onOpenCaseDetail(row.soChungTu || row.id, false)
            }
          />
        ),
      },
      {
        key: "bienSoXe",
        header: headerFilter(
          "bienSoXe",
          t("customers.drawer.licensePlate", "Biển số xe"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">
            <Car className="w-3 h-3 text-muted-foreground shrink-0" />
            {row.bienSoXe || "—"}
          </span>
        ),
      },
      {
        key: "ngayHoanThanhCongViec",
        className: "text-right",
        header: headerFilter.date(
          "ngayHoanThanhCongViec",
          t("customers.drawer.completionDate", "Ngày hoàn thành"),
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <TableDateCell
            date={row.ngayHoanThanhCongViec || row.ngayPhatSinh}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "tienCoThue",
        className: "text-right",
        header: headerFilter.amount(
          "tienCoThue",
          t("customers.drawer.totalAmount", "Tổng tiền"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <span className="font-mono text-xs font-semibold block text-right">
            {money(Number(row.tienCoThue) || 0)}
          </span>
        ),
      },
      {
        key: "tienDaThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienDaThanhToan",
          t("customers.drawer.paidAmount", "Đã thu"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium block text-right">
            {money(Number(row.tienDaThanhToan) || 0)}
          </span>
        ),
      },
      {
        key: "tienConPhaiThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienConPhaiThanhToan",
          t("customers.drawer.balanceAmount", "Còn nợ"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          return (
            <span
              className={cn(
                "font-mono text-xs font-bold block text-right",
                bal > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground font-normal",
              )}
            >
              {money(bal)}
            </span>
          );
        },
      },
      {
        key: "agingDays",
        className: "text-center",
        header: headerFilter(
          "agingDays",
          t("customers.drawer.agingDays", "Tuổi nợ"),
        ),
        size: 100,
        minSize: 90,
        enableResizing: true,
        cell: (row: any) => (
          <CustomerCaseAgingBadgeCell
            balance={Number(row.tienConPhaiThanhToan) || 0}
            agingDays={Number(row.agingDays) || 0}
          />
        ),
      },
      {
        key: "tinhTrangDichVu",
        header: headerFilter(
          "tinhTrangDichVu",
          t("customers.drawer.status", "Trạng thái"),
        ),
        size: 120,
        minSize: 100,
        enableResizing: true,
        cell: (row: any) => (
          <KgaraCaseStatusBadge
            status={row.tenTinhTrangDichVu || row.tinhTrangDichVu}
          />
        ),
      },
      {
        key: "actions",
        header: (
          <span className="w-full block text-center">
            {t("customers.drawer.actions", "Thao tác")}
          </span>
        ),
        size: 110,
        enableResizing: false,
        className: "text-center",
        cell: (row: any) => (
          <CustomerCaseActionsCell
            row={row}
            onOpenCaseDetail={onOpenCaseDetail}
            onOpenSettlementModal={onOpenSettlementModal}
            onOpenInvoiceLinkingModal={onOpenInvoiceLinkingModal}
          />
        ),
      },
    ],
    [
      headerFilter,
      onOpenCaseDetail,
      onOpenInvoiceLinkingModal,
      onOpenSettlementModal,
      page,
      pageSize,
      t,
    ],
  );
}
