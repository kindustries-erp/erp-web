/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useAccountingConfigListStore } from "@/modules/accounting/hooks/useAccountingConfigListStore";
import { useAccountingConfigListQuery } from "@/modules/accounting/hooks/useAccountingConfigListQuery";
import { AccountingConfigFormModal } from "@/modules/accounting/components/AccountingConfigFormModal";

export function ErpAccountingConfigPage() {
  const store = useAccountingConfigListStore();
  const listQuery = useAccountingConfigListQuery({
    page: store.page,
    pageSize: store.pageSize,
    search: store.search || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filterConfig = useMemo(
    () => ({
      search: true,
    }),
    [],
  );

  const filterPanel = useFilterPanel(filterConfig, () => {
    store.setPage(1);
  });

  // Sync filterPanel state back to store
  useEffect(() => {
    store.setSearch(filterPanel.state.search);
  }, [filterPanel.state.search, store]);

  // Debounce search is handled by useFilterPanel natively

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const columns: DataTableColumn<any>[] = [
    {
      key: "module",
      header: "Phân hệ",
      cell: (val: any) => (
        <span className="font-semibold uppercase">{val.module}</span>
      ),
    },
    {
      key: "action",
      header: "Hành động (Action)",
      cell: (val: any) => <span className="uppercase">{val.action}</span>,
    },
    {
      key: "debit_account",
      header: "Tài khoản Nợ",
      cell: (val: any) =>
        val.debit_account
          ? `${val.debit_account.account_code} - ${val.debit_account.account_name}`
          : "-",
    },
    {
      key: "credit_account",
      header: "Tài khoản Có",
      cell: (val: any) =>
        val.credit_account
          ? `${val.credit_account.account_code} - ${val.credit_account.account_name}`
          : "-",
    },
    {
      key: "description",
      header: "Mô tả",
      cell: (val: any) => (
        <span className="text-sm truncate max-w-[200px] inline-block">
          {val.description}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Trạng thái",
      cell: (val: any) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            val.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {val.is_active ? "Hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      title="Cấu hình Tài khoản Kế toán"
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            activeCount={filterPanel.activeFilterCount}
            onClick={filterPanel.togglePanel}
          />
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-fg rounded-md text-sm font-medium hover:opacity-90"
            onClick={() => {
              setEditingId(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Cấu hình</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 h-full">
        <FilterPanel config={filterConfig} filter={filterPanel} />

        <div className="flex-1 bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <DataTable
            columns={columns}
            items={items}
            getRowKey={(item: any) => item.id}
            emptyLabel="Không có cấu hình nào"
            loading={listQuery.isFetching}
            page={store.page}
            pageSize={store.pageSize}
            total={total}
            totalPages={totalPages}
            onPage={store.setPage}
            onPageSize={store.setPageSize}
            onRowClick={(row: any) => {
              setEditingId(row.id);
              setModalOpen(true);
            }}
          />
        </div>
      </div>

      <AccountingConfigFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        configId={editingId}
      />
    </PageLayout>
  );
}
