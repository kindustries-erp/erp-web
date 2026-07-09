import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { InvoiceBadgeLinks } from "@/shared/components/InvoiceBadgeLinks";
import { money } from "@/shared/utils/format";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import api from "@/core/api/axiosInstance";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { FileText, Eye, Download, Info } from "lucide-react";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
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
    { key: "invoiceNo", header: "Số HĐ", size: 120 },
    { key: "invoiceDate", header: "Ngày HĐ", size: 120 },
    {
      key: "qty",
      header: "Số lượng",
      size: 100,
      className: "text-right font-medium",
      cell: (row) => parseFloat(row.qty),
    },
    {
      key: "unitPrice",
      header: "Đơn giá",
      size: 120,
      className: "text-right",
      cell: (row) => money(row.unitPrice),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      size: 140,
      className: "text-right font-medium",
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

  const { data, isLoading, refetch } = useQuery({
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
      cell: (row) => <span className="font-semibold">{row.itemCode}</span>,
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
      sortKey: "qtyBought",
      cell: (row) => (
        <span className="font-medium text-blue-600">{row.qtyBought}</span>
      ),
    },
    {
      key: "avgBuyPrice",
      header: "Giá mua TB",
      sortKey: "avgBuyPrice",
      cell: (row) => money(row.avgBuyPrice),
    },
    {
      key: "buyInvoices",
      header: "HĐ Mua vào",
      cell: (row) => (
        <InvoiceBadgeLinks
          invoiceIds={row.buyInvoiceIds || []}
          onOpenInvoice={(id) => formHook.openDetail(id)}
          labelPrefix="hóa đơn"
        />
      ),
    },
    {
      key: "qtySold",
      header: "SL Bán ra",
      sortKey: "qtySold",
      cell: (row) => (
        <span className="font-medium text-green-600">{row.qtySold}</span>
      ),
    },
    {
      key: "avgSellPrice",
      header: "Giá bán TB",
      sortKey: "avgSellPrice",
      cell: (row) => money(row.avgSellPrice),
    },
    {
      key: "sellInvoices",
      header: "HĐ Bán ra",
      cell: (row) => (
        <InvoiceBadgeLinks
          invoiceIds={row.sellInvoiceIds || []}
          onOpenInvoice={(id) => formHook.openDetail(id)}
          labelPrefix="hóa đơn"
        />
      ),
    },
    {
      key: "margin",
      header: "Biên lợi nhuận",
      sortKey: "margin",
      cell: (row) => (
        <div className="flex flex-col">
          <span className={row.margin > 0 ? "text-green-600" : "text-red-600"}>
            {money(row.margin)}
          </span>
          <span className="text-xs text-gray-500">{row.marginPct}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title="Báo cáo phụ tùng VINFAST"
        desc="Tổng hợp và đối chiếu phụ tùng mua vào từ VINFAST và bán ra theo tháng"
        icon={<FileText className="w-4 h-4 opacity-75" />}
        tableId="vinfast-parts"
        customActionsNode={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
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
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Tải bảng kê
          </Button>
        }
        items={data?.data || []}
        columns={columns as any}
        getRowKey={(row: any) => `${row.itemCode}-${row.month}`}
        loading={isLoading}
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
