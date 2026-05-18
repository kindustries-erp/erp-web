import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import { cn } from "@/shared/utils";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import type { PartnerLedgerItem } from "@/modules/finance/api/financeApi";
import { fmtAmt, StatusBadge } from "./helpers";
import type { LedgerRowActions, TFunc } from "./types";

interface PartnerLedgerTableProps {
  items: PartnerLedgerItem[];
  loading: boolean;
  fetchError: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  partnerName: (id: string) => string;
  accountCode: (id: string) => string;
  actions: LedgerRowActions;
  t: TFunc;
}

export function PartnerLedgerTable({
  items,
  loading,
  fetchError,
  total,
  page,
  pageSize,
  totalPages,
  onPage,
  onPageSize,
  partnerName,
  accountCode,
  actions,
  t,
}: PartnerLedgerTableProps) {
  return (
    <div className="bg-surface border border-border rounded-xl card-shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">
          {t("ledger.table.title")}
        </span>
        {total > 0 && (
          <span className="ml-2 text-[11px] text-[color:var(--muted-fg)]">
            ({total})
          </span>
        )}
      </div>
      {fetchError && (
        <div className="px-4 py-3 text-sm text-[#d92a2a]">{fetchError}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-[11px] uppercase tracking-[0.05em]">
              {[
                "colItemNo",
                "colPartner",
                "colAccount",
                "colDocDate",
                "colDueDate",
                "colDescription",
                "colOriginal",
                "colSettled",
                "colOpen",
                "colStatus",
                "colActions",
              ].map((key) => (
                <th
                  key={key}
                  className={cn(
                    "px-3 py-2 font-medium whitespace-nowrap",
                    key === "colOriginal" ||
                      key === "colSettled" ||
                      key === "colOpen"
                      ? "text-right"
                      : "text-left",
                  )}
                >
                  {t(`ledger.table.${key}` as Parameters<typeof t>[0])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRows />
            ) : items.length === 0 ? (
              <EmptyRow t={t} />
            ) : (
              items.map((item) => (
                <LedgerRow
                  key={item.id}
                  item={item}
                  partnerName={partnerName}
                  accountCode={accountCode}
                  actions={actions}
                  t={t}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3">
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPage={onPage}
          onPageSize={onPageSize}
        />
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          {Array.from({ length: 11 }).map((_, j) => (
            <td key={j} className="px-3 py-2">
              <Skeleton className="h-4 w-full rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyRow({ t }: { t: TFunc }) {
  return (
    <tr>
      <td
        colSpan={11}
        className="px-4 py-8 text-center text-sm text-[color:var(--muted-fg)]"
      >
        {t("ledger.table.noData")}
      </td>
    </tr>
  );
}

function LedgerRow({
  item,
  partnerName,
  accountCode,
  actions,
  t,
}: {
  item: PartnerLedgerItem;
  partnerName: (id: string) => string;
  accountCode: (id: string) => string;
  actions: LedgerRowActions;
  t: TFunc;
}) {
  const isOverdue =
    item.due_date &&
    item.due_date < todayIsoDate() &&
    item.status !== "SETTLED" &&
    item.status !== "CANCELLED";
  return (
    <tr className="border-b border-border hover:bg-surface-hover transition-colors">
      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
        {item.item_no}
      </td>
      <td className="px-3 py-2 text-xs max-w-[140px] truncate">
        {partnerName(item.business_partner_id)}
      </td>
      <td className="px-3 py-2 text-xs whitespace-nowrap">
        {accountCode(item.accounting_account_id)}
      </td>
      <td className="px-3 py-2 text-xs whitespace-nowrap">
        {item.document_date}
      </td>
      <td
        className={cn(
          "px-3 py-2 text-xs whitespace-nowrap",
          isOverdue && "text-[#d92a2a] font-medium",
        )}
      >
        {item.due_date ?? "—"}
      </td>
      <td className="px-3 py-2 text-xs max-w-[200px] truncate">
        {item.description}
      </td>
      <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
        {fmtAmt(item.original_amount)}
      </td>
      <td className="px-3 py-2 text-xs text-right whitespace-nowrap text-approve-fg">
        {fmtAmt(item.settled_amount)}
      </td>
      <td className="px-3 py-2 text-xs text-right whitespace-nowrap font-medium">
        {fmtAmt(item.open_amount)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <RowActionButtons item={item} actions={actions} t={t} />
      </td>
    </tr>
  );
}

function RowActionButtons({
  item,
  actions,
  t,
}: {
  item: PartnerLedgerItem;
  actions: LedgerRowActions;
  t: TFunc;
}) {
  return (
    <div className="flex items-center gap-1">
      {actions.canUpdate &&
        item.status !== "SETTLED" &&
        item.status !== "CANCELLED" && (
          <button
            className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors"
            onClick={() => actions.onEdit(item)}
          >
            {t("ledger.actions.edit")}
          </button>
        )}
      {actions.canSettle &&
        (item.status === "OPEN" || item.status === "PARTIAL") && (
          <button
            className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors text-[#2a6dd9]"
            onClick={() => actions.onSettle(item)}
          >
            {t("ledger.actions.settle")}
          </button>
        )}
      {actions.canDelete && item.status === "OPEN" && (
        <button
          className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors text-[#d92a2a]"
          onClick={() => actions.onCancel(item)}
        >
          {t("ledger.actions.cancel")}
        </button>
      )}
    </div>
  );
}
