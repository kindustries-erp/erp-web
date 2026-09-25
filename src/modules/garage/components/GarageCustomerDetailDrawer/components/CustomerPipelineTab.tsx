import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { KgaraCaseStatusBadge } from "../../KgaraCaseStatusBadge";
import { money } from "@/shared/utils/format";
import { Car, Eye, Info } from "lucide-react";

interface CustomerPipelineTabProps {
  cases: any[];
  onOpenCaseDetail: (caseCode: string) => void;
}

export const CustomerPipelineTab = React.memo(function CustomerPipelineTab({
  cases,
  onOpenCaseDetail,
}: CustomerPipelineTabProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns: DataTableColumn<any>[] = useMemo(
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
        cell: (_: any, idx: number) => idx + 1,
      },
      {
        key: "soChungTu",
        header: t("customers.drawer.caseCode", "Số chứng từ"),
        size: 150,
        minSize: 130,
        enableResizing: true,
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || row.id}
            onDetailClick={() => onOpenCaseDetail(row.soChungTu || row.id)}
          />
        ),
      },
      {
        key: "bienSoXe",
        header: t("customers.drawer.licensePlate", "Biển số xe"),
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
        key: "ngayPhatSinh",
        className: "text-right",
        header: t("customers.drawer.caseDate", "Ngày tiếp nhận"),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <TableDateCell
            date={row.ngayTiepNhan || row.ngayPhatSinh || row.createdAt}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "tienCoThue",
        className: "text-right",
        header: t("customers.drawer.totalAmount", "Dự thu (Tạm tính)"),
        size: 140,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="font-mono text-xs font-semibold block text-right">
            {money(Number(row.tienCoThue) || 0)}
          </span>
        ),
      },
      {
        key: "tinhTrangDichVu",
        header: t("customers.drawer.status", "Trạng thái"),
        size: 160,
        minSize: 140,
        enableResizing: true,
        cell: (row: any) => (
          <div className="flex items-center gap-1.5">
            <KgaraCaseStatusBadge
              status={row.tenTinhTrangDichVu || row.tinhTrangDichVu}
            />
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap"
            >
              Chưa tính nợ
            </Badge>
          </div>
        ),
      },
      {
        key: "actions",
        header: (
          <span className="w-full block text-center">
            {t("customers.drawer.actions", "Thao tác")}
          </span>
        ),
        size: 80,
        enableResizing: false,
        className: "text-center",
        cell: (row: any) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title={t("customers.drawer.viewDetail", "Xem chi tiết")}
            onClick={() => onOpenCaseDetail(row.soChungTu || row.id)}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        ),
      },
    ],
    [onOpenCaseDetail, t],
  );

  return (
    <div className="space-y-3 flex flex-col flex-1 min-h-0 w-full">
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold">
            {t(
              "customers.drawer.pipelineTitle",
              "Xe đang làm tại xưởng (Dự thu):",
            )}
          </span>{" "}
          {t(
            "customers.drawer.pipelineDesc",
            "Các vụ việc đang trong quá trình thực hiện dịch vụ, chưa hoàn thành nghiệm thu nên chưa phát sinh công nợ phải thu và không tính tuổi nợ.",
          )}
        </div>
      </div>

      <DataTable
        items={cases}
        columns={columns}
        emptyLabel={t("customers.empty", "Không có xe nào đang làm tại xưởng")}
        total={cases.length}
        page={1}
        pageSize={Math.max(10, cases.length)}
        containerClassName="flex-1 min-h-0 w-full"
      />
    </div>
  );
});
