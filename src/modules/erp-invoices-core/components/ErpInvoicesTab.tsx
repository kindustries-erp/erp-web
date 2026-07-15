import { useState, useMemo, useEffect, useCallback } from "react";
import { format, isValid } from "date-fns";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Receipt,
  DownloadCloud,
  Eye,
  Download,
  RefreshCw,
  Trash,
  Ban,
  FileCode,
  FileText,
} from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useUIStore } from "@/core/config/uiStore";
import { type DataTableColumn } from "@/shared/components/DataTable";

import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import { ErpInvoiceDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceDrawer";
import { ErpInvoiceFormGeneral } from "@/modules/erp-invoices-core/components/ErpInvoiceFormGeneral";
import { ErpInvoiceFormItems } from "@/modules/erp-invoices-core/components/ErpInvoiceFormItems";
import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/InvoiceImportSyncDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { ErpInvoiceInternalInfo } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";

interface ErpInvoicesTabProps {
  direction: "IN" | "OUT";
}

export function ErpInvoicesTab({ direction }: ErpInvoicesTabProps) {
  const { t } = useTranslation("erpInvoices");
  const listHook = useErpInvoicesList(direction);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);
  const showToast = useUIStore((s) => s.showToast);

  // Hook theo dõi tiến trình nền SSE, tự động refresh bảng khi hoàn thành
  useInvoiceSyncProgress(listHook.loadInvoices);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
  } | null>(null);

  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkTypes, setBulkTypes] = useState<string[]>(["pdf", "xml"]);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({
        label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
        value: val,
      });
    }
    return opts;
  }, []);

  useEffect(() => {
    if (!bulkMonth && monthOptions.length > 0) {
      setBulkMonth(monthOptions[0].value);
    }
  }, [bulkMonth, monthOptions]);

  const handleBulkDownloadFiles = async () => {
    if (bulkTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại file (PDF hoặc XML)");
      return;
    }
    if (!bulkMonth) {
      toast.error("Vui lòng chọn kỳ tải hóa đơn");
      return;
    }
    try {
      setBulkDownloading(true);
      const [year, month] = bulkMonth.split("-");
      const dateFrom = `${year}-${month}-01`;
      const dateTo = new Date(Number(year), Number(month), 0)
        .toISOString()
        .slice(0, 10);

      const blob = await erpInvoicesCoreApi.bulkDownloadFiles({
        query: {
          date_from: dateFrom,
          date_to: dateTo,
          direction,
        },
        types: bulkTypes,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HoaDon_${bulkMonth}_${direction}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBulkDrawerOpen(false);
      toast.success("Tải hàng loạt thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error("Tải hàng loạt thất bại: " + error.message);
    } finally {
      setBulkDownloading(false);
    }
  };

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-options"],
    queryFn: getBranchOptionsApi,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewId");
    if (viewId) {
      formHook.openDetail({ id: viewId } as ErpInvoice);
      params.delete("viewId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "erp_invoice" && detail.id) {
        formHook.openDetail({ id: detail.id } as ErpInvoice);
      } else if (detail && detail.type === "bank_transaction" && detail.id) {
        setDetailTransactionId(detail.id);
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);
    return () => window.removeEventListener("open_erp_document", handleOpenDoc);
  }, [formHook]);

  async function handleDownload(id: string, type: "pdf" | "xml") {
    try {
      showToast({
        title: `Đang tải file ${type.toUpperCase()}...`,
        variant: "default",
      });
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
      showToast({
        title: `Không thể tải ${type.toUpperCase()}`,
        variant: "destructive",
      });
    }
  }

  async function handlePreviewPdf(id: string, key: string, filename: string) {
    try {
      showToast({ title: "Đang mở PDF...", variant: "default" });
      const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(id, key, true);
      setPreviewPdf({
        url,
        filename,
        fileKey: key,
        invoiceId: id,
      });
    } catch {
      showToast({ title: "Không thể mở PDF", variant: "destructive" });
    }
  }

  async function handleExportExcel(type: "summary" | "detailed" = "summary") {
    try {
      showToast({
        title: "Đang tạo file Excel...",
        variant: "default",
      });
      const { search, dateFrom, dateTo, status, custom } =
        listHook.filterPanel.state;
      const blob = await erpInvoicesCoreApi.exportExcel({
        direction,
        search: search || undefined,
        seller_name: custom?.seller_name || undefined,
        buyer_name: custom?.buyer_name || undefined,
        date_from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
        status: status || undefined,
        tag_id: (custom?.tag_id as string) || undefined,
        sort_by: listHook.sortBy || undefined,
        sort_order: listHook.sortOrder || undefined,
        export_type: type,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DanhSachHoaDon_${direction}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        title: "Xuất Excel thành công",
        variant: "default",
      });
    } catch {
      showToast({
        title: "Không thể xuất Excel",
        variant: "destructive",
      });
    }
  }

  const handleReparseXml = async (inv: ErpInvoice) => {
    try {
      const token = localStorage.getItem("erp_portal_token") || "";
      showToast({ title: "Đang tải dữ liệu XML...", variant: "default" });
      await erpInvoicesCoreApi.reparseXml(inv.id, token);
      showToast({ title: "Đồng bộ chi tiết thành công", variant: "default" });
      void listHook.loadInvoices();
    } catch (e: unknown) {
      showToast({
        title:
          (e as { response?: { data?: { message?: string } } }).response?.data
            ?.message || "Đồng bộ thất bại",
        variant: "destructive",
      });
    }
  };

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

  const formatAmtOption = (val: string | number) => {
    const n = Number(val || 0);
    if (isNaN(n)) return String(val);
    return n.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "tag_id",
          label: t("tag", "Thẻ nhãn"),
          placeholder: t("allTags", "Tất cả thẻ"),
          options: allTags.map((tag) => ({ value: tag.id, label: tag.name })),
          type: "combobox" as const,
        },
      ],
    }),
    [t, allTags],
  );

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
      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
        direction,
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          let labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "branchId") {
            const branch = branches.find((b) => b.value === valStr);
            if (branch) labelStr = branch.label;
          }
          if (columnKey === "invoiceDate" && valStr) {
            // Backend now returns YYYY-MM-DD via TO_CHAR — use as value directly
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
    [direction],
  );

  const handleFilterChange = (key: string, vals: string[]) => {
    listHook.tableState.setColumnFilter(key, vals);
    listHook.setPage(1);
  };

  const columns: DataTableColumn<ErpInvoice>[] = useMemo(() => {
    return [
      {
        key: "attachments",
        header: (
          <TableColumnHeaderFilter
            title={t("attachments", "Chứng từ")}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={
              listHook.tableState.columnFilters["attachments"] || []
            }
            onFilterChange={(vals) => handleFilterChange("attachments", vals)}
            align="center"
            columnKey="attachments"
            requireSearchToFetchOptions={false}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={async ({ search }) => {
              const options = [
                { value: "has_pdf", label: "Có file PDF" },
                { value: "has_xml", label: "Có file XML" },
                { value: "no_pdf", label: "Không có file PDF" },
                { value: "no_xml", label: "Không có file XML" },
              ];
              const filtered = options.filter((o) =>
                o.label.toLowerCase().includes(search.toLowerCase()),
              );
              return {
                items: filtered,
                total: filtered.length,
                next: null,
              };
            }}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv) => (
          <div className="flex items-center justify-center gap-1.5">
            {inv.xmlFileKey ? (
              <Tooltip content={t("downloadXml", "Tải file XML")}>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(inv.id, "xml");
                  }}
                >
                  <FileCode className="w-4 h-4 text-slate-700 hover:text-primary transition-colors" />
                </div>
              </Tooltip>
            ) : (
              <Tooltip content={t("noXml", "Chưa có file XML/ZIP")}>
                <FileCode className="w-4 h-4 text-gray-300" />
              </Tooltip>
            )}
            {inv.pdfFileKey || (inv.pdfFiles && inv.pdfFiles.length > 0) ? (
              <Popover
                align="start"
                open={openPopoverId === inv.id}
                onOpenChange={(open) => setOpenPopoverId(open ? inv.id : null)}
                content={
                  <div className="p-3 w-[350px]">
                    <div className="text-sm font-semibold mb-3 text-slate-800">
                      Danh sách file PDF
                    </div>
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                      {inv.pdfFileKey &&
                        !inv.pdfFiles?.some(
                          (p: any) => p.key === inv.pdfFileKey,
                        ) && (
                        <div className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg mb-2">
                          <div className="flex flex-col min-w-0 flex-1 mr-2">
                            <span
                              className="truncate font-medium text-slate-700"
                              title="Hóa đơn PDF"
                            >
                              {(inv.pdfFileKey as string).split("/").pop() || "Hóa đơn PDF"}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Hóa đơn PDF (Gốc)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopoverId(null);
                              handlePreviewPdf(
                                inv.id,
                                inv.pdfFileKey as string,
                                (inv.pdfFileKey as string).split("/").pop() ||
                                  "Hóa đơn PDF",
                              );
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {inv.pdfFiles?.map((pdf: any) => (
                        <div
                          key={pdf.key}
                          className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg"
                        >
                          <div className="flex flex-col min-w-0 flex-1 mr-2">
                            <span
                              className="truncate font-medium text-slate-700"
                              title={pdf.filename}
                            >
                              {pdf.filename}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Hóa đơn PDF
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopoverId(null);
                              handlePreviewPdf(inv.id, pdf.key, pdf.filename);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Tooltip content={t("pdfList", "Danh sách file PDF")}>
                    <div className="cursor-pointer">
                      <FileText className="w-4 h-4 text-slate-700 hover:text-primary transition-colors" />
                    </div>
                  </Tooltip>
                </div>
              </Popover>
            ) : (
              <Tooltip content={t("noPdf", "Chưa có file PDF")}>
                <FileText className="w-4 h-4 text-gray-300" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceDate", "Ngày HĐ")}
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
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd-MM-yyyy")
            : "",
      },
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title={t("serialNo", "Ký hiệu")}
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
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-left",
        cell: (inv) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceNo", "Số HĐ")}
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
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 80,
        headerClassName: "text-center",
        className: "font-medium text-primary text-left",
        cell: (inv) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
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
              {inv.status !== "CONFIRMED" && (
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                    inv.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {inv.status === "CANCELLED"
                    ? t("statusCancelled", "Đã hủy")
                    : t("statusDraft", "Nháp")}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title={
              direction === "IN"
                ? t("seller", "Bên bán")
                : t("buyer", "Bên mua")
            }
            sortState={getSortState("partner")}
            onSortChange={(state) => handleSortChange("partner", state)}
            searchValue={listHook.tableState.columnSearch["partner"] || ""}
            onSearchChange={(val) => handleSearchChange("partner", val)}
            selectedFilters={listHook.tableState.columnFilters["partner"] || []}
            onFilterChange={(vals) => handleFilterChange("partner", vals)}
            align="center"
            columnKey="partner"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 250,
        headerClassName: "text-center",
        className: "text-left",
        cell: (inv) => {
          const text =
            direction === "IN" ? inv.sellerName || "—" : inv.buyerName || "—";
          return (
            <Tooltip content={text !== "—" ? text : ""}>
              <div className="whitespace-normal break-words w-full cursor-pointer">
                {text}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "taxCode",
        header: (
          <TableColumnHeaderFilter
            title={t("taxCode", "MST")}
            sortState={getSortState("taxCode")}
            onSortChange={(state) => handleSortChange("taxCode", state)}
            searchValue={listHook.tableState.columnSearch["taxCode"] || ""}
            onSearchChange={(val) => handleSearchChange("taxCode", val)}
            selectedFilters={listHook.tableState.columnFilters["taxCode"] || []}
            onFilterChange={(vals) => handleFilterChange("taxCode", vals)}
            align="center"
            columnKey="taxCode"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left",
        cell: (inv) =>
          direction === "IN"
            ? inv.sellerTaxCode || "—"
            : inv.buyerTaxCode || "—",
      },
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("description", "Diễn giải")}
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
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 300,
        className: "text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <Popover
            content={
              <div className="p-3 max-h-[300px] max-w-[800px] max-w-[90vw] overflow-auto">
                <h4 className="font-semibold text-sm mb-2 text-slate-800">
                  Chi tiết mặt hàng
                </h4>
                {row.items && row.items.length > 0 ? (
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
                      {row.items.map((item: any, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-2 py-1 whitespace-normal break-words max-w-[200px]">
                            {item.description || "—"}
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
                            {item.unit || "—"}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {fmtAmt(item.unitPrice?.toString())}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap font-medium">
                            {fmtAmt(item.preVatAmount?.toString())}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {item.vatRate != null
                              ? `${(Number(item.vatRate) * 100).toFixed(0)}%`
                              : "—"}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap">
                            {fmtAmt(item.vatAmount?.toString())}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap font-semibold text-slate-800">
                            {fmtAmt(
                              (
                                (Number(item.preVatAmount) || 0) +
                                (Number(item.vatAmount) || 0)
                              ).toString(),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 sticky bottom-0 border-t">
                      <tr>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          Tổng cộng
                        </td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          {row.items
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
                            row.items
                              .reduce(
                                (acc: number, item: any) =>
                                  acc + (Number(item.preVatAmount) || 0),
                                0,
                              )
                              .toString(),
                          )}
                        </td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-700">
                          {fmtAmt(
                            row.items
                              .reduce(
                                (acc: number, item: any) =>
                                  acc + (Number(item.vatAmount) || 0),
                                0,
                              )
                              .toString(),
                          )}
                        </td>
                        <td className="px-2 py-2 font-semibold text-right text-slate-800">
                          {fmtAmt(
                            row.items
                              .reduce(
                                (acc: number, item: any) =>
                                  acc +
                                  (Number(item.preVatAmount) || 0) +
                                  (Number(item.vatAmount) || 0),
                                0,
                              )
                              .toString(),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div className="text-slate-500 text-sm italic">
                    Không có chi tiết mặt hàng.
                  </div>
                )}
              </div>
            }
          >
            <div
              className="whitespace-normal break-words w-full cursor-pointer hover:text-primary text-slate-700 underline decoration-dashed underline-offset-4 decoration-slate-300"
              title={row.description || ""}
            >
              {row.description || "—"}
            </div>
          </Popover>
        ),
      },
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("preVatAmount", "Trước VAT")}
            sortState={getSortState("preVatAmount")}
            onSortChange={(state) => handleSortChange("preVatAmount", state)}
            searchValue={listHook.tableState.columnSearch["preVatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("preVatAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["preVatAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("preVatAmount", vals)}
            align="center"
            columnKey="preVatAmount"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => fmtAmt(row.preVatAmount),
      },
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("vatAmount", "Thuế VAT")}
            sortState={getSortState("vatAmount")}
            onSortChange={(state) => handleSortChange("vatAmount", state)}
            searchValue={listHook.tableState.columnSearch["vatAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("vatAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["vatAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("vatAmount", vals)}
            align="center"
            columnKey="vatAmount"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.vatAmount),
      },
      {
        key: "discountAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("discountAmount", "Chiết khấu")}
            sortState={getSortState("discountAmount")}
            onSortChange={(state) => handleSortChange("discountAmount", state)}
            searchValue={
              listHook.tableState.columnSearch["discountAmount"] || ""
            }
            onSearchChange={(val) => handleSearchChange("discountAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["discountAmount"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("discountAmount", vals)
            }
            align="center"
            columnKey="discountAmount"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.discountAmount),
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("totalAmount", "Thành tiền")}
            sortState={getSortState("totalAmount")}
            onSortChange={(state) => handleSortChange("totalAmount", state)}
            searchValue={listHook.tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["totalAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("totalAmount", vals)}
            align="center"
            columnKey="totalAmount"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right font-semibold",
        cell: (inv) => fmtAmt(inv.totalAmount),
      },
      ...(direction === "OUT"
        ? [
            {
              key: "settlementOrder",
              header: (
                <TableColumnHeaderFilter
                  title={t("settlementOrder", "Lệnh quyết toán")}
                  sortState={getSortState("settlementOrder")}
                  onSortChange={(state) =>
                    handleSortChange("settlementOrder", state)
                  }
                  searchValue={
                    listHook.tableState.columnSearch["settlementOrder"] || ""
                  }
                  onSearchChange={(val) =>
                    handleSearchChange("settlementOrder", val)
                  }
                  selectedFilters={
                    listHook.tableState.columnFilters["settlementOrder"] || []
                  }
                  onFilterChange={(vals) =>
                    handleFilterChange("settlementOrder", vals)
                  }
                  align="center"
                  columnKey="settlementOrder"
                  requireSearchToFetchOptions={true}
                  allFilters={listHook.tableState.columnFilters}
                  fetchOptions={fetchInvoiceOptions}
                />
              ),
              headerClassName: "text-center w-[150px]",
              className: "text-left w-[150px]",
              cell: (inv: ErpInvoice) => inv.settlementOrder || "—",
            },
            {
              key: "licensePlate",
              header: (
                <TableColumnHeaderFilter
                  title={t("licensePlate", "Biển số xe")}
                  sortState={getSortState("licensePlate")}
                  onSortChange={(state) =>
                    handleSortChange("licensePlate", state)
                  }
                  searchValue={
                    listHook.tableState.columnSearch["licensePlate"] || ""
                  }
                  onSearchChange={(val) =>
                    handleSearchChange("licensePlate", val)
                  }
                  selectedFilters={
                    listHook.tableState.columnFilters["licensePlate"] || []
                  }
                  onFilterChange={(vals) =>
                    handleFilterChange("licensePlate", vals)
                  }
                  align="center"
                  columnKey="licensePlate"
                  requireSearchToFetchOptions={true}
                  allFilters={listHook.tableState.columnFilters}
                  fetchOptions={fetchInvoiceOptions}
                />
              ),
              headerClassName: "text-center w-[110px]",
              className: "text-left w-[110px]",
              cell: (inv: ErpInvoice) => inv.licensePlate || "—",
            },
          ]
        : []),
      {
        key: "netOffAmount",
        header: t("netOffAmount", "Đã cấn trừ"),
        size: 150,
        headerClassName: "text-right bg-blue-50/50 border-l border-blue-200",
        className: "text-right bg-blue-50/50 border-l border-blue-200",
        cell: (inv: any) => {
          const netOff = parseFloat(inv.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="text-blue-600">{fmtAmt(inv.netOffAmount)}</span>
          );
        },
      },
      {
        key: "remainingAmount",
        header: t("invoice.columns.remainingAmount", "Còn lại"),
        size: 120,
        headerClassName: "text-center bg-blue-50/50",
        className: "text-right font-semibold bg-blue-50/50",
        cell: (inv: any) => {
          const total = parseFloat(inv.totalAmount) || 0;
          const netOff = parseFloat(inv.netOffAmount) || 0;
          const remaining = total - netOff;
          if (remaining === 0)
            return <span className="text-emerald-600">0</span>;
          return (
            <span className="text-slate-700">
              {fmtAmt(remaining.toString())}
            </span>
          );
        },
      },
      {
        key: "branchId",
        header: (
          <TableColumnHeaderFilter
            title={t("branch", "Chi nhánh")}
            sortState={getSortState("branchId")}
            onSortChange={(state) => handleSortChange("branchId", state)}
            searchValue={listHook.tableState.columnSearch["branchId"] || ""}
            onSearchChange={(val) => handleSearchChange("branchId", val)}
            selectedFilters={
              listHook.tableState.columnFilters["branchId"] || []
            }
            onFilterChange={(vals) => handleFilterChange("branchId", vals)}
            align="center"
            columnKey="branchId"
            requireSearchToFetchOptions={true}
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.branchId) return "—";
          const branch = branches.find((b) => b.value === inv.branchId);
          return branch ? branch.label : inv.branchId;
        },
      },
    ];
  }, [
    direction,
    t,
    branches,
    listHook.tableState.columnFilters,
    listHook.tableState.columnSearch,
    listHook.tableState.sorts,
    fetchInvoiceOptions,
    openPopoverId,
  ]);

  const activeSortKey = listHook.sortBy;
  const activeSortOrder = listHook.sortOrder;

  const summaryRow = useMemo(() => {
    if (!listHook.invoices || listHook.invoices.length === 0) return undefined;

    const totalPreVatAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.preVatAmount) || 0),
      0,
    );
    const totalVatAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.vatAmount) || 0),
      0,
    );
    const totalDiscountAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.discountAmount) || 0),
      0,
    );
    const totalTotalAmount = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.totalAmount) || 0),
      0,
    );
    const totalNetOff = listHook.invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = listHook.invoices.reduce(
      (acc: number, curr: any) =>
        acc +
        ((parseFloat(curr.totalAmount) || 0) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      preVatAmount:
        totalPreVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalPreVatAmount.toString())}
          </span>
        ),
      vatAmount:
        totalVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalVatAmount.toString())}
          </span>
        ),
      discountAmount:
        totalDiscountAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalDiscountAmount.toString())}
          </span>
        ),
      totalAmount:
        totalTotalAmount === 0 ? (
          "--"
        ) : (
          <span className="font-semibold">
            {fmtAmt(totalTotalAmount.toString())}
          </span>
        ),
      netOffAmount:
        totalNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {fmtAmt(totalNetOff.toString())}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-orange-600 font-medium">
            {fmtAmt(totalRemaining.toString())}
          </span>
        ),
    };
  }, [listHook.invoices]);

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          direction === "IN"
            ? t("inbound", "Hóa đơn mua vào")
            : t("outbound", "Hóa đơn bán ra")
        }
        desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
        icon={<Receipt className="h-5 w-5" />}
        tableId={`erp-invoices-table-${direction}`}
        items={listHook.invoices}
        columns={columns}
        getRowKey={(r) => r.id}
        summaryRow={summaryRow}
        loading={listHook.loading}
        emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
        minWidth={1200}
        sortArray={
          activeSortKey
            ? [activeSortOrder === "desc" ? `-${activeSortKey}` : activeSortKey]
            : undefined
        }
        onSort={listHook.handleSort}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={listHook.setPage}
        onPageSize={listHook.setPageSize}
        onRefresh={() => void listHook.loadInvoices()}
        filterConfig={filterConfig}
        filter={listHook.filterPanel}
        rowActions={(inv) => {
          const traCuuItems = [];
          const thaoTacItems = [];

          traCuuItems.push({
            label: t("actionDetail", "Chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => formHook.openDetail(inv),
          });
          if (inv.xmlFileKey) {
            traCuuItems.push({
              label: t("actionDownloadXml", "Tải XML"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: () => handleDownload(inv.id, "xml"),
            });
          }
          const hasPdf =
            inv.pdfFileKey || (inv.pdfFiles && inv.pdfFiles.length > 0);
          if (hasPdf) {
            traCuuItems.push({
              label: t("actionDownloadPdf", "Tải PDF"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: async () => {
                if (inv.pdfFiles && inv.pdfFiles.length > 1) {
                  try {
                    showToast({
                      title: "Đang nén file PDF...",
                      variant: "default",
                    });
                    const blob = await erpInvoicesCoreApi.downloadPdfsZip(
                      inv.id,
                    );
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `hoadon_${inv.id}_pdfs.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch {
                    showToast({
                      title: "Không thể tải file PDF",
                      variant: "destructive",
                    });
                  }
                } else if (inv.pdfFiles && inv.pdfFiles.length === 1) {
                  const f = inv.pdfFiles[0];
                  try {
                    const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                      inv.id,
                      f.key,
                      false,
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = f.filename || "document.pdf";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch {
                    showToast({
                      title: "Không thể tải file PDF",
                      variant: "destructive",
                    });
                  }
                } else if (inv.pdfFileKey) {
                  handleDownload(inv.id, "pdf");
                }
              },
            });
          }

          thaoTacItems.push({
            label: t("actionReparseXml", "Đồng bộ lại từ XML"),
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            onClick: () => handleReparseXml(inv),
          });
          if (inv.status === "DRAFT") {
            thaoTacItems.push({
              label: t("actionDelete", "Xóa"),
              icon: <Trash className="w-3.5 h-3.5" />,
              variant: "danger" as const,
              onClick: () => {
                formHook.openDetail(inv);
                formHook.setDeleteConfirm(true);
              },
            });
          }
          if (inv.status === "CONFIRMED") {
            thaoTacItems.push({
              label: t("actionCancel", "Hủy"),
              icon: <Ban className="w-3.5 h-3.5" />,
              variant: "danger" as const,
              onClick: () => {
                formHook.openDetail(inv);
                formHook.setCancelConfirm(true);
              },
            });
          }

          return [
            {
              groupLabel: t("groupTraCuu", "Tra cứu"),
              items: traCuuItems,
            },
            {
              groupLabel: t("groupThaoTac", "Thao tác"),
              items: thaoTacItems,
            },
          ];
        }}
        createActions={[
          {
            groupLabel: t("groupInvoice", "Hóa đơn"),
            items: [
              {
                label: t("createInvoice", "Tạo hóa đơn"),
                icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
                onClick: () => formHook.openNew(direction),
              },
            ],
          },
          {
            groupLabel: t("groupData", "Đồng bộ & Tải"),
            items: [
              {
                label: t("syncInvoices", "Đồng bộ hóa đơn"),
                icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
                onClick: () => setImportModalOpen(true),
              },
              {
                label: t("bulkDownloadXml", "Tải lại XML hàng loạt"),
                icon: <RefreshCw className="w-4 h-4 text-orange-600" />,
                onClick: async () => {
                  const token = localStorage.getItem("erp_portal_token");
                  if (!token) {
                    toast.error(
                      "Vui lòng cấu hình token Cổng thuế trong chức năng Đồng bộ từ GDT trước.",
                    );
                    return;
                  }
                  try {
                    const res = await erpInvoicesCoreApi.bulkDownloadXml({
                      token,
                      direction,
                    });
                    toast.success(res.message);
                  } catch (e: any) {
                    toast.error(
                      e.response?.data?.message ||
                        e.message ||
                        "Lỗi tải lại XML",
                    );
                  }
                },
              },
              {
                label: t("bulkDownloadZip", "Tải ZIP PDF/XML hàng loạt"),
                icon: <Download className="w-4 h-4 text-blue-600" />,
                onClick: () => setBulkDrawerOpen(true),
              },
              {
                label: t("exportExcelSummary", "Xuất Excel Bảng kê (Tổng hợp)"),
                icon: <Download className="w-4 h-4 text-green-600" />,
                onClick: () => handleExportExcel("summary"),
              },
              {
                label: t(
                  "exportExcelDetailed",
                  "Xuất Excel Hàng hóa (Chi tiết)",
                ),
                icon: <Download className="w-4 h-4 text-emerald-600" />,
                onClick: () => handleExportExcel("detailed"),
              },
            ],
          },
        ]}
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
        onDownload={handleDownload}
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
              direction={direction}
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

      <InvoiceImportSyncDrawer
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialDirection={direction}
        onImported={(dir: "IN" | "OUT") => {
          if (dir === direction) {
            void listHook.loadInvoices();
          }
        }}
      />

      <FilePreviewDrawer
        open={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        previewUrl={previewPdf?.url}
        fileName={previewPdf?.filename}
        fetchBlobFn={
          previewPdf
            ? () =>
                erpInvoicesCoreApi.getPdfBlob(
                  previewPdf.invoiceId,
                  previewPdf.fileKey,
                )
            : undefined
        }
        onDownload={
          previewPdf
            ? async () => {
                try {
                  const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                    previewPdf.invoiceId,
                    previewPdf.fileKey,
                    false,
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewPdf.filename || "document.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch {
                  showToast({
                    title: "Lỗi tải xuống file",
                    variant: "destructive",
                  });
                }
              }
            : undefined
        }
      />

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />

      <DrawerModal
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Tải hàng loạt hóa đơn"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kỳ tải hóa đơn *</label>
            <Combobox
              options={monthOptions}
              value={bulkMonth}
              onChange={(v) => setBulkMonth(v ?? "")}
              placeholder="Chọn kỳ..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hệ thống sẽ tải toàn bộ hóa đơn trong tháng đã chọn để tránh quá
              tải.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Định dạng file tải về *
            </label>
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("pdf")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes((prev) => [...prev, "pdf"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "pdf"));
                    }
                  }}
                />
                <span className="text-sm">File PDF</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkTypes.includes("xml")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkTypes((prev) => [...prev, "xml"]);
                    } else {
                      setBulkTypes((prev) => prev.filter((t) => t !== "xml"));
                    }
                  }}
                />
                <span className="text-sm">File XML</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-border">
            <Button
              onClick={() => setBulkDrawerOpen(false)}
              variant="outline"
              disabled={bulkDownloading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBulkDownloadFiles}
              disabled={bulkDownloading}
            >
              {bulkDownloading ? "Đang nén file..." : "Xác nhận tải"}
            </Button>
          </div>
        </div>
      </DrawerModal>
    </>
  );
}
