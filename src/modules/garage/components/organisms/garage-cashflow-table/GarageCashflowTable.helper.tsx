import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { TableText } from "@/shared/components/DataTable/TableText";

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

export const renderCaseCodeCell = (row: GarageCashflowVoucher) => {
  return row.case?.soChungTu ? (
    <TableText
      text={row.case.soChungTu}
      enableCopy
      textClassName="font-mono text-xs border border-input rounded-md px-2 py-0.5"
    />
  ) : (
    <span className="text-muted-foreground">—</span>
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

export const renderNoteCell = (row: GarageCashflowVoucher) => {
  return (
    <span
      className="text-muted-foreground text-xs truncate block"
      title={row.note || ""}
    >
      {row.note || "—"}
    </span>
  );
};

export const renderSttCell = (_: any, idx: number) => (
  <span className="w-full block text-center font-mono text-xs text-muted-foreground">
    {idx}
  </span>
);
