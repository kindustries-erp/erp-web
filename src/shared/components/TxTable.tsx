import { Transaction, TxSource } from "@/shared/types";
import { fmtMoney } from "@/shared/utils";
import { useUIStore } from "@/core/config/uiStore";
import { useT, useDict } from "@/core/i18n";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";

interface TxTableProps {
  rows: Transaction[];
  src: TxSource;
}

export function TxTable({ rows, src }: TxTableProps) {
  const { openPanel } = useUIStore();
  const t = useT();
  const dict = useDict();

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "date",
      header: dict.table.headers[0],
      cell: (r) => (
        <span className="text-xs text-[color:var(--muted-fg)]">{r.date}</span>
      ),
      className: "px-2 py-[10px] border-b border-[color:var(--border-light)]",
    },
    {
      key: "code",
      header: dict.table.headers[1],
      cell: (r) => (
        <span className="text-xs font-medium text-foreground">{r.code}</span>
      ),
      className: "px-2 py-[10px] border-b border-[color:var(--border-light)]",
    },
    {
      key: "type",
      header: dict.table.headers[2],
      cell: (r) => {
        const isThu = r.type === "thu";
        return (
          <span
            className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${
              isThu ? "bg-up-bg text-up-fg" : "bg-down-bg text-down-fg"
            }`}
          >
            {src === "bank-deposit"
              ? isThu
                ? "UNT"
                : "UNC"
              : isThu
                ? t("table.thu")
                : t("table.chi")}
          </span>
        );
      },
      className: "px-2 py-[10px] border-b border-[color:var(--border-light)]",
    },
    {
      key: "counterparty",
      header: dict.table.headers[3],
      cell: (r) => (
        <span className="text-xs text-[color:var(--muted-fg)]">
          {r.doituong}
        </span>
      ),
      className: "px-2 py-[10px] border-b border-[color:var(--border-light)]",
    },
    {
      key: "description",
      header: dict.table.headers[4],
      cell: (r) => (
        <span
          className="text-xs text-[color:var(--muted-fg)] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap inline-block"
          title={r.dienGiai}
        >
          {r.dienGiai}
        </span>
      ),
      className: "px-2 py-[10px] border-b border-[color:var(--border-light)]",
    },
    {
      key: "amount",
      header: dict.table.headers[5],
      cell: (r) => (
        <span className="text-xs font-medium">₫ {fmtMoney(r.amount)}</span>
      ),
      className:
        "px-2 py-[10px] text-right border-b border-[color:var(--border-light)]",
      headerClassName: "text-right",
    },
    {
      key: "status",
      header: dict.table.headers[6],
      cell: (r) => {
        const approved = r.trangThai === "da-duyet";
        return (
          <span
            className={`text-[10px] px-[9px] py-[3px] rounded-[20px] font-medium whitespace-nowrap ${
              approved
                ? "bg-approve-bg text-approve-fg"
                : "bg-warn-bg text-warn-fg"
            }`}
          >
            {approved ? t("status.approved") : t("status.pending")}
          </span>
        );
      },
      className:
        "px-2 py-[10px] text-right border-b border-[color:var(--border-light)]",
      headerClassName: "text-right",
    },
  ];

  return (
    <DataTable<Transaction>
      items={rows}
      columns={columns}
      getRowKey={(r) => String(r.id)}
      emptyLabel={t("common.noData")}
      onRowClick={(row) => openPanel({ kind: "detail", src, id: row.id })}
      minWidth={600}
      elevated={false}
    />
  );
}
