/**
 * GrFormDrawer — Goods Receipt form drawer adapter.
 * Builds type-specific config from useGrDrawer() and delegates rendering
 * to the unified InventoryVoucherFormDrawer shell.
 */
import { useRef, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { CellInput } from "@/shared/components/CellInput";
import { CellTextarea } from "@/shared/components/CellTextarea";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import { GoodsReceiptPrintTemplate } from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { useT } from "@/core/i18n";
import toast from "react-hot-toast";
import { FilterButton } from "@/shared/components/FilterPanel";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { InventoryVoucherFormDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "0";
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

interface GrFormDrawerProps {
  drawer: UseGrDrawerReturn;
}

export function GrFormDrawer({ drawer }: GrFormDrawerProps) {
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    poDetail,
    poOptions,
    itemsDict,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const t = useT();
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission("goods_receipts", "update");
  const isAdmin = useHasPermission("*", "*");

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuNhapKho_${editing?.receiptNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const tableMode: "po" | "other-edit" | "view" = poDetail
    ? "po"
    : !viewOnly
      ? "other-edit"
      : "view";

  const sourceLines = tableMode === "po" ? poDetail?.lines || [] : form.lines;

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
      tableId: "gr-details-table",
      lines: sourceLines,
      isOpen: open,
      getCode: (line: any) =>
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].sku
          : line.itemCode) || "",
      getName: (line: any) =>
        line.itemName ||
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].itemName
          : "") ||
        line.description ||
        "",
      customSort: (a, b, field, isDesc) => {
        if (field === "ordered") {
          return isDesc
            ? Number(b.qtyOrdered ?? 0) - Number(a.qtyOrdered ?? 0)
            : Number(a.qtyOrdered ?? 0) - Number(b.qtyOrdered ?? 0);
        }
        if (field === "remaining") {
          const remA = Math.max(
            0,
            Number(a.qtyOrdered ?? 0) - Number(a.qtyReceived ?? 0),
          );
          const remB = Math.max(
            0,
            Number(b.qtyOrdered ?? 0) - Number(b.qtyReceived ?? 0),
          );
          return isDesc ? remB - remA : remA - remB;
        }
        return null;
      },
    });

  // ── Column header helper ───────────────────────────────────────────────────

  const makeFilterHeader = (
    key: string,
    title: string,
    source: any[],
    opts?: { hideFilter?: boolean; queryPrefix?: string },
  ) => (
    <TableColumnHeaderFilter
      title={title}
      sortState={
        listHook.sorts.includes(key)
          ? "asc"
          : listHook.sorts.includes(`-${key}`)
            ? "desc"
            : "none"
      }
      onSortChange={(state) => listHook.setSort(key, state)}
      searchValue={listHook.columnSearch[key] || ""}
      onSearchChange={(val) => listHook.setColumnSearch(key, val)}
      selectedFilters={listHook.columnFilters[key] || []}
      onFilterChange={(vals) => listHook.setColumnFilter(key, vals)}
      align="center"
      columnKey={key}
      queryKeyPrefix={opts?.queryPrefix ?? `gr-${key}`}
      allFilters={listHook.columnFilters}
      hideFilter={opts?.hideFilter}
      fetchOptions={
        opts?.hideFilter ? undefined : buildFilterOptions(key as any, source)
      }
    />
  );

  // ── Index column (shared across all 3 table modes) ─────────────────────────

  const indexCol = {
    key: "index",
    header: "#",
    size: 40,
    headerClassName: "text-center w-[40px] min-w-[40px]",
    className: "text-center w-[40px] min-w-[40px]",
    cell: (_: any, idx: number) => (
      <span className="text-muted-foreground">{idx}</span>
    ),
  };

  const tableItems =
    tableMode === "view"
      ? processedLines.filter((l) => Number(l.qtyReceived) > 0)
      : processedLines;

  const getRowKey = (line: any) =>
    tableMode === "po"
      ? line.id || String(Math.random())
      : String(form.lines.indexOf(line));

  // ── PO table columns ───────────────────────────────────────────────────────

  const poColumns = [
    indexCol,
    {
      key: "itemCode",
      header: makeFilterHeader(
        "itemCode",
        t("Mã linh kiện"),
        poDetail?.lines || [],
        {
          queryPrefix: "gr-form-po-itemcode",
        },
      ),
      minSize: 140,
      enableResizing: true,
      headerClassName: "w-[140px] min-w-[140px]",
      className: "w-[140px] min-w-[140px]",
      cell: (poLine: any) => {
        const itemCode =
          poLine.itemId && itemsDict[poLine.itemId]
            ? itemsDict[poLine.itemId].sku
            : "—";
        return <span>{itemCode}</span>;
      },
    },
    {
      key: "itemName",
      header: makeFilterHeader(
        "itemName",
        t("Tên linh kiện"),
        poDetail?.lines || [],
        {
          queryPrefix: "gr-form-po-itemname",
        },
      ),
      minSize: 260,
      enableResizing: true,
      headerClassName: "w-[260px] min-w-[260px]",
      className: "w-[260px] min-w-[260px]",
      cell: (poLine: any) => {
        const itemName =
          poLine.itemName ||
          (poLine.itemId && itemsDict[poLine.itemId]
            ? itemsDict[poLine.itemId].itemName
            : "") ||
          poLine.description ||
          poLine.itemId ||
          "—";
        return (
          <div
            className="font-medium text-foreground truncate max-w-[260px]"
            title={itemName}
          >
            {itemName}
          </div>
        );
      },
    },
    {
      key: "ordered",
      header: makeFilterHeader("ordered", t("Đã đặt"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-po-ordered",
      }),
      minSize: 100,
      enableResizing: true,
      headerClassName: "text-center w-[100px] min-w-[100px]",
      className: "text-center w-[100px] min-w-[100px]",
      cell: (poLine: any) => (
        <div className="font-medium text-foreground">
          {Number(poLine.qtyOrdered ?? 0).toLocaleString("vi-VN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    ...(!viewOnly && (!editing || editing.status === "DRAFT")
      ? [
          {
            key: "remaining",
            header: makeFilterHeader("remaining", t("Còn lại"), [], {
              hideFilter: true,
              queryPrefix: "gr-form-po-remaining",
            }),
            minSize: 100,
            enableResizing: true,
            headerClassName: "text-center w-[100px] min-w-[100px]",
            className: "text-center w-[100px] min-w-[100px]",
            cell: (poLine: any) => {
              const ordered = Number(poLine.qtyOrdered ?? 0);
              const received = Number(poLine.qtyReceived ?? 0);
              const remaining = Math.max(0, ordered - received);
              return (
                <div className="font-medium text-amber-600">
                  {remaining.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              );
            },
          },
        ]
      : []),
    {
      key: "qtyInput",
      header: makeFilterHeader("qtyInput", t("SL Nhập"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-po-qtyinput",
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px] p-0 align-middle",
      cell: (poLine: any) => {
        const lineIdx = form.lines.findIndex(
          (l) => l.purchaseOrderLineId === poLine.id,
        );
        const currentLine = lineIdx >= 0 ? form.lines[lineIdx] : null;

        if (!viewOnly) {
          const ordered = Number(poLine.qtyOrdered ?? 0);
          const received = Number(poLine.qtyReceived ?? 0);
          const remaining = Math.max(0, ordered - received);
          return (
            <CellInput
              type="number"
              min={0}
              max={remaining}
              className={cn(
                "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none font-medium text-emerald-700 placeholder:text-muted-foreground/50 transition-all hover:bg-slate-50 focus:bg-white px-3",
              )}
              placeholder={`Max ${remaining}`}
              value={currentLine?.qtyReceived ?? ""}
              disabled={viewOnly || editing?.status === "POSTED"}
              onValueChange={(v) => {
                setForm((f) => {
                  const lines = [...f.lines];
                  if (lineIdx >= 0) {
                    lines[lineIdx] = { ...lines[lineIdx], qtyReceived: v };
                  } else {
                    lines.push({
                      purchaseOrderLineId: poLine.id ?? "",
                      productionOrderMaterialId: "",
                      itemId: poLine.itemId ?? "",
                      itemCode: "",
                      itemName: poLine.itemName ?? "",
                      qtyReceived: v,
                      unitCost: poLine.unitPrice ?? "",
                    });
                  }
                  return { ...f, lines };
                });
              }}
            />
          );
        }
        return currentLine && Number(currentLine.qtyReceived) > 0 ? (
          <div className="font-medium text-emerald-600 px-3 py-2">
            +{fmtQty(currentLine.qtyReceived)}
          </div>
        ) : null;
      },
    },
  ];

  // ── OTHER edit table columns ───────────────────────────────────────────────

  const otherEditColumns = [
    indexCol,
    {
      key: "itemCode",
      header: makeFilterHeader("itemCode", t("Mã linh kiện"), form.lines, {
        queryPrefix: "gr-form-other-itemcode",
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "w-[140px] min-w-[140px]",
      className: "w-[140px] min-w-[140px]",
      cell: (line: any) => {
        const itemCode =
          line.itemCode ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].sku
            : "—");
        return <span>{itemCode}</span>;
      },
    },
    {
      key: "itemName",
      header: makeFilterHeader("itemName", t("Tên linh kiện"), form.lines, {
        queryPrefix: "gr-form-other-itemname",
      }),
      minSize: 260,
      enableResizing: true,
      headerClassName: "w-[260px] min-w-[260px]",
      className: "w-[260px] min-w-[260px] p-0 align-middle",
      cell: (line: any) => {
        const i = form.lines.indexOf(line);
        return (
          <input
            type="text"
            className={cn(
              "w-full h-full min-h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none font-medium placeholder:text-muted-foreground/50 transition-all hover:bg-slate-50 focus:bg-white px-3",
            )}
            placeholder={t("Nhập tên linh kiện")}
            value={line.itemName}
            disabled={viewOnly || editing?.status === "POSTED"}
            onChange={(e) => {
              const val = e.target.value;
              setForm((f) => {
                const lines = [...f.lines];
                if (i > -1) lines[i] = { ...lines[i], itemName: val };
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      key: "qtyInput",
      header: makeFilterHeader("qtyInput", t("SL Nhập"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-other-qtyinput",
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px] p-0 align-middle",
      cell: (line: any) => {
        const i = form.lines.indexOf(line);
        return (
          <CellInput
            type="number"
            min={0}
            className={cn(
              "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none font-medium text-emerald-700 placeholder:text-muted-foreground/50 transition-all hover:bg-slate-50 focus:bg-white px-3",
            )}
            placeholder="Nhập SL"
            value={line.qtyReceived ?? ""}
            disabled={viewOnly || editing?.status === "POSTED"}
            onValueChange={(v) => {
              setForm((f) => {
                const lines = [...f.lines];
                if (i > -1) lines[i] = { ...lines[i], qtyReceived: v };
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
  ];

  // ── View-only table columns ────────────────────────────────────────────────

  const viewOnlySource = form.lines.filter((l) => Number(l.qtyReceived) > 0);

  const viewOnlyColumns = [
    indexCol,
    {
      key: "itemCode",
      header: makeFilterHeader("itemCode", t("Mã linh kiện"), viewOnlySource, {
        queryPrefix: "gr-form-view-itemcode",
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "w-[140px] min-w-[140px]",
      className: "w-[140px] min-w-[140px]",
      cell: (line: any) => {
        const itemCode =
          line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].sku
            : "—";
        return <span>{itemCode}</span>;
      },
    },
    {
      key: "itemName",
      header: makeFilterHeader("itemName", t("Tên linh kiện"), viewOnlySource, {
        queryPrefix: "gr-form-view-itemname",
      }),
      minSize: 260,
      enableResizing: true,
      headerClassName: "w-[260px] min-w-[260px]",
      className: "w-[260px] min-w-[260px]",
      cell: (line: any) => {
        const itemName =
          line.itemName ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].itemName
            : "") ||
          line.itemId ||
          "—";
        return (
          <div
            className="font-medium text-foreground truncate max-w-[260px]"
            title={itemName}
          >
            {itemName}
          </div>
        );
      },
    },
    ...(form.receiptType === "PO"
      ? [
          {
            key: "ordered",
            header: makeFilterHeader("ordered", t("Đã đặt"), [], {
              hideFilter: true,
              queryPrefix: "gr-form-view-ordered",
            }),
            minSize: 100,
            enableResizing: true,
            headerClassName: "text-center w-[100px] min-w-[100px]",
            className: "text-center w-[100px] min-w-[100px]",
            cell: () => "—",
          },
        ]
      : []),
    {
      key: "qtyReceived",
      header: makeFilterHeader("qtyReceived", t("SL Nhập"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-view-qtyreceived",
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px]",
      cell: (line: any) => (
        <div className="font-medium text-emerald-600">
          +{fmtQty(line.qtyReceived)}
        </div>
      ),
    },
  ];

  // ── Determine final table columns & summary ────────────────────────────────

  const tableColumns =
    tableMode === "po"
      ? poColumns
      : tableMode === "other-edit"
        ? otherEditColumns
        : viewOnlyColumns;

  const summaryRow =
    tableMode === "po"
      ? {
          itemName: (
            <div className="text-right w-full font-semibold">{t("Tổng")}:</div>
          ),
          ordered: (
            <div className="text-center font-semibold text-foreground">
              {fmtQty(
                poDetail?.lines
                  ?.reduce((sum, l) => sum + Number(l.qtyOrdered || 0), 0)
                  .toString(),
              )}
            </div>
          ),
          qtyInput: (
            <div className="text-center font-semibold text-emerald-600">
              {fmtQty(
                form.lines
                  .reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0)
                  .toString(),
              )}
            </div>
          ),
        }
      : {
          itemName: (
            <div className="text-right w-full font-semibold">{t("Tổng")}:</div>
          ),
          [tableMode === "other-edit" ? "qtyInput" : "qtyReceived"]: (
            <div className="text-center font-semibold text-emerald-600">
              {viewOnly
                ? `+${fmtQty(form.lines.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0).toString())}`
                : fmtQty(
                    form.lines
                      .reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0)
                      .toString(),
                  )}
            </div>
          ),
        };

  // ── Actions column (delete) ────────────────────────────────────────────────

  const actionsColumn =
    tableMode === "other-edit"
      ? {
          header: "" as any,
          cell: (line: any) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500"
              disabled={viewOnly || editing?.status === "POSTED"}
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  lines: f.lines.filter((l) => l !== line),
                }));
              }}
            >
              ✕
            </Button>
          ),
        }
      : undefined;

  // ── Section title ──────────────────────────────────────────────────────────

  const sectionTitle =
    t("Chi tiết") +
    " (" +
    (tableMode === "po" ? (poDetail?.lines?.length ?? 0) : form.lines.length) +
    ")";

  const clearFilterBtn =
    listHook.activeFilterCount > 0 ? (
      <FilterButton
        activeCount={listHook.activeFilterCount}
        onClick={() => {}}
        onClear={listHook.resetFilters}
      />
    ) : null;

  const sectionTitleExtra = (
    <div className="flex items-center gap-2">
      {clearFilterBtn}
      {tableMode === "other-edit" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => {
              setForm((f) => ({
                ...f,
                lines: [
                  ...f.lines,
                  {
                    purchaseOrderLineId: "",
                    productionOrderMaterialId: "",
                    itemId: "",
                    itemCode: "",
                    itemName: "",
                    qtyReceived: "",
                    unitCost: "",
                  },
                ],
              }));
            }}
          >
            + {t("Thêm dòng")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => setIsImportOpen(true)}
          >
            {t("Nhập từ Excel")}
          </Button>
        </>
      )}
      {!viewOnly && poDetail && editing?.status !== "POSTED" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2 leading-none text-muted-foreground hover:text-foreground"
            onClick={() =>
              setForm((f) => ({
                ...f,
                lines: f.lines.map((l) => ({ ...l, qtyReceived: "" })),
              }))
            }
          >
            {t("Đặt lại")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[11px] px-2 leading-none"
            onClick={() => {
              setForm((f) => {
                const newLines =
                  poDetail?.lines?.map((poLine) => {
                    const ordered = Number(poLine.qtyOrdered ?? 0);
                    const received = Number(poLine.qtyReceived ?? 0);
                    const remaining = Math.max(0, ordered - received);
                    return {
                      purchaseOrderLineId: poLine.id ?? "",
                      productionOrderMaterialId: "",
                      itemId: poLine.itemId ?? "",
                      itemCode: "",
                      itemName: poLine.itemName ?? "",
                      qtyReceived: remaining > 0 ? remaining.toString() : "",
                      unitCost: poLine.unitPrice ?? "",
                    };
                  }) ?? [];
                return { ...f, lines: newLines };
              });
            }}
          >
            {t("Nhập hết")}
          </Button>
        </>
      )}
    </div>
  );

  // ── Table footer ───────────────────────────────────────────────────────────

  const tableFooter = undefined;

  // ── Empty state for "no PO selected yet" ──────────────────────────────────

  const emptyLabel =
    !poDetail && form.receiptType === "PO"
      ? t("Chọn PO để hiện danh sách hàng cần nhận.")
      : t("Không có dữ liệu");

  // ── Actions ────────────────────────────────────────────────────────────────

  const actions =
    viewOnly || loading
      ? [
          ...(editing && editing.status !== "DRAFT" && isAdmin
            ? [
                {
                  label: t("common.print"),
                  onClick: handlePrint,
                  variant: "secondary" as const,
                  disabled: loading,
                },
              ]
            : []),
          {
            label: t("Đóng"),
            onClick: close,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : [
          {
            label: t("Hủy"),
            onClick: close,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: t("Lưu nháp"),
            onClick: () => void handleSave("DRAFT"),
            variant: "secondary" as const,
            loading: saving,
            disabled: saving,
          },
          {
            label: editing ? t("Cập nhật") : t("Tạo mới"),
            onClick: () => void handleSave("POSTED"),
            primary: true,
            loading: saving,
            disabled: saving,
          },
        ];

  // ── Status badge ───────────────────────────────────────────────────────────

  const statusBadge =
    editing?.status === "DRAFT" ? (
      <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        {t("Nháp")}
      </span>
    ) : editing?.status === "CANCELLED" ? (
      <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
        {t("Đã hủy")}
      </span>
    ) : undefined;

  // ── Right panel content (Thông tin chung) ─────────────────────────────────

  const rightPanelContent = (
    <>
      <DrawerField label={t("Số phiếu")}>
        <input
          className={inputCls}
          placeholder={t("Tự động nếu để trống")}
          value={form.receiptNo}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(e) =>
            setForm((f) => ({ ...f, receiptNo: e.target.value }))
          }
        />
      </DrawerField>
      <DrawerField label={t("Ngày nhập")}>
        <DatePicker
          value={form.receiptDate ? form.receiptDate.slice(0, 10) : ""}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(v) => setForm((f) => ({ ...f, receiptDate: v }))}
        />
      </DrawerField>
      <DrawerField label={t("Loại nhập")}>
        <Combobox
          options={[
            { label: t("— Chọn —"), value: "" },
            { label: t("Đơn mua hàng"), value: "PO" },
            { label: t("Nhập khác"), value: "OTHER" },
          ]}
          value={form.receiptType}
          onChange={(val) => {
            if (val === "PO") {
              setForm((f) => ({ ...f, receiptType: "PO", lines: [] }));
            } else if (val === "OTHER") {
              setForm((f) => ({
                ...f,
                receiptType: "OTHER",
                purchaseOrderId: "",
                lines: [],
              }));
            }
          }}
          disabled={viewOnly || editing !== null}
          placeholder={t("— Chọn —")}
          allowClear={false}
        />
      </DrawerField>
      {form.receiptType === "PO" && (
        <DrawerField label={t("Đơn mua hàng (PO)")}>
          {(viewOnly || editing !== null) && form.purchaseOrderId ? (
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-md w-full overflow-hidden">
              <TooltipProvider>
                <Tooltip
                  content={
                    poOptions.find((o) => o.value === form.purchaseOrderId)
                      ?.label || form.purchaseOrderId
                  }
                >
                  <span
                    className="text-primary font-medium cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-80 group/link w-full"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open_erp_document", {
                          detail: {
                            type: "erp_purchase_order",
                            id: form.purchaseOrderId,
                          },
                        }),
                      );
                    }}
                  >
                    <span className="group-hover/link:underline underline-offset-4 truncate">
                      {poOptions.find((o) => o.value === form.purchaseOrderId)
                        ?.label || form.purchaseOrderId}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0" />
                  </span>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Combobox
              options={poOptions}
              value={form.purchaseOrderId}
              disabled={viewOnly || editing !== null}
              placeholder={t("Chọn PO...")}
              onChange={(v) =>
                setForm((f) => ({ ...f, purchaseOrderId: v, lines: [] }))
              }
            />
          )}
        </DrawerField>
      )}
    </>
  );

  // ── Remarks content (Ghi chú section) ─────────────────────────────────────

  const remarksContent = (
    <CellTextarea
      className={`${inputCls} min-h-[60px] resize-y`}
      value={form.remarks}
      disabled={viewOnly}
      onValueChange={(val) => setForm((f) => ({ ...f, remarks: val }))}
      placeholder={t("Nhập ghi chú chung nếu có...")}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <InventoryVoucherFormDrawer
      open={open}
      mode={viewOnly ? "view" : editing ? "edit" : "create"}
      noAnimation={!!drawer.unifiedContext}
      title={
        editing
          ? viewOnly
            ? t("Phiếu nhập kho")
            : t("Sửa nhập kho")
          : t("Tạo phiếu nhập kho")
      }
      subtitle={editing?.receiptNo ?? t("Nhập kho")}
      statusBadge={statusBadge}
      onClose={close}
      onToggleEdit={
        viewOnly &&
        editing &&
        canUpdate &&
        !["CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
          ? () => setViewOnly(false)
          : undefined
      }
      actions={actions}
      loading={loading}
      error={saveError}
      unifiedContext={drawer.unifiedContext}
      // Table
      sectionTitle={sectionTitle}
      sectionTitleExtra={sectionTitleExtra}
      tableItems={tableItems}
      getRowKey={getRowKey}
      tableColumns={tableColumns}
      summaryRow={summaryRow}
      actionsColumn={actionsColumn}
      emptyLabel={emptyLabel}
      tableFooter={tableFooter}
      // Right panel
      rightPanelContent={rightPanelContent}
      remarksContent={remarksContent}
      // Slots
      printSlot={
        <div className="hidden">
          <GoodsReceiptPrintTemplate
            ref={printRef}
            companyProfile={companyProfile}
            data={{
              receiptNo: editing?.receiptNo || form.receiptNo || "...",
              receiptDate:
                editing?.receiptDate ||
                form.receiptDate ||
                new Date().toISOString(),
              supplierName: "",
              poNo:
                poOptions.find((o) => o.value === form.purchaseOrderId)
                  ?.label || "",
              remarks: form.remarks,
              lines: form.lines.map((l) => {
                const dictItem = itemsDict[l.itemId];
                return {
                  itemId: l.itemId,
                  itemCode: dictItem?.sku || l.itemId,
                  itemName: l.itemName || dictItem?.itemName || "",
                  qtyReceived: l.qtyReceived,
                  unitCost: l.unitCost,
                };
              }),
            }}
          />
        </div>
      }
      importModalSlot={
        <ImportExcelModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onDownloadTemplate={async () => {
            const headers = [
              "Mã linh kiện",
              "Tên linh kiện",
              "Số lượng",
              "Đơn giá",
            ];
            let refItems: any[] = [];
            try {
              const res = await basicMastersApi.list({
                entities: "inventoryItems",
                limit: 5000,
              });
              refItems = (res.items.inventoryItems || []).map((item: any) => ({
                sku: item.sku || "",
                name: item.itemName || "",
              }));
            } catch (e) {
              console.error("Failed to fetch reference items", e);
            }
            downloadInventoryTemplate(
              headers,
              "Template_NhapKho.xlsx",
              refItems,
            );
          }}
          onUpload={async (file, overwrite) => {
            try {
              const data = await parseExcelFile(file);
              let skipped = 0;
              const newLines: any[] = [];
              let allItems: any[] = [];
              try {
                const res = await basicMastersApi.list({
                  entities: "inventoryItems",
                  limit: 5000,
                });
                allItems = res.items.inventoryItems || [];
              } catch (e) {
                console.error("Failed to fetch items for upload lookup", e);
              }
              const skuToId: Record<string, string> = {};
              const idToName: Record<string, string> = {};
              const idToSku: Record<string, string> = {};
              allItems.forEach((item: any) => {
                if (item.sku) {
                  skuToId[item.sku.toLowerCase()] = item.id;
                  idToName[item.id] = item.itemName;
                  idToSku[item.id] = item.sku;
                }
              });
              data.forEach((row: any) => {
                const sku = row["Mã linh kiện"]?.toString().trim();
                const qty = row["Số lượng"]?.toString().trim();
                const price = row["Đơn giá"]?.toString().trim();
                if (!sku) return;
                const itemId = skuToId[sku.toLowerCase()];
                if (itemId) {
                  newLines.push({
                    purchaseOrderLineId: "",
                    productionOrderMaterialId: "",
                    itemId,
                    itemCode: idToSku[itemId] || "",
                    itemName: idToName[itemId] || "",
                    qtyReceived: qty || "",
                    unitCost: price || "",
                  });
                } else {
                  skipped++;
                }
              });
              if (skipped > 0) {
                toast.error(
                  `Đã bỏ qua ${skipped} dòng chứa mã linh kiện không tồn tại.`,
                );
              }
              setForm((f) => {
                const filteredOldLines = overwrite
                  ? []
                  : f.lines.filter((l: any) => l.itemId);
                return { ...f, lines: [...filteredOldLines, ...newLines] };
              });
              setIsImportOpen(false);
            } catch {
              toast.error("Lỗi khi đọc file Excel");
            }
          }}
        />
      }
    />
  );
}
