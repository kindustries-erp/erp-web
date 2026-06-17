import React, { useEffect, useMemo, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useAccountingConfigListStore } from "@/modules/accounting/hooks/useAccountingConfigListStore";
import { useAccountingConfigListQuery } from "@/modules/accounting/hooks/useAccountingConfigListQuery";
import { AccountingConfigFormModal } from "@/modules/accounting/components/AccountingConfigFormModal";
import type { ErpAccountingConfig } from "@/modules/accounting/api/accountingApi";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { TKTab } from "@/modules/settings/components/ChartOfAccountsTab";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabKey = "chart-of-accounts" | "accounting-config";

const TABS: { value: TabKey; label: string }[] = [
  { value: "chart-of-accounts", label: "Danh mục tài khoản" },
  { value: "accounting-config", label: "Cấu hình hạch toán" },
];

// ─── Tab: Cấu hình hạch toán ─────────────────────────────────────────────────
export function AccountingConfigTab({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (v: string) => void;
}) {
  const page = useAccountingConfigListStore((s) => s.page);
  const pageSize = useAccountingConfigListStore((s) => s.pageSize);
  const search = useAccountingConfigListStore((s) => s.search);
  const setPage = useAccountingConfigListStore((s) => s.setPage);
  const setPageSize = useAccountingConfigListStore((s) => s.setPageSize);
  const setSearch = useAccountingConfigListStore((s) => s.setSearch);

  const listQuery = useAccountingConfigListQuery({
    page,
    pageSize,
    search: search || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: accountingApi.deleteConfig,
    onSuccess: () => {
      toast.success("Đã xóa cấu hình thành công");
      queryClient.invalidateQueries({ queryKey: ["accounting-configs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa cấu hình");
    },
  });

  const filterConfig = useMemo(() => ({ search: true }), []);
  const filterPanel = useFilterPanel(filterConfig, () => setPage(1));

  useEffect(() => {
    setSearch(filterPanel.state.search);
  }, [filterPanel.state.search, setSearch]);

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const columns: DataTableColumn<ErpAccountingConfig>[] = [
    {
      key: "module",
      header: "Phân hệ",
      cell: (val) => (
        <span className="font-semibold uppercase">{val.module}</span>
      ),
    },

    {
      key: "debit_account",
      header: "Tài khoản Nợ",
      cell: (val) =>
        val.debit_account
          ? `${val.debit_account.account_code} - ${val.debit_account.account_name}`
          : "—",
    },
    {
      key: "credit_account",
      header: "Tài khoản Có",
      cell: (val) =>
        val.credit_account
          ? `${val.credit_account.account_code} - ${val.credit_account.account_name}`
          : "—",
    },
    {
      key: "description",
      header: "Mô tả",
      cell: (val) => (
        <span className="text-sm truncate max-w-[200px] inline-block">
          {val.description || "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Trạng thái",
      cell: (val) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            val.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {val.is_active ? "Hoạt động" : "Ngưng"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (val) => (
        <ActionDropdown
          items={[
            {
              label: "Xóa",
              variant: "danger",
              onClick: () => {
                if (window.confirm("Bạn có chắc chắn muốn xóa cấu hình này?")) {
                  deleteMutation.mutate(val.id);
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageLayout
      title="Thiết lập kế toán"
      desc="Danh mục tài khoản và cấu hình hạch toán tự động"
      icon={<Settings2 className="w-5 h-5" />}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            activeCount={filterPanel.activeFilterCount}
            onClick={filterPanel.togglePanel}
          />
          <button
            id="btn-create-accounting-config"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-fg rounded-md text-sm font-medium hover:opacity-90"
            onClick={() => {
              setEditingId(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tạo cấu hình</span>
          </button>
        </div>
      }
    >
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <DataTable
            columns={columns}
            items={items}
            getRowKey={(item) => item.id}
            emptyLabel="Không có cấu hình nào"
            loading={listQuery.isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={setPageSize}
            onRowClick={(row) => {
              setEditingId(row.id);
              setModalOpen(true);
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filterPanel} />
      </div>

      <AccountingConfigFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        configId={editingId}
      />
    </PageLayout>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ErpAccountingSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("chart-of-accounts");

  if (activeTab === "chart-of-accounts") {
    return (
      <TKTab
        activeTab={activeTab}
        onTabChange={(v: string) => setActiveTab(v as TabKey)}
      />
    );
  }
  return (
    <AccountingConfigTab
      activeTab={activeTab}
      onTabChange={(v: string) => setActiveTab(v as TabKey)}
    />
  );
}
