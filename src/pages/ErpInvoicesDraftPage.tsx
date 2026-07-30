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
      alert(`Đồng bộ thành công ${res.synced} hóa đơn nháp mới.`);
      listHook.loadDrafts();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Đồng bộ thất bại");
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
      size: 100,
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
      size: 100,
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
      className: "truncate",
      size: 250,
      cell: (inv) => (
        <TableText
          text={inv.buyerName || "-"}
          tooltip={true}
          className="line-clamp-2 whitespace-normal leading-tight max-w-[230px]"
        />
      ),
    },
    {
      key: "buyerTaxCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerTaxCode", "Mã số thuế")}
        />
      ),
      className: "font-mono",
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
      className: "max-w-[300px] truncate",
      size: 300,
      cell: (inv) => (
        <TableText
          text={(inv as any).description || "-"}
          popoverContent={(() => {
            try {
              const lpStr = inv.responsePayload?.listProduct;
              const parsedLp = lpStr
                ? typeof lpStr === "string"
                  ? JSON.parse(lpStr)
                  : lpStr
                : null;
              const items = parsedLp?.itemInfo || [];

              if (items.length > 0) {
                return (
                  <div className="p-3 max-h-[300px] max-w-[800px] max-w-[90vw] overflow-auto">
                    <h4 className="font-semibold text-sm mb-2 text-slate-800">
                      Chi tiết mặt hàng
                    </h4>
                    <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium">
                            Tên mặt hàng
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            SL
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-left">
                            ĐVT
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            Đơn giá
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            Thành tiền trước thuế
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            Thuế suất
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            Thuế VAT
                          </th>
                          <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item: any, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b last:border-0 hover:bg-slate-50"
                          >
                            <td className="px-2 py-1 whitespace-normal break-words max-w-[200px]">
                              {item.itemName || "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.quantity != null
                                ? formatMoney(item.quantity)
                                : "-"}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              {item.unitName || "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.unitPrice != null
                                ? formatMoney(item.unitPrice)
                                : "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.itemTotalAmountWithoutVat != null
                                ? formatMoney(item.itemTotalAmountWithoutVat)
                                : "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.vatPercentage != null
                                ? `${item.vatPercentage}%`
                                : "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.vatAmount != null
                                ? formatMoney(item.vatAmount)
                                : "-"}
                            </td>
                            <td className="px-2 py-1 text-right whitespace-nowrap">
                              {item.itemTotalAmountWithVat != null
                                ? formatMoney(item.itemTotalAmountWithVat)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 sticky bottom-0 font-semibold">
                        <tr>
                          <td
                            className="px-2 py-2 text-right text-slate-800"
                            colSpan={4}
                          >
                            Tổng cộng
                          </td>
                          <td className="px-2 py-2 text-right text-slate-800">
                            {formatMoney(
                              items.reduce(
                                (acc: number, item: any) =>
                                  acc +
                                  (Number(item.itemTotalAmountWithoutVat) || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-2 py-2 text-right" colSpan={2}>
                            {formatMoney(
                              items.reduce(
                                (acc: number, item: any) =>
                                  acc + (Number(item.vatAmount) || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td className="px-2 py-2 text-right text-slate-800">
                            {formatMoney(
                              items.reduce(
                                (acc: number, item: any) =>
                                  acc +
                                  (Number(item.itemTotalAmountWithVat) || 0),
                                0,
                              ),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              }
            } catch (e) {
              console.error("Lỗi parse listProduct:", e);
            }

            return (
              <div className="p-3 text-sm max-w-[300px] whitespace-pre-wrap">
                {(inv as any).description || "Không có diễn giải chi tiết"}
              </div>
            );
          })()}
        />
      ),
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
      size: 100,
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
