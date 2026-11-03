import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { CashTransactionDto } from "../../../api/dtos/cashTransaction.dto";
import {
  remainingOfTransaction,
  sourceLabelOfTransaction,
} from "../../../domain/rules/partnerTransactionQuery";
import { useCashPartnerTransactions } from "./useCashPartnerTransactions";
import type { CashPartnerTransactionsProps } from "./CashPartnerTransactions.type";

/** Bảng kê giao dịch của đối tượng; bấm số tham chiếu để mở giao dịch đó */
export function CashPartnerTransactions({
  correspondentAccount = "",
  correspondentName = "",
  onSelectTransaction,
}: CashPartnerTransactionsProps) {
  const { t } = useV2Translation();
  const table = useCashPartnerTransactions(
    { correspondentAccount, correspondentName },
    Boolean(correspondentAccount || correspondentName),
  );

  const columns: V2Column<CashTransactionDto>[] = [
    {
      key: "no",
      label: t("v2.cashPartner.columns.no", "STT"),
      size: 60,
      cell: (_row, index) =>
        (table.query.page - 1) * table.query.pageSize + index + 1,
    },
    {
      key: "transDate",
      label: t("v2.cashPartner.columns.date", "Ngày GD"),
      size: 120,
      cell: (row) => formatDateTimeParts(row.transDate)?.date ?? "—",
    },
    {
      key: "referenceNumber",
      label: t("v2.cashPartner.columns.reference", "Số tham chiếu"),
      size: 150,
      cell: (row) => (
        <V2Button
          type="button"
          variant="ghost"
          size="xs"
          className="font-mono text-xs"
          onClick={() => onSelectTransaction?.(row.id)}
        >
          {row.referenceNumber || "—"}
        </V2Button>
      ),
    },
    {
      key: "description",
      label: t("v2.cashPartner.columns.description", "Diễn giải"),
      size: 240,
      cell: (row) => row.description || "—",
    },
    {
      key: "creditAmount",
      label: t("v2.cashPartner.columns.cashIn", "Thu"),
      size: 120,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(Number(row.creditAmount || 0)),
    },
    {
      key: "debitAmount",
      label: t("v2.cashPartner.columns.cashOut", "Chi"),
      size: 120,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(Number(row.debitAmount || 0)),
    },
    {
      key: "source",
      label: t("v2.cashPartner.columns.source", "Nguồn tiền"),
      size: 180,
      cell: (row) => sourceLabelOfTransaction(row),
    },
    {
      key: "netOffAmount",
      label: t("v2.cashPartner.columns.netOff", "Đã cấn trừ"),
      size: 120,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(Number(row.netOffAmount || 0)),
    },
    {
      key: "remaining",
      label: t("v2.cashPartner.columns.remaining", "Còn lại"),
      size: 120,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(remainingOfTransaction(row)),
    },
  ];

  return (
    <V2StandardTable
      tableId="cash-partner-transactions"
      columns={columns}
      items={table.items}
      getRowKey={(row) => row.id}
      mode="server"
      total={table.total}
      loading={table.loading}
      emptyLabel={t(
        "v2.cashPartner.empty",
        "Chưa có giao dịch của đối tượng này",
      )}
      initialQuery={table.query}
      onQueryChange={table.setQuery}
    />
  );
}
