import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, BookText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useAccountingJournalListStore } from "@/modules/accounting/hooks/useAccountingJournalListStore";
import { useAccountingJournalListQuery } from "@/modules/accounting/hooks/useAccountingJournalListQuery";
import { JournalEntryFormModal } from "@/modules/accounting/components/JournalEntryFormModal";
import { JournalEntryDetailModal } from "@/modules/accounting/components/JournalEntryDetailModal";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { money } from "@/shared/utils/format";
import type { ErpJournalEntry } from "@/modules/accounting/api/accountingApi";

export function ErpAccountingJournalPage() {
  const page = useAccountingJournalListStore((s) => s.page);
  const pageSize = useAccountingJournalListStore((s) => s.pageSize);
  const search = useAccountingJournalListStore((s) => s.search);
  const statusFilter = useAccountingJournalListStore((s) => s.statusFilter);
  const dateFrom = useAccountingJournalListStore((s) => s.dateFrom);
  const dateTo = useAccountingJournalListStore((s) => s.dateTo);
  const setPage = useAccountingJournalListStore((s) => s.setPage);
  const setPageSize = useAccountingJournalListStore((s) => s.setPageSize);
  const setSearch = useAccountingJournalListStore((s) => s.setSearch);
  const setStatusFilter = useAccountingJournalListStore(
    (s) => s.setStatusFilter,
  );
  const setDateFrom = useAccountingJournalListStore((s) => s.setDateFrom);
  const setDateTo = useAccountingJournalListStore((s) => s.setDateTo);

  const listQuery = useAccountingJournalListQuery({
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
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
    setPage(1);
  });

  // Sync filterPanel state back to store
  useEffect(() => {
    setSearch(filterPanel.state.search);
    setDateFrom(filterPanel.state.dateFrom);
    setDateTo(filterPanel.state.dateTo);
    setStatusFilter(filterPanel.state.status);
  }, [
    filterPanel.state.search,
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    filterPanel.state.status,
    setSearch,
    setDateFrom,
    setDateTo,
    setStatusFilter,
  ]);

  const items = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const columns: DataTableColumn<ErpJournalEntry>[] = [
    {
      key: "voucher_no",
      header: "Số chứng từ",
      cell: (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const voucherNo = item.voucher_no || (item as any).voucherNo;
        return (
          <span className="font-semibold text-primary cursor-pointer hover:underline">
            {voucherNo}
          </span>
        );
      },
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
      key: "debit_accounts",
      header: "TK Nợ",
      cell: (item) => {
        const debitLines = item.lines?.filter((l) => l.debit > 0) || [];
        const accounts = debitLines
          .map((l) => l.account?.account_code || "")
          .filter(Boolean);
        return (
          <span className="font-medium text-sm">
            {Array.from(new Set(accounts)).join(", ")}
          </span>
        );
      },
    },
    {
      key: "credit_accounts",
      header: "TK Có",
      cell: (item) => {
        const creditLines = item.lines?.filter((l) => l.credit > 0) || [];
        const accounts = creditLines
          .map((l) => l.account?.account_code || "")
          .filter(Boolean);
        return (
          <span className="font-medium text-sm">
            {Array.from(new Set(accounts)).join(", ")}
          </span>
        );
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
      cell: (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalDebit = item.total_debit ?? (item as any).totalDebit ?? 0;
        return <span className="font-medium">{money(totalDebit)}</span>;
      },
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
      desc="Xem báo cáo nhật ký chung và sổ cái"
      icon={<BookText className="w-5 h-5" />}
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
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <DataTable
            columns={columns}
            items={items}
            getRowKey={(item) => item.id}
            emptyLabel="Không có bút toán nào"
            loading={listQuery.isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={setPageSize}
            actionsColumn={{
              header: "",
              cell: (item) => (
                <ActionDropdown
                  items={[
                    {
                      label: "Xem chi tiết",
                      icon: <BookText className="w-4 h-4" />,
                      onClick: () => {
                        setSelectedJournalId(item.id);
                        setDetailModalOpen(true);
                      },
                    },
                  ]}
                />
              ),
            }}
            onRowClick={(row) => {
              setSelectedJournalId(row.id);
              setDetailModalOpen(true);
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filterPanel} />
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
