import { useMemo } from "react";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";

interface Props {
  tableState: any;
  items: any[];
  fetchPartnerOptions: (args: {
    columnKey: string;
    search: string;
    pageParam: number;
    pageSize?: number;
    filtersStr?: string;
  }) => Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }>;
  onPartnerClick: (account?: string, name?: string) => void;
  t: (key: string, fallback?: string) => string;
}

export function useBranchPartnerStatsColumns({
  tableState,
  items,
  fetchPartnerOptions,
  onPartnerClick,
  t,
}: Props) {
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
        fetchOptions: fetchPartnerOptions,
      }),
    [tableState, items, fetchPartnerOptions],
  );

  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      // 1. STT (40px, căn giữa)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className:
          "w-[40px] min-w-[40px] text-center font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Tên đối tác
      {
        key: "correspondentName",
        header: headerFilter(
          "correspondentName",
          t("cashflow.partner", "Đối tác"),
          { showBlankOption: true },
        ),
        size: 260,
        minSize: 180,
        enableResizing: true,
        cell: (row) => (
          <div
            className="cursor-pointer hover:underline text-primary"
            onClick={() =>
              onPartnerClick(row.correspondentAccount, row.correspondentName)
            }
          >
            <TableText
              text={row.correspondentName || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="truncate text-xs font-semibold select-text"
            />
          </div>
        ),
      },

      // 3. Số tài khoản đối ứng
      {
        key: "correspondentAccount",
        header: headerFilter(
          "correspondentAccount",
          t("cashflow.partnerAccount", "STK đối ứng"),
          { showBlankOption: true },
        ),
        size: 160,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.correspondentAccount || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate font-mono text-xs text-muted-foreground select-text"
          />
        ),
      },

      // 4. Ngân hàng đối ứng
      {
        key: "correspondentBankName",
        header: headerFilter(
          "correspondentBankName",
          t("cashflow.partnerBank", "Ngân hàng đối ứng"),
          { showBlankOption: true },
        ),
        size: 180,
        minSize: 140,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.correspondentBankName || "—"}
            tooltip={true}
            textClassName="truncate text-xs text-foreground select-text"
          />
        ),
      },

      // 5. Chi nhánh
      {
        key: "branchName",
        header: headerFilter(
          "branchName",
          t("thietlap.columns.branch", "Chi nhánh"),
          { showBlankOption: true },
        ),
        size: 160,
        minSize: 120,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.branchName || "—"}
            tooltip={true}
            textClassName="truncate text-xs text-foreground select-text"
          />
        ),
      },

      // 6. Tổng thu
      {
        key: "totalCredit",
        header: headerFilter.amount(
          "totalCredit",
          t("bankStatement.columns.thu", "Tiền vào (Thu)"),
        ),
        size: 150,
        minSize: 120,
        enableResizing: true,
        className: "text-right",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{money(row.totalCredit || 0)}
          </span>
        ),
      },

      // 7. Tổng chi
      {
        key: "totalDebit",
        header: headerFilter.amount(
          "totalDebit",
          t("bankStatement.columns.chi", "Tiền ra (Chi)"),
        ),
        size: 150,
        minSize: 120,
        enableResizing: true,
        className: "text-right",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-[#ea580c] dark:text-orange-400 tabular-nums">
            {money(row.totalDebit || 0)}
          </span>
        ),
      },
    ];
  }, [headerFilter, onPartnerClick, t]);

  return { columns };
}
