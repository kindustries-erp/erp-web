import {
  V2StandardTable,
  type V2ColumnPreferencesStorage,
  type V2ViewPresetStorage,
} from "@/v2/shared/components/organisms/v2-standard-table";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { type MatchedInvoice } from "./InvoiceXmlImportFileNote";
import { useImportFileColumns } from "./invoiceXmlImportFileColumns";

/** Modal tạm thời: không lưu cột/chế độ xem vào localStorage */
const NO_PREFERENCES: V2ColumnPreferencesStorage = {
  load: () => null,
  save: () => {},
  clear: () => {},
};
const NO_VIEW_PRESETS: V2ViewPresetStorage = {
  load: () => null,
  save: () => {},
  clear: () => {},
};

export interface InvoiceXmlImportFilesTableProps {
  files: FileEntry[];
  direction: "IN" | "OUT";
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onPreview: (file: File) => void;
  matchedInvoices: Record<string, MatchedInvoice | null>;
  manualMatches: Record<string, string>;
  candidateOptions: { value: string; label: string }[];
  onManualMatchChange: (id: string, value: string) => void;
}

export function InvoiceXmlImportFilesTable({
  files,
  direction,
  selectedIds,
  onSelectedIdsChange,
  onPreview,
  matchedInvoices,
  manualMatches,
  candidateOptions,
  onManualMatchChange,
}: InvoiceXmlImportFilesTableProps) {
  const columns = useImportFileColumns({
    direction,
    candidateOptions,
    manualMatches,
    matchedInvoices,
    onPreview,
    onManualMatchChange,
  });

  return (
    <V2StandardTable<FileEntry>
      tableId="invoice-xml-import-preview"
      mode="client"
      columns={columns}
      items={files}
      getRowKey={(entry) => entry.id}
      enableRowSelection
      selectedKeys={selectedIds}
      onSelectionChange={onSelectedIdsChange}
      initialQuery={{ pageSize: 50 }}
      preferencesStorage={NO_PREFERENCES}
      viewPresetStorage={NO_VIEW_PRESETS}
    />
  );
}
