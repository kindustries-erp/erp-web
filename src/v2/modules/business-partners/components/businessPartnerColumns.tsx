import { Badge } from "@/v2/shared/ui";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { BusinessPartner } from "../domain/entities/businessPartner";

type Translate = (key: string, fallback?: string) => string;

const value = (text?: string | null) => text || "—";

export const buildBusinessPartnerColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<BusinessPartner>[] => [
  {
    key: "code",
    label: t("v2.partners.columns.code", "Mã đối tác"),
    size: 170,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={row.code}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "name",
    label: t("v2.partners.columns.name", "Tên đối tác"),
    size: 230,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <span className="block truncate font-semibold">{row.name}</span>
    ),
  },
  {
    key: "displayName",
    label: t("v2.partners.columns.displayName", "Tên hiển thị"),
    size: 180,
    enableResizing: true,
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-muted-fg">
        {value(row.displayName)}
      </span>
    ),
  },
  {
    key: "taxCode",
    label: t("v2.partners.columns.taxCode", "Mã số thuế"),
    size: 150,
    enableResizing: true,
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2TableText
        text={value(row.taxCode)}
        enableCopy={Boolean(row.taxCode)}
      />
    ),
  },
  {
    key: "phone",
    label: t("v2.partners.columns.phone", "Điện thoại"),
    size: 140,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="font-mono text-xs">{value(row.phone)}</span>
    ),
  },
  {
    key: "email",
    label: t("v2.partners.columns.email", "Email"),
    size: 190,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-xs">{value(row.email)}</span>
    ),
  },
  {
    key: "contactName",
    label: t("v2.partners.columns.contactName", "Người liên hệ"),
    size: 170,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate">{value(row.contactName)}</span>
    ),
  },
  {
    key: "address",
    label: t("v2.partners.columns.address", "Địa chỉ"),
    size: 240,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-xs text-muted-fg">
        {value(row.address)}
      </span>
    ),
  },
  {
    key: "status",
    label: t("v2.partners.columns.status", "Trạng thái"),
    size: 125,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        { value: "ACTIVE", label: t("v2.partners.status.active", "Hoạt động") },
        {
          value: "INACTIVE",
          label: t("v2.partners.status.inactive", "Ngưng hoạt động"),
        },
      ],
    },
    cell: (row) => (
      <Badge variant={row.status === "ACTIVE" ? "default" : "secondary"}>
        {row.status === "ACTIVE"
          ? t("v2.partners.status.active", "Hoạt động")
          : t("v2.partners.status.inactive", "Ngưng hoạt động")}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: t("v2.partners.columns.createdAt", "Ngày tạo"),
    size: 135,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) =>
      new Intl.DateTimeFormat("vi-VN").format(new Date(row.createdAt)),
  },
];
