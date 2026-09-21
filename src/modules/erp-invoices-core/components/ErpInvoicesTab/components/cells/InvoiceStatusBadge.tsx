import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatTaxInvoiceStatus, formatTaxProcessStatus } from "../../utils";

export interface TaxInvoiceStatusBadgeProps {
  status?: number | null;
  relatedInvoiceNo?: string | null;
  relatedSerialNo?: string | null;
}

export const TaxInvoiceStatusBadge = React.memo(function TaxInvoiceStatusBadge({
  status,
  relatedInvoiceNo,
  relatedSerialNo,
}: TaxInvoiceStatusBadgeProps) {
  if (status == null) return <>—</>;

  const lbl = formatTaxInvoiceStatus(status);
  let badgeClass = "w-[80px] border-slate-200 bg-slate-50 text-slate-700";

  switch (status) {
    case 1:
      badgeClass =
        "w-[80px] border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
      break;
    case 2:
    case 3:
    case 5:
      badgeClass =
        "w-[80px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300";
      break;
    case 4:
    case 6:
      badgeClass =
        "w-[80px] border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300";
      break;
  }

  let tooltipContent = lbl;
  if (relatedInvoiceNo) {
    const relStr = `HĐ số ${relatedInvoiceNo}${
      relatedSerialNo ? " (" + relatedSerialNo + ")" : ""
    }`;
    if (status === 3) {
      tooltipContent = `Điều chỉnh cho ${relStr}`;
    } else if (status === 2) {
      tooltipContent = `Thay thế cho ${relStr}`;
    } else {
      tooltipContent = `${lbl} (Liên quan: ${relStr})`;
    }
  } else if (status === 5) {
    tooltipContent = "Bị điều chỉnh (HĐ gốc đã có HĐ điều chỉnh phát sinh)";
  } else if (status === 4) {
    tooltipContent = "Bị thay thế (HĐ gốc đã được thay thế bởi HĐ mới)";
  }

  const subText = relatedInvoiceNo
    ? `${status === 3 ? "Đ/c: " : status === 2 ? "Thay: " : "HĐ: "}${relatedInvoiceNo}`
    : null;

  return (
    <Tooltip content={tooltipContent}>
      <div className="inline-flex flex-col items-center justify-center gap-0.5 max-w-[130px]">
        <Badge
          variant="ghost"
          className={`border min-h-[18px] h-[18px] py-0 px-1.5 text-[10px] leading-none ${badgeClass}`}
        >
          <span className="truncate block max-w-full">{lbl}</span>
        </Badge>
        {subText && (
          <span className="text-[10px] text-muted-foreground font-mono font-medium truncate max-w-full leading-none">
            {subText}
          </span>
        )}
      </div>
    </Tooltip>
  );
});

export interface TaxProcessStatusBadgeProps {
  status?: number | null;
}

export const TaxProcessStatusBadge = React.memo(function TaxProcessStatusBadge({
  status,
}: TaxProcessStatusBadgeProps) {
  const lbl = formatTaxProcessStatus(status);
  if (lbl === "—") return <>—</>;

  return (
    <Tooltip content={lbl}>
      <Badge
        variant="outline"
        className="w-[100px] min-h-[18px] h-[18px] py-0 px-1 text-[10px] leading-none bg-slate-50 text-slate-700 hover:bg-slate-100"
      >
        <span className="truncate block max-w-full">{lbl}</span>
      </Badge>
    </Tooltip>
  );
});

export interface PostingStatusBadgeProps {
  status?: string | null;
}

export const PostingStatusBadge = React.memo(function PostingStatusBadge({
  status,
}: PostingStatusBadgeProps) {
  const isPosted = status === "POSTED";
  const lbl = isPosted ? "Hạch toán" : "Chưa hạch toán";

  return (
    <Tooltip content={lbl}>
      <Badge
        variant="ghost"
        className={`border w-[100px] min-h-[18px] h-[18px] py-0 px-1 text-[10px] leading-none ${
          isPosted
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        }`}
      >
        {lbl}
      </Badge>
    </Tooltip>
  );
});

export interface InvoiceValidBadgeProps {
  isValid?: boolean;
  validLabel?: string;
  invalidLabel?: string;
}

export const InvoiceValidBadge = React.memo(function InvoiceValidBadge({
  isValid,
  validLabel = "Hợp lệ",
  invalidLabel = "Chưa hợp lệ",
}: InvoiceValidBadgeProps) {
  if (isValid) {
    return (
      <Badge
        variant="ghost"
        className="border border-emerald-200 bg-emerald-50 text-emerald-700 w-[80px] min-h-[18px] h-[18px] py-0 px-1 text-[10px] leading-none hover:bg-emerald-100"
      >
        <span className="truncate block max-w-full">{validLabel}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="ghost"
      className="border border-slate-200 bg-slate-50 text-slate-700 w-[80px] min-h-[18px] h-[18px] py-0 px-1 text-[10px] leading-none hover:bg-slate-100"
    >
      <span className="truncate block max-w-full">{invalidLabel}</span>
    </Badge>
  );
});
