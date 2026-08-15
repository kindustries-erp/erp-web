import { useState, useMemo, useEffect, useCallback } from "react";
import { format, isValid } from "date-fns";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt,
  DownloadCloud,
  Eye,
  Download,
  Trash,
  FileCode,
  FileText,
  Building2,
  CheckSquare,
  XSquare,
  MoreHorizontal,
  X,
  GitMerge,
  KeyRound,
} from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useUIStore } from "@/core/config/uiStore";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";

import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";

import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/InvoiceImportSyncDrawer";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/GdtPortalAuthDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { InvoiceBulkPostingDrawer } from "@/modules/erp-invoices-core/components/InvoiceBulkPostingDrawer";
import { InvoiceBulkNetOffDrawer } from "@/modules/erp-invoices-core/components/InvoiceBulkNetOffDrawer";
import { PartnerInvoiceDrawer } from "@/modules/erp-invoices-core/components/PartnerInvoiceDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { BulkEditDrawer } from "@/modules/erp-invoices-core/components/BulkEditDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";

const INVOICE_TYPE_MAP: Record<string, string> = {
  CHI_NHANH: "Hóa đơn chi nhánh",
  CHIET_KHAU: "Hóa đơn chiết khấu",
  DICH_VU_CUU_HO: "Hóa đơn cứu hộ",
  HANG_HOA: "Hàng hóa / Vật tư",
  DICH_VU: "Dịch vụ",
  PHI_THUE: "Phí & Thuế",
  CUU_HO: "Cứu hộ",
  KHAC: "Khác",
};

import { Checkbox } from "@/shared/components/ui/checkbox";
import { InvoiceExportDrawer } from "@/modules/erp-invoices-core/components/InvoiceExportDrawer";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  getFileViewUrl,
  getAttachmentContentBlobApi,
  getAttachmentDownloadUrlApi,
} from "@/modules/system/api/attachmentsApi";

function getPdfAttachments(attachments: any[]) {
  return (attachments ?? []).filter(
    (a) => a.attachment?.mimeType === "application/pdf",
  );
}

function formatTaxInvoiceType(type?: string | null) {
  if (type === "CASH_REGISTER") return "HĐ Máy tính tiền";
  if (type === "STANDARD") return "HĐ Điện tử";
  return type || "—";
}

function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return val?.toString() || "—";
  }
}

function formatTaxProcessStatus(val?: number | null) {
  switch (val) {
    case 0:
      return "Cục Thuế đã nhận";
    case 1:
      return "Đang tiến hành kiểm tra điều kiện cấp mã";
    case 2:
      return "CQT từ chối hóa đơn theo từng lần phát sinh";
    case 3:
      return "Hóa đơn đủ điều kiện cấp mã";
    case 4:
      return "Hóa đơn không đủ điều kiện cấp mã";
    case 5:
      return "Đã cấp mã hóa đơn";
    case 6:
      return "Cục Thuế đã nhận không mã";
    case 7:
      return "Đã kiểm tra định kỳ HĐĐT không có mã";
    case 8:
      return "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền";
    default:
      return val?.toString() || "—";
  }
}

export interface ErpInvoicesTabProps {
  direction: "IN" | "OUT";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
}

