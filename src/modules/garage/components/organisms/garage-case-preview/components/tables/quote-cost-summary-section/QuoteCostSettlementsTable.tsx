import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteCostSettlementItem } from "./QuoteCostSummarySection.type";

export interface QuoteCostSettlementsTableProps {
  settlements: QuoteCostSettlementItem[];
  loading?: boolean;
}

export const QuoteCostSettlementsTable: React.FC<
  QuoteCostSettlementsTableProps
> = ({ settlements, loading }) => {
  const { t } = useTranslation(["garage", "common"]);

  const columns: DataTableColumn<QuoteCostSettlementItem>[] = useMemo(() => {
    return [
      {
        key: "stt",
        header: "#",
        size: 45,
        cell: (_row, idx) => (
          <div className="w-full text-center text-xs font-medium text-muted-foreground tabular-nums">
            {idx}
          </div>
        ),
      },
      {
        key: "transDate",
        header: t("cases.financials.paymentDate", "Ngày chi"),
        size: 130,
        cell: (row) => (
          <TableDateCell
            date={row.transDate}
            format="date"
            className="text-xs"
          />
        ),
      },
      {
        key: "category",
        header: t("cases.financials.channel", "Phương thức"),
        size: 170,
        cell: (row) => {
          const isInvoice =
            row.type === "INVOICE" || row.category === "HOA_DON_DAU_VAO";
          const isOffSystem = row.sourceChannel === "OFF_SYSTEM_MANUAL";

          let label = t("cases.financials.onSystem", "Sao kê / Hệ thống");
          let badgeStyle =
            "bg-secondary text-secondary-foreground border-border/60";

          if (isInvoice) {
            label = `🧾 ${t("cases.financials.invoiceIn", "HĐ Đầu vào")}${row.invoiceNo && row.invoiceNo !== "---" ? ` #${row.invoiceNo}` : ""}`;
            badgeStyle =
              "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
          } else if (row.category === "TIEN_MAT_NGOAI") {
            label = t("cases.financials.channelCash", "💵 Tiền mặt ngoài");
            badgeStyle =
              "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
          } else if (row.category === "CHUYEN_KHOAN_CA_NHAN") {
            label = t("cases.financials.channelBankPersonal", "🏦 CK Cá nhân");
            badgeStyle =
              "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
          } else if (isOffSystem) {
            label = t("cases.financials.offSystem", "Chi ngoài sổ");
          }

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border truncate max-w-[155px] ${badgeStyle}`}
              >
                {label}
              </span>
              {row.isPending && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 whitespace-nowrap">
                  {t("cases.reconciliation.pendingBadge", "Chờ lưu")}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "partnerName",
        header: t("cases.financials.partner", "Người nhận / Đối tác"),
        size: 180,
        cell: (row) => (
          <TableText
            text={row.partnerName || "—"}
            className="text-xs font-medium"
            tooltip
          />
        ),
      },
      {
        key: "amount",
        header: t("cases.financials.paidAmount", "Số tiền đã chi"),
        size: 140,
        cell: (row) => (
          <div className="w-full text-right font-mono tabular-nums font-semibold text-xs text-emerald-600 dark:text-emerald-400">
            {formatNumber(row.amount)} ₫
          </div>
        ),
      },
      {
        key: "note",
        header: t("cases.financials.note", "Ghi chú"),
        size: 200,
        cell: (row) => (
          <TableText
            text={row.note || "—"}
            className="text-xs text-muted-foreground"
            tooltip
          />
        ),
      },
    ];
  }, [t]);

  if (!settlements || settlements.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md border border-border/60 overflow-hidden bg-card">
      <div className="px-3 py-1.5 bg-muted/40 border-b border-border/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {t("cases.financials.costHistoryTitle", "Chi tiết các lần chi tiền")} (
        {settlements.length})
      </div>
      <StandardTable
        items={settlements}
        columns={columns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        minWidth={855}
        loading={loading}
      />
    </div>
  );
};
