import { V2TableText, V2Text, type V2Column } from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { EmployeeRecord } from "../../../domain/employee";
import { formatVnDate } from "../../../domain/rules/employeeDates";
import { EmployeeStatusBadge } from "../../molecules/employee-status-badge";

type Translate = (key: string, fallback?: string) => string;

export interface EmployeeColumnOptions {
  openDetail: (id: string) => void;
  branchOptions: { value: string; label: string }[];
}

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildEmployeeColumns = (
  t: Translate,
  { openDetail, branchOptions }: EmployeeColumnOptions,
): V2Column<EmployeeRecord>[] => [
  {
    key: "employeeCode",
    label: t("v2.employees.columns.employeeCode", "Mã"),
    size: 120,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    summary: {
      variant: "count",
      accessor: () => 1,
      metricTitle: t("v2.employees.summary.count", "Số nhân viên"),
    },
    cell: (row) => (
      <V2TableText
        text={row.employeeCode}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "fullName",
    label: t("v2.employees.columns.fullName", "Họ tên"),
    size: 220,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => <V2Text truncate>{row.fullName}</V2Text>,
  },
  {
    key: "jobTitle",
    label: t("v2.employees.columns.jobTitle", "Chức danh"),
    size: 170,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => <V2Text truncate>{row.jobTitle || "—"}</V2Text>,
  },
  {
    key: "department",
    label: t("v2.employees.columns.department", "Phòng ban"),
    size: 170,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => <V2Text truncate>{row.department || "—"}</V2Text>,
  },
  {
    key: "branchId",
    label: t("v2.employees.columns.branch", "Chi nhánh"),
    size: 170,
    enableResizing: true,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: branchOptions,
    },
    cell: (row) => <V2Text truncate>{row.branch?.name || "—"}</V2Text>,
  },
  {
    key: "phone",
    label: t("v2.employees.columns.phone", "Điện thoại"),
    size: 140,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => <V2Text truncate>{row.phone || "—"}</V2Text>,
  },
  {
    key: "email",
    label: t("v2.employees.columns.email", "Email"),
    size: 210,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => <V2Text truncate>{row.email || "—"}</V2Text>,
  },
  {
    key: "birthDate",
    label: t("v2.employees.columns.birthDate", "Ngày sinh"),
    size: 130,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    // Ngày thuần: hiển thị theo giờ VN để không lệch ngày giữa các múi giờ
    cell: (row) => <V2Text>{formatVnDate(row.birthDate)}</V2Text>,
  },
  {
    key: "startDate",
    label: t("v2.employees.columns.startDate", "Ngày vào làm"),
    size: 140,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => <V2Text>{formatVnDate(row.startDate)}</V2Text>,
  },
  {
    key: "status",
    label: t("v2.employees.columns.status", "Trạng thái"),
    size: 120,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        { value: "ACTIVE", label: t("v2.employees.status.active", "Đang làm") },
        {
          value: "INACTIVE",
          label: t("v2.employees.status.inactive", "Nghỉ việc"),
        },
      ],
    },
    cell: (row) => <EmployeeStatusBadge status={row.status} />,
  },
  {
    // Cột dẫn xuất từ `linkedUser`, không lọc/sắp xếp phía server
    key: "account",
    label: t("v2.employees.columns.account", "Tài khoản"),
    size: 210,
    enableResizing: true,
    mobileSlot: "hidden",
    cell: (row) => <V2Text truncate>{row.linkedUser?.email || "—"}</V2Text>,
  },
];
