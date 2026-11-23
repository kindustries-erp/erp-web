import {
  V2TableDateCell,
  V2TableText,
  V2Text,
  type V2Column,
} from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { AuditLogRow } from "../../../api/dtos/audit-log.dto";
import { AuditStatusBadge } from "../../molecules/audit-status-badge";

type Translate = (key: string, fallback?: string) => string;

const text = (value: string | null) => <V2Text truncate>{value || "—"}</V2Text>;

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildAuditColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<AuditLogRow>[] => [
  {
    key: "createdAt",
    label: t("v2.audit.columns.createdAt", "Thời gian"),
    size: 170,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => <V2TableDateCell date={row.createdAt} />,
  },
  {
    key: "actorEmail",
    label: t("v2.audit.columns.actorEmail", "Người thực hiện"),
    size: 220,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2TableText
        text={row.actorEmail || "—"}
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "module",
    label: t("v2.audit.columns.module", "Module"),
    size: 150,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => text(row.module),
  },
  {
    key: "actionType",
    label: t("v2.audit.columns.actionType", "Hành động"),
    size: 150,
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => text(row.actionType),
  },
  {
    key: "entityType",
    label: t("v2.audit.columns.entityType", "Đối tượng"),
    size: 170,
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => text(row.entityType),
  },
  {
    key: "entityId",
    label: t("v2.audit.columns.entityId", "Mã đối tượng"),
    size: 220,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => text(row.entityId),
  },
  {
    key: "status",
    label: t("v2.audit.columns.status", "Trạng thái"),
    size: 130,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        { value: "SUCCESS", label: t("v2.audit.status.success", "Thành công") },
        { value: "FAILED", label: t("v2.audit.status.failed", "Lỗi") },
      ],
    },
    cell: (row) => <AuditStatusBadge status={row.status} />,
  },
  {
    key: "httpMethod",
    label: t("v2.audit.columns.httpMethod", "Phương thức"),
    size: 110,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => text(row.httpMethod),
  },
  {
    key: "uiScreen",
    label: t("v2.audit.columns.uiScreen", "Màn hình"),
    size: 180,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => text(row.uiScreen),
  },
  {
    key: "message",
    label: t("v2.audit.columns.message", "Thông điệp"),
    size: 280,
    enableResizing: true,
    mobileSlot: "hidden",
    cell: (row) => text(row.message),
  },
];
