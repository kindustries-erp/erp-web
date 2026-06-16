import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useAccountingJournalListStore } from "@/modules/accounting/hooks/useAccountingJournalListStore";
import { useAccountingJournalListQuery } from "@/modules/accounting/hooks/useAccountingJournalListQuery";
import { JournalEntryFormModal } from "@/modules/accounting/components/JournalEntryFormModal";
import { JournalEntryDetailModal } from "@/modules/accounting/components/JournalEntryDetailModal";
import { money } from "@/shared/utils/format";
import type { ErpJournalEntry } from "@/modules/accounting/api/accountingApi";

export function ErpAccountingJournalPage() {
  const store = useAccountingJournalListStore();
  const listQuery = useAccountingJournalListQuery({
    page: store.page,
    pageSize: store.pageSize,
    search: store.search || undefined,
    status: store.statusFilter || undefined,
    date_from: store.dateFrom || undefined,
    date_to: store.dateTo || undefined,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
    null,
  );

  const filterConfig = useMemo(
    () => ({
      search: true,
      period: true,
      status: {
        options: [
          { value: "POSTED", label: "Đã ghi sổ (POSTED)" },
          { value: "REVERSED", label: "Đã đảo (REVERSED)" },
        ],
        placeholder: "Tất cả trạng thái",
      },
    }),
    [],
  );

  const filterPanel = useFilterPanel(filterConfig, () => {
    store.setPage(1);
  });

  // Sync filterPanel state back to store
  useEffect(() => {
    store.setSearch(filterPanel.state.search);
    store.setDateFrom(filterPanel.state.dateFrom);
    store.setDateTo(filterPanel.state.dateTo);
    store.setStatusFilter(filterPanel.state.status);
  }, [
    filterPanel.state.search,
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    filterPanel.state.status,
    store,
  ]);

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const columns: DataTableColumn<ErpJournalEntry>[] = [
    {
      key: "voucher_no",
      header: "Số chứng từ",
      cell: (item) => (
        <span className="font-semibold text-primary cursor-pointer hover:underline">
          {item.voucher_no}
        </span>
      ),
    },
    {
      key: "date",
      header: "Ngày hạch toán",
      cell: (item) => {
        if (!item.date) return "";
        try {
          return format(new Date(item.date), "dd/MM/yyyy");
        } catch {
          return item.date;
        }
      },
    },
    {
      key: "description",
      header: "Diễn giải",
      cell: (item) => (
        <span className="text-sm truncate max-w-[300px] inline-block">
          {item.description}
        </span>
      ),
    },
    {
      key: "total_debit",
      header: "Tổng phát sinh",
      className: "text-right",
      headerClassName: "text-right",
      cell: (item) => (
        <span className="font-medium">{money(item.total_debit)}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            item.status === "POSTED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      title="Sổ Nhật ký chung"
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            activeCount={filterPanel.activeFilterCount}
            onClick={filterPanel.togglePanel}
          />
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-fg rounded-md text-sm font-medium hover:opacity-90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu phát sinh ngoài</span>
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
            getRowKey={(item) => item.id}
            emptyLabel="Không có bút toán nào"
            loading={listQuery.isFetching}
            page={store.page}
            pageSize={store.pageSize}
            total={total}
            totalPages={totalPages}
            onPage={store.setPage}
            onPageSize={store.setPageSize}
            onRowClick={(row) => {
              setSelectedJournalId(row.id);
              setDetailModalOpen(true);
            }}
          />
        </div>
      </div>

      <JournalEntryFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <JournalEntryDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        journalId={selectedJournalId}
      />
    </PageLayout>
  );
}
