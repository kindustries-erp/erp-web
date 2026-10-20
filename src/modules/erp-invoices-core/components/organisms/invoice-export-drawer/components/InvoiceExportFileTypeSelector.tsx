import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/shared/components/ui/checkbox";

export type InvoiceExportFileType = "pdf" | "xml" | "zip";

export interface InvoiceExportFileTypeSelectorProps {
  value: InvoiceExportFileType[];
  onChange: (next: InvoiceExportFileType[]) => void;
  disabled?: boolean;
}

export function InvoiceExportFileTypeSelector({
  value,
  onChange,
  disabled,
}: InvoiceExportFileTypeSelectorProps) {
  const { t } = useTranslation("erpInvoices");

  const options: Array<{ type: InvoiceExportFileType; label: string }> = [
    {
      type: "pdf",
      label: t(
        "erpInvoices:exportDrawer.fileTypePdf",
        "File PDF (Bản thể hiện hóa đơn)",
      ),
    },
    {
      type: "xml",
      label: t(
        "erpInvoices:exportDrawer.fileTypeXml",
        "File XML (Dữ liệu gốc hóa đơn điện tử)",
      ),
    },
    {
      type: "zip",
      label: t(
        "erpInvoices:exportDrawer.fileTypeZip",
        "File ZIP (Gói hóa đơn gốc của nhà cung cấp)",
      ),
    },
  ];

  const toggle = (type: InvoiceExportFileType, checked: boolean) =>
    onChange(
      checked ? [...value, type] : value.filter((item) => item !== type),
    );

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">
        {t("erpInvoices:exportDrawer.fileTypeLabel", "Loại file")}
      </label>
      <div className="space-y-2">
        {options.map(({ type, label }) => (
          <label
            key={type}
            className="flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <Checkbox
              checked={value.includes(type)}
              disabled={disabled}
              onCheckedChange={(checked) => toggle(type, Boolean(checked))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
