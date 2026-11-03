import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { type V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import {
  FileBadge,
  FileStatusBadge,
  FileTypeIcon,
} from "./InvoiceXmlImportFileBadges";
import { InvoiceXmlManualMatchCombobox } from "./InvoiceXmlManualMatchCombobox";
import { FileNote, type MatchedInvoice } from "./InvoiceXmlImportFileNote";

export interface ImportFileColumnsInput {
  direction: "IN" | "OUT";
  candidateOptions: { value: string; label: string }[];
  manualMatches: Record<string, string>;
  matchedInvoices: Record<string, MatchedInvoice | null>;
  onPreview: (file: File) => void;
  onManualMatchChange: (id: string, value: string) => void;
}

/** Cột của bảng file import: loại, tên, cỡ, ghi chú, ghép HĐ, trạng thái */
export function useImportFileColumns({
  direction,
  candidateOptions,
  manualMatches,
  matchedInvoices,
  onPreview,
  onManualMatchChange,
}: ImportFileColumnsInput): V2Column<FileEntry>[] {
  const { t } = useTranslation("erpInvoices");

  return [
    {
      key: "type",
      label: t("importColType", "Loại"),
      size: 120,
      enableResizing: true,
      mobileSlot: "hidden",
      cell: (entry) => (
        <div className="flex items-center gap-1.5">
          <FileTypeIcon type={entry.type} />
          <FileBadge type={entry.type} />
        </div>
      ),
    },
    {
      key: "name",
      label: t("importColName", "Tên file"),
      size: 260,
      enableResizing: true,
      mobileSlot: "title",
      accessor: (entry) => entry.file.name,
      cell: (entry) => (
        <div className="flex items-center gap-2">
          <span
            className="min-w-0 truncate font-medium text-foreground"
            title={entry.file.name}
          >
            {entry.file.name}
          </span>
          {entry.type === "pdf" && (
            <V2Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("importPreviewFile", "Xem trước file")}
              title={t("importPreviewFile", "Xem trước file")}
              onClick={() => onPreview(entry.file)}
            >
              <Eye className="h-3.5 w-3.5" />
            </V2Button>
          )}
        </div>
      ),
    },
    {
      key: "size",
      label: t("importColSize", "Kích thước"),
      size: 110,
      align: TableColumnAlign.RIGHT,
      enableResizing: true,
      mobileSlot: "hidden",
      accessor: (entry) => entry.file.size,
      cell: (entry) => (
        <span className="tabular-nums text-muted-foreground">
          {(entry.file.size / 1024).toFixed(0)} KB
        </span>
      ),
    },
    {
      key: "note",
      label: t("importColNote", "Ghi chú"),
      size: 240,
      enableResizing: true,
      mobileSlot: "subtitle",
      cell: (entry) => (
        <FileNote
          entry={entry}
          manualMatch={!!manualMatches[entry.id]}
          autoMatch={matchedInvoices[entry.file.name] ?? null}
        />
      ),
    },
    {
      key: "manual",
      label: t("importColManual", "Ghép HĐ (Thủ công)"),
      size: 220,
      enableResizing: true,
      mobileSlot: "hidden",
      cell: (entry) =>
        entry.type === "pdf" && !entry.pairedPdf ? (
          <InvoiceXmlManualMatchCombobox
            direction={direction}
            initialOptions={candidateOptions}
            value={manualMatches[entry.id] || ""}
            onChange={(val) => onManualMatchChange(entry.id, val)}
          />
        ) : null,
    },
    {
      key: "status",
      label: t("importColStatus", "Trạng thái"),
      size: 190,
      enableResizing: true,
      mobileSlot: "meta",
      cell: (entry) => (
        <FileStatusBadge
          entry={entry}
          hasMatch={
            !!manualMatches[entry.id] || !!matchedInvoices[entry.file.name]
          }
        />
      ),
    },
  ];
}
