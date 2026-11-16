import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { formatFileSize } from "@/v2/shared/components/organisms/v2-attachments-panel/V2AttachmentsPanel.helper";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { FileAttachment } from "../../../domain/entities/fileAttachment";

type Translate = (key: string, fallback?: string) => string;

const fmtDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—";

/** Cột STT do V2StandardTable tự render, không khai báo ở đây */
export const buildFileAttachmentsColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<FileAttachment>[] => [
  {
    key: "fileName",
    label: t("v2.fileAttachments.columns.fileName", "Tên tệp"),
    size: 240,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={row.fileName}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "ownerType",
    label: t("v2.fileAttachments.columns.ownerType", "Đối tượng"),
    size: 130,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.STATUS },
    cell: (row) =>
      t(`v2.fileAttachments.owners.${row.ownerType}`, row.ownerType),
  },
  {
    key: "category",
    label: t("v2.fileAttachments.columns.category", "Loại"),
    size: 120,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.STATUS },
    cell: (row) =>
      t(`v2.attachmentsPanel.categories.${row.category}`, row.category),
  },
  {
    key: "origin",
    label: t("v2.fileAttachments.columns.origin", "Nguồn"),
    size: 110,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.STATUS },
    cell: (row) => t(`v2.fileAttachments.origins.${row.origin}`, row.origin),
  },
  {
    key: "fileSize",
    label: t("v2.fileAttachments.columns.fileSize", "Dung lượng"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    cell: (row) => formatFileSize(row.fileSize),
  },
  {
    key: "createdAt",
    label: t("v2.fileAttachments.columns.createdAt", "Ngày tải lên"),
    size: 125,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => fmtDate(row.createdAt),
  },
  {
    key: "deletedAt",
    label: t("v2.fileAttachments.columns.deletedAt", "Ngày xóa"),
    size: 125,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => fmtDate(row.deletedAt),
  },
];
