import React from "react";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";

export const renderCopyableText = (
  text: string,
  t: (key: string, options?: any) => string,
) => {
  if (!text) return null;
  return (
    <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
      <div
        className="w-full line-clamp-2 break-words whitespace-normal cursor-pointer hover:opacity-80 active:opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          toast.success(t("copied", { defaultValue: "Đã copy text" }));
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

export const renderReferenceCell = (
  row: any,
  onDetailClick: (id: string) => void,
) => {
  if (!row.referenceNumber) return "—";
  return (
    <TableText
      text={row.referenceNumber}
      onDetailClick={(e) => {
        e.stopPropagation();
        onDetailClick(row.id);
      }}
      tooltip={true}
      enableCopy={true}
      textClassName="text-primary font-mono"
    />
  );
};

export const renderThuCell = (row: any) => {
  const credit = parseFloat(row.creditAmount) || 0;
  if (credit > 0) {
    return (
      <span className="text-emerald-600 font-medium tabular-nums">
        {money(credit)}
      </span>
    );
  }
  return null;
};

export const renderChiCell = (row: any) => {
  const debit = parseFloat(row.debitAmount) || 0;
  if (debit > 0) {
    return (
      <span className="text-amber-600 dark:text-amber-500 font-medium tabular-nums">
        {money(debit)}
      </span>
    );
  }
  return null;
};

export const renderNetOffCell = (row: any) => {
  const netOff = parseFloat(row.netOffAmount) || 0;
  if (netOff === 0) return "--";
  return (
    <span className="text-primary font-medium tabular-nums">
      {money(netOff)}
    </span>
  );
};

export const renderRemainingCell = (row: any) => {
  const credit = parseFloat(row.creditAmount) || 0;
  const debit = parseFloat(row.debitAmount) || 0;
  const amount = credit > 0 ? credit : debit;
  const netOff = parseFloat(row.netOffAmount) || 0;
  const remaining = amount - netOff;
  if (remaining === 0) {
    return <span className="text-emerald-600 font-medium tabular-nums">0</span>;
  }
  return (
    <span className="text-foreground font-medium tabular-nums">
      {money(remaining)}
    </span>
  );
};

export const renderInvoiceSubjectCell = (
  row: any,
  t: (k: string, o?: any) => string,
) => {
  let subject = row.invoiceSubject;
  if (!subject && row.invoiceNetOffs && row.invoiceNetOffs.length > 0) {
    const subjects = row.invoiceNetOffs
      .map((link: any) => {
        const inv = link.invoice || link.erpInvoice || {};
        const name = inv.direction === "IN" ? inv.sellerName : inv.buyerName;
        const taxCode =
          inv.direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;
        return taxCode && name ? `${taxCode} - ${name}` : name;
      })
      .filter(Boolean);
    if (subjects.length > 0) {
      subject = Array.from(new Set(subjects)).join(", ");
    }
  }
  return renderCopyableText(subject, t);
};

export const renderPartnerCell = (
  account: string | undefined,
  name: string | undefined,
  rowId: string,
  onOpenPartner: (account?: string, name?: string, rowId?: string) => void,
) => {
  const text = name || account;
  if (!text) return null;
  return (
    <TableText
      text={text}
      onDrawerClick={(e) => {
        e.stopPropagation();
        onOpenPartner(account, name, rowId);
      }}
      tooltip={text}
      enableCopy={true}
      textClassName="text-primary"
    />
  );
};
