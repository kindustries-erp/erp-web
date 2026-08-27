import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { FileText, Eye, DownloadCloud, Settings } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatGMT7 } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { useUIStore } from "@/core/config/uiStore";
import { formatMoney } from "@/modules/accounting/utils/journalEntryUtils";
import { normalizeOutInvoiceLineDisplay } from "@/modules/erp-invoices-core/utils/outInvoiceDisplay";
import {
  syncSinvoiceDraftsApi,
  getSinvoiceDraftColumnOptionsApi,
  type SinvoiceDraft,
} from "@/modules/accounting/api/sinvoiceDraftApi";
import { SinvoiceDraftModal } from "@/modules/accounting/components/SinvoiceDraftModal";
import { SinvoiceDraftDetailWrapper } from "@/modules/accounting/components/SinvoiceDraftDetailWrapper";
import { SinvoiceConfigDrawer } from "@/modules/accounting/components/SinvoiceConfigDrawer";
import { useSinvoiceDraftsList } from "@/modules/accounting/hooks/useSinvoiceDraftsList";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";

export function ErpInvoicesDraftPage() {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission("invoices", "update");
  const listHook = useSinvoiceDraftsList();

  const [draftOpen, setDraftOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [detailDraft, setDetailDraft] = useState<SinvoiceDraft | null>(null);
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);

  const handleSync = async () => {
    try {
      setGlobalLoading(true);
      const res = await syncSinvoiceDraftsApi();
      if (res.changed) {
        toast.success(
          t("sinvoiceDraft.syncSuccess", {
            added: res.added,
            removed: res.removed,
            synced: res.synced,
          }),
        );
      }
      listHook.loadDrafts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("sinvoiceDraft.syncFail"));
    } finally {
      setGlobalLoading(false);
    }
  };

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    const s = listHook.tableState.sorts[0];
    if (!s) return "none";
    if (s === key) return "asc";
    if (s === `-${key}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    key: string,
    direction: "asc" | "desc" | "none",
  ) => {
    listHook.tableState.setSort(key, direction);
  };

  const handleSearchChange = (key: string, search: string) => {
    listHook.tableState.setColumnSearch(key, search);
  };

  const handleFilterChange = (key: string, filters: string[]) => {
    listHook.tableState.setColumnFilter(key, filters);
  };

  const formatAmtOption = (val: string | number) => {
    const n = Number(val || 0);
    if (isNaN(n)) return String(val);
    return n.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

      const isMoney = [
        "amountWithoutVAT",
        "vatAmount",
        "discountAmount",
        "totalAmount",
      ].includes(key);
      const searchStr = isMoney
        ? params.search.replace(/[,.]/g, "")
        : params.search;

      const res = await getSinvoiceDraftColumnOptionsApi(
        params.columnKey,
        searchStr,
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
      className: "pl-6 text-center",
      headerClassName: "text-center",
      size: 140,
      cell: (inv) => {
        const dStr = inv.responsePayload?.createdDate || inv.createdAt;
        if (!dStr) return "-";
        const d = new Date(dStr);
        const datePart = d.toLocaleDateString("vi-VN");
        const timePart = d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return (
          <Tooltip content={formatGMT7(dStr, "datetime-sec")}>
            <div className="cursor-help inline-flex flex-row items-baseline gap-1.5 whitespace-nowrap leading-tight">
              <span className="text-sm text-gray-900">{datePart}</span>
              <span className="text-xs text-gray-500">{timePart}</span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "documentNo",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("documentNo", "Mã chứng từ", "center")}
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
          onDetailClick={(e) => {
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
          {...createHeaderProps("templateCode", "Mẫu HĐ", "center")}
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
          {...createHeaderProps("invoiceSeri", "Ký hiệu HĐ", "center")}
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
      key: "buyerPersonName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerPersonName", "Tên người mua", "center")}
        />
      ),
      className: "text-left text-xs",
      headerClassName: "text-center",
      size: 150,
      cell: (inv) => (
        <TableText
          text={inv.responsePayload?.buyerName || "-"}
          tooltip={true}
          textClassName="line-clamp-2 whitespace-normal break-words"
        />
      ),
    },
    {
      key: "buyerName",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerName", "Tên đơn vị", "center")}
        />
      ),
      className: "text-left",
      headerClassName: "text-center",
      size: 250,
      cell: (inv) => (
        <TableText
          text={inv.buyerName || "-"}
          tooltip={true}
          textClassName="line-clamp-2 whitespace-normal leading-tight break-words"
        />
      ),
    },
    {
      key: "buyerTaxCode",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("buyerTaxCode", "MST", "center")}
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
          {...createHeaderProps("description", "Diễn giải", "center")}
        />
      ),
      className: "text-left",
      headerClassName: "text-center",
      size: 300,
      cell: (inv) => {
        let items: any[] = [];
        try {
          if (
            (inv as any).lines &&
            Array.isArray((inv as any).lines) &&
            (inv as any).lines.length > 0
          ) {
            items = (inv as any).lines;
          } else {
            const lpStr =
              (inv as any).listProduct ||
              (inv as any).responsePayload?.listProduct;
            const parsedLp = lpStr
              ? typeof lpStr === "string"
                ? JSON.parse(lpStr)
                : lpStr
              : null;
            items = parsedLp?.itemInfo || [];
          }
        } catch (e) {
          console.error("Lỗi parse dữ liệu mặt hàng:", e);
        }

        const fmtAmt = (val: string | number | null | undefined) => {
          if (val == null) return "—";
          const n = Number(val);
          if (isNaN(n)) return "—";
          return (
            n.toLocaleString("vi-VN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + " đ"
          );
        };

        const popoverContent = (
          <div className="p-3 max-h-[350px] w-[850px] max-w-[90vw] overflow-auto">
            <h4 className="font-semibold text-sm mb-2 text-slate-800">
              Chi tiết mặt hàng
            </h4>
            {items.length > 0 ? (
              (() => {
                const descriptionLineCount = String(inv.description || "")
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean).length;
                const invoiceLineCount = Math.max(
                  items.length,
                  descriptionLineCount,
                  1,
                );
                const displayItems = items.map((item: any) =>
                  normalizeOutInvoiceLineDisplay(
                    item,
                    inv.buyerTaxCode,
                    "OUT",
                    invoiceLineCount,
                  ),
                );

                return (
                  <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-100/60 sticky top-0 backdrop-blur-sm">
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
                      {displayItems.map((item: any, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-2 py-1 whitespace-normal break-words max-w-[200px]">
                            {item.description || item.itemName || "—"}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {item.quantity != null
                              ? Number(item.quantity).toLocaleString("vi-VN", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                })
                              : "—"}
                          </td>
                          <td className="px-2 py-1 text-left whitespace-nowrap">
                            {item.unit || item.unitName || "—"}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {fmtAmt(item.unitPrice)}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap font-medium">
                            {fmtAmt(item.preVatAmount)}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {item.vatPercentage != null
                              ? `${Number(item.vatPercentage).toFixed(0)}%`
                              : "—"}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {fmtAmt(item.vatAmount)}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap font-semibold text-slate-800">
                            {fmtAmt(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-footer-glass sticky bottom-0 border-t border-border shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
                      <tr>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          Tổng cộng
                        </td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          {displayItems
                            .reduce(
                              (acc: number, item: any) =>
                                acc + (Number(item.quantity) || 0),
                              0,
                            )
                            .toLocaleString("vi-VN", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                        </td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          {fmtAmt(
                            displayItems.reduce(
                              (acc: number, item: any) =>
                                acc + (Number(item.preVatAmount) || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          {fmtAmt(
                            displayItems.reduce(
                              (acc: number, item: any) =>
                                acc + (Number(item.vatAmount) || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-800">
                          {fmtAmt(
                            displayItems.reduce(
                              (acc: number, item: any) =>
                                acc + (Number(item.totalAmount) || 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                );
              })()
            ) : (
              <div className="text-slate-500 text-sm italic">
                Không có chi tiết mặt hàng.
              </div>
            )}
          </div>
        );

        return (
          <TableText
            text={((inv as any).description || "-").replace(/\\n/g, " ")}
            tooltip={true}
            textClassName="line-clamp-2 break-words whitespace-normal text-slate-700"
            popoverContent={popoverContent}
          />
        );
      },
    },
    {
      key: "discountAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("discountAmount", "CHIẾT KHẤU", "center")}
          formatOptionLabel={formatAmtOption}
        />
      ),
      className: "text-right font-mono",
      headerClassName: "text-center",
      size: 130,
      cell: (inv) => formatMoney(Number(inv.discountAmount || 0)),
    },
    {
      key: "amountWithoutVAT",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("amountWithoutVAT", "TRƯỚC GTGT", "center")}
          formatOptionLabel={formatAmtOption}
        />
      ),
      className: "text-right font-mono",
      headerClassName: "text-center",
      size: 130,
      cell: (inv) =>
        formatMoney(Number(inv.totalAmount || 0) - Number(inv.vatAmount || 0)),
    },
    {
      key: "vatRate",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("vatRate", "THUẾ SUẤT", "center")}
        />
      ),
      className: "text-right font-mono",
      headerClassName: "text-center",
      size: 120,
      cell: (inv) => {
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
          // ignore parsing error
        }
        return "—";
      },
    },
    {
      key: "vatAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("vatAmount", "THUẾ GTGT", "center")}
          formatOptionLabel={formatAmtOption}
        />
      ),
      className: "text-right font-mono",
      headerClassName: "text-center",
      size: 130,
      cell: (inv) => formatMoney(Number(inv.vatAmount || 0)),
    },
    {
      key: "totalAmount",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("totalAmount", "THÀNH TIỀN", "center")}
          formatOptionLabel={formatAmtOption}
        />
      ),
      className: "text-right font-mono text-slate-800 font-semibold",
      headerClassName: "text-center",
      size: 130,
      cell: (inv) => formatMoney(Number(inv.totalAmount || 0)),
    },
    {
      key: "currency",
      header: (
        <TableColumnHeaderFilter
          {...createHeaderProps("currency", "Loại tiền", "center", true)}
        />
      ),
      className: "text-center",
      headerClassName: "text-center",
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
        createLabel="Tạo HĐ nháp"
        onCreate={() => setDraftOpen(true)}
        createActions={[
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: "Xuất Excel",
                icon: <FileText className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  alert("Tính năng đang phát triển");
                },
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
              {
                label: "Đồng bộ",
                icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
                onClick: handleSync,
              },
              ...(canEditInvoice
                ? [
                    {
                      label: t("sinvoiceDraft.config", "Cấu hình SInvoice"),
                      icon: <Settings className="w-4 h-4 text-primary" />,
                      onClick: () => setConfigDrawerOpen(true),
                    },
                  ]
                : []),
            ],
          },
        ]}
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

      <SinvoiceConfigDrawer
        open={configDrawerOpen}
        onClose={() => setConfigDrawerOpen(false)}
      />
    </>
  );
}
