import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { DataTable } from "@/shared/components/DataTable";
import { useAccountingJournalListStore } from "@/modules/accounting/hooks/useAccountingJournalListStore";
import { useAccountingJournalListQuery } from "@/modules/accounting/hooks/useAccountingJournalListQuery";
import { JournalEntryFormModal } from "@/modules/accounting/components/JournalEntryFormModal";
import { JournalEntryDetailModal } from "@/modules/accounting/components/JournalEntryDetailModal";
import { money } from "@/shared/utils/format";

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

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
    null,
  );

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
      key: "voucher_no",
      title: "Số chứng từ",
      render: (val: string, row: any) => (
        <span className="font-semibold text-primary cursor-pointer hover:underline">
          {val}
        </span>
      ),
    },
    {
      key: "date",
      title: "Ngày hạch toán",
      render: (val: string) => {
        if (!val) return "";
        try {
          return format(new Date(val), "dd/MM/yyyy");
        } catch {
          return val;
        }
      },
    },
    {
      key: "description",
      title: "Diễn giải",
      render: (val: string) => (
        <span className="text-sm truncate max-w-[300px] inline-block">
          {val}
        </span>
      ),
    },
    {
      key: "total_debit",
      title: "Tổng phát sinh",
      align: "right" as const,
      render: (val: number) => (
        <span className="font-medium">{money(val)}</span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            val === "POSTED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  const filterConfig = {
    search: true,
    period: true,
    status: {
      options: [
        { value: "POSTED", label: "Đã ghi sổ (POSTED)" },
        { value: "REVERSED", label: "Đã đảo (REVERSED)" },
      ],
      placeholder: "Tất cả trạng thái",
    },
  };

  return (
    <PageLayout
      title="Sổ Nhật ký chung"
      actions={
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-fg rounded-md text-sm font-medium hover:opacity-90"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu phát sinh ngoài</span>
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
          dateFrom={store.dateFrom}
          dateTo={store.dateTo}
          onDateFromChange={store.setDateFrom}
          onDateToChange={store.setDateTo}
          period={store.dateFrom ? "custom" : ""}
          onPeriodChange={(v, from, to) => {
            store.setDateFrom(from || "");
            store.setDateTo(to || "");
          }}
          status={store.statusFilter}
          onStatusChange={store.setStatusFilter}
          onReset={store.resetAllFilters}
          activeCount={
            [
              !!store.searchInput,
              !!store.statusFilter,
              !!store.dateFrom,
            ].filter(Boolean).length
          }
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
