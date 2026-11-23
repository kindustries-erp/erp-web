import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { V2TableDateCell } from "@/v2/shared/components/atoms/v2-table-date-cell";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
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
      <V2Text
        variant="body-sm"
        truncate
        className="block text-muted-foreground"
      >
        {value(row.description)}
      </V2Text>
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
        return (
          <V2Text variant="caption" className="text-muted-foreground/60">
            —
          </V2Text>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
          {list.slice(0, 3).map((u) => (
            <V2Badge
              key={u.id || u.email}
              variant={V2BadgeVariant.OUTLINE}
              size={V2BadgeSize.SM}
              className="font-normal text-[11px] px-1.5 py-0 h-5 max-w-[130px] truncate border-border text-foreground/80 dark:text-foreground/90 bg-muted/20 dark:bg-muted/10"
            >
              {u.email || u.id}
            </V2Badge>
          ))}
          {list.length > 3 && (
            <V2Text
              variant="caption"
              className="text-[11px] text-muted-foreground"
            >
              +{list.length - 3}
            </V2Text>
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
    cell: (row) => <V2TableDateCell date={row.createdAt} />,
  },
];
