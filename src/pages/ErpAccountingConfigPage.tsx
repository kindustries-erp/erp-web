import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { DataTable } from "@/shared/components/DataTable";
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

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      store.setSearch(store.searchInput);
    }, 300);
    return () => clearTimeout(id);
  }, [store.searchInput, store.setSearch]);

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const columns = [
    {
      key: "module",
      title: "Phân hệ",
      render: (val: string) => (
        <span className="font-semibold uppercase">{val}</span>
      ),
    },
    {
      key: "action",
      title: "Hành động (Action)",
      render: (val: string) => <span className="uppercase">{val}</span>,
    },
    {
      key: "debit_account",
      title: "Tài khoản Nợ",
      render: (val: any) =>
        val ? `${val.account_code} - ${val.account_name}` : "-",
    },
    {
      key: "credit_account",
      title: "Tài khoản Có",
      render: (val: any) =>
        val ? `${val.account_code} - ${val.account_name}` : "-",
    },
    {
      key: "description",
      title: "Mô tả",
      render: (val: string) => (
        <span className="text-sm truncate max-w-[200px] inline-block">
          {val}
        </span>
      ),
    },
    {
      key: "is_active",
      title: "Trạng thái",
      render: (val: boolean) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            val ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {val ? "Hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
  ];

  const filterConfig = {
    search: true,
  };

  return (
    <PageLayout
      title="Cấu hình Tài khoản Kế toán"
      actions={
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
      }
    >
      <div className="flex flex-col gap-4 h-full">
        <FilterPanel
          config={filterConfig}
          open={filterPanelOpen}
          onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
          search={store.searchInput}
          onSearchChange={store.setSearchInput}
          onReset={store.resetAllFilters}
          activeCount={[!!store.searchInput].filter(Boolean).length}
        />

        <div className="flex-1 bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <DataTable
            columns={columns}
            data={items}
            loading={listQuery.isFetching}
            page={store.page}
            pageSize={store.pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={store.setPage}
            onPageSizeChange={store.setPageSize}
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
