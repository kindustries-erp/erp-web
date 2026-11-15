import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import type { AuditLogRow } from "../../../api/dtos/audit-log.dto";
import {
  isAuditFailed,
  toSnapshotEntries,
} from "../../../domain/rules/auditRules";
import { AuditStatusBadge } from "../../molecules/audit-status-badge";

type Translate = (key: string, fallback?: string) => string;

const dash = (v: string | null | undefined) => v || "—";

const snapshotRows = (
  prefix: string,
  snapshot: Record<string, unknown> | null,
): DrawerRowConfig[] =>
  toSnapshotEntries(snapshot).map((e) => ({
    key: `${prefix}-${e.key}`,
    label: e.key,
    value: e.value,
    multiline: 3,
  }));

/** Chế độ xem nhật ký (chỉ đọc): nhãn - giá trị, không render ô nhập. */
export function AuditLogView({ row, t }: { row: AuditLogRow; t: Translate }) {
  const info: DrawerRowConfig[] = [
    {
      key: "actor",
      label: t("v2.audit.columns.actorEmail", "Người thực hiện"),
      value: dash(row.actorEmail),
    },
    {
      key: "module",
      label: t("v2.audit.columns.module", "Module"),
      value: dash(row.module),
    },
    {
      key: "action",
      label: t("v2.audit.columns.actionType", "Hành động"),
      value: dash(row.actionType),
    },
    {
      key: "entity",
      label: t("v2.audit.columns.entityType", "Đối tượng"),
      value: dash(row.entityType),
    },
    {
      key: "entityId",
      label: t("v2.audit.columns.entityId", "Mã đối tượng"),
      value: dash(row.entityId),
      copyable: Boolean(row.entityId),
    },
    {
      key: "route",
      label: t("v2.audit.detail.route", "Đường dẫn"),
      value: row.route ? `${row.httpMethod ?? ""} ${row.route}`.trim() : "—",
      multiline: 2,
    },
    {
      key: "status",
      label: t("v2.audit.columns.status", "Trạng thái"),
      value: <AuditStatusBadge status={row.status} />,
    },
    {
      key: "screen",
      label: t("v2.audit.columns.uiScreen", "Màn hình"),
      value: dash(row.uiScreen),
    },
    {
      key: "uiAction",
      label: t("v2.audit.detail.uiAction", "Thao tác giao diện"),
      value: dash(row.uiAction),
    },
    {
      key: "ip",
      label: t("v2.audit.detail.ipAddress", "Địa chỉ IP"),
      value: dash(row.ipAddress),
    },
    {
      key: "ua",
      label: t("v2.audit.detail.userAgent", "Trình duyệt"),
      value: dash(row.userAgent),
      multiline: 2,
    },
    {
      key: "requestId",
      label: t("v2.audit.detail.requestId", "Mã yêu cầu"),
      value: dash(row.requestId),
      copyable: Boolean(row.requestId),
    },
    {
      key: "message",
      label: t("v2.audit.columns.message", "Thông điệp"),
      value: dash(row.message),
      multiline: 3,
    },
  ];
  const sections: [string, string, DrawerRowConfig[]][] = [
    [
      "before",
      t("v2.audit.detail.before", "Dữ liệu trước"),
      snapshotRows("before", row.beforeSnapshot),
    ],
    [
      "after",
      t("v2.audit.detail.after", "Dữ liệu sau"),
      snapshotRows("after", row.afterSnapshot),
    ],
    ...(isAuditFailed(row.status)
      ? ([
          [
            "error",
            t("v2.audit.detail.error", "Chi tiết lỗi"),
            snapshotRows("error", row.errorSnapshot),
          ],
        ] as [string, string, DrawerRowConfig[]][])
      : []),
  ];

  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.audit.detail.info", "Thông tin")}>
        <V2DrawerRowList rows={info} />
      </DrawerSection>
      {sections
        .filter(([, , rows]) => rows.length > 0)
        .map(([key, title, rows]) => (
          <DrawerSection key={key} title={title}>
            <V2DrawerRowList rows={rows} />
          </DrawerSection>
        ))}
    </div>
  );
}
