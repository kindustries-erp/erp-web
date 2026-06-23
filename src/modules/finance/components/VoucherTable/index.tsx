import type { ReactNode } from "react";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { SearchInput } from "@/shared/components/SearchInput";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { StatusBadge, VoucherTypeBadge } from "@/shared/components/badges";
import { AttachmentCell } from "@/shared/components/AttachmentComponents";
import { IconEdit, IconSort, IconTrash } from "@/shared/components/icons";
import {
  STATUS_FILTER_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
import type {
  CounterpartySource,
  PaymentVoucher,
  PaymentVoucherAttachment,
  VoucherStatus,
} from "@/modules/finance/api/financeApi";
import { useT } from "@/core/i18n";
import { formatGMT7 } from "@/shared/utils/format";

interface VoucherTableProps {
  title: string;
  vouchers: PaymentVoucher[];
  loading: boolean;
  fetchError: string | null;
  voucherAttachments: Record<string, PaymentVoucherAttachment[]>;
  sortCol: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchInput: string;
  amountMinInput: string;
  amountMaxInput: string;
  statusFilter: VoucherStatus | "";
  noDataLabel: string;
  channelNameResolver: (id: string | null) => string; // fundName or bankName
  channelColLabel: string; // "Quỹ" / "Ngân hàng"
  voucherTypeLabel?: (type: string) => string; // optional override
  onSort: (col: string) => void;
  onPage: (p: number) => void;
  onPageSize: (ps: number) => void;
  onEdit: (v: PaymentVoucher) => void;
  onDelete: (v: PaymentVoucher) => void;
  onSearchInput: (v: string) => void;
  onAmountMin: (v: string) => void;
  onAmountMax: (v: string) => void;
  onStatusFilter: (v: VoucherStatus | "") => void;
  counterpartySourceFilter: CounterpartySource | "";
  onCounterpartySourceFilter: (v: CounterpartySource | "") => void;
}

function SortHeader({
  col,
  active,
  onSort,
  children,
  className,
}: {
  col: string;
  active: string;
  onSort: (col: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const isActive = active === col || active === `-${col}`;
  const desc = active === `-${col}`;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className={`inline-flex items-center gap-1 ${className ?? ""}`}
    >
      {children}
      <IconSort active={isActive} desc={desc} />
    </button>
  );
}

/**
 * VoucherTable — Organism: bảng danh sách chứng từ với search, filter, sort, phân trang.
 * Dùng chung cho TienMat (CASH) và TienGui (BANK).
 */
export function VoucherTable({
  title,
  vouchers,
  loading,
  fetchError,
  voucherAttachments,
  sortCol,
  page,
  pageSize,
  total,
  totalPages,
  searchInput,
  amountMinInput,
  amountMaxInput,
  statusFilter,
  counterpartySourceFilter,
  onCounterpartySourceFilter,
  noDataLabel,
  channelNameResolver,
  channelColLabel,
  onSort,
  onPage,
  onPageSize,
  onEdit,
  onDelete,
  onSearchInput,
  onAmountMin,
  onAmountMax,
  onStatusFilter,
}: VoucherTableProps) {
  const t = useT();
  const columns: DataTableColumn<PaymentVoucher>[] = [
    {
      key: "document_date",
      header: (
        <SortHeader col="document_date" active={sortCol} onSort={onSort}>
          {t("voucher.table.colDate")}
        </SortHeader>
      ),
      cell: (v) => formatGMT7(v.document_date, "datetime"),
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-20",
    },
    {
      key: "voucher_no",
      header: t("voucher.table.colNo"),
      cell: (v) => v.voucher_no,
      className: "font-mono font-semibold",
      skeletonClassName: "w-20",
    },
    {
      key: "voucher_type",
      header: t("voucher.table.colType"),
      cell: (v) => <VoucherTypeBadge type={v.voucher_type} />,
      skeletonClassName: "w-16",
    },
    {
      key: "channel",
      header: channelColLabel,
      cell: (v) =>
        channelNameResolver(
          v.cash_fund_id ?? v.company_bank_account_id ?? null,
        ),
      className: "text-[color:var(--muted-fg)] whitespace-nowrap",
      skeletonClassName: "w-20",
    },
    {
      key: "partner",
      header: t("voucher.table.colPartner"),
      cell: (v) => {
        const name = v.counterparty_name_snapshot || "—";
        const badge =
          v.counterparty_source === "INTERNAL" ? (
            <span className="ml-1 text-[10px] px-1 py-[1px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Nội bộ
            </span>
          ) : v.counterparty_source === "EXTERNAL" ? (
            <span className="ml-1 text-[10px] px-1 py-[1px] rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Bên ngoài
            </span>
          ) : null;
        return (
          <span className="inline-flex items-center gap-1">
            {name}
            {badge}
          </span>
        );
      },
      skeletonClassName: "w-32",
    },
    {
      key: "description",
      header: t("voucher.table.colDesc"),
      cell: (v) => v.description,
      className: "text-[color:var(--muted-fg)] max-w-[180px] truncate",
      skeletonClassName: "w-36",
    },
    {
      key: "amount",
      header: (
        <SortHeader
          col="amount"
          active={sortCol}
          onSort={onSort}
          className="justify-end"
        >
          {t("voucher.table.colAmount")}
        </SortHeader>
      ),
      cell: (v) => Number(v.amount).toLocaleString("vi-VN"),
      headerClassName: "text-right",
      className: "text-right font-mono",
      skeletonClassName: "w-20 ml-auto",
    },
    {
      key: "status",
      header: t("voucher.table.colStatus"),
      cell: (v) => <StatusBadge status={v.status} />,
      skeletonClassName: "w-16",
    },
    {
      key: "attachment",
      header: t("voucher.table.colAttachment"),
      cell: (v) => (
        <AttachmentCell attachments={voucherAttachments[v.id] ?? []} />
      ),
      skeletonClassName: "w-16",
    },
  ];

  return (
    <Panel title={title} extra={<PanelMore />}>
      <DataTable
        items={vouchers}
        columns={columns}
        getRowKey={(v) => v.id}
        loading={loading}
        error={fetchError}
        emptyLabel={noDataLabel}
        minWidth={860}
        elevated={false}
        actionsColumn={{
          cell: (v) => (
            <ActionDropdown
              items={[
                {
                  label: t("voucher.table.btnEdit"),
                  icon: <IconEdit />,
                  onClick: () => onEdit(v),
                },
                {
                  label: t("voucher.table.btnDelete"),
                  icon: <IconTrash />,
                  onClick: () => onDelete(v),
                  variant: "danger",
                  hidden: v.status !== "DRAFT",
                },
              ]}
            />
          ),
        }}
        filters={
          <>
            <SearchInput
              placeholder={t("voucher.table.searchPlaceholder")}
              value={searchInput}
              onChange={onSearchInput}
              className="max-w-[220px]"
            />
            <input
              type="text"
              inputMode="numeric"
              className="form-input max-w-[150px]"
              value={amountMinInput}
              onChange={(e) => onAmountMin(e.target.value)}
              placeholder={t("voucher.table.amountFrom")}
            />
            <input
              type="text"
              inputMode="numeric"
              className="form-input max-w-[150px]"
              value={amountMaxInput}
              onChange={(e) => onAmountMax(e.target.value)}
              placeholder={t("voucher.table.amountTo")}
            />
            <Combobox
              options={STATUS_FILTER_OPTS}
              value={statusFilter}
              onChange={(v) => onStatusFilter((v as VoucherStatus | "") ?? "")}
              placeholder={t("voucher.table.statusPlaceholder")}
              className="w-[170px]"
            />
            <Combobox
              options={[
                { value: "", label: "Tất cả đối tượng" },
                ...COUNTERPARTY_SOURCE_OPTS,
              ]}
              value={counterpartySourceFilter}
              onChange={(v) =>
                onCounterpartySourceFilter((v as CounterpartySource | "") ?? "")
              }
              placeholder="Loại đối tượng"
              className="w-[180px]"
            />
          </>
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={onPage}
        onPageSize={onPageSize}
      />
    </Panel>
  );
}
