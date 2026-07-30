import { toast } from "react-hot-toast";
import React, { useState } from "react";
import { FileText, Eye, DownloadCloud, Plus } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { formatMoney } from "@/modules/accounting/utils/journalEntryUtils";
import {
  syncSinvoiceDraftsApi,
  getSinvoiceDraftColumnOptionsApi,
  type SinvoiceDraft,
} from "@/modules/accounting/api/sinvoiceDraftApi";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";
import { SinvoiceDraftDetailWrapper } from "@/modules/accounting/components/SinvoiceDraftDetailWrapper";
import { useSinvoiceDraftsList } from "@/modules/accounting/hooks/useSinvoiceDraftsList";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";

export function ErpInvoicesDraftPage() {
  const listHook = useSinvoiceDraftsList();

  const [draftOpen, setDraftOpen] = useState(false);
  const [detailDraft, setDetailDraft] = useState<SinvoiceDraft | null>(null);

  const handleSync = async () => {
    try {
      const res = await syncSinvoiceDraftsApi();
      toast.success(`Đồng bộ thành công ${res.synced} hóa đơn nháp mới.`);
      listHook.loadDrafts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đồng bộ thất bại");
    }
  };

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    const s = listHook.tableState.sorts[0];
    if (!s) return "none";
    if (s === key) return "asc";
    if (s === `-${key}`) return "desc";
    return "none";
  };

  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    listHook.tableState.setSort(key, state);
  };

  const handleSearchChange = (key: string, val: string) => {
    listHook.tableState.setColumnSearch(key, val);
  };

  const handleFilterChange = (key: string, filters: string[]) => {
    listHook.tableState.setColumnFilter(key, filters);
  };

  const createHeaderProps = (
    key: string,
    title: string,
    align: "left" | "center" | "right" = "left",
    hideFilter = false,
  ) => ({
    title,
    columnKey: key,
    sortState: getSortState(key),
    onSortChange: (state: "asc" | "desc" | "none") =>
      handleSortChange(key, state),
    searchValue: listHook.tableState.columnSearch[key] || "",
    onSearchChange: (val: string) => handleSearchChange(key, val),
    selectedFilters: listHook.tableState.columnFilters[key] || [],
    onFilterChange: (vals: string[]) => handleFilterChange(key, vals),
    fetchOptions: async (params: {
      columnKey: string;
      search: string;
      pageParam: number;
    }) => {
      const filtersStr = Object.keys(listHook.tableState.columnFilters).length
        ? JSON.stringify(listHook.tableState.columnFilters)
        : undefined;
      const res = await getSinvoiceDraftColumnOptionsApi(
        params.columnKey,
        params.search,
        params.pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((i) => ({ label: i, value: i })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    align,
    hideFilter,
  });

  const columns: DataTableColumn<any>[] = [
    {
      key: "createdAt",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("createdAt", "Ngày tạo", "center", true)}
          hideFooter={true}
          isActive={
            !!(
              listHook.filterPanel.state.dateFrom ||
              listHook.filterPanel.state.dateTo
            )
          }
          dateRangeSlot={({ close }) => (
            <InvoiceDateRangeSlot
              dateFrom={listHook.filterPanel.state.dateFrom}
              dateTo={listHook.filterPanel.state.dateTo}
              onChange={(from, to) => {
                listHook.filterPanel.setDateFrom(from);
                listHook.filterPanel.setDateTo(to);
                listHook.setPage(1);
                close();
              }}
              onClose={close}
            />
          )}
        />
      ),
      className: "pl-6 text-[color:var(--muted-fg)] text-center",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) =>
        inv.createdAt
          ? new Date(inv.createdAt).toLocaleDateString("vi-VN")
          : "-",
    },
    {
      key: "documentNo",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("documentNo", "Mã chứng từ")}
        />
      ),
      className: "font-medium text-primary text-left",
      headerClassName: "text-center",
      size: 200,
      cell: (inv) => (
        <TableText
          text={inv.documentNo || "-"}
          enableCopy={true}
          tooltip={true}
          onDrawerClick={(e) => {
            e.stopPropagation();
            setDetailDraft(inv);
          }}
        />
      ),
    },
    {
      key: "templateCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("templateCode", "Mẫu HĐ")}
        />
      ),
      className: "font-mono text-xs",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) => (
        <TableText text={inv.responsePayload?.templateCode || "-"} />
      ),
    },
    {
      key: "invoiceSeri",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("invoiceSeri", "Ký hiệu HĐ")}
        />
      ),
      className: "font-mono text-xs",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) => (
        <TableText
          text={
            inv.responsePayload?.invoiceSeri ||
            inv.responsePayload?.invoiceSeries ||
            "-"
          }
        />
      ),
    },
    {
      key: "buyerName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerName", "Khách hàng")}
        />
      ),
      className:
        "max-w-[200px] line-clamp-2 whitespace-normal leading-tight text-left",
      headerClassName: "text-center",
      size: 250,
      cell: (inv) => <TableText text={inv.buyerName || "-"} tooltip={true} />,
    },
    {
      key: "buyerTaxCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerTaxCode", "MST")}
        />
      ),
      className: "font-mono",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) => <TableText text={inv.buyerTaxCode || "-"} />,
    },
    {
      key: "description",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("description", "Diễn giải")}
        />
      ),
      className:
        "max-w-[230px] line-clamp-2 whitespace-normal leading-tight text-left",
      headerClassName: "text-center",
      size: 300,
      cell: (inv) => <TableText text={(inv as any).description || "-"} />,
    },
    {
      key: "amountWithoutVAT",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("amountWithoutVAT", "TRƯỚC GTGT", "right")}
        />
      ),
      className: "text-right font-mono",
      size: 130,
      cell: (inv) =>
        formatMoney(Number(inv.totalAmount || 0) - Number(inv.vatAmount || 0)),
    },
    {
      key: "vatRate",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("vatRate", "THUẾ SUẤT", "right")}
        />
      ),
      className: "text-right font-mono",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) => {
        // Mặc định lấy từ listProduct item đầu tiên nếu có, nếu không thì hiển thị "-"
        try {
          const lpStr = inv.responsePayload?.listProduct;
          const parsedLp = lpStr
            ? typeof lpStr === "string"
              ? JSON.parse(lpStr)
              : lpStr
            : null;
          const items = parsedLp?.itemInfo || [];
          const validItem = items.find(
            (i: any) => i.vatPercentage != null && i.vatPercentage !== "",
          );
          if (validItem) {
            return `${validItem.vatPercentage}%`;
          }
        } catch {
          // ignore
        }
        return "—";
      },
    },
    {
      key: "vatAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("vatAmount", "THUẾ GTGT", "right")}
        />
      ),
      className: "text-right font-mono",
      size: 130,
      cell: (inv) => formatMoney(inv.vatAmount),
    },
    {
      key: "discountAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("discountAmount", "CHIẾT KHẤU", "right")}
        />
      ),
      className: "text-right font-mono",
      size: 120,
      cell: () => "—",
    },
    {
      key: "totalAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("totalAmount", "THÀNH TIỀN", "right")}
        />
      ),
      className: "text-right font-mono font-semibold",
      size: 130,
      cell: (inv) => formatMoney(inv.totalAmount),
    },
    {
      key: "currency",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("currency", "Loại tiền", "center")}
        />
      ),
      className: "text-center",
      size: 100,
      cell: (inv) => (
        <TableText
          text={inv.responsePayload?.currencyCode || "VND"}
          className="justify-center"
        />
      ),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title="Hóa đơn nháp"
        desc="Quản lý danh sách hóa đơn điện tử nháp"
        icon={<FileText className="h-5 w-5" />}
        tableId="erp-invoices-draft-table"
        items={listHook.drafts}
        columns={columns}
        getRowKey={(r) => r.id}
        loading={listHook.loading}
        emptyLabel="Chưa có hóa đơn nháp nào."
        minWidth={1000}
        defaultColumnOrder={["__selection", "__actions"]}
        rowActions={(inv) => {
          return [
            {
              groupLabel: "TRA CỨU",
              items: [
                {
                  label: "Chi tiết",
                  icon: <Eye className="w-3.5 h-3.5" />,
                  onClick: () => setDetailDraft(inv as any),
                },
              ],
            },
          ];
        }}
        // Sorting / Pagination
        sortArray={listHook.tableState.sorts}
        onSort={(key: string) => {
          const currentSort = listHook.tableState.sorts[0];
          if (currentSort === key) {
            listHook.tableState.setSort(key, "desc");
          } else if (currentSort === `-${key}`) {
            listHook.tableState.setSort(key, "none");
          } else {
            listHook.tableState.setSort(key, "asc");
          }
        }}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p: number) => listHook.setPage(p)}
        onPageSize={(s: number) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={listHook.loadDrafts}
        customActionsNode={
          <div className="flex items-center gap-2">
            <ActionDropdown
              customTrigger={<Button variant="outline">Thao tác</Button>}
              items={[
                {
                  label: "Tạo HĐ nháp",
                  icon: <Plus className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setDraftOpen(true),
                },
                {
                  label: "Đồng bộ",
                  icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
                  onClick: handleSync,
                },
              ]}
            />
          </div>
        }
      />

      {draftOpen && (
        <SinvoiceDraftModal
          open={draftOpen}
          onClose={() => setDraftOpen(false)}
          onSaved={() => {
            setDraftOpen(false);
            listHook.loadDrafts();
          }}
        />
      )}

      {detailDraft && (
        <SinvoiceDraftDetailWrapper
          draft={detailDraft}
          onClose={() => setDetailDraft(null)}
        />
      )}
    </>
  );
}
