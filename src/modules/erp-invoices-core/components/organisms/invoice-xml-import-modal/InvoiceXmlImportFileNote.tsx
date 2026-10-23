import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { formatInvoiceAmount } from "./invoiceXmlImportModal.helper";

export interface MatchedInvoice {
  id: string;
  invoiceNo: string;
  serialNo: string | null;
  totalAmount: string | null;
}

export function FileNote({
  entry,
  manualMatch,
  autoMatch,
}: {
  entry: FileEntry;
  manualMatch: boolean;
  autoMatch: MatchedInvoice | null;
}) {
  const { t } = useTranslation("erpInvoices");

  if (entry.type === "xml" && entry.pairedPdf) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        {t("importNotePaired", "Đã ghép PDF")}
      </span>
    );
  }
  if (entry.type === "pdf") {
    if (manualMatch) {
      return (
        <span className="text-[11px] font-medium text-primary">
          {t("importNoteManual", "Đã chọn ghép thủ công (chờ import)")}
        </span>
      );
    }
    if (autoMatch) {
      const text = `${t("importNoteAuto", "Tự động")}: HĐ ${autoMatch.invoiceNo} (KH: ${autoMatch.serialNo || "N/A"}) - ${formatInvoiceAmount(autoMatch.totalAmount)}`;
      return (
        <span className="text-[11px] font-medium text-emerald-700" title={text}>
          {text}
        </span>
      );
    }
    return (
      <span className="text-[11px] text-muted-foreground">
        {t("importNoteOrphan", "File mồ côi")}
      </span>
    );
  }
  if (entry.type === "zip") {
    return (
      <span className="text-[11px] text-muted-foreground">
        {t("importNoteZip", "Server sẽ extract")}
      </span>
    );
  }
  return null;
}
