/**
 * GiFormDrawer — Goods Issue form drawer adapter.
 * Builds type-specific config from useGiDrawer() and delegates rendering
 * to the unified InventoryVoucherFormDrawer shell.
 */
import { useRef, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import { fmtQty } from "@/shared/utils/format";
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
import { GoodsIssuePrintTemplate } from "@/shared/components/print-templates/GoodsIssuePrintTemplate";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { useT } from "@/core/i18n";
import toast from "react-hot-toast";
import { FilterButton } from "@/shared/components/FilterPanel";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import {
  emptyGiLine,
  isMoLinkedGiLocked,
  type UseGiDrawerReturn,
} from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { InventoryVoucherFormDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";

interface GiFormDrawerProps {
  drawer: UseGiDrawerReturn;
}

export function GiFormDrawer({ drawer }: GiFormDrawerProps) {
  const t = useT();
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    soOptions,
    handleSoChange,
    itemOptions,
    setItemSearch,
    fetchNextItems,
    loadingItems,
    moOptions,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const isLineViewOnly = viewOnly || form.issueType === "SALE";
  const moLinkedLocked = isMoLinkedGiLocked(editing);
  const canUpdate = useHasPermission("goods_issues", "update");
  const isAdmin = useHasPermission("*", "*");

  // ── Serial details ─────────────────────────────────────────────────────────

  const [serialDetails, setSerialDetails] = useState<
    Record<string, InventorySerialRow>
  >({});
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const sIds = form.lines.map((l) => l.serialId).filter(Boolean);
    if (sIds.length > 0) {
      inventoryCoreApi
        .listSerials({ ids: sIds, pageSize: 1000 })
        .then((res) => {
          if (active) {
            const map: Record<string, InventorySerialRow> = {};
            res.items.forEach((s) => {
              map[s.id] = s;
            });
            setSerialDetails(map);
          }
        })
        .catch(console.error);
    } else {
      setSerialDetails({});
    }
    return () => {
      active = false;
    };
  }, [form.lines]);

  // ── Print ──────────────────────────────────────────────────────────────────

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuXuatKho_${editing?.issueNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();

  // ── Client-side filter / sort ──────────────────────────────────────────────

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
      tableId: "gi-details-table",
      lines: form.lines,
      isOpen: open,
      getCode: (line: any) =>
        line.itemCode || line.itemName?.split(" — ")[0] || "",
      getName: (line: any) => {
        const nameParts = line.itemName?.split(" — ");
        return nameParts && nameParts.length > 1
          ? nameParts[1]
          : line.itemName || "";
      },
    });

  // ── Column header helper ───────────────────────────────────────────────────

  const makeFilterHeader = (
    key: string,
    title: string,
    opts?: { hideFilter?: boolean },
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
      queryKeyPrefix={`gi-${key}`}
      allFilters={listHook.columnFilters}
      hideFilter={opts?.hideFilter}
      fetchOptions={
        opts?.hideFilter
          ? undefined
          : buildFilterOptions(key as any, form.lines)
      }
    />
  );

  // ── Table columns ──────────────────────────────────────────────────────────

  const tableColumns = [
    {
      key: "index",
      header: "#",
      size: 40,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => (
        <span className="text-muted-foreground">{idx}</span>
      ),
    },
    {
      key: "itemCode",
      header: makeFilterHeader("itemCode", t("Mã vật tư")),
      minSize: isLineViewOnly ? 140 : 200,
      enableResizing: true,
      headerClassName: isLineViewOnly
        ? "w-[140px] min-w-[140px]"
        : "w-[200px] min-w-[200px]",
      className: isLineViewOnly
        ? "w-[140px] min-w-[140px]"
        : "w-[200px] min-w-[200px] p-0 align-middle",
      cell: (line: any, idx: number) => {
        if (isLineViewOnly) {
          const code = line.itemCode || line.itemName?.split(" — ")[0] || "—";
          return <span>{code}</span>;
        }
        return (
          <Combobox
            variant="spreadsheet"
            options={itemOptions}
            value={line.itemId}
            fallbackLabel={line.itemCode || line.itemName}
            disabled={isLineViewOnly || form.issueType !== "OTHER"}
            placeholder={t("Chọn hàng hóa")}
            searchPlaceholder={t("Tìm SKU / tên")}
            onSearch={setItemSearch}
            onScrollBottom={fetchNextItems}
            loading={loadingItems}
            onChange={(v) => {
              const found = itemOptions.find((o) => o.value === v) as any;
              setForm((f) => {
                const lines = [...f.lines];
                const currentLine = form.lines.find((l) => l === line);
                const actualIdx = currentLine
                  ? form.lines.indexOf(currentLine)
                  : idx - 1;
                lines[actualIdx] = {
                  ...lines[actualIdx],
                  itemId: v || "",
                  itemCode: found?.label || "",
                  itemName: found?._itemName ?? found?.label ?? "",
                };
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      key: "itemName",
      header: makeFilterHeader("itemName", t("Tên vật tư")),
      minSize: 200,
      enableResizing: true,
      headerClassName: "w-[200px] min-w-[200px]",
      className: "w-[200px] min-w-[200px]",
      cell: (line: any) => {
        const nameParts = line.itemName?.split(" — ");
        const name =
          nameParts && nameParts.length > 1
            ? nameParts[1]
            : line.itemName || "—";
        return (
          <div
            className={cn(
              "font-medium truncate max-w-[200px]",
              isLineViewOnly ? "text-foreground" : "text-muted-foreground",
            )}
            title={name}
          >
            {name}
          </div>
        );
      },
    },
    {
      key: "tracking",
      header: makeFilterHeader("tracking", t("Serials / Số khung"), {
        hideFilter: true,
      }),
      minSize: 250,
      enableResizing: true,
      headerClassName: "w-[250px] min-w-[250px]",
      className: "w-[250px] min-w-[250px]",
      cell: (line: any) => {
        if (!line.serialId) {
          return <span className="text-[11px] text-muted-foreground">—</span>;
        }
        const s = serialDetails[line.serialId];
        if (!s) {
          return <span className="text-[11px] text-muted-foreground">...</span>;
        }
        return (
          <div className="flex flex-col text-[13px] py-1">
            <span className="font-mono text-gray-900">
              {s.vinNo || s.serialNo || s.id.substring(0, 8)}
            </span>
            {s.engineNo && (
              <span className="text-gray-500 text-[11px]">
                Số máy: {s.engineNo}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "qtyIssued",
      header: makeFilterHeader("qtyIssued", t("Số lượng"), {
        hideFilter: true,
      }),
      minSize: 140,
      enableResizing: true,
      headerClassName: isLineViewOnly
        ? "text-center w-[140px] min-w-[140px]"
        : "text-left w-[140px] min-w-[140px]",
      className: isLineViewOnly
        ? "text-center w-[140px] min-w-[140px]"
        : "text-left w-[140px] min-w-[140px] p-0 align-middle",
      cell: (line: any, idx: number) => {
        const qty = line.itemId ? line.qtyIssued : "0";
        if (isLineViewOnly) {
          return Number(qty) > 0 ? (
            <div className="font-medium text-red-600">{fmtQty(qty)}</div>
          ) : (
            <div className="text-center font-medium text-muted-foreground">
              0
            </div>
          );
        }
        return (
          <CellInput
            type="number"
            className={cn(
              "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all",
              !line.itemId && "bg-muted text-muted-foreground",
            )}
            value={qty}
            disabled={
              isLineViewOnly || editing?.status === "POSTED" || !line.itemId
            }
            onValueChange={(v) => {
              setForm((f) => {
                const lines = [...f.lines];
                const currentLine = form.lines.find((l) => l === line);
                const actualIdx = currentLine
                  ? form.lines.indexOf(currentLine)
                  : idx;
                lines[actualIdx] = { ...lines[actualIdx], qtyIssued: v };
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      key: "unitCost",
      header: makeFilterHeader("unitCost", t("Đơn giá"), { hideFilter: true }),
      minSize: 140,
      enableResizing: true,
      headerClassName: isLineViewOnly
        ? "text-right w-[140px] min-w-[140px]"
        : "text-left w-[140px] min-w-[140px]",
      className: isLineViewOnly
        ? "text-right w-[140px] min-w-[140px]"
        : "text-left w-[140px] min-w-[140px] p-0 align-middle",
      cell: (line: any, idx: number) => {
        if (isLineViewOnly) {
          return line.unitCost ? (
            <span className="text-muted-foreground">
              {fmtQty(line.unitCost)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
        return (
          <CellInput
            type="number"
            className={cn(
              "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all",
            )}
            value={line.unitCost}
            disabled={isLineViewOnly || editing?.status === "POSTED"}
            placeholder={t("Tùy chọn")}
            onValueChange={(v) => {
              setForm((f) => {
                const lines = [...f.lines];
                const currentLine = form.lines.find((l) => l === line);
                const actualIdx = currentLine
                  ? form.lines.indexOf(currentLine)
                  : idx;
                lines[actualIdx] = { ...lines[actualIdx], unitCost: v };
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
  ];

  // ── Summary row ────────────────────────────────────────────────────────────

  const summaryRow = {
    tracking: (
      <div className="text-right w-full font-semibold">{t("Tổng")}:</div>
    ),
    qtyIssued: (
      <div
        className={cn(
          "text-center font-semibold",
          viewOnly ? "text-red-600" : "",
        )}
      >
        {fmtQty(
          form.lines
            .reduce(
              (sum, line) =>
                sum + (line.itemId ? Number(line.qtyIssued || 0) : 0),
              0,
            )
            .toString(),
        )}
      </div>
    ),
  };

  // ── Actions column (delete) ────────────────────────────────────────────────

  const actionsColumn = !(
    viewOnly ||
    form.issueType === "SALE" ||
    editing?.status === "POSTED"
  )
    ? {
        header: "" as any,
        cell: (item: any) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={() => {
              setForm((f) => ({
                ...f,
                lines: f.lines.filter((l) => l !== item),
              }));
            }}
          >
            ✕
          </Button>
        ),
      }
    : undefined;

  // ── Table footer ───────────────────────────────────────────────────────────

  const tableFooter = undefined;

  // ── Actions ────────────────────────────────────────────────────────────────

  const ISSUE_TYPE_OPTIONS = [
    { value: "", label: t("— Chọn —") },
    { value: "SALE", label: t("Xuất bán") },
    { value: "OTHER", label: t("Xuất khác") },
  ];

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
          ...(editing?.status === "POSTED"
            ? []
            : [
                {
                  label: t("Lưu nháp"),
                  onClick: () => void handleSave("DRAFT"),
                  variant: "secondary" as const,
                  loading: saving,
                  disabled: saving,
                },
              ]),
          {
            label: editing ? t("Cập nhật") : t("Tạo mới"),
            onClick: () =>
              void handleSave(
                editing?.status === "POSTED" ? undefined : "POSTED",
              ),
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
      <DrawerField label={t("Số phiếu xuất")} required>
        <input
          className={inputCls}
          value={form.issueNo}
          disabled={viewOnly || !!editing}
          onChange={(e) => setForm((f) => ({ ...f, issueNo: e.target.value }))}
          placeholder="GI-YYYYMMDD-001"
        />
      </DrawerField>
      <DrawerField label={t("Ngày xuất")} required>
        <DatePicker
          value={form.issueDate ? form.issueDate.slice(0, 10) : ""}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
        />
      </DrawerField>
      <DrawerField label={t("Loại xuất")} required>
        <Combobox
          options={ISSUE_TYPE_OPTIONS}
          value={form.issueType}
          disabled={viewOnly || editing !== null}
          placeholder={t("— Chọn —")}
          allowClear={false}
          onChange={(v) => setForm((f) => ({ ...f, issueType: v || "" }))}
        />
      </DrawerField>
      {form.issueType === "SALE" && (
        <DrawerField label={t("Đơn bán hàng")}>
          {(viewOnly || !!editing) && form.salesOrderId ? (
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-md w-full overflow-hidden">
              <TooltipProvider>
                <Tooltip
                  content={
                    soOptions.find((o) => o.value === form.salesOrderId)
                      ?.label || form.salesOrderId
                  }
                >
                  <span
                    className="text-primary font-medium cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-80 group/link w-full"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open_erp_document", {
                          detail: {
                            type: "erp_sales_order",
                            id: form.salesOrderId,
                          },
                        }),
                      );
                    }}
                  >
                    <span className="group-hover/link:underline underline-offset-4 truncate">
                      {soOptions.find((o) => o.value === form.salesOrderId)
                        ?.label || form.salesOrderId}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0" />
                  </span>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Combobox
              options={soOptions}
              value={form.salesOrderId}
              disabled={viewOnly || !!editing}
              placeholder={t("Chọn đơn bán hàng")}
              searchPlaceholder={t("Tìm Đơn bán hàng")}
              allowClear={true}
              onChange={(v) => handleSoChange(v || "")}
            />
          )}
        </DrawerField>
      )}
      {form.issueType === "PRODUCTION" && (
        <DrawerField label={t("Lệnh sản xuất")}>
          <Combobox
            options={moOptions}
            value={form.productionOrderId}
            disabled={viewOnly || editing?.status === "POSTED"}
            placeholder={t("Chọn lệnh sản xuất")}
            searchPlaceholder={t("Tìm MO")}
            onChange={(v) =>
              setForm((f) => ({ ...f, productionOrderId: v || "" }))
            }
          />
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

  // ── Section info ───────────────────────────────────────────────────────────

  const sectionTitle = t("Dòng xuất kho") + " (" + form.lines.length + ")";
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
      {!viewOnly &&
        form.issueType !== "SALE" &&
        editing?.status !== "POSTED" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  lines: [...f.lines, emptyGiLine()],
                }))
              }
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
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const showEmptySOMessage =
    form.issueType === "SALE" && !form.salesOrderId && !loading;

  return (
    <InventoryVoucherFormDrawer
      open={open}
      mode={viewOnly ? "view" : editing ? "edit" : "create"}
      noAnimation={!!drawer.unifiedContext}
      title={
        editing
          ? viewOnly
            ? t("Phiếu xuất kho")
            : t("Sửa xuất kho")
          : t("Tạo phiếu xuất kho")
      }
      subtitle={editing?.issueNo ?? t("Xuất kho")}
      statusBadge={statusBadge}
      onClose={close}
      onToggleEdit={
        viewOnly &&
        editing &&
        canUpdate &&
        !moLinkedLocked &&
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
      tableItems={showEmptySOMessage ? [] : processedLines}
      getRowKey={(item) => String(form.lines.indexOf(item))}
      tableColumns={tableColumns}
      summaryRow={summaryRow}
      actionsColumn={actionsColumn}
      emptyLabel={
        showEmptySOMessage
          ? t("Vui lòng chọn Đơn bán hàng để xem chi tiết xuất kho.")
          : t("Không có dữ liệu")
      }
      tableFooter={tableFooter}
      // Right panel
      rightPanelContent={rightPanelContent}
      remarksContent={remarksContent}
      // Slots
      printSlot={
        <div className="hidden">
          <GoodsIssuePrintTemplate
            ref={printRef}
            companyProfile={companyProfile}
            data={{
              issueNo: editing?.issueNo || form.issueNo || "...",
              issueDate:
                editing?.issueDate ||
                form.issueDate ||
                new Date().toISOString(),
              customerName:
                form.issueType !== "PRODUCTION"
                  ? soOptions.find((o) => o.value === form.salesOrderId)
                      ?.label || ""
                  : "",
              remarks: form.remarks,
              lines: form.lines.map((l) => {
                const foundOption = itemOptions.find(
                  (o) => o.value === l.itemId,
                );
                let itemCode = l.itemId;
                let itemName = l.itemName || "";
                if (foundOption && foundOption.label.includes(" — ")) {
                  const parts = foundOption.label.split(" — ");
                  itemCode = parts[0];
                  itemName = parts.slice(1).join(" — ");
                }
                return {
                  itemId: l.itemId,
                  itemCode,
                  itemName,
                  qtyIssued: l.qtyIssued,
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
              "Mã vật tư",
              "Số lượng",
              "Đơn giá",
              "Serials/Số khung",
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
              "Template_XuatKho.xlsx",
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
                const sku = row["Mã vật tư"]?.toString().trim();
                const qty = row["Số lượng"]?.toString().trim();
                const price = row["Đơn giá"]?.toString().trim();
                if (!sku) return;
                const itemId = skuToId[sku.toLowerCase()];
                if (itemId) {
                  newLines.push({
                    itemId,
                    itemCode: idToSku[itemId] || "",
                    itemName: idToName[itemId] || "",
                    qtyIssued: qty || "",
                    unitCost: price || "",
                    serialId: "",
                    vehicleId: "",
                  });
                } else {
                  skipped++;
                }
              });
              if (skipped > 0) {
                toast.error(
                  `Đã bỏ qua ${skipped} dòng chứa mã vật tư không tồn tại.`,
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
