import React, { useMemo, useCallback } from "react";
import { format, isValid } from "date-fns";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useQuery } from "@tanstack/react-query";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { erpInvoiceDashboardApi } from "../api/erpInvoiceDashboardApi";
import { useErpInvoicesList } from "../hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "../hooks/useErpInvoiceForm";
import { StandardTable } from "@/shared/components/StandardTable";
import { money } from "@/shared/utils/format";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { ErpInvoiceDrawer } from "./ErpInvoiceDrawer";
import { ErpInvoiceFormGeneral } from "./ErpInvoiceFormGeneral";
import { ErpInvoiceInternalInfo } from "./ErpInvoiceInternalInfo";
import { ErpInvoiceFormItems } from "./ErpInvoiceFormItems";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface PartnerInvoiceDrawerProps {
  open: boolean;
  onClose: () => void;
  taxCode?: string;
  partnerName?: string;
  filterState?: any;
}

export function PartnerInvoiceDrawer({
  open,
  onClose,
  taxCode,
  partnerName,
  filterState,
}: PartnerInvoiceDrawerProps) {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "partner-invoice-stats",
      taxCode,
      filterState?.dateFrom,
      filterState?.dateTo,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartnerStats(taxCode!, {
        date_from: filterState?.dateFrom || undefined,
        date_to: filterState?.dateTo || undefined,
      }),
    enabled: !!taxCode && open,
  });

  const listHook = useErpInvoicesList("ALL", taxCode);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);

  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    if (isNaN(n)) return "—";
    return (
      n.toLocaleString("vi-VN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " đ"
    );
  }

  async function handleDownload(id: string, type: "pdf" | "xml") {
    try {
      const { url } = await erpInvoicesCoreApi.getDownloadUrl(id, type);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      console.error("Lỗi tải xuống");
    }
  }

  React.useEffect(() => {
    if (open && taxCode) {
      listHook.setPage(1);
      void listHook.loadInvoices();
    }
  }, [open, taxCode]);

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashIn) || [];
  const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashOut) || [];

  const getSortState = (key: string) => {
    if (listHook.tableState.sorts.includes(key)) return "asc";
    if (listHook.tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    listHook.tableState.setSort(key, state);
    listHook.setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    listHook.tableState.setColumnSearch(key, val);
    listHook.setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    listHook.tableState.setColumnFilter(key, vals);
    listHook.setPage(1);
  };

  const fetchInvoiceOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (taxCode) {
        currentFilters["taxCode"] = [taxCode];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        newFiltersStr,
        undefined, // direction undefined to search both IN and OUT
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          const labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "invoiceDate" && valStr) {
            const dateVal = valStr.substring(0, 10); // ensure YYYY-MM-DD
            try {
              const parsed = new Date(dateVal);
              const label = isValid(parsed)
                ? format(parsed, "dd-MM-yyyy")
                : dateVal;
              return { label, value: dateVal };
            } catch {
              return { label: valStr, value: valStr };
            }
          }
          return { label: labelStr, value: valStr };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [],
  );

  const columns = useMemo(() => {
    return [
      {
        key: "direction",
        header: "Loại HĐ",
        size: 80,
        className: "text-center",
        cell: (inv: any) => (
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              inv.direction === "IN"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {inv.direction === "IN" ? "Đầu vào" : "Đầu ra"}
          </span>
        ),
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title="Ngày HĐ"
            sortState={getSortState("invoiceDate")}
            onSortChange={(state) => handleSortChange("invoiceDate", state)}
            searchValue={listHook.tableState.columnSearch["invoiceDate"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceDate", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceDate"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceDate", vals)}
            align="center"
            columnKey="invoiceDate"
            queryKeyPrefix="partner-invoice-options"
            requireSearchToFetchOptions={true}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        className: "text-right",
        cell: (inv: any) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd-MM-yyyy")
            : "",
      },
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title="Ký hiệu"
            sortState={getSortState("serialNo")}
            onSortChange={(state) => handleSortChange("serialNo", state)}
            searchValue={listHook.tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => handleSearchChange("serialNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["serialNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("serialNo", vals)}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix="partner-invoice-options"
            requireSearchToFetchOptions={true}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        className: "text-left text-muted-foreground",
        cell: (inv: any) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title="Số HĐ"
            sortState={getSortState("invoiceNo")}
            onSortChange={(state) => handleSortChange("invoiceNo", state)}
            searchValue={listHook.tableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceNo", vals)}
            align="center"
            columnKey="invoiceNo"
            queryKeyPrefix="partner-invoice-options"
            requireSearchToFetchOptions={true}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        className: "font-medium text-primary text-left",
        cell: (inv: any) => (
          <Button
            variant="link"
            onClick={(e) => {
              e.stopPropagation();
              formHook.openDetail(inv);
            }}
            className="font-medium text-primary hover:underline p-0 h-auto"
          >
            {inv.invoiceNo}
          </Button>
        ),
      },
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title="Trước thuế"
            sortState={getSortState("preVatAmount")}
            onSortChange={(state) => handleSortChange("preVatAmount", state)}
            searchValue={listHook.tableState.columnSearch["preVatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("preVatAmount", val)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.preVatAmount || 0),
      },
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title="Tiền thuế"
            sortState={getSortState("vatAmount")}
            onSortChange={(state) => handleSortChange("vatAmount", state)}
            searchValue={listHook.tableState.columnSearch["vatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("vatAmount", val)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.vatAmount || 0),
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title="Tổng tiền"
            sortState={getSortState("totalAmount")}
            onSortChange={(state) => handleSortChange("totalAmount", state)}
            searchValue={listHook.tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalAmount", val)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
          />
        ),
        size: 120,
        className: "text-right font-medium",
        cell: (inv: any) => money(inv.totalAmount || 0),
      },
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title="Trạng thái"
            sortState={getSortState("status")}
            onSortChange={(state) => handleSortChange("status", state)}
            searchValue={listHook.tableState.columnSearch["status"] || ""}
            onSearchChange={(val) => handleSearchChange("status", val)}
            selectedFilters={listHook.tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            queryKeyPrefix="partner-invoice-options"
            requireSearchToFetchOptions={false}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={async () => ({
              items: [
                { value: "DRAFT", label: "Nháp" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "CANCELLED", label: "Đã hủy" },
              ],
              total: 3,
              next: null,
            })}
          />
        ),
        size: 100,
        className: "text-center",
        cell: (inv: any) => (
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
              inv.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : inv.status === "DRAFT"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {inv.status === "CANCELLED"
              ? "Đã hủy"
              : inv.status === "DRAFT"
                ? "Nháp"
                : "Đã xác nhận"}
          </span>
        ),
      },
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title="Diễn giải"
            sortState={getSortState("description")}
            onSortChange={(state) => handleSortChange("description", state)}
            searchValue={listHook.tableState.columnSearch["description"] || ""}
            onSearchChange={(val) => handleSearchChange("description", val)}
            selectedFilters={
              listHook.tableState.columnFilters["description"] || []
            }
            onFilterChange={(vals) => handleFilterChange("description", vals)}
            align="center"
            columnKey="description"
            queryKeyPrefix="partner-invoice-options"
            requireSearchToFetchOptions={true}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 250,
        cell: (inv: any) => (
          <Tooltip content={inv.description || ""}>
            <div className="truncate max-w-[250px]">
              {inv.description || "—"}
            </div>
          </Tooltip>
        ),
      },
    ];
  }, [formHook]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Chi tiết đối tác: ${taxCode}${partnerName ? ` - ${partnerName}` : ""}`}
      panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
      bodyClassName="flex flex-col p-4"
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Tổng quan Hóa đơn
          </h3>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="relative h-[210px]">
              {!isLoadingStats && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendOut,
                      color: barIn, // Đầu vào -> Phải trả tiền -> Ghi nhận là chi phí (invoices in)
                      label: "HĐ Đầu vào",
                    },
                    {
                      data: cashTrendIn,
                      color: barOut, // Đầu ra -> Thu tiền -> (invoices out)
                      label: "HĐ Đầu ra",
                    },
                  ]}
                />
              ) : isLoadingStats ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-[3px] mr-2"
                  style={{ backgroundColor: barIn }}
                />
                <span className="text-[color:var(--muted-fg)]">HĐ Đầu vào</span>
              </div>
              <div className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-[3px] mr-2"
                  style={{ backgroundColor: barOut }}
                />
                <span className="text-[color:var(--muted-fg)]">HĐ Đầu ra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Danh sách Hóa đơn
          </h3>
          <div className="flex-1 min-h-0 flex flex-col">
            <StandardTable
              items={listHook.invoices}
              columns={columns}
              getRowKey={(r) => r.id}
              loading={listHook.loading}
              variant="spreadsheet"
              minWidth={800}
              enableColumnResizing={true}
              page={listHook.page}
              pageSize={listHook.pageSize}
              total={listHook.total}
              totalPages={listHook.totalPages}
              onPage={listHook.setPage}
              onPageSize={listHook.setPageSize}
            />
          </div>
        </div>
      </div>
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
        onDownload={handleDownload}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        leftPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceInternalInfo
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key, value) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.form.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={() =>
                formHook.openDetail({
                  id: formHook.detailInvoice!.id,
                } as ErpInvoice)
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

      <ConfirmModal
        open={formHook.deleteConfirm}
        onCancel={() => formHook.setDeleteConfirm(false)}
        title="Xóa hóa đơn"
        message={`Bạn có chắc muốn xóa hóa đơn ${formHook.detailInvoice?.invoiceNo}? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleDelete}
      />

      <ConfirmModal
        open={formHook.cancelConfirm}
        onCancel={() => formHook.setCancelConfirm(false)}
        title="Hủy hóa đơn"
        message={`Bạn có chắc muốn hủy hóa đơn ${formHook.detailInvoice?.invoiceNo}?`}
        confirmLabel="Đồng ý hủy"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleCancel}
      />
    </DrawerModal>
  );
}
