import { useEffect, useState, useCallback, useMemo } from "react";
import { Layers } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerAction,
  DrawerField,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { fmtQty } from "@/shared/utils/format";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
  type InventoryMovementsPayload,
  type InventoryMovement,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { InventoryStockLedgerSection } from "./InventoryStockLedgerSection";

interface ItemForm {
  sku: string;
  itemName: string;
  uomId: string;
  itemTypeId: string;
  status: string;
  note: string;
  trackingPolicyId: string;
  trackingCategoryId: string;
  attributes: string[];
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uomId: "",
  itemTypeId: "",
  status: "ACTIVE",
  note: "",
  trackingPolicyId: "",
  trackingCategoryId: "",
  attributes: [],
});

function buildForm(item: ErpInventoryItem): ItemForm {
  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uomId: item.uomId ?? "",
    itemTypeId: item.itemTypeId ?? "",
    status: item.status ?? "ACTIVE",
    note: item.note ?? "",
    trackingPolicyId: item.trackingPolicyId ?? "",
    trackingCategoryId: item.trackingCategoryId ?? "",
    attributes: item.attributes ?? [],
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uomId: form.uomId,
    itemTypeId: form.itemTypeId,
    status: form.status || "ACTIVE",
    note: form.note.trim() || undefined,
    trackingPolicyId: form.trackingPolicyId || undefined,
    trackingCategoryId: form.trackingCategoryId || undefined,
    attributes: form.attributes.length > 0 ? form.attributes : undefined,
  };
}

function buildMasterOptions(
  items: InventoryMasterOption[],
  useCodeAsValue = false,
) {
  return items
    .filter((item) => item.isActive)
    .map((item) => ({
      value: useCodeAsValue ? item.code : item.id,
      label: `${item.code} — ${item.name}`,
    }));
}

