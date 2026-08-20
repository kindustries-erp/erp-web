import React, { useState, useMemo, useEffect } from "react";
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { garageApi } from "@/modules/garage/api/garageApi";
import { toast } from "react-hot-toast";
import { money } from "@/shared/utils/format";
import {
  Sparkles,
  Loader2,
  FileCode,
  FileText,
  Eye,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { Textarea } from "@/shared/components/ui/textarea";
import { SmartInvoiceSuggestionCard } from "./SmartInvoiceSuggestionCard";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { getFileViewUrl } from "@/modules/system/api/attachmentsApi";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { cn } from "@/shared/utils";

export interface InvoiceLinkPayloadItem {
  invoiceId: string;
  linkType: "IN" | "OUT";
  note?: string;
  invoice?: ErpInvoice;
}

export interface InvoiceSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  defaultLinkType?: "IN" | "OUT";
  onSuccess?: () => void;
  onSubmit: (
    payloads: InvoiceLinkPayloadItem[] | InvoiceLinkPayloadItem,
  ) => Promise<void> | void;
}

function getPdfAttachments(attachments: any[]) {
  return (attachments ?? []).filter(
    (a) => a.attachment?.mimeType === "application/pdf",
  );
}

export function InvoiceSelectionDrawer({
  open,
  onClose,
  caseId,
  caseCode,
  defaultLinkType = "OUT",
  onSuccess,
  onSubmit,
}: InvoiceSelectionDrawerProps) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);
  const [linkType, setLinkType] = useState<"IN" | "OUT">(defaultLinkType);
  const [selectedInvoicesMap, setSelectedInvoicesMap] = useState<
    Record<string, ErpInvoice>
  >({});
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
    isAttachment?: boolean;
  } | null>(null);

  const tableState = useTableColumnState("garage-invoice-selection-table");

  // Query case financial summary if caseId is present
  const { data: caseFinancialSummary } = useQuery({
    queryKey: ["garage-case-financial-summary-in-invoice-modal", caseId],
    queryFn: () =>
      caseId
        ? garageApi.getCaseFinancialSummary(caseId)
        : Promise.resolve(null),
    enabled: open && !!caseId,
  });

  // Query smart invoice suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["garage-case-smart-invoice-suggestions", caseId, linkType],
    queryFn: () =>
      caseId
        ? garageApi.getSmartInvoiceSuggestions(caseId, linkType)
        : Promise.resolve([]),
    enabled: open && !!caseId,
  });

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setLinkType(defaultLinkType);
      setSelectedInvoicesMap({});
      setViewInvoiceId(null);
      setNote("");
      setPage(1);
    }
  }, [open, defaultLinkType]);

  const selectedInvoicesList = useMemo(
    () => Object.values(selectedInvoicesMap),
    [selectedInvoicesMap],
  );
  const selectedCount = selectedInvoicesList.length;
  const selectedTotalAmount = useMemo(() => {
    return selectedInvoicesList.reduce(
      (sum, inv) => sum + Number(inv.totalAmount || 0),
      0,
    );
  }, [selectedInvoicesList]);

  // Only pass sort_by and sort_order if user explicitly sorted a column in tableState (BE defaults to invoiceDate DESC)
  const sortBy =
    tableState.sorts.length > 0
      ? tableState.sorts[0]?.replace("-", "")
      : undefined;
  const sortOrder =
    tableState.sorts.length > 0
      ? tableState.sorts[0]?.startsWith("-")
        ? "desc"
        : "asc"
      : undefined;

  // Query invoices list
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: [
      "erp-invoices-for-linking",
      linkType,
      page,
      pageSize,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page,
        pageSize,
        direction: linkType,
        sort_by: sortBy,
        sort_order: sortOrder,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open,
  });

  const handleDownload = async (id: string, type: "xml" | "pdf") => {
    try {
      const res = await erpInvoicesCoreApi.getDownloadUrl(id, type);
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch {
      toast.error(t("erpInvoices:downloadFailed", "Không thể tải file"));
    }
  };

  const handleToggleInvoice = (inv: ErpInvoice) => {
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      if (next[inv.id]) {
        delete next[inv.id];
      } else {
        next[inv.id] = inv;
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    const items = invoiceData?.items || [];
    if (items.length === 0) return;
    const allSelected = items.every(
      (inv: ErpInvoice) => !!selectedInvoicesMap[inv.id],
    );
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      if (allSelected) {
        items.forEach((inv: ErpInvoice) => {
          delete next[inv.id];
        });
      } else {
        items.forEach((inv: ErpInvoice) => {
          next[inv.id] = inv;
        });
      }
      return next;
    });
  };

  const handleToggleSuggestion = (s: any) => {
    if (!s?.invoice) return;
    const inv = s.invoice;
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      if (next[inv.id]) {
        delete next[inv.id];
        toast.success(`Đã bỏ chọn HĐ: ${inv.invoiceNo || "---"}`);
      } else {
        next[inv.id] = inv;
        toast.success(
          `Đã chọn HĐ: ${inv.invoiceNo || "---"} (${money(inv.totalAmount)})`,
        );
      }
      return next;
    });
  };

  const handleSelectAllSuggestions = () => {
    if (!suggestions || suggestions.length === 0) return;
    const allSuggestedSelected = suggestions.every(
      (s: any) => !!selectedInvoicesMap[s.invoice.id],
    );
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      if (allSuggestedSelected) {
        suggestions.forEach((s: any) => {
          delete next[s.invoice.id];
        });
        toast.success("Đã bỏ chọn toàn bộ gợi ý");
      } else {
        suggestions.forEach((s: any) => {
          next[s.invoice.id] = s.invoice;
        });
        toast.success(`Đã chọn toàn bộ ${suggestions.length} hóa đơn gợi ý`);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedCount === 0) {
      toast.error(
        t(
          "cases.invoiceDrawer.selectPrompt",
          "Vui lòng chọn ít nhất 1 hóa đơn để liên kết",
        ),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payloads: InvoiceLinkPayloadItem[] = selectedInvoicesList.map(
        (inv) => ({
          invoiceId: inv.id,
          linkType,
          note: note || undefined,
          invoice: inv,
        }),
      );

      await onSubmit(payloads);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Lỗi liên kết hóa đơn",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInvoiceOptions = async ({
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
      linkType,
    );
    return {
      items: res.items.map((i: any) => {
        const valStr =
          typeof i === "object" ? String(i.value || i.id || i) : String(i);
        const labelStr =
          typeof i === "object"
            ? String(i.label || i.name || valStr)
            : String(i);
        return { label: labelStr, value: valStr };
      }),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };

  const getSortState = (columnKey: string): "asc" | "desc" | "none" => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const isAllCurrentPageSelected = useMemo(() => {
    const items = invoiceData?.items || [];
    if (items.length === 0) return false;
    return items.every((inv: ErpInvoice) => !!selectedInvoicesMap[inv.id]);
  }, [invoiceData?.items, selectedInvoicesMap]);

  const isSomeCurrentPageSelected = useMemo(() => {
    const items = invoiceData?.items || [];
    if (items.length === 0) return false;
    return (
      items.some((inv: ErpInvoice) => !!selectedInvoicesMap[inv.id]) &&
      !isAllCurrentPageSelected
    );
  }, [invoiceData?.items, selectedInvoicesMap, isAllCurrentPageSelected]);

  const columns = useMemo(() => {
    const isOut = linkType === "OUT";

    return [
      {
        key: "select",
        header: (
          <div
            className="flex items-center justify-center w-full h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAllOnPage();
            }}
            title="Chọn/Bỏ chọn tất cả trang này"
          >
            <Checkbox
              checked={
                isAllCurrentPageSelected
                  ? true
                  : isSomeCurrentPageSelected
                    ? "indeterminate"
                    : false
              }
              className="h-4 w-4 pointer-events-none"
            />
          </div>
        ),
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        size: 40,
        cell: (row: ErpInvoice) => {
          const isSelected = !!selectedInvoicesMap[row.id];
          return (
            <div
              className="flex items-center justify-center w-full h-full cursor-pointer py-1"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleInvoice(row);
              }}
            >
              <Checkbox
                checked={isSelected}
                className="h-4 w-4 pointer-events-none"
              />
            </div>
          );
        },
      },
      {
        key: "attachments",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:attachments", "Chứng từ")}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={tableState.columnFilters["attachments"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("attachments", vals);
              setPage(1);
            }}
            align="center"
            columnKey="attachments"
            filterOptions={[
              { value: "has_pdf", label: "Có file PDF" },
              { value: "has_xml", label: "Có file XML" },
              { value: "no_pdf", label: "Không có file PDF" },
              { value: "no_xml", label: "Không có file XML" },
            ]}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-center",
        enableResizing: true,
        cell: (inv: ErpInvoice) => (
          <div className="flex items-center justify-center gap-1.5">
            {inv.xmlFileKey ? (
              <Tooltip content={t("erpInvoices:downloadXml", "Tải file XML")}>
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
              <Tooltip content={t("erpInvoices:noXml", "Chưa có file XML")}>
                <FileCode className="w-4 h-4 text-slate-300 dark:text-slate-600" />
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
                  <div className="p-3 w-[320px]">
                    <div className="text-xs font-semibold mb-2 text-slate-800 dark:text-slate-200">
                      Danh sách file PDF
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                      {inv.pdfFileKey && (
                        <div className="flex items-center justify-between text-xs py-1.5 px-2.5 border rounded-lg">
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                            {(inv.pdfFileKey as string).split("/").pop() ||
                              "Hóa đơn PDF (Gốc)"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopoverId(null);
                              handleDownload(inv.id, "pdf");
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      {getPdfAttachments(inv.attachments ?? []).map(
                        (pdf: any) => (
                          <div
                            key={pdf.attachment?.fileKey || pdf.attachment?.id}
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 border rounded-lg"
                          >
                            <span className="truncate font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                              {pdf.attachment?.fileName || "Hóa đơn đính kèm"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                }
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Tooltip content={t("erpInvoices:pdfList", "File PDF")}>
                    <div className="cursor-pointer">
                      <FileText className="w-4 h-4 text-slate-700 hover:text-primary transition-colors" />
                    </div>
                  </Tooltip>
                </div>
              </Popover>
            ) : (
              <Tooltip content={t("erpInvoices:noPdf", "Chưa có file PDF")}>
                <FileText className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:invoiceDate", "Ngày HĐ")}
            sortState={getSortState("invoiceDate")}
            onSortChange={(state) => {
              tableState.setSort("invoiceDate", state);
              setPage(1);
            }}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
            columnKey="invoiceDate"
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(dateFrom || dateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChange={(from, to) => {
                  setDateFrom(from);
                  setDateTo(to);
                  setPage(1);
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-right",
        enableResizing: true,
        cell: (inv: ErpInvoice) => (
          <TableDateCell
            date={inv.invoiceDate}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:invoiceNo", "Số HĐ")}
            sortState={getSortState("invoiceNo")}
            onSortChange={(state) => {
              tableState.setSort("invoiceNo", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("invoiceNo", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["invoiceNo"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("invoiceNo", vals);
              setPage(1);
            }}
            align="center"
            columnKey="invoiceNo"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 130,
        headerClassName: "text-center",
        className: "font-medium text-primary text-left",
        enableResizing: true,
        cell: (inv: ErpInvoice) => (
          <TableText
            text={inv.invoiceNo || "---"}
            onDetailClick={(e) => {
              e.stopPropagation();
              setViewInvoiceId(inv.id);
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
            title={t("erpInvoices:serialNo", "Ký hiệu")}
            sortState={getSortState("serialNo")}
            onSortChange={(state) => {
              tableState.setSort("serialNo", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("serialNo", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["serialNo"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("serialNo", vals);
              setPage(1);
            }}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-muted-foreground text-left font-mono text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) => inv.serialNo || "—",
      },
      {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title={
              isOut
                ? t("erpInvoices:buyer", "Bên mua")
                : t("erpInvoices:seller", "Bên bán")
            }
            sortState={getSortState("partner")}
            onSortChange={(state) => {
              tableState.setSort("partner", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["partner"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("partner", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["partner"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("partner", vals);
              setPage(1);
            }}
            align="center"
            columnKey="partner"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 240,
        headerClassName: "text-center",
        className: "text-left",
        enableResizing: true,
        cell: (inv: ErpInvoice) => {
          const buyerDisplayName =
            inv.buyerName?.trim() || inv.buyerPersonalName?.trim() || "—";
          const text = isOut ? buyerDisplayName : inv.sellerName || "—";

          return (
            <TableText
              text={text}
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
            title={t("erpInvoices:taxCode", "MST")}
            sortState={getSortState("taxCode")}
            onSortChange={(state) => {
              tableState.setSort("taxCode", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["taxCode"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("taxCode", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["taxCode"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("taxCode", vals);
              setPage(1);
            }}
            align="center"
            columnKey="taxCode"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 130,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left font-mono",
        enableResizing: true,
        cell: (inv: ErpInvoice) => {
          const taxCode = isOut
            ? inv.buyerTaxCode || "—"
            : inv.sellerTaxCode || "—";
          if (!taxCode || taxCode === "—") return "—";
          return <TableText text={taxCode} tooltip={true} enableCopy={true} />;
        },
      },
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:description", "Diễn giải")}
            sortState={getSortState("description")}
            onSortChange={(state) => {
              tableState.setSort("description", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["description"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("description", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["description"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("description", vals);
              setPage(1);
            }}
            align="center"
            columnKey="description"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 260,
        headerClassName: "text-center",
        className: "text-left whitespace-normal",
        enableResizing: true,
        cell: (row: ErpInvoice) => (
          <TableText
            text={(row.description || "—").replace(/\n/g, " ")}
            tooltip={true}
            textClassName="line-clamp-2 break-words whitespace-normal text-slate-700 dark:text-slate-300 text-xs"
          />
        ),
      },
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:preVatAmount", "Trước GTGT")}
            sortState={getSortState("preVatAmount")}
            onSortChange={(state) => {
              tableState.setSort("preVatAmount", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["preVatAmount"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("preVatAmount", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["preVatAmount"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("preVatAmount", vals);
              setPage(1);
            }}
            align="center"
            columnKey="preVatAmount"
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right font-mono tabular-nums text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) =>
          inv.preVatAmount ? money(Number(inv.preVatAmount)) : "—",
      },
      {
        key: "vatRate",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:vatRate", "Thuế suất")}
            sortState={getSortState("vatRate")}
            onSortChange={(state) => {
              tableState.setSort("vatRate", state);
              setPage(1);
            }}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
            columnKey="vatRate"
            hideFilter={true}
          />
        ),
        size: 90,
        headerClassName: "text-center",
        className: "text-center font-mono text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) =>
          inv.vatRate != null ? `${Number(inv.vatRate) * 100}%` : "—",
      },
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:vatAmount", "Tiền thuế")}
            sortState={getSortState("vatAmount")}
            onSortChange={(state) => {
              tableState.setSort("vatAmount", state);
              setPage(1);
            }}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            align="center"
            columnKey="vatAmount"
            hideFilter={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-right font-mono tabular-nums text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) =>
          inv.vatAmount ? money(Number(inv.vatAmount)) : "—",
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:totalAmount", "Tổng tiền")}
            sortState={getSortState("totalAmount")}
            onSortChange={(state) => {
              tableState.setSort("totalAmount", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("totalAmount", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["totalAmount"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("totalAmount", vals);
              setPage(1);
            }}
            align="center"
            columnKey="totalAmount"
          />
        ),
        size: 130,
        headerClassName: "text-center",
        className:
          "text-right font-semibold font-mono tabular-nums text-primary text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) => money(Number(inv.totalAmount || 0)),
      },
      {
        key: "licensePlate",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:licensePlate", "Biển số xe")}
            sortState={getSortState("licensePlate")}
            onSortChange={(state) => {
              tableState.setSort("licensePlate", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["licensePlate"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("licensePlate", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["licensePlate"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("licensePlate", vals);
              setPage(1);
            }}
            align="center"
            columnKey="licensePlate"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center font-mono text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) =>
          inv.licensePlate ? (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200/50">
              {inv.licensePlate}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "settlementOrder",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:settlementOrder", "Lệnh QT")}
            sortState={getSortState("settlementOrder")}
            onSortChange={(state) => {
              tableState.setSort("settlementOrder", state);
              setPage(1);
            }}
            searchValue={tableState.columnSearch["settlementOrder"] || ""}
            onSearchChange={(val) => {
              tableState.setColumnSearch("settlementOrder", val);
              setPage(1);
            }}
            selectedFilters={tableState.columnFilters["settlementOrder"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("settlementOrder", vals);
              setPage(1);
            }}
            align="center"
            columnKey="settlementOrder"
            queryKeyPrefix={`garage-invoice-options-${linkType}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 130,
        headerClassName: "text-center",
        className: "text-left font-mono text-xs",
        enableResizing: true,
        cell: (inv: ErpInvoice) => inv.settlementOrder || "—",
      },
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("erpInvoices:status", "Trạng thái")}
            sortState={getSortState("status")}
            onSortChange={(state) => {
              tableState.setSort("status", state);
              setPage(1);
            }}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => {
              tableState.setColumnFilter("status", vals);
              setPage(1);
            }}
            align="center"
            columnKey="status"
            filterOptions={[
              { label: "CONFIRMED", value: "CONFIRMED" },
              { label: "DRAFT", value: "DRAFT" },
            ]}
          />
        ),
        size: 110,
        headerClassName: "text-center",
        className: "text-center",
        enableResizing: true,
        cell: (inv: ErpInvoice) => (
          <Badge
            variant="outline"
            className="w-[85px] inline-flex items-center justify-center text-center truncate text-[10px]"
          >
            {inv.status || "CONFIRMED"}
          </Badge>
        ),
      },
    ];
  }, [
    linkType,
    selectedInvoicesMap,
    tableState,
    dateFrom,
    dateTo,
    openPopoverId,
    t,
  ]);

  // Subtotal calculations
  const summaryRow = useMemo(() => {
    const items = invoiceData?.items || [];
    const totalPreVat = items.reduce(
      (acc: number, curr: ErpInvoice) =>
        acc + (parseFloat(String(curr.preVatAmount)) || 0),
      0,
    );
    const totalVat = items.reduce(
      (acc: number, curr: ErpInvoice) =>
        acc + (parseFloat(String(curr.vatAmount)) || 0),
      0,
    );
    const totalAmount = items.reduce(
      (acc: number, curr: ErpInvoice) =>
        acc + (parseFloat(String(curr.totalAmount)) || 0),
      0,
    );

    return {
      select: null,
      attachments: "",
      invoiceDate: "",
      invoiceNo: (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {t("common:total", "Tổng trang:")}
        </span>
      ),
      serialNo: "",
      partner: "",
      taxCode: "",
      description: "",
      preVatAmount: (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {money(totalPreVat)}
        </span>
      ),
      vatRate: "",
      vatAmount: (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {money(totalVat)}
        </span>
      ),
      totalAmount: (
        <span className="font-bold text-primary">{money(totalAmount)}</span>
      ),
      licensePlate: "",
      settlementOrder: "",
      status: "",
    };
  }, [invoiceData?.items, t]);

  const targetAmount =
    linkType === "OUT"
      ? Number(caseFinancialSummary?.targetRevenue || 0)
      : Number(caseFinancialSummary?.targetCost || 0);

  const diffAmount = selectedTotalAmount - targetAmount;

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={t("cases.invoiceDrawer.title", {
          defaultValue: `Liên kết Hóa đơn VAT${caseCode ? `: ${caseCode}` : ""}`,
        })}
        panelClassName="w-full max-w-[96vw] xl:max-w-[1440px] 2xl:max-w-[1550px]"
        bodyClassName="h-full flex flex-col p-3.5 overflow-hidden min-h-0"
        actions={[
          {
            label: t("common:cancel", "Hủy"),
            variant: "outline",
            onClick: onClose,
            disabled: isSubmitting,
          },
          {
            label: isSubmitting
              ? t("cases.invoiceDrawer.linking", "Đang liên kết...")
              : selectedCount > 0
                ? `Xác nhận liên kết (${selectedCount} hóa đơn - ${money(selectedTotalAmount)})`
                : t("cases.invoiceDrawer.confirm", "Xác nhận liên kết"),
            primary: true,
            disabled: selectedCount === 0 || isSubmitting,
            onClick: handleSave,
          },
        ]}
      >
        <div className="flex flex-col lg:flex-row h-full min-h-0 flex-1 gap-3 overflow-hidden">
          {/* ── LEFT COLUMN: PILL TABS & MAIN TABLE ── */}
          <div className="flex-1 min-w-0 flex flex-col h-full gap-2.5 overflow-hidden">
            {/* Flagship Pill Tabs: OUT vs IN */}
            <div className="shrink-0">
              <PillTabs
                value={linkType}
                onValueChange={(val) => {
                  setLinkType(val);
                  setSelectedInvoicesMap({});
                  setPage(1);
                }}
                items={[
                  {
                    value: "OUT",
                    label: t(
                      "cases.invoiceDrawer.tabs.out",
                      "1. Hóa đơn Bán ra (Doanh thu)",
                    ),
                    icon: ArrowUpRight,
                  },
                  {
                    value: "IN",
                    label: t(
                      "cases.invoiceDrawer.tabs.in",
                      "2. Hóa đơn Mua vào (Chi phí)",
                    ),
                    icon: ArrowDownLeft,
                  },
                ]}
              />
            </div>

            {/* Main Table: StandardTable with Spreadsheet variant */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {t(
                      "cases.invoiceDrawer.tableTitle",
                      "Danh sách Hóa đơn điện tử",
                    )}
                  </span>
                  {invoiceData?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({invoiceData.total} {t("erpInvoices:records", "hóa đơn")}
                      )
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {tableState.activeFilterCount > 0 && (
                    <FilterButton
                      activeCount={tableState.activeFilterCount}
                      onClick={() => {}}
                      onClear={() => {
                        tableState.resetFilters();
                        setDateFrom("");
                        setDateTo("");
                        setPage(1);
                      }}
                    />
                  )}
                </div>
              }
              className="flex-1 flex flex-col min-h-0 mb-0 p-3 [&>div:last-child]:flex-1 [&>div:last-child]:flex [&>div:last-child]:flex-col [&>div:last-child]:min-h-0"
              bodyClassName="flex-1 flex flex-col min-h-0 p-0"
            >
              <div className="flex-1 min-h-0 flex flex-col">
                <StandardTable
                  tableId="garage-invoice-selection-table"
                  items={invoiceData?.items || []}
                  columns={columns}
                  getRowKey={(row: ErpInvoice) => row.id}
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  loading={isLoading}
                  page={page}
                  pageSize={pageSize}
                  total={invoiceData?.total || 0}
                  totalPages={invoiceData?.totalPages || 0}
                  onPage={setPage}
                  onPageSize={setPageSize}
                  onRowClick={(row: ErpInvoice) => handleToggleInvoice(row)}
                  summaryRow={summaryRow}
                  minWidth={1150}
                  containerClassName="flex-1 min-h-0"
                />
              </div>
            </DrawerSection>
          </div>

          {/* ── RIGHT COLUMN: TARGET CONTEXT, SMART SUGGESTIONS & NOTE ── */}
          <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-thin">
            {/* Section 1: Thông tin Vụ việc & Tiến độ Đối soát */}
            <DrawerSection
              title={t(
                "cases.invoiceDrawer.targetTitle",
                "Đối soát & Mục tiêu",
              )}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Vụ việc:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {caseCode || "---"}
                  </span>
                </div>

                {targetAmount > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium">
                      {linkType === "OUT"
                        ? "Mục tiêu Doanh thu:"
                        : "Mục tiêu Chi phí:"}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {money(targetAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">
                    Hóa đơn đã chọn:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {selectedCount > 0
                      ? `${selectedCount} HĐ (${money(selectedTotalAmount)})`
                      : "Chưa chọn"}
                  </span>
                </div>

                {targetAmount > 0 && selectedCount > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-medium">
                      Chênh lệch:
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold px-2 py-0.5 rounded border",
                        Math.abs(diffAmount) < 1000
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : diffAmount > 0
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                      )}
                    >
                      {Math.abs(diffAmount) < 1000
                        ? "✓ Khớp mục tiêu"
                        : diffAmount > 0
                          ? `+${money(diffAmount)} (Dư)`
                          : `${money(diffAmount)} (Thiếu)`}
                    </span>
                  </div>
                )}

                {/* Selected Invoices Mini List */}
                {selectedInvoicesList.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Danh sách hóa đơn đã chọn ({selectedInvoicesList.length}):
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedInvoicesList.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px]"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                              Số: {inv.invoiceNo || "---"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {money(Number(inv.totalAmount || 0))}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleInvoice(inv)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                            title="Bỏ chọn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Section 2: Gợi ý Đối soát Thông minh (AI) */}
            {caseId && (
              <DrawerSection
                title={
                  <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      {linkType === "OUT"
                        ? "Gợi ý HĐ Bán ra"
                        : "Gợi ý HĐ Mua vào"}
                    </span>
                  </div>
                }
                titleExtra={
                  suggestions.length >= 2 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllSuggestions}
                      className="h-5 text-[10px] px-1.5 py-0 border-indigo-300 dark:border-indigo-700 bg-white/80 dark:bg-slate-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                      {suggestions.every(
                        (s: any) => !!selectedInvoicesMap[s.invoice.id],
                      )
                        ? "Bỏ chọn hết"
                        : `Chọn tất cả (${suggestions.length})`}
                    </Button>
                  ) : undefined
                }
                collapsible={true}
                defaultCollapsed={false}
              >
                {isLoadingSuggestions ? (
                  <div className="py-4 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tìm kiếm gợi ý...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {suggestions.map((s: any) => {
                      const isSelected = !!selectedInvoicesMap[s.invoice.id];
                      return (
                        <SmartInvoiceSuggestionCard
                          key={s.invoice.id}
                          suggestion={s}
                          isSelected={isSelected}
                          onAccept={() => handleToggleSuggestion(s)}
                          onViewDetail={(inv) =>
                            setViewInvoiceId(
                              typeof inv === "object" ? inv.id : inv,
                            )
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-3 text-center text-[11px] text-slate-400 italic">
                    Chưa tìm thấy hóa đơn khớp chính xác. Bạn có thể tìm trong
                    danh sách bảng bên trái.
                  </div>
                )}
              </DrawerSection>
            )}

            {/* Section 3: Ghi chú liên kết */}
            <DrawerSection
              title={t("cases.invoiceDrawer.note", "Ghi chú liên kết")}
              collapsible={true}
              defaultCollapsed={false}
            >
              <Textarea
                rows={3}
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNote(e.target.value)
                }
                placeholder={t(
                  "cases.invoiceDrawer.notePlaceholder",
                  "Ghi chú mục đích liên kết hóa đơn này với báo giá vụ việc...",
                )}
                className="text-xs resize-none h-20"
              />
            </DrawerSection>
          </div>
        </div>
      </DrawerModal>

      {/* Standalone Full Invoice Details Drawer with preview, sidebar and tabs */}
      <ErpInvoiceStandaloneDrawer
        isOpen={Boolean(viewInvoiceId)}
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
      />

      {/* PDF Attachment preview drawer */}
      <FilePreviewDrawer
        open={Boolean(previewPdf)}
        onClose={() => setPreviewPdf(null)}
        previewUrl={previewPdf?.url || ""}
        fileName={previewPdf?.filename || ""}
      />
    </>
  );
}
