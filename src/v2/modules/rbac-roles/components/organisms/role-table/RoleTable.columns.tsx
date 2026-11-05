import { Badge } from "@/v2/shared/ui";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import { RoleStatusBadge } from "../../molecules/role-status-badge";
import { RoleSystemBadge } from "../../molecules/role-system-badge";
import type { Role, RoleUserSummary } from "../../../domain/entities/role";

type Translate = (key: string, fallback?: string) => string;

const value = (text?: string | number | null) =>
  text === null || text === undefined || text === "" ? "—" : String(text);

const formatUsers = (users?: RoleUserSummary[] | number) => {
  if (!Array.isArray(users)) return null;
  return users.filter((u) => u && (u.email || u.id));
};

export const buildRolesColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<Role>[] => [
  {
    key: "name",
    label: t("v2.rbacRoles.columns.name", "Tên vai trò"),
    size: 200,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2TableText
        text={value(row.name)}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "description",
    label: t("v2.rbacRoles.columns.description", "Mô tả"),
    size: 220,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-muted-foreground">
        {value(row.description)}
      </span>
    ),
  },
  {
    key: "users",
    label: t("v2.rbacRoles.columns.users", "Người dùng"),
    size: 260,
    enableResizing: true,
    mobileSlot: "meta",
    cell: (row) => {
      const list = formatUsers(row.users);
      if (!list || list.length === 0) {
        return <span className="text-muted-foreground/60">—</span>;
      }
      return (
        <div className="flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
          {list.slice(0, 3).map((u) => (
            <Badge
              key={u.id || u.email}
              variant="outline"
              className="text-[11px] px-1.5 py-0 h-5 max-w-[130px] truncate"
            >
              {u.email || u.id}
            </Badge>
          ))}
          {list.length > 3 && (
            <span className="text-[11px] text-muted-foreground">
              +{list.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "isSystem",
    label: t("v2.rbacRoles.columns.isSystem", "Phân loại"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        {
          value: "true",
          label: t("v2.rbacRoles.systemType.system", "Hệ thống"),
        },
        {
          value: "false",
          label: t("v2.rbacRoles.systemType.custom", "Tùy biến"),
        },
      ],
    },
    cell: (row) => <RoleSystemBadge isSystem={row.isSystem} />,
  },
  {
    key: "status",
    label: t("v2.rbacRoles.columns.status", "Trạng thái"),
    size: 130,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        {
          value: "ACTIVE",
          label: t("v2.rbacRoles.status.active", "Hoạt động"),
        },
        {
          value: "INACTIVE",
          label: t("v2.rbacRoles.status.inactive", "Ngưng hoạt động"),
        },
      ],
    },
    cell: (row) => (
      <RoleStatusBadge
        status={
          row.status ?? (row.is_active || row.isActive ? "ACTIVE" : "INACTIVE")
        }
      />
    ),
  },
  {
    key: "createdAt",
    label: t("v2.rbacRoles.columns.createdAt", "Ngày tạo"),
    size: 130,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) =>
      row.createdAt
        ? new Intl.DateTimeFormat("vi-VN").format(new Date(row.createdAt))
        : "—",
  },
];
