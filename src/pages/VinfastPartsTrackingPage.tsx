import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import api from "@/core/api/axiosInstance";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { FileText, Eye, Download, Info, Loader2 } from "lucide-react";
import { Popover } from "@/core/components/ui/Popover";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
// import { Button } from "@/shared/components/ui/Button";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { ErpInvoiceInternalInfo } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoiceFormItems } from "@/modules/erp-invoices-core/components/ErpInvoiceFormItems";
import { ErpInvoiceFormGeneral } from "@/modules/erp-invoices-core/components/ErpInvoiceFormGeneral";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";

interface VinfastPartTrackingRow {
  itemCode: string;
  itemName: string;
  month: string;
  qtyBought: number;
  qtySold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  margin: number;
  marginPct: string;
  buyInvoiceIds: string[];
  sellInvoiceIds: string[];
}

function VinfastPartDetailDrawer({
  open,
  onClose,
  itemCode,
  itemName,
  month,
}: {
  open: boolean;
  onClose: () => void;
  itemCode: string;
  itemName: string;
  month: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["vinfast-parts-details", itemCode, month],
    enabled: open && !!itemCode && !!month,
    queryFn: async () => {
      const dateFrom = `${month}-01`;
      // Calculate end of month (e.g. 2026-03-31)
      const [y, m] = month.split("-");
      const d = new Date(parseInt(y), parseInt(m), 0).getDate();
      const dateTo = `${month}-${d}`;

      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom,
          dateTo,
          itemCode,
        },
      });
      return res.data;
    },
  });

  const columns: DataTableColumn<any>[] = [
    { key: "invoiceDate", header: "Ngày HĐ", size: 100 },
    { key: "invoiceNo", header: "Số HĐ", size: 100 },
    {
      key: "partnerName",
      header: "Đối tác",
      size: 200,
      cell: (row) => (
        <Tooltip content={row.partnerName || ""}>
          <div
            className="whitespace-normal break-words w-full truncate max-w-[200px]"
            title={row.partnerName || ""}
          >
            {row.partnerName || "—"}
          </div>
        </Tooltip>
      ),
    },
    { key: "unit", header: "ĐVT", size: 80 },
    {
      key: "qty",
      header: "Số lượng",
      size: 100,
      className: "text-right font-medium",
      cell: (row) =>
        Number(row.qty).toLocaleString("vi-VN", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
    },
    {
      key: "unitPrice",
      header: "Đơn giá",
      size: 120,
      className: "text-right",
      cell: (row) => money(row.unitPrice),
    },
    {
      key: "vatAmount",
      header: "Thuế VAT",
      size: 120,
      className: "text-right",
      cell: (row) => money(row.vatAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      size: 140,
      className: "text-right font-medium text-emerald-700",
      cell: (row) => money(row.totalAmount),
    },
  ];

  const buyData = data?.filter((r: any) => r.direction === "IN") || [];
  const sellData = data?.filter((r: any) => r.direction === "OUT") || [];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Chi tiết mã phụ tùng"
      subtitle={`${itemCode} - ${itemName}`}
      icon={<Info className="w-5 h-5 text-blue-600" />}
      panelClassName="w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]"
    >
      <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Hóa đơn Mua vào
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {buyData.length}
            </span>
          </h3>
          <StandardTable
            columns={columns as any}
            items={buyData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => `${row.invoiceNo}-${row.direction}`}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            Hóa đơn Bán ra
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {sellData.length}
            </span>
          </h3>
          <StandardTable
            columns={columns as any}
            items={sellData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => `${row.invoiceNo}-${row.direction}`}
          />
        </div>
      </div>
    </DrawerModal>
  );
}

