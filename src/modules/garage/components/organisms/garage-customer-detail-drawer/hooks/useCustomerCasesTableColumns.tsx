import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { KgaraCaseStatusBadge } from "@/modules/garage/components/KgaraCaseStatusBadge";
import { CustomerCaseAmountCell } from "../components/CustomerCaseAmountCell";
import { createCustomerCasesAgingColumns } from "./CustomerCasesTable.agingColumns";
import { Car } from "lucide-react";

export interface UseCustomerCasesTableColumnsProps {
  headerFilter: any;
  page: number;
  pageSize: number;
  debtType?: "receivables" | "payables";
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
}

export function useCustomerCasesTableColumns({
  headerFilter,
  debtType = "receivables",
  onOpenCaseDetail,
}: UseCustomerCasesTableColumnsProps) {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const isPayables = debtType === "payables";

  return useMemo<DataTableColumn<any>[]>(() => {
    const baseCols: DataTableColumn<any>[] = [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_: any, idx: number) => <span>{idx}</span>,
      },
      {
        key: "soChungTu",
        header: headerFilter(
          "soChungTu",
          t("customers.drawer.caseCode", "Số chứng từ"),
        ),
        size: 140,
        minSize: 125,
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
        size: 115,
        minSize: 105,
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
        size: 115,
        minSize: 105,
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
        key: isPayables ? "chiPhi" : "tienCoThue",
        className: "text-right",
        header: headerFilter.amount(
          isPayables ? "chiPhi" : "tienCoThue",
          isPayables
            ? t("payables.columns.costAmount", "Chi phí báo giá")
            : t("customers.drawer.totalAmount", "Tổng tiền"),
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <CustomerCaseAmountCell
            amount={
              isPayables ? Number(row.chiPhi) || 0 : Number(row.tienCoThue) || 0
            }
            variant="default"
          />
        ),
      },
      {
        key: isPayables ? "tienDaChi" : "tienDaThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          isPayables ? "tienDaChi" : "tienDaThanhToan",
          isPayables
            ? t("payables.columns.paidAmount", "Đã chi")
            : t("customers.drawer.paidAmount", "Đã thu"),
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <CustomerCaseAmountCell
            amount={
              isPayables
                ? Number(row.tienDaChi) || 0
                : Number(row.tienDaThanhToan) || 0
            }
            variant="paid"
          />
        ),
      },
      {
        key: isPayables ? "tienConPhaiChi" : "tienConPhaiThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          isPayables ? "tienConPhaiChi" : "tienConPhaiThanhToan",
          isPayables
            ? t("payables.columns.balanceAmount", "Còn phải chi")
            : t("customers.drawer.balanceAmount", "Còn nợ"),
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <CustomerCaseAmountCell
            amount={
              isPayables
                ? Number(row.tienConPhaiChi) || 0
                : Number(row.tienConPhaiThanhToan) || 0
            }
            variant="balance"
          />
        ),
      },
    ];

    const agingCols = createCustomerCasesAgingColumns({
      headerFilter,
      debtType,
      t,
    });

    const statusCol: DataTableColumn<any> = {
      key: "tinhTrangDichVu",
      header: headerFilter(
        "tinhTrangDichVu",
        t("customers.drawer.status", "Trạng thái"),
      ),
      size: 110,
      minSize: 100,
      enableResizing: true,
      cell: (row: any) => (
        <KgaraCaseStatusBadge
          status={row.tenTinhTrangDichVu || row.tinhTrangDichVu}
        />
      ),
    };

    return [...baseCols, ...agingCols, statusCol];
  }, [headerFilter, isPayables, onOpenCaseDetail, t]);
}
