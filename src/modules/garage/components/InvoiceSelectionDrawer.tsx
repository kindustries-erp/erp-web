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

export interface InvoiceSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  defaultLinkType?: "IN" | "OUT";
  onSuccess?: () => void;
  onSubmit: (payload: {
    invoiceId: string;
    linkType: "IN" | "OUT";
    note?: string;
    invoice?: ErpInvoice;
  }) => Promise<void> | void;
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
  const [selectedInvoice, setSelectedInvoice] = useState<ErpInvoice | null>(
    null,
  );
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
      setSelectedInvoice(null);
      setViewInvoiceId(null);
      setNote("");
      setPage(1);
    }
  }, [open, defaultLinkType]);

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

  const handleSelectInvoice = (inv: ErpInvoice) => {
    setSelectedInvoice((prev) => (prev?.id === inv.id ? null : inv));
  };

  const handleQuickAcceptSuggestion = (s: any) => {
    if (!s?.invoice) return;
    setSelectedInvoice(s.invoice);
    toast.success(
      `Đã chọn gợi ý HĐ: ${s.invoice.invoiceNo || "---"} (${money(s.invoice.totalAmount)})`,
    );
  };

  const handleSave = async () => {
    if (!selectedInvoice) {
      toast.error(
        t(
          "cases.invoiceDrawer.selectPrompt",
          "Vui lòng chọn 1 hóa đơn để liên kết",
        ),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        invoiceId: selectedInvoice.id,
        linkType,
        note: note || undefined,
        invoice: selectedInvoice,
      });

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

  const columns = useMemo(() => {
    const isOut = linkType === "OUT";

    return [
      {
        key: "select",
        header: <span className="w-full block text-center">#</span>,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        size: 40,
        cell: (row: ErpInvoice) => {
          const isSelected = selectedInvoice?.id === row.id;
          return (
            <div
              className="flex items-center justify-center w-full h-full cursor-pointer py-1"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectInvoice(row);
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
    selectedInvoice,
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
              : selectedInvoice
                ? t(
                    "cases.invoiceDrawer.confirmWithInvoice",
                    `Xác nhận liên kết HĐ: ${selectedInvoice.invoiceNo || "---"}`,
                  )
                : t("cases.invoiceDrawer.confirm", "Xác nhận liên kết"),
            primary: true,
            disabled: !selectedInvoice || isSubmitting,
            onClick: handleSave,
          },
        ]}
      >
        <div className="flex flex-col h-full min-h-0 flex-1 gap-2.5">
          {/* Target Document Context Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Vụ việc:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {caseCode || "---"}
              </span>
              {targetAmount > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-slate-500 font-medium">
                    {linkType === "OUT" ? "Doanh thu:" : "Tổng chi phí:"}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {money(targetAmount)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">
                Hóa đơn đã chọn:
              </span>
              {selectedInvoice ? (
                <span className="font-mono font-bold text-sm text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Số: {selectedInvoice.invoiceNo || "---"} (
                  {money(Number(selectedInvoice.totalAmount || 0))})
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Chưa chọn hóa đơn
                </span>
              )}
            </div>
          </div>

          {/* Flagship Pill Tabs: OUT vs IN */}
          <PillTabs
            value={linkType}
            onValueChange={(val) => {
              setLinkType(val);
              setSelectedInvoice(null);
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

          {/* Smart Invoice Suggestions Section (Horizontal Scrolling) */}
          {caseId && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    {linkType === "OUT"
                      ? "Gợi ý Đối soát Hóa đơn Bán ra (Doanh thu)"
                      : "Gợi ý Đối soát Hóa đơn Mua vào (Chi phí)"}
                  </h4>
                </div>
                {isLoadingSuggestions && (
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Đang tìm kiếm...
                  </span>
                )}
              </div>

              {suggestions.length > 0 ? (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {suggestions.map((s: any) => {
                    const isSelected = selectedInvoice?.id === s.invoice.id;
                    return (
                      <div
                        key={s.invoice.id}
                        className="min-w-[320px] max-w-[360px] shrink-0"
                      >
                        <SmartInvoiceSuggestionCard
                          suggestion={s}
                          isSelected={isSelected}
                          onAccept={() => handleQuickAcceptSuggestion(s)}
                          onViewDetail={(inv) =>
                            setViewInvoiceId(
                              typeof inv === "object" ? inv.id : inv,
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ) : !isLoadingSuggestions ? (
                <div className="text-[11px] text-slate-500 italic">
                  Chưa tìm thấy hóa đơn khớp chính xác với vụ việc này. Bạn có
                  thể tìm kiếm trong danh sách bảng bên dưới.
                </div>
              ) : null}
            </div>
          )}

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
                    ({invoiceData.total} {t("erpInvoices:records", "hóa đơn")})
                  </span>
                )}
                {selectedInvoice && (
                  <span className="text-xs font-semibold text-primary">
                    (Đã chọn Số: {selectedInvoice.invoiceNo || "---"})
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
                onRowClick={(row: ErpInvoice) => handleSelectInvoice(row)}
                summaryRow={summaryRow}
                minWidth={1400}
                containerClassName="flex-1 min-h-0"
              />
            </div>
          </DrawerSection>

          {/* Note input */}
          <div className="shrink-0 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t("cases.invoiceDrawer.note", "Ghi chú liên kết")}
            </label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder={t(
                "cases.invoiceDrawer.notePlaceholder",
                "Ghi chú mục đích liên kết hóa đơn này với báo giá vụ việc...",
              )}
              className="text-xs resize-none h-14"
            />
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
