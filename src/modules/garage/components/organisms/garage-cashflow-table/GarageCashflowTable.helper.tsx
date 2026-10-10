import React from "react";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

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
