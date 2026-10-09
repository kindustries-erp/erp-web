import React, { useMemo, useCallback, useState } from "react";
import { Eye, Pencil, Plus, Trash2, ReceiptText } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import {
  ColumnValueType,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import { useGarageCashflowList } from "../../../hooks/useGarageCashflowList";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageCashflowListProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export const GarageCashflowList: React.FC<GarageCashflowListProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const listHook = useGarageCashflowList();

  const filterBuilder = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHook as any,
      }),
    [listHook],
  );

  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    mode: "view" | "edit" | "create";
    voucher: GarageCashflowVoucher | null;
  }>({
    open: false,
    mode: "view",
    voucher: null,
  });

  const openDetail = useCallback(
    (row: GarageCashflowVoucher | null, mode: "view" | "edit" | "create") => {
      setDrawerState({ open: true, mode, voucher: row });
    },
    [],
  );

  const rowActions = useCallback(
    (row: GarageCashflowVoucher) => [
      {
        groupLabel: "Thao tác chính",
        items: [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <Eye className="w-4 h-4" />,
            onClick: () => openDetail(row, "view"),
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => openDetail(row, "edit"),
          },
        ],
      },
      {
        groupLabel: "Khác",
        items: [
          {
            key: "delete",
            label: "Xóa phiếu",
            icon: <Trash2 className="w-4 h-4" />,
            variant: "danger" as const,
            onClick: () => console.log("Delete", row.id),
          },
        ],
      },
    ],
    [openDetail],
  );

  const columns = useMemo<DataTableColumn<GarageCashflowVoucher>[]>(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx}
          </span>
        ),
      },
      {
        key: "created_at",
        sortKey: "created_at",
        size: 110,
        header: filterBuilder.date("created_at", "Ngày tạo"),
        cell: (row) => {
          if (!row.created_at) return "—";
          const d = new Date(row.created_at);
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {d.toLocaleDateString("vi-VN")}
              </span>
              <span className="text-xs text-slate-500">
                {d.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      },
      {
        key: "voucher_code",
        sortKey: "voucher_code",
        size: 160,
        header: filterBuilder("voucher_code", "Mã phiếu", {
          valueType: ColumnValueType.TEXT,
        }),
        cell: (row) => (
          <span
            className="text-primary font-medium cursor-pointer hover:underline"
            onClick={() => openDetail(row, "view")}
          >
            {row.voucher_code}
          </span>
        ),
      },
      {
        key: "voucher_type",
        sortKey: "voucher_type",
        size: 120,
        header: filterBuilder.client("voucher_type", "Loại phiếu", {
          valueType: ColumnValueType.TEXT,
          filterOptions: [
            { label: "Thu (RECEIPT)", value: "RECEIPT" },
            { label: "Chi (PAYMENT)", value: "PAYMENT" },
          ],
        }),
        cell: (row) => {
          const type = (row.voucher_type || "").toUpperCase();
          return (
            <span
              className={
                type === "RECEIPT"
                  ? "text-emerald-600 font-medium"
                  : "text-rose-600 font-medium"
              }
            >
              {type === "RECEIPT" ? "Phiếu Thu" : "Phiếu Chi"}
            </span>
          );
        },
      },
      {
        key: "amount",
        sortKey: "amount",
        size: 140,
        header: filterBuilder.amount("amount", "Số tiền", {
          valueType: ColumnValueType.NUMBER,
          align: "right",
        }),
        cell: (row) => (
          <span className="tabular-nums font-medium block text-right w-full">
            {row.amount.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
      {
        key: "partner_name",
        sortKey: "partner_name",
        size: 200,
        header: filterBuilder("partner_name", "Đối tác", {
          valueType: ColumnValueType.TEXT,
        }),
        cell: (row) => (
          <span className="truncate block" title={row.partner_name || ""}>
            {row.partner_name || "—"}
          </span>
        ),
      },
      {
        key: "description",
        size: 250,
        header: filterBuilder("description", "Diễn giải", {
          valueType: ColumnValueType.TEXT,
        }),
        cell: (row) => (
          <span
            className="text-muted-foreground text-xs truncate block"
            title={row.description || ""}
          >
            {row.description || "—"}
          </span>
        ),
      },
    ],
    [openDetail],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title="Thu chi xưởng"
        desc="Quản lý Thu/Chi nội bộ tại xưởng và đối soát với dòng tiền ERP"
        icon={<ReceiptText className="w-5 h-5 text-slate-700" />}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tableId="garage-cashflow-list"
        columns={columns}
        items={listHook.data}
        total={listHook.total}
        totalPages={listHook.totalPages}
        page={listHook.page}
        pageSize={listHook.pageSize}
        onPage={listHook.setPage}
        onPageSize={listHook.setPageSize}
        loading={listHook.isLoading}
        onRefresh={listHook.refetch}
        getRowKey={(row) => row.id}
        listHook={listHook}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        sortArray={listHook.sorts}
        onSort={listHook.setSort as any}
        rowActions={rowActions}
        onCreate={() => openDetail(null, "create")}
        createLabel="Tạo phiếu mới"
        createIcon={<Plus className="w-4 h-4 mr-1 text-primary-foreground" />}
      />
      <GarageCashflowDrawer
        open={drawerState.open}
        onClose={() => setDrawerState((prev) => ({ ...prev, open: false }))}
        initialMode={drawerState.mode}
        voucher={drawerState.voucher}
      />
    </>
  );
};