export function InventoryItemFormDrawer({
  open,
  onClose,
  itemId,
  onSuccess,
  viewOnly: initialViewOnly = false,
  onToggleEdit,
  onOpenDocument,
}: {
  open: boolean;
  onClose: () => void;
  itemId?: string | null;
  onSuccess?: () => void;
  viewOnly?: boolean;
  onToggleEdit?: () => void;
  onOpenDocument?: (docId: string, docType: string) => void;
}) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  const [viewOnly, setViewOnly] = useState(initialViewOnly);
  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movData, setMovData] = useState<InventoryMovementsPayload | undefined>(
    undefined,
  );
  const [movLoading, setMovLoading] = useState(false);
  const [movError, setMovError] = useState<string | null>(null);

  const [uomOptions, setUomOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [itemTypeOptions, setItemTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [trackingCategoryOptions, setTrackingCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [trackingPolicyOptions, setTrackingPolicyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Mini tables pagination & filter state
  const [inPage, setInPage] = useState(1);
  const [inPageSize, setInPageSize] = useState(4);
  const [outPage, setOutPage] = useState(1);
  const [outPageSize, setOutPageSize] = useState(4);

  const inTableState = useTableColumnState(
    `inv-item-in-mini-${itemId || "new"}`,
  );
  const outTableState = useTableColumnState(
    `inv-item-out-mini-${itemId || "new"}`,
  );

  const loadMasters = useCallback(async () => {
    try {
      const [uoms, itemTypes, trackingCategories, trackingPolicies] =
        await Promise.all([
          inventoryCoreApi.listUoms({ page: 1, pageSize: 500, isActive: true }),
          inventoryCoreApi.listItemTypes({
            page: 1,
            pageSize: 500,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingCategories({
            page: 1,
            pageSize: 500,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingPolicies({ page: 1, pageSize: 50 }),
        ]);
      setUomOptions(buildMasterOptions(uoms.items));
      setItemTypeOptions(buildMasterOptions(itemTypes.items));
      setTrackingCategoryOptions(buildMasterOptions(trackingCategories.items));
      setTrackingPolicyOptions(
        trackingPolicies.items
          .filter((p) => p.isActive)
          .map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
      );
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadMasters();
    }
  }, [open, loadMasters]);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm(emptyForm());
      setSaveError(null);
      setMovData(undefined);
      setMovError(null);
      return;
    }
    setViewOnly(initialViewOnly);
    if (itemId) {
      setLoading(true);
      inventoryCoreApi
        .get(itemId)
        .then((detail) => {
          setEditing(detail);
          setForm(buildForm(detail));
        })
        .catch((e) => {
          setSaveError(
            e instanceof Error ? e.message : "Không thể tải chi tiết",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEditing(null);
      setForm(emptyForm());
      setMovData(undefined);
      setMovError(null);
    }
  }, [open, itemId, initialViewOnly]);

  useEffect(() => {
    if (!open || !itemId) return;
    setMovLoading(true);
    setMovError(null);
    inventoryCoreApi
      .movements(itemId)
      .then((data) => setMovData(data))
      .catch((e) =>
        setMovError(e instanceof Error ? e.message : "Lỗi tải lịch sử"),
      )
      .finally(() => setMovLoading(false));
  }, [open, itemId]);

  async function handleSave() {
    if (!form.sku.trim()) {
      setSaveError("SKU là bắt buộc");
      return;
    }
    if (!form.itemName.trim()) {
      setSaveError("Tên item kho là bắt buộc");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      if (editing) {
        await inventoryCoreApi.update(editing.id, payload);
      } else {
        await inventoryCoreApi.create(payload);
      }
      showToast({
        title: editing ? "Cập nhật thành công" : "Tạo mới thành công",
        variant: "success",
      });
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  // Movements data processing for Right Panel mini tables & KPIs
  const allMovements = useMemo(() => movData?.movements || [], [movData]);

  const inMovementsAll = useMemo(() => {
    return allMovements.filter((m) => Number(m.qtyIn || 0) > 0);
  }, [allMovements]);

  const outMovementsAll = useMemo(() => {
    return allMovements.filter((m) => Number(m.qtyOut || 0) > 0);
  }, [allMovements]);

  const totalInQty = useMemo(() => {
    return inMovementsAll.reduce((sum, m) => sum + Number(m.qtyIn || 0), 0);
  }, [inMovementsAll]);

  const totalOutQty = useMemo(() => {
    return outMovementsAll.reduce((sum, m) => sum + Number(m.qtyOut || 0), 0);
  }, [outMovementsAll]);

  const currentOnHand = movData?.currentOnHand ?? totalInQty - totalOutQty;

  // Filter & paginate for IN mini table
  const filteredInMovements = useMemo(() => {
    let list = [...inMovementsAll];
    const dateRange = inTableState.columnSearch["transactionDate"];
    if (dateRange) {
      const [from, to] = dateRange.split("|");
      if (from || to) {
        list = list.filter((e) => {
          const d = (e.transactionDate || e.createdAt || "").split("T")[0];
          return (!from || d >= from) && (!to || d <= to);
        });
      }
    }
    if (inTableState.columnSearch["documentNo"]) {
      const q = inTableState.columnSearch["documentNo"].toLowerCase();
      list = list.filter((e) => e.documentNo?.toLowerCase().includes(q));
    }
    if (inTableState.columnFilters["documentNo"]?.length) {
      const filters = inTableState.columnFilters["documentNo"];
      list = list.filter((e) => e.documentNo && filters.includes(e.documentNo));
    }
    return list;
  }, [inMovementsAll, inTableState.columnSearch, inTableState.columnFilters]);

  const paginatedInMovements = useMemo(() => {
    const start = (inPage - 1) * inPageSize;
    return filteredInMovements.slice(start, start + inPageSize);
  }, [filteredInMovements, inPage, inPageSize]);

  // Filter & paginate for OUT mini table
  const filteredOutMovements = useMemo(() => {
    let list = [...outMovementsAll];
    const dateRange = outTableState.columnSearch["transactionDate"];
    if (dateRange) {
      const [from, to] = dateRange.split("|");
      if (from || to) {
        list = list.filter((e) => {
          const d = (e.transactionDate || e.createdAt || "").split("T")[0];
          return (!from || d >= from) && (!to || d <= to);
        });
      }
    }
    if (outTableState.columnSearch["documentNo"]) {
      const q = outTableState.columnSearch["documentNo"].toLowerCase();
      list = list.filter((e) => e.documentNo?.toLowerCase().includes(q));
    }
    if (outTableState.columnFilters["documentNo"]?.length) {
      const filters = outTableState.columnFilters["documentNo"];
      list = list.filter((e) => e.documentNo && filters.includes(e.documentNo));
    }
    return list;
  }, [
    outMovementsAll,
    outTableState.columnSearch,
    outTableState.columnFilters,
  ]);

  const paginatedOutMovements = useMemo(() => {
    const start = (outPage - 1) * outPageSize;
    return filteredOutMovements.slice(start, start + outPageSize);
  }, [filteredOutMovements, outPage, outPageSize]);

  // Column definitions for IN mini table
  const inColumns = useMemo<DataTableColumn<InventoryMovement>[]>(
    () => [
      {
        key: "transactionDate",
        header: () => (
          <TableColumnHeaderFilter
            title="Ngày"
            align="center"
            isActive={!!inTableState.columnSearch["transactionDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            dateRangeSlot={({ close }) => {
              const val = inTableState.columnSearch["transactionDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    inTableState.setColumnSearch(
                      "transactionDate",
                      f || t ? `${f}|${t}` : "",
                    );
                    close();
                  }}
                />
              );
            }}
          />
        ),
        cell: (row) =>
          row.transactionDate
            ? format(new Date(row.transactionDate), "dd/MM/yyyy")
            : "—",
        align: "center",
        size: 90,
      },
      {
        key: "documentNo",
        header: () => (
          <TableColumnHeaderFilter
            title="Số phiếu"
            align="center"
            sortState="none"
            onSortChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            searchValue={inTableState.columnSearch["documentNo"] || ""}
            onSearchChange={(val) =>
              inTableState.setColumnSearch("documentNo", val)
            }
            isActive={!!inTableState.columnSearch["documentNo"]}
          />
        ),
        cell: (row) =>
          row.documentNo ? (
            <TableText
              text={row.documentNo}
              tooltip={row.notes || undefined}
              enableCopy={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                if (row.documentId && row.documentType && onOpenDocument) {
                  onOpenDocument(row.documentId, row.documentType);
                }
              }}
              className="text-primary font-medium cursor-pointer"
            />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
        align: "left",
        size: 130,
      },
      {
        key: "qtyIn",
        header: "SL",
        cell: (row) => (
          <span className="font-semibold text-orange-600 dark:text-orange-400 tabular-nums block text-right pr-1">
            +{fmtQty(row.qtyIn)}
          </span>
        ),
        align: "right",
        size: 70,
      },
    ],
    [inTableState, onOpenDocument],
  );

  // Column definitions for OUT mini table
  const outColumns = useMemo<DataTableColumn<InventoryMovement>[]>(
    () => [
      {
        key: "transactionDate",
        header: () => (
          <TableColumnHeaderFilter
            title="Ngày"
            align="center"
            isActive={!!outTableState.columnSearch["transactionDate"]?.length}
            hideFilter={true}
            hideFooter={true}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            dateRangeSlot={({ close }) => {
              const val = outTableState.columnSearch["transactionDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    outTableState.setColumnSearch(
                      "transactionDate",
                      f || t ? `${f}|${t}` : "",
                    );
                    close();
                  }}
                />
              );
            }}
          />
        ),
        cell: (row) =>
          row.transactionDate
            ? format(new Date(row.transactionDate), "dd/MM/yyyy")
            : "—",
        align: "center",
        size: 90,
      },
      {
        key: "documentNo",
        header: () => (
          <TableColumnHeaderFilter
            title="Số phiếu"
            align="center"
            sortState="none"
            onSortChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            searchValue={outTableState.columnSearch["documentNo"] || ""}
            onSearchChange={(val) =>
              outTableState.setColumnSearch("documentNo", val)
            }
            isActive={!!outTableState.columnSearch["documentNo"]}
          />
        ),
        cell: (row) =>
          row.documentNo ? (
            <TableText
              text={row.documentNo}
              tooltip={row.notes || undefined}
              enableCopy={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                if (row.documentId && row.documentType && onOpenDocument) {
                  onOpenDocument(row.documentId, row.documentType);
                }
              }}
              className="text-primary font-medium cursor-pointer"
            />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
        align: "left",
        size: 130,
      },
      {
        key: "qtyOut",
        header: "SL",
        cell: (row) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums block text-right pr-1">
            -{fmtQty(row.qtyOut)}
          </span>
        ),
        align: "right",
        size: 70,
      },
    ],
    [outTableState, onOpenDocument],
  );

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";
  const drawerActions: DrawerAction[] = viewOnly
    ? [{ label: "Đóng", onClick: onClose, variant: "outline" }]
    : [
        { label: "Hủy", onClick: onClose, variant: "outline" },
        {
          label: editing ? "Lưu thay đổi" : "Tạo mới",
          onClick: handleSave,
          primary: true,
          loading: saving || loading,
          disabled: loading,
        },
      ];

  const uomName =
    editing?.uom?.name ||
    uomOptions.find((u) => u.value === form.uomId)?.label?.split(" — ")[1] ||
    "";

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      confirmOnClose={!viewOnly}
      onToggleEdit={onToggleEdit ? onToggleEdit : () => setViewOnly(false)}
      icon={<Layers className="h-4 w-4" />}
      title={
        viewOnly
          ? "Chi tiết item kho"
          : editing
            ? "Cập nhật item kho"
            : "Tạo item kho mới"
      }
      subtitle={
        editing
          ? `${editing.sku}${editing.itemName ? ` — ${editing.itemName}` : ""}`
          : "Danh mục item kho dùng chung"
      }
      actions={drawerActions}
      layout="2-columns"
      size="full"
      panelClassName="w-full lg:w-[calc(100vw-208px)]"
      collapsibleRightPanel={true}
      leftPanel={
        <div className="flex flex-col gap-6 w-full">
          <InventoryStockLedgerSection
            itemId={itemId || "new"}
            loading={movLoading && !!itemId}
            error={movError}
            movements={movData?.movements || []}
            itemInfo={{
              sku: editing?.sku || form.sku || "",
              itemName: editing?.itemName || form.itemName || "",
              uom: uomName,
            }}
            onOpenDocument={onOpenDocument}
          />
        </div>
      }
      rightPanel={
        <>
          {saveError && (
            <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {saveError}
            </div>
          )}

          {loading ? (
            <DrawerSection title="Thông tin item kho">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="w-full">
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </DrawerSection>
          ) : viewOnly ? (
            <div className="flex flex-col gap-4">
              {/* 1. Item Master Information */}
              <DrawerSection title="Thông tin item kho">
                <DrawerRow
                  label="Mã SKU"
                  value={
                    <span className="font-bold text-foreground">
                      {editing?.sku || form.sku}
                    </span>
                  }
                />
                <DrawerRow label="Đơn vị tính (ĐVT)" value={uomName || "—"} />
                <DrawerRow
                  label="Tên item kho"
                  value={editing?.itemName || form.itemName || "—"}
                />
                <DrawerRow
                  label="Loại item"
                  value={
                    editing?.itemType?.name ||
                    itemTypeOptions
                      .find((t) => t.value === form.itemTypeId)
                      ?.label?.split(" — ")[1] ||
                    "—"
                  }
                />
                <DrawerRow
                  label="Tracking policy"
                  value={
                    editing?.trackingPolicy?.name ||
                    trackingPolicyOptions
                      .find((p) => p.value === form.trackingPolicyId)
                      ?.label?.split(" — ")[1] ||
                    "Không"
                  }
                />

                {/* 3 Metric Summary Cards */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center justify-center p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                      Tổng Nhập
                    </span>
                    <span className="font-bold text-orange-700 dark:text-orange-300 text-base tabular-nums">
                      +{fmtQty(totalInQty)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                      Tổng Xuất
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base tabular-nums">
                      -{fmtQty(totalOutQty)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                      Tồn Cuối
                    </span>
                    <span className="font-extrabold text-blue-700 dark:text-blue-300 text-lg tabular-nums">
                      {fmtQty(currentOnHand)}
                    </span>
                  </div>
                </div>
              </DrawerSection>

              {/* 2. Mini Table: Lịch sử Nhập (IN) */}
              <DrawerSection
                title="Lịch sử Nhập (IN)"
                titleExtra={
                  inTableState.activeFilterCount > 0 ? (
                    <FilterButton
                      activeCount={inTableState.activeFilterCount}
                      onClick={() => {}}
                      onClear={inTableState.resetFilters}
                    />
                  ) : null
                }
              >
                <DataTable
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  columns={inColumns}
                  items={paginatedInMovements}
                  loading={movLoading}
                  emptyLabel="Không có dữ liệu nhập"
                  containerClassName="h-auto overflow-visible"
                  summaryRow={{
                    documentNo: (
                      <div className="text-right w-full font-semibold pr-2 text-xs">
                        Tổng cộng:
                      </div>
                    ),
                    qtyIn: (
                      <div className="text-right font-bold text-orange-600 dark:text-orange-400 tabular-nums text-xs">
                        +{fmtQty(totalInQty)}
                      </div>
                    ),
                  }}
                  page={inPage}
                  pageSize={inPageSize}
                  pageSizeOptions={[4, 10, 20]}
                  paginationClassName="justify-center mt-2"
                  onPage={setInPage}
                  onPageSize={setInPageSize}
                  total={filteredInMovements.length}
                  totalPages={Math.ceil(
                    filteredInMovements.length / inPageSize,
                  )}
                />
              </DrawerSection>

              {/* 3. Mini Table: Lịch sử Xuất (OUT) */}
              <DrawerSection
                title="Lịch sử Xuất (OUT)"
                titleExtra={
                  outTableState.activeFilterCount > 0 ? (
                    <FilterButton
                      activeCount={outTableState.activeFilterCount}
                      onClick={() => {}}
                      onClear={outTableState.resetFilters}
                    />
                  ) : null
                }
              >
                <DataTable
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  columns={outColumns}
                  items={paginatedOutMovements}
                  loading={movLoading}
                  emptyLabel="Không có dữ liệu xuất"
                  containerClassName="h-auto overflow-visible"
                  summaryRow={{
                    documentNo: (
                      <div className="text-right w-full font-semibold pr-2 text-xs">
                        Tổng cộng:
                      </div>
                    ),
                    qtyOut: (
                      <div className="text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-xs">
                        -{fmtQty(totalOutQty)}
                      </div>
                    ),
                  }}
                  page={outPage}
                  pageSize={outPageSize}
                  pageSizeOptions={[4, 10, 20]}
                  paginationClassName="justify-center mt-2"
                  onPage={setOutPage}
                  onPageSize={setOutPageSize}
                  total={filteredOutMovements.length}
                  totalPages={Math.ceil(
                    filteredOutMovements.length / outPageSize,
                  )}
                />
              </DrawerSection>

              {/* 4. Notes if any */}
              {form.note && (
                <DrawerSection title="Ghi chú">
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {form.note}
                  </p>
                </DrawerSection>
              )}
            </div>
          ) : (
            <>
              <DrawerSection title="Thông tin item kho">
                <div className="flex flex-col gap-3">
                  <DrawerField label="SKU" required>
                    <input
                      value={form.sku}
                      disabled={viewOnly || !!editing}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sku: e.target.value }))
                      }
                      className={inputCls}
                      placeholder="VD: FG-001"
                    />
                  </DrawerField>

                  <DrawerField label="Tên item kho" required>
                    <input
                      value={form.itemName}
                      disabled={viewOnly}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          itemName: e.target.value,
                        }))
                      }
                      className={inputCls}
                      placeholder="Tên đầy đủ của item kho"
                    />
                  </DrawerField>

                  <DrawerField label="Đơn vị tính (ĐVT)" required>
                    <Combobox
                      value={form.uomId}
                      disabled={viewOnly}
                      allowClear={false}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          uomId: value || form.uomId,
                        }))
                      }
                      options={uomOptions}
                      placeholder="Chọn ĐVT"
                    />
                  </DrawerField>

                  <DrawerField label="Loại item">
                    <Combobox
                      value={form.itemTypeId}
                      disabled={viewOnly}
                      allowClear={false}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          itemTypeId: value || form.itemTypeId,
                        }))
                      }
                      options={itemTypeOptions}
                      placeholder="Chọn loại"
                    />
                  </DrawerField>

                  <DrawerField label="Tracking policy">
                    <Combobox
                      value={form.trackingPolicyId}
                      disabled={viewOnly}
                      allowClear
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          trackingPolicyId: value || "",
                          trackingCategoryId: value
                            ? prev.trackingCategoryId
                            : "",
                        }))
                      }
                      options={trackingPolicyOptions}
                      placeholder="Chọn chính sách tracking"
                    />
                  </DrawerField>

                  <DrawerField label="Tracking category">
                    <Combobox
                      value={form.trackingCategoryId}
                      disabled={viewOnly}
                      allowClear
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          trackingCategoryId: value || "",
                        }))
                      }
                      options={trackingCategoryOptions}
                      placeholder="Chọn nhóm tracking"
                    />
                  </DrawerField>
                </div>
              </DrawerSection>

              <DrawerSection
                title={t("inventoryMasters.attributes.label", "Thuộc tính")}
              >
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    {
                      value: "CAN_BE_SOLD",
                      label: t(
                        "inventoryMasters.attributes.CAN_BE_SOLD",
                        "Có thể bán",
                      ),
                    },
                    {
                      value: "CAN_BE_PURCHASED",
                      label: t(
                        "inventoryMasters.attributes.CAN_BE_PURCHASED",
                        "Có thể mua",
                      ),
                    },
                    {
                      value: "CAN_BE_MANUFACTURED",
                      label: t(
                        "inventoryMasters.attributes.CAN_BE_MANUFACTURED",
                        "Có thể sản xuất",
                      ),
                    },
                  ].map((attr) => (
                    <label
                      key={attr.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={form.attributes.includes(attr.value)}
                        disabled={viewOnly}
                        onCheckedChange={(checked) => {
                          setForm((prev) => ({
                            ...prev,
                            attributes: checked
                              ? [...prev.attributes, attr.value]
                              : prev.attributes.filter((a) => a !== attr.value),
                          }));
                        }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {attr.label}
                      </span>
                    </label>
                  ))}
                </div>
              </DrawerSection>

              <DrawerSection title="Ghi chú">
                <div className="mt-1">
                  <textarea
                    value={form.note}
                    disabled={viewOnly}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className={`${inputCls} min-h-[80px] resize-y`}
                    placeholder="Ghi chú thêm về item kho này..."
                  />
                </div>
              </DrawerSection>
            </>
          )}
        </>
      }
    />
  );
}
