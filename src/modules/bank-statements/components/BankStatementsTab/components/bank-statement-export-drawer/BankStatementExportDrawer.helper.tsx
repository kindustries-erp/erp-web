import React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Tooltip } from "@/core/components/ui/Tooltip";

export function toDisplayDate(iso?: string) {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

export function toDisplayRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return "-";
  const from = dateFrom ? toDisplayDate(dateFrom).slice(0, 10) : "-";
  const to = dateTo ? toDisplayDate(dateTo).slice(0, 10) : "-";
  return `${from} - ${to}`;
}

export function renderOverflowText(text?: string | null, className?: string) {
  const value = text?.trim() || "-";
  const showTooltip = value.length > 36;

  return (
    <Tooltip content={value} disabled={!showTooltip}>
      <div
        className={`truncate ${className || ""}`}
        title={showTooltip ? undefined : value}
      >
        {value}
      </div>
    </Tooltip>
  );
}

const COLUMN_LABEL_MAP: Record<string, string> = {
  description: "Nội dung giao dịch",
  referenceNumber: "Số tham chiếu",
  correspondentName: "Đối tác / Tên người gửi",
  correspondentAccount: "Tài khoản đối ứng",
  thu: "Tiền vào (Thu)",
  chi: "Tiền ra (Chi)",
  balance: "Số dư",
  transDate: "Ngày giao dịch",
  branch: "Chi nhánh",
  account: "Ngân hàng",
  invoiceSubject: "Phân loại HĐ",
  netOffAmount: "Đã cấn trừ",
  remainingAmount: "Còn lại",
};

export function getColumnLabel(columnKey: string): string {
  return COLUMN_LABEL_MAP[columnKey] || columnKey;
}
