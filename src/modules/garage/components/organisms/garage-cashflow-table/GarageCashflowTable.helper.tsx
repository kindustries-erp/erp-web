import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";

export const createCashflowDateHeader = (
  key: string,
  title: string,
  tableHook?: any,
) => {
  const sortState = tableHook?.sorts?.includes(key)
    ? "asc"
    : tableHook?.sorts?.includes(`-${key}`)
      ? "desc"
      : "none";
  const dateRange = tableHook?.getDateRange?.(key);

  return (
    <TableColumnHeaderFilter
      title={title}
      sortState={sortState}
      onSortChange={(s) => tableHook?.setSort?.(key, s)}
      searchValue=""
      onSearchChange={() => {}}
      selectedFilters={[]}
      onFilterChange={() => {}}
      hideFilter
      hideFooter
      isActive={Boolean(dateRange?.from || dateRange?.to)}
      align="center"
      dateRangeSlot={({ close }) => (
        <DateRangeColumnSlot
          dateFrom={dateRange?.from || ""}
          dateTo={dateRange?.to || ""}
          onChange={(from, to) => {
            tableHook?.setDateRange?.(key, from, to);
            close();
          }}
          onClose={close}
        />
      )}
    />
  );
};

export const renderCreatedAtCell = (row: GarageCashflowVoucher) => {
  if (!row.createdAt) return "—";
  const d = new Date(row.createdAt);
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">
        {d.toLocaleDateString("vi-VN")}
      </span>
      <span className="text-xs text-slate-500">
        {d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

export const renderTransDateCell = (row: GarageCashflowVoucher) => {
  if (!row.transDate) return "—";
  const d = new Date(row.transDate);
  return (
    <span className="text-sm font-medium">{d.toLocaleDateString("vi-VN")}</span>
  );
};

export const renderThuCell = (row: GarageCashflowVoucher) => {
  const isIn = (row.voucherType || "").toUpperCase() === "RECEIPT";
  return isIn ? (
    <span className="tabular-nums font-medium text-emerald-600 block w-full text-right">
      +{Number(row.amount || 0).toLocaleString("vi-VN")}
    </span>
  ) : (
    <span className="text-muted-foreground block w-full text-right">—</span>
  );
};

export const renderChiCell = (row: GarageCashflowVoucher) => {
  const isOut = (row.voucherType || "").toUpperCase() === "PAYMENT";
  return isOut ? (
    <span className="tabular-nums font-medium text-rose-600 block w-full text-right">
      -{Number(row.amount || 0).toLocaleString("vi-VN")}
    </span>
  ) : (
    <span className="text-muted-foreground block w-full text-right">—</span>
  );
};

export const renderCaseCodeCell = (
  row: GarageCashflowVoucher,
  onOpenCaseDetail?: (caseCode: string) => void,
) => {
  const code = row.case?.soChungTu;
  return (
    <TableText
      text={code || "—"}
      enableCopy={Boolean(code)}
      tooltip={Boolean(code)}
      textClassName="font-medium text-primary text-left"
      onDetailClick={
        code && onOpenCaseDetail ? () => onOpenCaseDetail(code) : undefined
      }
    />
  );
};

export const renderPartnerNameCell = (row: GarageCashflowVoucher) => {
  const name = row.partnerName || row.case?.khachHangName || "—";
  return (
    <span className="truncate block" title={name}>
      {name}
    </span>
  );
};

export const renderNoteCell = (row: GarageCashflowVoucher) => (
  <span
    className="text-muted-foreground text-xs truncate block"
    title={row.note || ""}
  >
    {row.note || "—"}
  </span>
);

export const renderSttCell = (_: any, idx: number) => (
  <span className="w-full block text-center font-mono text-xs text-muted-foreground">
    {idx}
  </span>
);

export const renderLicensePlateCell = (row: GarageCashflowVoucher) => {
  const plate = row.licensePlate || row.case?.bienSoXe || "";
  return (
    <TableText
      text={plate || "—"}
      enableCopy={Boolean(plate)}
      tooltip={Boolean(plate)}
      textClassName="font-medium text-foreground text-left"
    />
  );
};

export const renderPaymentMethodCell = (row: GarageCashflowVoucher) => {
  const method =
    row.paymentMethod ||
    (row.erpBankTransactionId
      ? "Chuyển khoản"
      : row.erpCashVoucherId
        ? "Tiền mặt"
        : "");

  if (!method) return <span className="text-muted-foreground">—</span>;

  const BADGE_STYLES: Record<string, string> = {
    "Ứng trước": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Chuyển khoản": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "Tiền mặt": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Thẻ tín dụng": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Cấn trừ": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };
  const badgeStyle =
    BADGE_STYLES[method] ||
    "bg-slate-500/10 text-slate-600 border-slate-500/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      {method}
    </span>
  );
};
