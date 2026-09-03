import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { CellInput } from "@/shared/components/CellInput";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import type {
  UseGrDrawerReturn,
  GrLineForm,
} from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { fmtQty } from "../utils/formatters";
import type { GrTableMode } from "../types";

interface UseGrFormColumnsProps {
  drawer: UseGrDrawerReturn;
  tableMode: GrTableMode;
  listHook: any;
  buildFilterOptions: (key: any, source: any[]) => any;
  handleOpenSerialDrawer: (
    line: any,
    lineIndex: number,
    item: any,
    qty: number,
    isViewOnly?: boolean,
  ) => void;
  t: (key: string, ...args: any[]) => string;
}

export function useGrFormColumns({
  drawer,
  tableMode,
  listHook,
  buildFilterOptions,
  handleOpenSerialDrawer,
  t,
}: UseGrFormColumnsProps) {
  const { form, setForm, editing, viewOnly, poDetail, itemsDict } = drawer;

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

  // ── Index column ───────────────────────────────────────────────────────────

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
    {
      key: "serials",
      header: makeFilterHeader("serials", t("Serial / Tracking"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-po-serials",
      }),
      minSize: 170,
      enableResizing: true,
      headerClassName: "text-center w-[170px] min-w-[170px]",
      className: "text-center w-[170px] min-w-[170px]",
      cell: (poLine: any) => {
        const lineIdx = form.lines.findIndex(
          (l) => l.purchaseOrderLineId === poLine.id,
        );
        const currentLine = lineIdx >= 0 ? form.lines[lineIdx] : null;
        const itemId = poLine.itemId || currentLine?.itemId;
        const item = itemId ? itemsDict[itemId] : null;
        const trackingCode = item?.trackingPolicy?.code;
        const hasTracking =
          trackingCode &&
          (trackingCode === "SERIAL" ||
            trackingCode === "VEHICLE" ||
            trackingCode === "CUSTOM");
        const qty = Math.round(Number(currentLine?.qtyReceived ?? 0));
        const declaredCount = currentLine?.declaredSerials?.length || 0;

        if (!hasTracking) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        if (qty <= 0) {
          return (
            <span className="text-muted-foreground text-xs">
              {t("Chưa nhập SL")}
            </span>
          );
        }

        const isComplete = declaredCount === qty;

        if (viewOnly || editing?.status === "POSTED") {
          return (
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-sm cursor-pointer",
                isComplete
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300",
              )}
              onClick={() => {
                const actualQty = Math.round(
                  Number(currentLine?.qtyReceived || qty || 0),
                );
                handleOpenSerialDrawer(
                  currentLine || poLine,
                  lineIdx,
                  item,
                  actualQty,
                  true,
                );
              }}
              title={t("Bấm để xem danh sách số serial")}
            >
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>
                {declaredCount}/{qty} serial
              </span>
            </button>
          );
        }

        return (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-sm cursor-pointer",
              isComplete
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300",
            )}
            onClick={() => {
              let idx = lineIdx;
              let target = currentLine;
              if (idx < 0 || !target) {
                const ordered = Number(poLine.qtyOrdered ?? 0);
                const received = Number(poLine.qtyReceived ?? 0);
                const rem = Math.max(0, ordered - received);
                const newLine: GrLineForm = {
                  purchaseOrderLineId: poLine.id ?? "",
                  productionOrderMaterialId: "",
                  itemId: poLine.itemId ?? "",
                  itemCode: poLine.itemCode || "",
                  itemName: poLine.itemName ?? "",
                  qtyReceived: String(rem > 0 ? rem : 1),
                  unitCost: poLine.unitPrice ?? "",
                  declaredSerials: [],
                };
                setForm((f) => ({ ...f, lines: [...f.lines, newLine] }));
                idx = form.lines.length;
                target = newLine;
              }
              const actualQty = Math.round(
                Number(target.qtyReceived || qty || 1),
              );
              handleOpenSerialDrawer(target, idx, item, actualQty);
            }}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t(`Đủ ${declaredCount}/${qty} serial`)}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t(`Khai báo (${declaredCount}/${qty})`)}</span>
              </>
            )}
          </button>
        );
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
    {
      key: "serials",
      header: makeFilterHeader("serials", t("Serial / Tracking"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-other-serials",
      }),
      minSize: 170,
      enableResizing: true,
      headerClassName: "text-center w-[170px] min-w-[170px]",
      className: "text-center w-[170px] min-w-[170px]",
      cell: (line: any) => {
        const i = form.lines.indexOf(line);
        const item = line.itemId ? itemsDict[line.itemId] : null;
        const trackingCode = item?.trackingPolicy?.code;
        const hasTracking =
          trackingCode &&
          (trackingCode === "SERIAL" ||
            trackingCode === "VEHICLE" ||
            trackingCode === "CUSTOM");
        const qty = Math.round(Number(line.qtyReceived || 0));
        const declaredCount = line.declaredSerials?.length || 0;

        if (!hasTracking) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        if (qty <= 0) {
          return (
            <span className="text-muted-foreground text-xs">
              {t("Chưa nhập SL")}
            </span>
          );
        }

        const isComplete = declaredCount === qty;

        if (viewOnly || editing?.status === "POSTED") {
          return (
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-sm cursor-pointer",
                isComplete
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300",
              )}
              onClick={() => handleOpenSerialDrawer(line, i, item, qty, true)}
              title={t("Bấm để xem danh sách số serial")}
            >
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>
                {declaredCount}/{qty} serial
              </span>
            </button>
          );
        }

        return (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-sm cursor-pointer",
              isComplete
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300",
            )}
            onClick={() => handleOpenSerialDrawer(line, i, item, qty)}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t(`Đủ ${declaredCount}/${qty} serial`)}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t(`Khai báo (${declaredCount}/${qty})`)}</span>
              </>
            )}
          </button>
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
    {
      key: "serials",
      header: makeFilterHeader("serials", t("Serial / Tracking"), [], {
        hideFilter: true,
        queryPrefix: "gr-form-view-serials",
      }),
      minSize: 170,
      enableResizing: true,
      headerClassName: "text-center w-[170px] min-w-[170px]",
      className: "text-center w-[170px] min-w-[170px]",
      cell: (line: any) => {
        const item = line.itemId ? itemsDict[line.itemId] : null;
        const trackingCode = item?.trackingPolicy?.code;
        const hasTracking =
          trackingCode &&
          (trackingCode === "SERIAL" ||
            trackingCode === "VEHICLE" ||
            trackingCode === "CUSTOM");
        const qty = Math.round(Number(line.qtyReceived || 0));
        const declaredCount = line.declaredSerials?.length || 0;

        if (!hasTracking) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        const isComplete = declaredCount === qty;

        return (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all shadow-sm cursor-pointer",
              isComplete
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300",
            )}
            onClick={() =>
              handleOpenSerialDrawer(
                line,
                form.lines.indexOf(line),
                item,
                qty,
                true,
              )
            }
            title={t("Bấm để xem danh sách số serial")}
          >
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>
              {declaredCount}/{qty} serial
            </span>
          </button>
        );
      },
    },
  ];

  // ── Determine final table columns & summary ────────────────────────────────

  const tableColumns =
    tableMode === "po"
      ? poColumns
      : tableMode === "other-edit"
        ? otherEditColumns
        : viewOnlyColumns;

  const summaryRow: Record<string, ReactNode> =
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

  return {
    tableColumns,
    summaryRow,
    actionsColumn,
    makeFilterHeader,
    indexCol,
  };
}