function PriceWithInvoicePopover({
  price,
  itemCode,
  month,
  direction,
  onOpenInvoice,
}: {
  price: number;
  itemCode: string;
  month: string;
  direction: "IN" | "OUT";
  onOpenInvoice?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["vinfast-parts-details", itemCode, month],
    enabled: open && !!itemCode && !!month,
    queryFn: async () => {
      const dateFrom = `${month}-01`;
      const [y, m] = month.split("-");
      const d = new Date(parseInt(y), parseInt(m), 0).getDate();
      const dateTo = `${month}-${d}`;

      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom,
          dateTo,
          itemCode,
        },
      });
      return res.data;
    },
  });

  const filteredData =
    data?.filter((r: any) => r.direction === direction) || [];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="center"
      glass
      content={
        <div className="p-3 w-[500px] max-h-[400px] overflow-auto text-sm text-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center h-20 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center text-gray-500 p-2">
              Không có hóa đơn
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 font-semibold">Ngày HĐ</th>
                  <th className="py-1.5 font-semibold">Số HĐ</th>
                  <th className="py-1.5 font-semibold">Đối tác</th>
                  <th className="py-1.5 font-semibold text-right">Số lượng</th>
                  <th className="py-1.5 font-semibold text-right">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => {
                      if (onOpenInvoice && row.invoiceId) {
                        onOpenInvoice(row.invoiceId);
                        setOpen(false);
                      }
                    }}
                  >
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceDate}
                    </td>
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceNo}
                    </td>
                    <td
                      className="py-1.5 truncate max-w-[150px]"
                      title={row.partnerName}
                    >
                      {row.partnerName || "—"}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {Number(row.qty).toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                    <td className="py-1.5 text-right font-medium text-emerald-700">
                      {money(row.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300 bg-gray-50">
                  <td
                    colSpan={3}
                    className="py-2 text-right font-semibold text-slate-700"
                  >
                    Tổng cộng:
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {filteredData
                      .reduce(
                        (acc: number, cur: any) => acc + (Number(cur.qty) || 0),
                        0,
                      )
                      .toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {money(
                      filteredData.reduce(
                        (acc: number, cur: any) =>
                          acc + (Number(cur.totalAmount) || 0),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      }
    >
      <span className="cursor-pointer font-medium text-slate-700 underline decoration-dotted decoration-slate-400 hover:text-slate-900">
        {money(price)}
      </span>
    </Popover>
  );
}

export function VinfastPartsTrackingPage() {
  const { t } = useTranslation("erpInvoices");
  const formHook = useErpInvoiceForm(() => {});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortArray, setSortArray] = useState<string[]>([]);
  const [detailRow, setDetailRow] = useState<VinfastPartTrackingRow | null>(
    null,
  );

  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    return isNaN(n) ? "—" : money(n);
  }

  const sortCol = sortArray[0];
  const sortOrder = sortCol?.startsWith("-") ? "desc" : "asc";
  const sortBy = sortCol?.startsWith("-") ? sortCol.slice(1) : sortCol;

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      search: { placeholder: "Tìm mã phụ tùng..." },
    }),
    [],
  );

  const filterProps = useFilterPanel(filterConfig, () => setPage(1));
  const { state: filterState } = filterProps;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "vinfast-parts",
      page,
      pageSize,
      sortBy,
      sortOrder,
      filterState.dateFrom,
      filterState.dateTo,
      filterState.search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (filterState.search) params.append("search", filterState.search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortDir", sortOrder);
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const res = await api.get(`/api/v1/reports/vinfast-parts?${params}`);
      return res.data as { data: VinfastPartTrackingRow[]; total: number };
    },
  });

  const summaryRow = useMemo(() => {
    if (!data?.data || data.data.length === 0) return undefined;

    const totalQtyBought = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtyBought) || 0),
      0,
    );
    const totalQtySold = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtySold) || 0),
      0,
    );
    const totalMargin = data.data.reduce(
      (acc, curr) => acc + (Number(curr.margin) || 0),
      0,
    );
    const totalAvgBuyPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgBuyPrice) || 0),
      0,
    );
    const totalAvgSellPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgSellPrice) || 0),
      0,
    );

    return {
      qtyBought: (
        <span className="font-semibold text-slate-700">
          {totalQtyBought.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      qtySold: (
        <span className="font-semibold text-slate-700">
          {totalQtySold.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      avgBuyPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgBuyPrice)}
        </span>
      ),
      avgSellPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgSellPrice)}
        </span>
      ),
      margin: (
        <span className="font-semibold text-slate-700">
          {money(totalMargin)}
        </span>
      ),
    };
  }, [data]);

  const columns: DataTableColumn<VinfastPartTrackingRow>[] = [
    {
      key: "actions",
      header: "",
      size: 48,
      cell: (row) => (
        <ActionDropdown
          items={[
            {
              label: t("actionDetail", "Xem chi tiết"),
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => {
                setDetailRow(row);
              },
            },
          ]}
        />
      ),
    },
    {
      key: "month",
      header: "Tháng",
      sortable: true,
      sortKey: "month",
      size: 100,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => row.month,
    },
    {
      key: "itemCode",
      header: "Mã phụ tùng",
      sortKey: "itemCode",
      cell: (row) => (
        <span
          className="font-semibold cursor-pointer border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors"
          onClick={() => setDetailRow(row)}
        >
          {row.itemCode}
        </span>
      ),
    },
    {
      key: "itemName",
      header: "Tên phụ tùng",
      size: 200,
      cell: (row) => (
        <Tooltip content={row.itemName || ""}>
          <div
            className="whitespace-normal break-words w-full truncate max-w-[200px]"
            title={row.itemName || ""}
          >
            {row.itemName}
          </div>
        </Tooltip>
      ),
    },

    {
      key: "qtyBought",
      header: "SL Mua (VINFAST)",
      sortable: true,
      sortKey: "qtyBought",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {Number(row.qtyBought).toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
    },
    {
      key: "avgBuyPrice",
      header: "Giá mua TB",
      sortable: true,
      sortKey: "avgBuyPrice",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <PriceWithInvoicePopover
          price={row.avgBuyPrice}
          itemCode={row.itemCode}
          month={row.month}
          direction="IN"
          onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
        />
      ),
    },
    {
      key: "qtySold",
      header: "SL Bán ra",
      sortable: true,
      sortKey: "qtySold",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {Number(row.qtySold).toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
    },
    {
      key: "avgSellPrice",
      header: "Giá bán TB",
      sortable: true,
      sortKey: "avgSellPrice",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <PriceWithInvoicePopover
          price={row.avgSellPrice}
          itemCode={row.itemCode}
          month={row.month}
          direction="OUT"
          onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
        />
      ),
    },
    {
      key: "margin",
      header: "Biên LN",
      sortable: true,
      sortKey: "margin",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {money(row.margin)}
        </span>
      ),
    },
    {
      key: "marginPct",
      header: "Biên LN (%)",
      sortable: true,
      sortKey: "marginPct",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => <span className="text-gray-600">{row.marginPct}</span>,
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title="Báo cáo phụ tùng VINFAST"
        desc="Tổng hợp và đối chiếu phụ tùng mua vào từ VINFAST và bán ra theo tháng"
        icon={<FileText className="w-4 h-4 opacity-75" />}
        tableId="vinfast-parts"
        createActions={[
          {
            groupLabel: "Dữ liệu",
            items: [
              {
                label: "Tải bảng kê",
                icon: <Download className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  const params = new URLSearchParams();
                  if (filterState.dateFrom)
                    params.append("dateFrom", filterState.dateFrom);
                  if (filterState.dateTo)
                    params.append("dateTo", filterState.dateTo);
                  if (filterState.search)
                    params.append("search", filterState.search);
                  if (sortBy) params.append("sortBy", sortBy);
                  if (sortOrder) params.append("sortDir", sortOrder);

                  // Logic to trigger download
                  const url = `/api/v1/reports/vinfast-parts/export/excel?${params.toString()}`;
                  api.get(url, { responseType: "blob" }).then((res) => {
                    const fileUrl = window.URL.createObjectURL(res.data);
                    const a = document.createElement("a");
                    a.href = fileUrl;
                    a.download = `bang-ke-phu-tung-vinfast.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(fileUrl);
                    document.body.removeChild(a);
                  });
                },
              },
            ],
          },
        ]}
        items={data?.data || []}
        columns={columns as any}
        summaryRow={summaryRow}
        getRowKey={(row: any) => `${row.itemCode}-${row.itemName}-${row.month}`}
        loading={isLoading || isFetching}
        emptyLabel="Chưa có dữ liệu"
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={Math.ceil((data?.total || 0) / pageSize) || 1}
        onPage={setPage}
        onPageSize={setPageSize}
        sortArray={sortArray}
        onSort={(key) => {
          setSortArray((prev) => {
            if (prev[0] === key) return [`-${key}`];
            if (prev[0] === `-${key}`) return [];
            return [key];
          });
        }}
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filterProps}
      />

      <ErpInvoiceDrawer
        open={formHook.drawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        setEditMode={formHook.setEditMode}
        setDeleteConfirm={formHook.setDeleteConfirm}
        onDownload={() => {}}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        leftPanel={
          <div className="flex flex-col gap-5">
            {formHook.formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                {formHook.formError}
              </div>
            )}
            <ErpInvoiceInternalInfo
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key, value) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.detailInvoice?.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={() =>
                formHook.openDetail({
                  id: formHook.detailInvoice!.id,
                } as any)
              }
            />
            <ErpInvoiceFormItems
              form={formHook.form}
              editMode={formHook.editMode && !formHook.detailInvoice?.id}
              setForm={formHook.setForm}
              fmtAmt={fmtAmt}
            />
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceFormGeneral
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key, value) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
            />
            <ErpInvoicePdfUpload
              invoiceId={formHook.detailInvoice?.id ?? null}
              pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
              pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
              editMode={formHook.editMode}
            />
          </div>
        }
      />

      <VinfastPartDetailDrawer
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        itemCode={detailRow?.itemCode || ""}
        itemName={detailRow?.itemName || ""}
        month={detailRow?.month || ""}
      />
    </>
  );
}
