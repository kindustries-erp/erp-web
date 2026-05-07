import { Transaction, TxSource } from "@/shared/types";
import { fmtMoney } from "@/shared/utils";
import { useUIStore } from "@/core/config/uiStore";
import { useT, useDict } from "@/core/i18n";

interface TxTableProps {
  rows: Transaction[];
  src: TxSource;
}

export function TxTable({ rows, src }: TxTableProps) {
  const { openPanel } = useUIStore();
  const t = useT();
  const dict = useDict();

  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className="w-full border-collapse mt-1" style={{ minWidth: 600 }}>
        <thead>
          <tr>
            {dict.table.headers.map((h, i) => (
              <th
                key={h}
                className={`text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-2 py-[6px] border-b border-border uppercase tracking-[0.05em] ${i >= 5 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const approved = r.trangThai === "da-duyet";
            const isThu = r.type === "thu";
            return (
              <tr
                key={r.id}
                className="cursor-pointer hover:[&>td]:bg-[color:var(--muted)]"
                onClick={() => openPanel({ kind: "detail", src, id: r.id })}
              >
                <td className="px-2 py-[10px] text-xs text-[color:var(--muted-fg)] border-b border-[color:var(--border-light)]">
                  {r.date}
                </td>
                <td className="px-2 py-[10px] text-xs font-medium text-foreground border-b border-[color:var(--border-light)]">
                  {r.code}
                </td>
                <td className="px-2 py-[10px] border-b border-[color:var(--border-light)]">
                  <span
                    className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${
                      isThu ? "bg-up-bg text-up-fg" : "bg-down-bg text-down-fg"
                    }`}
                  >
                    {src === "tiengui"
                      ? isThu
                        ? "UNT"
                        : "UNC"
                      : isThu
                        ? t("table.thu")
                        : t("table.chi")}
                  </span>
                </td>
                <td className="px-2 py-[10px] text-xs text-[color:var(--muted-fg)] border-b border-[color:var(--border-light)]">
                  {r.doituong}
                </td>
                <td
                  className="px-2 py-[10px] text-xs text-[color:var(--muted-fg)] border-b border-[color:var(--border-light)] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={r.dienGiai}
                >
                  {r.dienGiai}
                </td>
                <td className="px-2 py-[10px] text-xs font-medium text-right border-b border-[color:var(--border-light)]">
                  ₫ {fmtMoney(r.amount)}
                </td>
                <td className="px-2 py-[10px] text-right border-b border-[color:var(--border-light)]">
                  <span
                    className={`text-[10px] px-[9px] py-[3px] rounded-[20px] font-medium whitespace-nowrap ${
                      approved
                        ? "bg-approve-bg text-approve-fg"
                        : "bg-warn-bg text-warn-fg"
                    }`}
                  >
                    {approved ? t("status.approved") : t("status.pending")}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