export function ErpInvoicesTab({
  direction,
  initialDateFrom,
  initialDateTo,
  isDrawer = false,
}: ErpInvoicesTabProps) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission("invoices", "update");
  const listDir = isDrawer
    ? direction === "IN"
      ? "CHECKPOINT_IN"
      : "CHECKPOINT_OUT"
    : direction;
  const listHook = useErpInvoicesList(listDir);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);
  const showToast = useUIStore((s) => s.showToast);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [portalAuthOpen, setPortalAuthOpen] = useState(false);

  useEffect(() => {
    if (isDrawer && (initialDateFrom || initialDateTo)) {
      if (initialDateFrom) listHook.filterPanel.setDateFrom(initialDateFrom);
      if (initialDateTo) listHook.filterPanel.setDateTo(initialDateTo);
      listHook.setPage(1);
    }
  }, [isDrawer, initialDateFrom, initialDateTo]);

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
    isAttachment?: boolean;
  } | null>(null);

  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkTypes, setBulkTypes] = useState<string[]>(["pdf", "xml"]);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkSelectedTypes, setBulkSelectedTypes] = useState<string[]>([
    "pdf",
    "xml",
  ]);
  const [bulkSelectedDownloading, setBulkSelectedDownloading] = useState(false);
  const [bulkSelectedModalOpen, setBulkSelectedModalOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkEditDrawerOpen, setBulkEditDrawerOpen] = useState(false);
  const [bulkPostingModalOpen, setBulkPostingModalOpen] = useState(false);
  const [bulkNetOffDrawerOpen, setBulkNetOffDrawerOpen] = useState(false);
  const [bulkPostingMode, setBulkPostingMode] = useState<"post" | "unpost">(
    "post",
  );
  const [selectedPartner, setSelectedPartner] = useState<{
    taxCode: string;
    partnerName: string;
  } | null>(null);
  const [partnerDrawerOpen, setPartnerDrawerOpen] = useState(false);

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection],
  );

  const bulkActionsNode =
    selectedIds.length > 0 ? (
      <div className="flex items-center rounded-md shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <ActionDropdown
          align="start"
          customTrigger={
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-r-none border-r-0 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <CheckSquare className="w-4 h-4 mr-1.5" />
              {t("bulkActions", "Thao tác")} ({selectedIds.length})
            </Button>
          }
          items={[
            {
              groupLabel: "Nghiệp vụ & Hạch toán",
              items: [
                {
                  label: t("bulkAssignAll", "Gán hàng loạt"),
                  icon: (
                    <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  ),
                  onClick: () => {
                    setBulkEditDrawerOpen(true);
                  },
                },
                {
                  label: "Hạch toán hàng loạt",
                  icon: (
                    <CheckSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                  ),
                  onClick: () => {
                    setBulkPostingMode("post");
                    setBulkPostingModalOpen(true);
                  },
                },
                {
                  label: "Đề xuất cấn trừ sao kê",
                  icon: (
                    <GitMerge className="w-4 h-4 mr-2 text-muted-foreground" />
                  ),
                  onClick: () => {
                    setBulkNetOffDrawerOpen(true);
                  },
                },
                {
                  label: "Hủy hạch toán hàng loạt",
                  icon: <XSquare className="w-4 h-4 mr-2 text-red-500" />,
                  onClick: () => {
                    setBulkPostingMode("unpost");
                    setBulkPostingModalOpen(true);
                  },
                },
              ],
            },
            {
              groupLabel: "Tải & Xuất tệp",
              items: [
                {
                  label: "Tải ZIP PDF/XML",
                  icon: <Download className="w-4 h-4 mr-2 text-blue-500" />,
                  onClick: () => setBulkSelectedModalOpen(true),
                },
              ],
            },
          ]}
        />
        <div className="w-[1px] h-8 bg-primary/20 z-10" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRowSelection({})}
          className="h-8 w-8 px-0 rounded-l-none border-l-0 border-primary/30 bg-primary/5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors focus:z-10"
          title={t("deselectAll", "Bỏ chọn")}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : null;

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

  const handleBulkDownloadSelected = async () => {
    if (bulkSelectedTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại file");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Không có hóa đơn nào được chọn");
      return;
    }

    try {
      setBulkSelectedDownloading(true);
      const blob = await erpInvoicesCoreApi.bulkDownloadSelected({
        ids: selectedIds,
        types: bulkSelectedTypes,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HoaDon_${selectedIds.length}_invoices.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBulkSelectedModalOpen(false);
      toast.success(`Đã tải ${selectedIds.length} hóa đơn thành công!`);
    } catch (error: any) {
      toast.error("Tải thất bại: " + error.message);
    } finally {
      setBulkSelectedDownloading(false);
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
      // Route to merged internal drawer
      formHook.openInternal({ id: viewId } as ErpInvoice);
      params.delete("viewId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "bank_transaction" && detail.id) {
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

  const handleExportExcel = () => {
    setExportDrawerOpen(true);
  };

  const buildExportBaseQuery =
    useCallback((): Partial<ErpInvoiceListParams> => {
      const { search, status, custom } = listHook.filterPanel.state;
      return {
        direction,
        search: search || undefined,
        seller_name: custom?.seller_name || undefined,
        buyer_name: custom?.buyer_name || undefined,
        status: status || undefined,
        tag_id: (custom?.tag_id as string) || undefined,
        sort_by: listHook.sortBy || undefined,
        sort_order: listHook.sortOrder || undefined,
        column_search:
          Object.keys(listHook.tableState.columnSearch).length > 0
            ? JSON.stringify(listHook.tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(listHook.tableState.columnFilters).length > 0
            ? JSON.stringify(listHook.tableState.columnFilters)
            : undefined,
      };
    }, [
      direction,
      listHook.filterPanel.state,
      listHook.sortBy,
      listHook.sortOrder,
      listHook.tableState.columnFilters,
      listHook.tableState.columnSearch,
    ]);

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
            if (branch) {
              const parts = branch.label.split(" — ");
              labelStr = parts.length > 1 ? parts[1] : branch.label;
            }
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
    [direction, branches],
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
            {inv.pdfFileKey ||
            (inv.pdfFiles && inv.pdfFiles.length > 0) ||
            (inv.attachments &&
              getPdfAttachments(inv.attachments).length > 0) ? (
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
                        !inv.attachments?.some(
                          (p: any) => p.attachment?.fileKey === inv.pdfFileKey,
                        ) && (
                          <div className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg mb-2">
                            <div className="flex flex-col min-w-0 flex-1 mr-2">
                              <span
                                className="truncate font-medium text-slate-700"
                                title="Hóa đơn PDF"
                              >
                                {(inv.pdfFileKey as string).split("/").pop() ||
                                  "Hóa đơn PDF"}
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
                      {getPdfAttachments(inv.attachments ?? []).map(
                        (pdf: any) => (
                          <div
                            key={pdf.attachment?.fileKey}
                            className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg"
                          >
                            <div className="flex flex-col min-w-0 flex-1 mr-2">
                              <span
                                className="truncate font-medium text-slate-700"
                                title={pdf.attachment?.fileName}
                              >
                                {pdf.attachment?.fileName}
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
                                const url = getFileViewUrl(pdf.attachment?.id);
                                setPreviewPdf({
                                  url,
                                  filename:
                                    pdf.attachment?.fileName || "document.pdf",
                                  fileKey: pdf.attachment?.id,
                                  invoiceId: inv.id,
                                  isAttachment: true,
                                });
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ),
                      )}
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
            hideFilter={true}
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
        size: 100,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd-MM-yyyy")
            : "",
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "font-medium text-primary text-left",
        cell: (inv) => (
          <TableText
            text={inv.invoiceNo || ""}
            onDrawerClick={(e) => {
              e.stopPropagation();
              formHook.openInternal(inv);
            }}
            tooltip={true}
            enableCopy={true}
          />
        ),
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 250,
        headerClassName: "text-center",
        className: "text-left",
        cell: (inv) => {
          const buyerDisplayName =
            inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "—";
          const text =
            direction === "IN" ? inv.sellerName || "—" : buyerDisplayName;
          const taxCode =
            direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;

          return (
            <TableText
              text={text}
              onDrawerClick={
                taxCode
                  ? (e) => {
                      e.stopPropagation();
                      setSelectedPartner({
                        taxCode,
                        partnerName: text !== "—" ? text : "",
                      });
                      setPartnerDrawerOpen(true);
                    }
                  : undefined
              }
              tooltip={true}
              enableCopy={true}
              textClassName="whitespace-normal line-clamp-2 break-words"
            />
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 150,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left",
        cell: (inv) => {
          const taxCode =
            direction === "IN"
              ? inv.sellerTaxCode || "—"
              : inv.buyerTaxCode || "—";
          const buyerDisplayName =
            inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "";
          const partnerName =
            direction === "IN" ? inv.sellerName || "" : buyerDisplayName;

          if (!taxCode || taxCode === "—") return "—";

          return (
            <TableText
              text={taxCode}
              onDrawerClick={(e) => {
                e.stopPropagation();
                setSelectedPartner({
                  taxCode,
                  partnerName,
                });
                setPartnerDrawerOpen(true);
              }}
              tooltip={true}
              enableCopy={true}
            />
          );
        },
      },
      {
        key: "taxInvoiceType",
        header: (
          <TableColumnHeaderFilter
            title={t("taxInvoiceType", "Loại HĐ")}
            sortState={getSortState("taxInvoiceType")}
            onSortChange={(state) => handleSortChange("taxInvoiceType", state)}
            searchValue={
              listHook.tableState.columnSearch["taxInvoiceType"] || ""
            }
            onSearchChange={(val) => handleSearchChange("taxInvoiceType", val)}
            selectedFilters={
              listHook.tableState.columnFilters["taxInvoiceType"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxInvoiceType", vals)
            }
            filterOptions={[
              { label: "HĐ Máy tính tiền", value: "CASH_REGISTER" },
              { label: "HĐ Điện tử", value: "STANDARD" },
            ]}
            align="center"
            columnKey="taxInvoiceType"
          />
        ),
        size: 150,
        className: "text-center text-xs",
        cell: (inv) => formatTaxInvoiceType(inv.taxInvoiceType),
      },
      {
        key: "taxInvoiceStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("taxInvoiceStatus", "Trạng thái (GDT)")}
            sortState={getSortState("taxInvoiceStatus")}
            onSortChange={(state) =>
              handleSortChange("taxInvoiceStatus", state)
            }
            searchValue={
              listHook.tableState.columnSearch["taxInvoiceStatus"] || ""
            }
            onSearchChange={(val) =>
              handleSearchChange("taxInvoiceStatus", val)
            }
            selectedFilters={
              listHook.tableState.columnFilters["taxInvoiceStatus"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxInvoiceStatus", vals)
            }
            filterOptions={[
              { label: "Mới", value: "1" },
              { label: "Thay thế", value: "2" },
              { label: "Điều chỉnh", value: "3" },
              { label: "Bị thay thế", value: "4" },
              { label: "Bị điều chỉnh", value: "5" },
              { label: "Bị hủy", value: "6" },
            ]}
            align="center"
            columnKey="taxInvoiceStatus"
          />
        ),
        size: 150,
        className: "text-center",
        cell: (inv) => {
          const lbl = formatTaxInvoiceStatus(inv.taxInvoiceStatus);

          let badgeClass =
            "w-[80px] border-slate-200 bg-slate-50 text-slate-700";
          switch (inv.taxInvoiceStatus) {
            case 1:
              badgeClass =
                "w-[80px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
              break;
            case 2:
            case 3:
            case 5:
              badgeClass =
                "w-[80px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
              break;
            case 4:
            case 6:
              badgeClass =
                "w-[80px] border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
              break;
          }

          return inv.taxInvoiceStatus != null ? (
            <Tooltip content={lbl}>
              <Badge variant="ghost" className={`border ${badgeClass}`}>
                <span className="truncate block max-w-full">{lbl}</span>
              </Badge>
            </Tooltip>
          ) : (
            "—"
          );
        },
      },
      {
        key: "taxProcessStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("taxProcessStatus", "KQ Kiểm tra")}
            sortState={getSortState("taxProcessStatus")}
            onSortChange={(state) =>
              handleSortChange("taxProcessStatus", state)
            }
            searchValue={
              listHook.tableState.columnSearch["taxProcessStatus"] || ""
            }
            onSearchChange={(val) =>
              handleSearchChange("taxProcessStatus", val)
            }
            selectedFilters={
              listHook.tableState.columnFilters["taxProcessStatus"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("taxProcessStatus", vals)
            }
            filterOptions={[
              { label: "Cục Thuế đã nhận", value: "0" },
              { label: "Đang tiến hành kiểm tra điều kiện cấp mã", value: "1" },
              {
                label: "CQT từ chối hóa đơn theo từng lần phát sinh",
                value: "2",
              },
              { label: "Hóa đơn đủ điều kiện cấp mã", value: "3" },
              { label: "Hóa đơn không đủ điều kiện cấp mã", value: "4" },
              { label: "Đã cấp mã hóa đơn", value: "5" },
              { label: "Cục Thuế đã nhận không mã", value: "6" },
              { label: "Đã kiểm tra định kỳ HĐĐT không có mã", value: "7" },
              {
                label:
                  "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền",
                value: "8",
              },
            ]}
            align="center"
            columnKey="taxProcessStatus"
          />
        ),
        size: 150,
        className: "text-center text-xs whitespace-normal",
        cell: (inv) => {
          const lbl = formatTaxProcessStatus(inv.taxProcessStatus);
          return lbl !== "—" ? (
            <Tooltip content={lbl}>
              <Badge
                variant="outline"
                className="w-[100px] bg-slate-50 text-slate-700 hover:bg-slate-100"
              >
                <span className="truncate block max-w-full">{lbl}</span>
              </Badge>
            </Tooltip>
          ) : (
            "—"
          );
        },
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 300,
        className: "text-left whitespace-normal",
        headerClassName: "text-center",
        cell: (row) => {
          const popoverContent = (
            <div className="p-3 max-h-[350px] w-[850px] max-w-[90vw] overflow-auto">
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
                    {row.items.map((item: any, idx: number) => {
                      const compVatAmt =
                        Number(item.vatAmount) ||
                        (Number(item.preVatAmount) || 0) *
                          (Number(item.vatRate) || 0);
                      const compTotalAmt =
                        (Number(item.preVatAmount) || 0) + compVatAmt;
                      return (
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
                            {fmtAmt(compVatAmt.toString())}
                          </td>
                          <td className="px-2 py-1 text-right whitespace-nowrap font-semibold text-slate-800">
                            {fmtAmt(compTotalAmt.toString())}
                          </td>
                        </tr>
                      );
                    })}
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
                            .reduce((acc: number, item: any) => {
                              const compVatAmt =
                                Number(item.vatAmount) ||
                                (Number(item.preVatAmount) || 0) *
                                  (Number(item.vatRate) || 0);
                              return acc + compVatAmt;
                            }, 0)
                            .toString(),
                        )}
                      </td>
                      <td className="px-2 py-2 font-semibold text-right text-slate-800">
                        {fmtAmt(
                          row.items
                            .reduce((acc: number, item: any) => {
                              const compVatAmt =
                                Number(item.vatAmount) ||
                                (Number(item.preVatAmount) || 0) *
                                  (Number(item.vatRate) || 0);
                              return (
                                acc +
                                (Number(item.preVatAmount) || 0) +
                                compVatAmt
                              );
                            }, 0)
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
          );

          return (
            <TableText
              text={(row.description || "—").replace(/\\n/g, " ")}
              tooltip={true}
              popoverContent={popoverContent}
              textClassName="line-clamp-2 break-words whitespace-normal text-slate-700"
            />
          );
        },
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.discountAmount),
      },
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("preVatAmount", "Trước GTGT")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => fmtAmt(row.preVatAmount),
      },
      {
        key: "vatRate",
        header: (
          <TableColumnHeaderFilter
            title={t("vatRate", "Thuế suất GTGT")}
            sortState={getSortState("vatRate")}
            onSortChange={(state) => handleSortChange("vatRate", state)}
            searchValue={listHook.tableState.columnSearch["vatRate"] || ""}
            onSearchChange={(val) => handleSearchChange("vatRate", val)}
            selectedFilters={listHook.tableState.columnFilters["vatRate"] || []}
            onFilterChange={(vals) => handleFilterChange("vatRate", vals)}
            align="center"
            columnKey="vatRate"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row) =>
          row.vatRate != null ? `${Number(row.vatRate) * 100}%` : "",
      },
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("vatAmount", "Thuế GTGT")}
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv) => fmtAmt(inv.vatAmount),
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
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
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
        header: (
          <TableColumnHeaderFilter
            title={t("netOffAmount", "Đã cấn trừ")}
            sortState={getSortState("netOffAmount")}
            onSortChange={(state) => handleSortChange("netOffAmount", state)}
            searchValue={listHook.tableState.columnSearch["netOffAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("netOffAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["netOffAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("netOffAmount", vals)}
            align="right"
            filterOptions={[
              { value: "settled_full", label: "Đã cấn trừ hết" },
              { value: "settled_partial", label: "Đã cấn trừ một phần" },
              { value: "unsettled", label: "Chưa cấn trừ" },
            ]}
          />
        ),
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
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.columns.remainingAmount", "Còn lại")}
            sortState={getSortState("remainingAmount")}
            onSortChange={(state) => handleSortChange("remainingAmount", state)}
            searchValue={
              listHook.tableState.columnSearch["remainingAmount"] || ""
            }
            onSearchChange={(val) => handleSearchChange("remainingAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["remainingAmount"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("remainingAmount", vals)
            }
            align="right"
            filterOptions={[
              { value: "settled_full", label: "Đã cấn trừ hết" },
              { value: "settled_partial", label: "Đã cấn trừ một phần" },
              { value: "unsettled", label: "Chưa cấn trừ" },
            ]}
          />
        ),
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
        key: "postingStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("postingStatus", "Hạch toán")}
            sortState={getSortState("postingStatus")}
            onSortChange={(state) => handleSortChange("postingStatus", state)}
            searchValue={
              listHook.tableState.columnSearch["postingStatus"] || ""
            }
            onSearchChange={(val) => handleSearchChange("postingStatus", val)}
            selectedFilters={
              listHook.tableState.columnFilters["postingStatus"] || []
            }
            onFilterChange={(vals) => handleFilterChange("postingStatus", vals)}
            filterOptions={[
              { label: "HẠCH TOÁN", value: "POSTED" },
              { label: "CHƯA HẠCH TOÁN", value: "UNPOSTED" },
            ]}
            align="center"
            columnKey="postingStatus"
          />
        ),
        size: 150,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv) => {
          const isPosted = inv.postingStatus === "POSTED";
          const lbl = isPosted ? "Hạch toán" : "Chưa hạch toán";
          return (
            <Tooltip content={lbl}>
              <Badge
                variant="ghost"
                className={`border w-[110px] ${
                  isPosted
                    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {lbl}
              </Badge>
            </Tooltip>
          );
        },
      },
      ...(direction === "IN"
        ? [
            {
              key: "isValid",
              header: (
                <TableColumnHeaderFilter
                  title={t("invoice.columns.isValid", "HĐ hợp lệ")}
                  sortState="none"
                  onSortChange={() => {}}
                  searchValue=""
                  onSearchChange={() => {}}
                  selectedFilters={
                    listHook.tableState.columnFilters["isValid"] || []
                  }
                  onFilterChange={(vals) => handleFilterChange("isValid", vals)}
                  align="center"
                  columnKey="isValid"
                  queryKeyPrefix="erp-invoice-options"
                  allFilters={listHook.tableState.columnFilters}
                  fetchOptions={async ({ search }: { search: string }) => {
                    const options = [
                      {
                        value: "true",
                        label: t("invoice.isValid.true", "Hợp lệ"),
                      },
                      {
                        value: "false",
                        label: t("invoice.isValid.false", "Chưa hợp lệ"),
                      },
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
              size: 150,
              headerClassName: "text-center",
              className: "text-center",
              cell: (inv: any) =>
                inv.isValid ? (
                  <Badge
                    variant="ghost"
                    className="border border-emerald-200 bg-emerald-50 text-emerald-700 w-[85px] hover:bg-emerald-100"
                  >
                    <span className="truncate block max-w-full">
                      {t("invoice.isValid.true", "Hợp lệ")}
                    </span>
                  </Badge>
                ) : (
                  <Badge
                    variant="ghost"
                    className="border border-slate-200 bg-slate-50 text-slate-700 w-[85px] hover:bg-slate-100"
                  >
                    <span className="truncate block max-w-full">
                      {t("invoice.isValid.false", "Chưa hợp lệ")}
                    </span>
                  </Badge>
                ),
            } as DataTableColumn<ErpInvoice>,
          ]
        : []),
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
            queryKeyPrefix={`erp-invoice-options-branch-${branches.length}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.branchId) return "—";
          const branch = branches.find((b) => b.value === inv.branchId);
          if (!branch) return inv.branchId;
          const parts = branch.label.split(" — ");
          return parts.length > 1 ? parts[1] : branch.label;
        },
      },

      {
        key: "invoiceCategory",
        header: (
          <TableColumnHeaderFilter
            title="Phân loại HĐ"
            sortState={getSortState("invoiceCategory")}
            onSortChange={(state) => handleSortChange("invoiceCategory", state)}
            searchValue={
              listHook.tableState.columnSearch["invoiceCategory"] || ""
            }
            onSearchChange={(val) => handleSearchChange("invoiceCategory", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceCategory"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("invoiceCategory", vals)
            }
            align="center"
            columnKey="invoiceCategory"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 140,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.invoiceCategory) return "—";
          return INVOICE_TYPE_MAP[inv.invoiceCategory] || inv.invoiceCategory;
        },
      },
      {
        key: "notes",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.columns.notes", "Ghi chú")}
            sortState={getSortState("notes")}
            onSortChange={(state) => handleSortChange("notes", state)}
            searchValue={listHook.tableState.columnSearch["notes"] || ""}
            onSearchChange={(val) => handleSearchChange("notes", val)}
            selectedFilters={listHook.tableState.columnFilters["notes"] || []}
            onFilterChange={(vals) => handleFilterChange("notes", vals)}
            align="center"
            columnKey="notes"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 200,
        headerClassName: "text-center",
        className: "text-left whitespace-normal",
        cell: (inv: any) => {
          if (!inv.notes) return "—";
          return (
            <Popover
              content={
                <div className="p-3 max-h-[300px] max-w-[400px] overflow-auto whitespace-pre-wrap text-sm text-slate-700">
                  {inv.notes}
                </div>
              }
            >
              <div
                className="group flex w-full cursor-pointer hover:text-primary text-slate-700 items-center justify-between gap-1"
                title={inv.notes}
              >
                <div className="line-clamp-2 break-words flex-1 text-left">
                  {inv.notes}
                </div>
                {inv.notes && (
                  <div className="opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                )}
              </div>
            </Popover>
          );
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
    listHook.filterPanel.state.dateFrom,
    listHook.filterPanel.state.dateTo,
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
        hideHeader={isDrawer}
        defaultColumnOrder={["__selection", "__actions", "__expand"]}
        title={
          direction === "IN"
            ? t("inbound", "Hóa đơn mua vào")
            : t("outbound", "Hóa đơn bán ra")
        }
        desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
        icon={<Receipt className="h-5 w-5" />}
        tableId={
          isDrawer
            ? `erp-invoices-table-checkpoint-${direction}`
            : `erp-invoices-table-${direction}`
        }
        items={listHook.invoices}
        columns={columns}
        getRowKey={(r) => r.id}
        summaryRow={summaryRow}
        loading={listHook.loading}
        emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
        minWidth={1200}
        activeFilterCount={
          listHook.filterPanel.activeFilterCount +
          (listHook.tableState.activeFilterCount || 0)
        }
        onClearAllFilters={() => {
          listHook.filterPanel.resetAll();
          listHook.setPage(1);
        }}
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
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={(updater) =>
          setRowSelection((prev) =>
            typeof updater === "function" ? updater(prev) : updater,
          )
        }
        bulkActionsNode={bulkActionsNode}
        filterConfig={filterConfig}
        filter={listHook.filterPanel}
        rowActions={(inv) => {
          const traCuuItems = [];
          const thaoTacItems = [];

          traCuuItems.push({
            label: t("actionDetail", "Chi tiết hóa đơn"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => formHook.openInternal(inv),
          });
          if (inv.xmlFileKey) {
            traCuuItems.push({
              label: t("actionDownloadXml", "Tải XML"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: () => handleDownload(inv.id, "xml"),
            });
          }
          const hasPdf =
            inv.pdfFileKey ||
            (inv.pdfFiles && inv.pdfFiles.length > 0) ||
            (inv.attachments && getPdfAttachments(inv.attachments).length > 0);
          if (hasPdf) {
            traCuuItems.push({
              label: t("actionDownloadPdf", "Tải PDF"),
              icon: <Download className="w-3.5 h-3.5" />,
              onClick: async () => {
                if (inv.attachments && inv.attachments.length > 1) {
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
                } else if (inv.attachments && inv.attachments.length === 1) {
                  const f = inv.attachments[0];
                  try {
                    const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                      inv.id,
                      f.attachment?.fileKey,
                      false,
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = f.attachment?.fileName || "document.pdf";
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

          if (inv.status === "DRAFT") {
            thaoTacItems.push({
              label: t("actionDelete", "Xóa"),
              icon: <Trash className="w-3.5 h-3.5" />,
              variant: "danger" as const,
              onClick: () => {
                formHook.openInternal(inv);
                formHook.setDeleteConfirm(true);
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
        onCreate={() => setImportModalOpen(true)}
        createLabel={t("syncInvoices", "Đồng bộ hóa đơn")}
        createIcon={<DownloadCloud className="w-4 h-4 mr-1 text-indigo-100" />}
        createActions={[
          {
            groupLabel: t("groupTraCuu", "Tra cứu"),
            items: [
              {
                label: t("exportExcel", "Xuất Excel"),
                icon: <Download className="w-4 h-4 text-green-600" />,
                onClick: () => handleExportExcel(),
              },
            ],
          },
          ...(canEditInvoice
            ? [
                {
                  groupLabel: t("groupThaoTac", "Thao tác"),
                  items: [
                    {
                      label: t("loginTaxPortal", "Đăng nhập Cổng Thuế"),
                      icon: <KeyRound className="w-4 h-4 text-primary" />,
                      onClick: () => setPortalAuthOpen(true),
                    },
                  ],
                },
              ]
            : []),
        ]}
      />

      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        rightPanel={
          <div className="flex flex-col gap-5">
            {formHook.loadingDetail ? (
              <div className="space-y-6">
                <div className="h-[200px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
                <div className="h-[300px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              </div>
            ) : (
              <ErpInvoiceInternalSidebar
                form={formHook.form}
                editMode={formHook.editMode}
                fieldSet={(key: string, value: any) =>
                  formHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                invoiceId={formHook.detailInvoice?.id ?? null}
                pendingTagIds={formHook.pendingTagIds}
                onPendingTagsChange={formHook.setPendingTagIds}
                direction={direction}
                detailInvoice={formHook.detailInvoice}
                onRefreshDetail={formHook.handleSyncDetail}
                pdfSlot={
                  <ErpInvoicePdfUpload
                    invoiceId={formHook.detailInvoice?.id ?? null}
                    attachments={formHook.detailInvoice?.attachments ?? null}
                    pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
                    pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
                    editMode={formHook.editMode}
                    pendingDeletedPdfs={formHook.form.pendingDeletedPdfs}
                    onPendingDeletePdf={(key) => {
                      const current = formHook.form.pendingDeletedPdfs || [];
                      formHook.setForm((prev) => ({
                        ...prev,
                        pendingDeletedPdfs: [...current, key],
                      }));
                    }}
                    pendingAddedAttachments={
                      formHook.form.pendingAddedAttachments
                    }
                    onPendingAddedAttachmentsChange={(files) => {
                      formHook.setForm((prev) => ({
                        ...prev,
                        pendingAddedAttachments: files,
                      }));
                    }}
                  />
                }
              />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {formHook.loadingDetail ? (
            <div className="space-y-6">
              <div className="h-[250px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
            </div>
          ) : (
            <>
              {formHook.formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {formHook.formError}
                </div>
              )}
              <ErpInvoiceInternalMain
                form={formHook.form}
                editMode={formHook.editMode}
                fieldSet={(key: string, value: any) =>
                  formHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                direction={direction}
                detailInvoice={formHook.detailInvoice}
                postingState={formHook.postingState}
                pendingUnpost={formHook.pendingUnpost}
                onUnpost={() => formHook.setPendingUnpost(true)}
                onRefreshDetail={() => {
                  if (formHook.detailInvoice?.id) {
                    formHook.openInternal({
                      id: formHook.detailInvoice.id,
                    } as ErpInvoice);
                  }
                }}
                invoicePreview={
                  formHook.detailInvoice ? (
                    <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                  ) : undefined
                }
              />
            </>
          )}
        </div>
      </ErpInvoiceInternalDrawer>

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

      <GdtPortalAuthDrawer
        open={portalAuthOpen}
        onClose={() => setPortalAuthOpen(false)}
      />

      <FilePreviewDrawer
        open={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        previewUrl={previewPdf?.url}
        fileName={previewPdf?.filename}
        fetchBlobFn={
          previewPdf
            ? () =>
                previewPdf.isAttachment
                  ? getAttachmentContentBlobApi(previewPdf.fileKey)
                  : erpInvoicesCoreApi.getPdfBlob(
                      previewPdf.invoiceId,
                      previewPdf.fileKey,
                    )
            : undefined
        }
        onDownload={
          previewPdf
            ? async () => {
                try {
                  const url = previewPdf.isAttachment
                    ? (await getAttachmentDownloadUrlApi(previewPdf.fileKey))
                        .url
                    : (
                        await erpInvoicesCoreApi.getPdfDownloadUrl(
                          previewPdf.invoiceId,
                          previewPdf.fileKey,
                          false,
                        )
                      ).url;
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

      <InvoiceExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        direction={direction}
        buildBaseQuery={buildExportBaseQuery}
      />

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />

      <DrawerModal
        open={bulkSelectedModalOpen}
        onClose={() => setBulkSelectedModalOpen(false)}
        title={`Tải ZIP ${selectedIds.length} hóa đơn đã chọn`}
        actions={[
          {
            label: "Hủy",
            onClick: () => setBulkSelectedModalOpen(false),
            variant: "outline" as const,
            disabled: bulkSelectedDownloading,
          },
          {
            label: bulkSelectedDownloading
              ? "Đang nén file..."
              : "Xác nhận tải",
            onClick: handleBulkDownloadSelected,
            primary: true,
            disabled: bulkSelectedDownloading,
            loading: bulkSelectedDownloading,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Đã chọn <strong>{selectedIds.length}</strong> hóa đơn. Hệ thống sẽ
            nén PDF/XML của các hóa đơn này thành 1 file ZIP.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Định dạng file tải về *
            </label>
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkSelectedTypes.includes("pdf")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkSelectedTypes((prev) =>
                        prev.includes("pdf") ? prev : [...prev, "pdf"],
                      );
                    } else {
                      setBulkSelectedTypes((prev) =>
                        prev.filter((t) => t !== "pdf"),
                      );
                    }
                  }}
                />
                <span className="text-sm">File PDF</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={bulkSelectedTypes.includes("xml")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBulkSelectedTypes((prev) =>
                        prev.includes("xml") ? prev : [...prev, "xml"],
                      );
                    } else {
                      setBulkSelectedTypes((prev) =>
                        prev.filter((t) => t !== "xml"),
                      );
                    }
                  }}
                />
                <span className="text-sm">File XML</span>
              </label>
            </div>
          </div>
        </div>
      </DrawerModal>

      <DrawerModal
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Tải hàng loạt hóa đơn"
        actions={[
          {
            label: "Hủy",
            onClick: () => setBulkDrawerOpen(false),
            variant: "outline" as const,
            disabled: bulkDownloading,
          },
          {
            label: bulkDownloading ? "Đang nén file..." : "Xác nhận tải",
            onClick: handleBulkDownloadFiles,
            primary: true,
            disabled: bulkDownloading,
            loading: bulkDownloading,
          },
        ]}
      >
        <div className="space-y-6">
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
        </div>
      </DrawerModal>

      <BulkEditDrawer
        open={bulkEditDrawerOpen}
        onClose={() => setBulkEditDrawerOpen(false)}
        selectedIds={selectedIds}
        invoices={listHook.invoices || []}
        branches={branches}
        onSuccess={() => {
          setBulkEditDrawerOpen(false);
          setRowSelection({});
          listHook.loadInvoices();
        }}
      />

      <InvoiceBulkPostingDrawer
        open={bulkPostingModalOpen}
        mode={bulkPostingMode}
        onClose={() => setBulkPostingModalOpen(false)}
        selectedInvoiceIds={selectedIds}
        invoices={listHook.invoices || []}
        direction={direction}
        onSuccess={() => {
          setBulkPostingModalOpen(false);
          setRowSelection({});
          listHook.loadInvoices();
        }}
      />

      <InvoiceBulkNetOffDrawer
        open={bulkNetOffDrawerOpen}
        onClose={() => setBulkNetOffDrawerOpen(false)}
        selectedInvoiceIds={selectedIds}
        invoices={listHook.invoices || []}
        direction={direction}
        onSuccess={() => {
          setBulkNetOffDrawerOpen(false);
          setRowSelection({});
          listHook.loadInvoices();
        }}
      />

      <PartnerInvoiceDrawer
        open={partnerDrawerOpen}
        onClose={() => setPartnerDrawerOpen(false)}
        taxCode={selectedPartner?.taxCode}
        partnerName={selectedPartner?.partnerName}
      />
    </>
  );
}
