import React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Tooltip } from "@/core/components/ui/Tooltip";

export function toDisplayDate(iso?: string): string {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

export function toDisplayRange(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "-";
  const from = dateFrom ? toDisplayDate(dateFrom).slice(0, 10) : "-";
  const to = dateTo ? toDisplayDate(dateTo).slice(0, 10) : "-";
  return `${from} - ${to}`;
}

export function renderOverflowText(
  text: string,
  className?: string,
): React.ReactNode {
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

// ── Quarter helpers ────────────────────────────────────────────────────────────

export function quarterFirstDay(q: string): string {
  if (!q || !q.includes("-Q")) return "";
  const [year, qNum] = q.split("-Q");
  const qInt = parseInt(qNum, 10);
  const startMonth = (qInt - 1) * 3 + 1;
  return `${year}-${String(startMonth).padStart(2, "0")}-01`;
}

export function quarterLastDay(q: string): string {
  if (!q || !q.includes("-Q")) return "";
  const [year, qNum] = q.split("-Q");
  const qInt = parseInt(qNum, 10);
  const endMonth = qInt * 3;
  const lastDay = new Date(Number(year), endMonth, 0).getDate();
  return `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export function initQuarter(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export function generateQuarterOptions(
  yearsBack = 3,
): Array<{ value: string; label: string }> {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const options: Array<{ value: string; label: string }> = [];

  for (let y = currentYear; y >= currentYear - yearsBack; y--) {
    const maxQ = y === currentYear ? currentQuarter : 4;
    for (let q = maxQ; q >= 1; q--) {
      const val = `${y}-Q${q}`;
      const from = quarterFirstDay(val);
      const to = quarterLastDay(val);
      options.push({
        value: val,
        label: `Quý ${q}/${y} (${from.slice(8, 10)}/${from.slice(5, 7)} - ${to.slice(8, 10)}/${to.slice(5, 7)}/${y})`,
      });
    }
  }
  return options;
}

export function quarterFromExactRange(
  dateFrom?: string,
  dateTo?: string,
): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10)
    return "";
  const year = dateFrom.slice(0, 4);
  if (dateTo.slice(0, 4) !== year) return "";

  for (let q = 1; q <= 4; q++) {
    const qKey = `${year}-Q${q}`;
    if (dateFrom === quarterFirstDay(qKey) && dateTo === quarterLastDay(qKey)) {
      return qKey;
    }
  }
  return "";
}

// ── Export Columns Definitions & Groups ────────────────────────────────────────

export interface ExportColumnItem {
  key: string;
  labelKey: string;
  defaultLabel: string;
  group: "general" | "partner" | "amountTax" | "operation" | "netOff";
}

export const ALL_INVOICE_EXPORT_COLUMNS: ExportColumnItem[] = [
  // Thông tin chung
  {
    key: "invoiceDate",
    labelKey: "erpInvoices:columns.invoiceDate",
    defaultLabel: "Ngày phát hành",
    group: "general",
  },
  {
    key: "serialNo",
    labelKey: "erpInvoices:columns.serialNo",
    defaultLabel: "Ký hiệu hóa đơn",
    group: "general",
  },
  {
    key: "invoiceNo",
    labelKey: "erpInvoices:columns.invoiceNo",
    defaultLabel: "Số hóa đơn",
    group: "general",
  },
  {
    key: "statusName",
    labelKey: "erpInvoices:columns.status",
    defaultLabel: "Trạng thái",
    group: "general",
  },
  {
    key: "branchName",
    labelKey: "erpInvoices:columns.branch",
    defaultLabel: "Chi nhánh",
    group: "general",
  },
  // Đối tác
  {
    key: "partnerName",
    labelKey: "erpInvoices:columns.partner",
    defaultLabel: "Tên đối tác (KH / NCC)",
    group: "partner",
  },
  {
    key: "taxCode",
    labelKey: "erpInvoices:columns.taxCode",
    defaultLabel: "Mã số thuế",
    group: "partner",
  },
  {
    key: "address",
    labelKey: "erpInvoices:columns.address",
    defaultLabel: "Địa chỉ",
    group: "partner",
  },
  // Số tiền & Thuế
  {
    key: "headerDiscountAmount",
    labelKey: "erpInvoices:columns.discount",
    defaultLabel: "Chiết khấu",
    group: "amountTax",
  },
  {
    key: "preVat",
    labelKey: "erpInvoices:columns.preVat",
    defaultLabel: "Trước thuế GTGT",
    group: "amountTax",
  },
  {
    key: "vatRate",
    labelKey: "erpInvoices:columns.vatRate",
    defaultLabel: "Thuế suất",
    group: "amountTax",
  },
  {
    key: "vat",
    labelKey: "erpInvoices:columns.vat",
    defaultLabel: "Thuế GTGT",
    group: "amountTax",
  },
  {
    key: "total",
    labelKey: "erpInvoices:columns.total",
    defaultLabel: "Thành tiền",
    group: "amountTax",
  },
  // Chi tiết nghiệp vụ
  {
    key: "licensePlate",
    labelKey: "erpInvoices:columns.licensePlate",
    defaultLabel: "Biển số xe",
    group: "operation",
  },
  {
    key: "wo",
    labelKey: "erpInvoices:columns.wo",
    defaultLabel: "Lệnh quyết toán",
    group: "operation",
  },
  {
    key: "description",
    labelKey: "erpInvoices:columns.description",
    defaultLabel: "Diễn giải",
    group: "operation",
  },
  // Cấn trừ & Thanh toán
  {
    key: "netOffReferences",
    labelKey: "erpInvoices:columns.netOffReferences",
    defaultLabel: "Tham chiếu cấn trừ",
    group: "netOff",
  },
  {
    key: "netOffTransDate",
    labelKey: "erpInvoices:columns.netOffTransDate",
    defaultLabel: "Ngày giao dịch",
    group: "netOff",
  },
  {
    key: "netOffTransDesc",
    labelKey: "erpInvoices:columns.netOffTransDesc",
    defaultLabel: "Nội dung giao dịch",
    group: "netOff",
  },
  {
    key: "netOffRefAmount",
    labelKey: "erpInvoices:columns.netOffRefAmount",
    defaultLabel: "Số tiền tham chiếu",
    group: "netOff",
  },
  {
    key: "netOffAmount",
    labelKey: "erpInvoices:columns.netOffAmount",
    defaultLabel: "Số tiền cấn trừ",
    group: "netOff",
  },
  {
    key: "remainingAmount",
    labelKey: "erpInvoices:columns.remainingAmount",
    defaultLabel: "Còn lại",
    group: "netOff",
  },
];

export const DEFAULT_EXPORT_COLUMN_KEYS = ALL_INVOICE_EXPORT_COLUMNS.map(
  (c) => c.key,
);

export const INVOICE_EXPORT_COLUMNS_STORAGE_KEY =
  "erp_invoice_export_selected_columns";
