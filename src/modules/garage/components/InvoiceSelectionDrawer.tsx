import React, { useState, useMemo, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { garageApi } from "@/modules/garage/api/garageApi";
import { toast } from "react-hot-toast";
import { money, formatGMT7 } from "@/shared/utils/format";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Link2,
  X,
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/Button";
import { Textarea } from "@/shared/components/ui/textarea";
import { SmartInvoiceSuggestionCard } from "./SmartInvoiceSuggestionCard";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
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
  onSubmit?: (
    payloads: InvoiceLinkPayloadItem[] | InvoiceLinkPayloadItem,
  ) => Promise<void> | void;
}

export interface SelectedInvoiceCardProps {
  invoice: ErpInvoice;
  onRemove: () => void;
  onViewDetail?: (invoice: any) => void;
}

export function SelectedInvoiceCard({
  invoice,
  onRemove,
  onViewDetail,
}: SelectedInvoiceCardProps) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);
  const partner =
    invoice.direction === "IN"
      ? invoice.sellerName || "—"
      : invoice.buyerName || invoice.buyerPersonalName || "—";
  const desc = invoice.description || "—";

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border shadow-2xs relative group text-xs transition-all bg-emerald-50/30 border-emerald-300/80 dark:bg-emerald-950/20 dark:border-emerald-800/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              {invoice.invoiceDate
                ? formatGMT7(invoice.invoiceDate, "date")
                : ""}
            </span>
            {invoice.serialNo && (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {invoice.serialNo}
              </span>
            )}
          </div>
          <span
            className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary transition-colors truncate"
            onClick={() => onViewDetail && onViewDetail(invoice)}
            title={t(
              "smartSuggestion.viewDetailInvoice",
              "Nhấn để xem chi tiết hóa đơn",
            )}
          >
            Số: {invoice.invoiceNo || "---"}
          </span>
        </div>

        <div className="flex items-start gap-1.5 shrink-0">
          <div className="text-right flex flex-col items-end">
            <div className="font-bold text-xs font-mono text-slate-800 dark:text-slate-100 tabular-nums">
              {money(invoice.totalAmount)}
            </div>
            <div className="mt-0.5 flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border whitespace-nowrap leading-none bg-emerald-100/80 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              {t("cases.invoiceDrawer.selected", "Đã chọn")}
            </div>
          </div>
        </div>
      </div>

      {/* Partner Name */}
      <div className="text-[10px] text-slate-500 font-medium truncate">
        {invoice.direction === "IN" ? "Bên bán:" : "Bên mua:"}{" "}
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          {partner}
        </span>
      </div>

      {/* License plate & Settlement order tags if present */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {invoice.settlementOrder && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold">
            📋 {invoice.settlementOrder}
          </span>
        )}
        {invoice.licensePlate && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
            🚗 {invoice.licensePlate}
          </span>
        )}
      </div>

      {/* Description */}
      {desc && desc !== "—" && (
        <Tooltip content={desc}>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-normal break-words mt-0.5 line-clamp-2">
            {desc}
          </div>
        </Tooltip>
      )}

      {/* Action button */}
      <div className="mt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[11px] w-full transition-colors cursor-pointer font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/50"
          onClick={onRemove}
        >
          <X className="w-3 h-3 mr-1 text-rose-500" />
          {t("cases.invoiceDrawer.unselect", "Bỏ chọn")}
        </Button>
      </div>
    </div>
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

  // Query currently linked invoices for this case
  const { data: linkedInvoices = [] } = useQuery({
    queryKey: ["garage-case-linked-invoices-for-drawer", caseId],
    queryFn: () =>
      caseId ? garageApi.getCaseLinkedInvoices(caseId) : Promise.resolve([]),
    enabled: open && !!caseId,
  });

  const linkedInvoiceIdSet = useMemo(() => {
    return new Set(
      (linkedInvoices || []).map((l: any) => l.invoiceId).filter(Boolean),
    );
  }, [linkedInvoices]);

  const initialLinkedInvoicesForType = useMemo(() => {
    return (linkedInvoices || []).filter(
      (l: any) => (l.linkType || "OUT") === linkType,
    );
  }, [linkedInvoices, linkType]);

  const initialLinkedIdSet = useMemo(() => {
    return new Set(
      initialLinkedInvoicesForType.map((l: any) => l.invoiceId).filter(Boolean),
    );
  }, [initialLinkedInvoicesForType]);

  // Reset table filters & search when opening drawer
  useEffect(() => {
    if (open) {
      tableState.resetFilters();
      setDateFrom("");
      setDateTo("");
      setPage(1);
    }
  }, [open]);

  // Pre-select already linked invoices for the active linkType
  useEffect(() => {
    if (open) {
      const map: Record<string, ErpInvoice> = {};
      initialLinkedInvoicesForType.forEach((item: any) => {
        if (item.invoiceId) {
          map[item.invoiceId] = {
            id: item.invoiceId,
            invoiceNo: item.invoiceNo,
            sellerName: item.sellerName,
            buyerName: item.buyerName,
            totalAmount: item.totalAmount,
            preVatAmount: item.preVatAmount,
            vatAmount: item.vatAmount,
            description: item.description,
            direction: item.direction || item.linkType,
            licensePlate: item.licensePlate,
            settlementOrder: item.settlementOrder,
            serialNo: item.serialNo,
            invoiceDate: item.invoiceDate,
          } as ErpInvoice;
        }
      });
      setSelectedInvoicesMap(map);
      setViewInvoiceId(null);
      setNote("");
    }
  }, [open, linkType, initialLinkedInvoicesForType]);

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

  const currentSelectedIds = useMemo(
    () => new Set(Object.keys(selectedInvoicesMap)),
    [selectedInvoicesMap],
  );

  const hasChanged = useMemo(() => {
    if (initialLinkedIdSet.size !== currentSelectedIds.size) return true;
    for (const id of currentSelectedIds) {
      if (!initialLinkedIdSet.has(id)) return true;
    }
    return false;
  }, [initialLinkedIdSet, currentSelectedIds]);

  // Mutual exclusion: Suggestions that are NOT in selectedInvoicesMap
  const filteredSuggestions = useMemo(() => {
    return (suggestions || []).filter(
      (s: any) => s?.invoice?.id && !selectedInvoicesMap[s.invoice.id],
    );
  }, [suggestions, selectedInvoicesMap]);

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

  const handleSelectAllFilteredSuggestions = () => {
    if (!filteredSuggestions || filteredSuggestions.length === 0) return;
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      filteredSuggestions.forEach((s: any) => {
        if (s?.invoice) {
          next[s.invoice.id] = s.invoice;
        }
      });
      return next;
    });
    toast.success(
      `Đã chọn toàn bộ ${filteredSuggestions.length} hóa đơn gợi ý`,
    );
  };

  const handleSave = async () => {
    if (!hasChanged) return;

    try {
      setIsSubmitting(true);

      if (
        caseId &&
        !caseId.startsWith("tmp-") &&
        !caseId.startsWith("manual-tmp-")
      ) {
        // 1. Gỡ bỏ các hóa đơn đã bỏ chọn (Removed links)
        const removedLinks = (linkedInvoices || []).filter(
          (l: any) =>
            (l.linkType || "OUT") === linkType &&
            !selectedInvoicesMap[l.invoiceId],
        );
        for (const r of removedLinks) {
          if (r.id) {
            await garageApi.removeCaseLinkedInvoice(caseId, r.id);
          }
        }

        // 2. Thêm mới các hóa đơn vừa chọn (Newly added invoices)
        const newlyAddedInvoices = selectedInvoicesList.filter(
          (inv) => !initialLinkedIdSet.has(inv.id),
        );
        if (newlyAddedInvoices.length > 0) {
          await garageApi.addCaseLinkedInvoices(
            caseId,
            newlyAddedInvoices.map((inv) => ({
              invoiceId: inv.id,
              linkType,
              note: note || undefined,
            })),
          );
        }
      }

      if (onSubmit) {
        const payloads: InvoiceLinkPayloadItem[] = selectedInvoicesList.map(
          (inv) => ({
            invoiceId: inv.id,
            linkType,
            note: note || undefined,
            invoice: inv,
          }),
        );
        await onSubmit(payloads);
      }

      toast.success(
        selectedCount === 0
          ? t(
              "cases.invoiceDrawer.unlinkedAll",
              "Đã gỡ bỏ toàn bộ liên kết hóa đơn",
            )
          : t(
              "cases.invoiceDrawer.linkSuccess",
              "Đã cập nhật liên kết {{count}} hóa đơn thành công",
              { count: selectedCount },
            ),
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi cập nhật liên kết hóa đơn",
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

  // Columns: Removed attachments and status; moved settlementOrder & licensePlate right before description
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
        size: 145,
        headerClassName: "text-center",
        className: "font-medium text-primary text-left",
        enableResizing: true,
        cell: (inv: ErpInvoice) => {
          const isLinked = linkedInvoiceIdSet.has(inv.id);
          return (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <TableText
                className="flex-1 min-w-0"
                text={inv.invoiceNo || "---"}
                onDetailClick={(e) => {
                  e.stopPropagation();
                  setViewInvoiceId(inv.id);
                }}
                tooltip={true}
                enableCopy={true}
              />
              {isLinked && (
                <Tooltip
                  content={t(
                    "cases.invoiceDrawer.alreadyLinkedTooltip",
                    "Hóa đơn này đã được liên kết với phiếu dịch vụ",
                  )}
                >
                  <span className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto inline-flex items-center">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                </Tooltip>
              )}
            </div>
          );
        },
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
    ];
  }, [
    linkType,
    selectedInvoicesMap,
    linkedInvoiceIdSet,
    tableState,
    dateFrom,
    dateTo,
    t,
  ]);

  // Subtotal calculations
  const summaryRow = useMemo(() => {
    const items = invoiceData?.items || [];
    const totalAmount = items.reduce(
      (acc: number, curr: ErpInvoice) =>
        acc + (parseFloat(String(curr.totalAmount)) || 0),
      0,
    );

    return {
      select: null,
      invoiceDate: "",
      invoiceNo: (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {t("common:total", "Tổng trang:")}
        </span>
      ),
      serialNo: "",
      partner: "",
      taxCode: "",
      settlementOrder: "",
      licensePlate: "",
      description: "",
      totalAmount: (
        <span className="font-bold text-primary">{money(totalAmount)}</span>
      ),
    };
  }, [invoiceData?.items, t]);

  const targetAmount =
    linkType === "OUT"
      ? Number(caseFinancialSummary?.targetRevenue || 0)
      : Number(caseFinancialSummary?.targetCost || 0);

  const diffAmount = selectedTotalAmount - targetAmount;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="edit"
        onClose={onClose}
        title={t("cases.invoiceDrawer.title", {
          defaultValue: `Liên kết Hóa đơn VAT${caseCode ? `: ${caseCode}` : ""}`,
        })}
        subtitle={
          caseCode
            ? t("cases.invoiceDrawer.subtitle", {
                code: caseCode,
                defaultValue: `Đối soát 2 chiều với Sổ báo giá ${caseCode}`,
              })
            : undefined
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        stickyRightPanel={false}
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
              ? t("cases.invoiceDrawer.linking", "Đang lưu...")
              : !hasChanged
                ? t("cases.invoiceDrawer.noChange", "Chưa có thay đổi")
                : selectedCount === 0
                  ? t(
                      "cases.invoiceDrawer.confirmUnlink",
                      "Gỡ toàn bộ liên kết",
                    )
                  : `Xác nhận liên kết (${selectedCount} hóa đơn - ${money(selectedTotalAmount)})`,
            primary: true,
            variant: hasChanged && selectedCount === 0 ? "danger" : undefined,
            disabled: !hasChanged || isSubmitting,
            onClick: handleSave,
          },
        ]}
        leftPanel={
          <div className="h-[calc(100vh-180px)] flex flex-col gap-2.5 min-h-0 overflow-hidden">
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

            {/* Main Table: StandardTable with Spreadsheet variant inside DrawerSection */}
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
                  {selectedCount > 0 && (
                    <span className="text-xs font-semibold text-primary">
                      ({selectedCount} đã chọn)
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
              collapsible={true}
              defaultCollapsed={false}
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
                  getRowClassName={(row: ErpInvoice) =>
                    linkedInvoiceIdSet.has(row.id)
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20"
                      : undefined
                  }
                  summaryRow={summaryRow}
                  minWidth={1150}
                  containerClassName="flex-1 min-h-0"
                />
              </div>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="w-full flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-thin">
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
              </div>
            </DrawerSection>

            {/* Section 2: Hóa đơn đã chọn (Dedicated Section with Card UI like SmartInvoiceSuggestionCard) */}
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {t(
                      "cases.invoiceDrawer.selectedCount",
                      `Hóa đơn đã chọn (${selectedCount})`,
                      { count: selectedCount },
                    )}
                  </span>
                </div>
              }
              titleExtra={
                selectedCount >= 2 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedInvoicesMap({});
                      toast.success("Đã bỏ chọn tất cả hóa đơn");
                    }}
                    className="h-5 text-[10px] px-1.5 py-0 border-rose-300 dark:border-rose-700 bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 text-rose-700 dark:text-rose-300 font-medium cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5 mr-0.5 text-rose-500" />
                    {t("cases.invoiceDrawer.unselectAll", "Bỏ chọn tất cả")}
                  </Button>
                ) : undefined
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              {selectedInvoicesList.length > 0 ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedInvoicesList.map((inv) => (
                    <SelectedInvoiceCard
                      key={inv.id}
                      invoice={inv}
                      onRemove={() => handleToggleInvoice(inv)}
                      onViewDetail={(i) =>
                        setViewInvoiceId(typeof i === "object" ? i.id : i)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center text-[11px] text-slate-400 italic">
                  {t(
                    "cases.invoiceDrawer.noSelectedInvoices",
                    "Chưa chọn hóa đơn nào. Bạn có thể tick chọn trong bảng hoặc chọn từ gợi ý bên dưới.",
                  )}
                </div>
              )}
            </DrawerSection>

            {/* Section 3: Gợi ý Đối soát Thông minh (AI) - ONLY unselected suggestions */}
            {caseId && (
              <DrawerSection
                title={
                  <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      {linkType === "OUT"
                        ? t(
                            "cases.invoiceDrawer.suggestedOut",
                            "Gợi ý HĐ Bán ra",
                          )
                        : t(
                            "cases.invoiceDrawer.suggestedIn",
                            "Gợi ý HĐ Mua vào",
                          )}
                      {filteredSuggestions.length > 0
                        ? ` (${filteredSuggestions.length})`
                        : ""}
                    </span>
                  </div>
                }
                titleExtra={
                  filteredSuggestions.length >= 2 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllFilteredSuggestions}
                      className="h-5 text-[10px] px-1.5 py-0 border-indigo-300 dark:border-indigo-700 bg-white/80 dark:bg-slate-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                      {t(
                        "cases.invoiceDrawer.selectAllSuggestions",
                        `Chọn tất cả (${filteredSuggestions.length})`,
                        { count: filteredSuggestions.length },
                      )}
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
                ) : filteredSuggestions.length > 0 ? (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {filteredSuggestions.map((s: any) => (
                      <SmartInvoiceSuggestionCard
                        key={s.invoice.id}
                        suggestion={s}
                        isSelected={false}
                        onAccept={() => handleToggleSuggestion(s)}
                        onViewDetail={(inv) =>
                          setViewInvoiceId(
                            typeof inv === "object" ? inv.id : inv,
                          )
                        }
                      />
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-3 text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {t(
                      "cases.invoiceDrawer.allSuggestionsSelected",
                      `Đã chọn toàn bộ (${suggestions.length}) hóa đơn gợi ý.`,
                      { count: suggestions.length },
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center text-[11px] text-slate-400 italic">
                    {t(
                      "cases.invoiceDrawer.noSuggestions",
                      "Chưa tìm thấy hóa đơn khớp chính xác. Bạn có thể tìm trong danh sách bảng bên trái.",
                    )}
                  </div>
                )}
              </DrawerSection>
            )}

            {/* Section 4: Ghi chú liên kết */}
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
        }
      />

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
