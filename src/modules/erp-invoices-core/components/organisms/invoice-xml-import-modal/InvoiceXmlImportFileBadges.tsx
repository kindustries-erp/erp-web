import { useTranslation } from "react-i18next";
import {
  Archive,
  FileCode,
  FileText,
  PackageOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/v2/shared/ui/badge";
import {
  getFilePreviewStatus,
  type FileEntry,
} from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

export function FileTypeIcon({ type }: { type: FileEntry["type"] }) {
  if (type === "xml")
    return <FileCode className="h-4 w-4 shrink-0 text-sky-500" />;
  if (type === "pdf")
    return <FileText className="h-4 w-4 shrink-0 text-red-500" />;
  return <Archive className="h-4 w-4 shrink-0 text-amber-500" />;
}

const FILE_BADGE_CLASS: Record<FileEntry["type"], string> = {
  xml: "bg-sky-100 text-sky-700",
  pdf: "bg-red-100 text-red-700",
  zip: "bg-amber-100 text-amber-700",
};

export function FileBadge({ type }: { type: FileEntry["type"] }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${FILE_BADGE_CLASS[type]}`}
    >
      {type.toUpperCase()}
    </span>
  );
}

/** Trạng thái xử lý của một file: tạo mới, ghép vào HĐ, extract ZIP hoặc cần chọn HĐ */
export function FileStatusBadge({
  entry,
  hasMatch,
}: {
  entry: FileEntry;
  hasMatch: boolean;
}) {
  const { t } = useTranslation("erpInvoices");
  const isOrphanPdf = entry.type === "pdf" && !entry.pairedPdf && !hasMatch;
  if (isOrphanPdf) {
    return (
      <Badge variant="warning" className="gap-1 rounded-full">
        <Clock className="h-3 w-3" />
        {t("xmlStatusNeedChoice", "Cần chọn HĐ")}
      </Badge>
    );
  }
  const status = getFilePreviewStatus(entry);
  if (status === "extract-zip") {
    return (
      <Badge variant="warning" className="gap-1 rounded-full">
        <PackageOpen className="h-3 w-3" />
        {t("xmlStatusExtract", "Extract & import")}
      </Badge>
    );
  }
  if (status === "attach-pdf") {
    return (
      <Badge variant="secondary" className="gap-1 rounded-full">
        <Clock className="h-3 w-3" />
        {t("xmlStatusAttach", "Ghép vào HĐ hiện có")}
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="gap-1 rounded-full">
      <CheckCircle2 className="h-3 w-3" />
      {t("xmlStatusCreate", "Sẽ tạo HĐ mới")}
    </Badge>
  );
}
