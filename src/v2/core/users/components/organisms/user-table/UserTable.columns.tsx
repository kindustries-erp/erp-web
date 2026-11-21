import {
  V2TableDateCell,
  V2TableText,
  V2Text,
  type V2Column,
} from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { UserRecord } from "../../../domain/user";
import { UserStatusBadge } from "../../molecules/user-status-badge";

type Translate = (key: string, fallback?: string) => string;

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildUserColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<UserRecord>[] => [
  {
    key: "email",
    label: t("v2.users.columns.email", "Email"),
    size: 260,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    summary: {
      variant: "count",
      accessor: () => 1,
      metricTitle: t("v2.users.summary.count", "Số tài khoản"),
    },
    cell: (row) => (
      <V2TableText
        text={row.email}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "employee",
    label: t("v2.users.columns.employee", "Nhân viên"),
    size: 230,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2Text truncate>
        {row.employee
          ? `${row.employee.employeeCode} · ${row.employee.fullName}`
          : "—"}
      </V2Text>
    ),
  },
  {
    key: "status",
    label: t("v2.users.columns.status", "Trạng thái"),
    size: 130,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        { value: "ACTIVE", label: t("v2.users.status.active", "Hoạt động") },
        {
          value: "INACTIVE",
          label: t("v2.users.status.inactive", "Ngưng hoạt động"),
        },
      ],
    },
    cell: (row) => <UserStatusBadge status={row.status} />,
  },
  {
    key: "lastLoginAt",
    label: t("v2.users.columns.lastLoginAt", "Đăng nhập gần nhất"),
    size: 170,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.DATE },
    // ISO UTC từ API; V2TableDateCell hiển thị theo múi giờ trình duyệt
    cell: (row) => <V2TableDateCell date={row.lastLoginAt} />,
  },
  {
    key: "createdAt",
    label: t("v2.users.columns.createdAt", "Ngày tạo"),
    size: 170,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => <V2TableDateCell date={row.createdAt} />,
  },
];
