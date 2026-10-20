import { useMemo } from "react";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import type { NormalizedCashBook } from "../hooks/useCashFundLogic";

interface UseCashFundColumnsProps {
  tableState: any;
  items: NormalizedCashBook[];
  t: (key: string, fallback?: string) => string;
}

export function useCashFundColumns({
  tableState,
  items,
  t,
}: UseCashFundColumnsProps) {
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
      }),
    [tableState, items],
  );

  const columns: DataTableColumn<NormalizedCashBook>[] = useMemo(() => {
    return [
      // 1. STT (40px, căn giữa chuẩn)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Tên sổ quỹ
      {
        key: "name",
        header: headerFilter(
          "name",
          t("thietlap.columns.cashFundName", "Tên sổ quỹ"),
          {
            showBlankOption: true,
          },
        ),
        size: 280,
        minSize: 180,
        enableResizing: true,
        cell: (a) => (
          <TableText
            text={a.name || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate text-xs font-semibold text-primary select-text"
          />
        ),
      },

      // 3. Chi nhánh
      {
        key: "branchName",
        header: headerFilter(
          "branchName",
          t("thietlap.columns.branch", "Chi nhánh"),
          {
            showBlankOption: true,
          },
        ),
        size: 200,
        minSize: 150,
        enableResizing: true,
        cell: (a) => (
          <TableText
            text={a.branchName || "—"}
            tooltip={true}
            textClassName="truncate text-xs text-foreground select-text"
          />
        ),
      },

      // 4. Tiền tệ
      {
        key: "currency",
        header: headerFilter(
          "currency",
          t("thietlap.columns.currency", "Tiền tệ"),
          {
            showBlankOption: true,
          },
        ),
        size: 110,
        minSize: 90,
        enableResizing: true,
        className: "text-center",
        cell: (a) => (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {a.currency || "VND"}
          </span>
        ),
      },

      // 5. Số dư ban đầu
      {
        key: "openingBalance",
        header: headerFilter.amount(
          "openingBalance",
          t("thietlap.columns.openingBalance", "Số dư ban đầu"),
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        className: "text-right",
        cell: (a) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {money(a.openingBalance || 0)}
          </span>
        ),
      },

      // 6. Trạng thái
      {
        key: "isActive",
        header: headerFilter.client(
          "isActive",
          t("thietlap.columns.status", "Trạng thái"),
          {
            filterOptions: [
              { label: t("common.active", "Hoạt động"), value: "true" },
              {
                label: t("common.inactive", "Ngưng hoạt động"),
                value: "false",
              },
            ],
          },
        ),
        size: 130,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (a) => (
          <Badge
            variant="ghost"
            className={`border min-h-[18px] h-[18px] py-0 px-2 text-[10px] leading-none ${
              a.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {a.isActive
              ? t("common.active", "Hoạt động")
              : t("common.inactive", "Ngưng")}
          </Badge>
        ),
      },
    ];
  }, [headerFilter, t]);

  return { columns };
}
