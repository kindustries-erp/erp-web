import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Pencil,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  bomCoreApi,
  type CreateBomPayload,
  type ErpBom,
  type ErpBomLine,
} from "@/modules/bom-core/api/bomCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { cn } from "@/shared/utils";

const ITEM_LOOKUP_LIMIT = 200;

interface BomLineForm {
  componentItemId: string;
  qtyRequired: string;
  uom: string;
  scrapRate: string;
  notes: string;
}

interface BomForm {
  bomCode: string;
  bomName: string;
  finishedGoodItemId: string;
  version: string;
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
  lines: BomLineForm[];
}

const emptyLine = (): BomLineForm => ({
  componentItemId: "",
  qtyRequired: "1",
  uom: "PCS",
  scrapRate: "0",
  notes: "",
});

const emptyForm = (): BomForm => ({
  bomCode: "",
  bomName: "",
  finishedGoodItemId: "",
  version: "v1",
  status: "ACTIVE",
  effectiveFrom: "",
  effectiveTo: "",
  notes: "",
  lines: [emptyLine()],
});

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function buildForm(bom: ErpBom): BomForm {
  return {
    bomCode: bom.bomCode ?? "",
    bomName: bom.bomName ?? "",
    finishedGoodItemId: bom.finishedGoodItemId ?? "",
    version: bom.version ?? "v1",
    status: bom.status ?? "ACTIVE",
    effectiveFrom: bom.effectiveFrom ? bom.effectiveFrom.slice(0, 10) : "",
    effectiveTo: bom.effectiveTo ? bom.effectiveTo.slice(0, 10) : "",
    notes: bom.notes ?? "",
    lines: bom.lines?.length
      ? bom.lines.map((line) => ({
          componentItemId: line.componentItemId ?? "",
          qtyRequired: line.qtyRequired ?? "1",
          uom: line.uom ?? "PCS",
          scrapRate: line.scrapRate ?? "0",
          notes: line.notes ?? "",
        }))
      : [emptyLine()],
  };
}

function toPayload(form: BomForm): CreateBomPayload {
  return {
    bomCode: form.bomCode.trim(),
    bomName: form.bomName.trim(),
    finishedGoodItemId: form.finishedGoodItemId || undefined,
    version: form.version.trim() || "v1",
    status: form.status || "ACTIVE",
    effectiveFrom: form.effectiveFrom || undefined,
    effectiveTo: form.effectiveTo || undefined,
    notes: form.notes.trim() || undefined,
    lines: form.lines.map((line) => ({
      componentItemId: line.componentItemId || undefined,
      qtyRequired: line.qtyRequired,
      uom: line.uom.trim() || "PCS",
      scrapRate: line.scrapRate || undefined,
      notes: line.notes.trim() || undefined,
    })),
  };
}

interface BomTreeProps {
  bomId: string;
  fgToBomMap: Record<string, ErpBom>;
  itemsMap: Record<string, string>;
  level?: number;
}

function BomTree({ bomId, fgToBomMap, itemsMap, level = 0 }: BomTreeProps) {
  const [bom, setBom] = useState<ErpBom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const detail = await bomCoreApi.get(bomId);
        if (active) {
          setBom(detail);
        }
      } catch (err) {
        if (active) {
          setError("Không thể tải chi tiết cấu trúc");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void fetchDetail();
    return () => {
      active = false;
    };
  }, [bomId]);

  if (loading) {
    return (
      <div className="pl-4 py-2 text-xs text-muted-foreground animate-pulse">
        Đang tải cấu trúc NVL...
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-4 py-2 text-xs text-red-500 font-medium">
        ⚠️ {error}
      </div>
    );
  }

  if (!bom || !bom.lines || bom.lines.length === 0) {
    return (
      <div className="pl-4 py-2 text-xs text-muted-foreground italic">
        Không có nguyên vật liệu bên trong.
      </div>
    );
  }

  return (
    <div className="space-y-1 pl-4 border-l border-dashed border-border/40 ml-2.5 mt-1">
      {bom.lines.map((line, idx) => {
        const itemId = line.componentItemId;
        const itemName =
          line.componentItemName ||
          (itemId ? itemsMap[itemId] : "Linh kiện không xác định");
        const subBom = itemId ? fgToBomMap[itemId] : null;
        const isExpanded = itemId ? !!expandedLines[itemId] : false;

        const formattedQty = parseFloat(line.qtyRequired || "0").toFixed(1);
        const hasScrap = line.scrapRate && parseFloat(line.scrapRate) > 0;
        const formattedScrap = hasScrap
          ? parseFloat(line.scrapRate || "0").toFixed(1)
          : "";

        return (
          <div key={line.id || idx} className="text-xs">
            <div className="flex items-center justify-between py-1 hover:bg-muted/80 rounded px-2 transition-all duration-150 gap-4">
              <div className="flex items-center gap-2 min-w-0">
                {subBom ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (itemId) {
                        setExpandedLines((prev) => ({
                          ...prev,
                          [itemId]: !prev[itemId],
                        }));
                      }
                    }}
                    className="p-0.5 hover:bg-muted rounded text-muted-foreground transition-colors flex items-center justify-center shrink-0"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transform transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </button>
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-muted-foreground/30 text-[10px] shrink-0">
                    •
                  </span>
                )}
                <span className="font-medium text-foreground/90 truncate">
                  {itemName}
                  {line.notes && (
                    <span className="italic text-muted-foreground ml-1.5 font-normal">
                      ({line.notes})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full min-w-[32px] text-center">
                  {formattedQty}
                </span>
                <span className="font-medium text-foreground/75 w-10 truncate">
                  {line.uom}
                </span>
                {hasScrap && (
                  <span className="text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-full text-[9px] font-medium shrink-0">
                    Hao hụt {formattedScrap}%
                  </span>
                )}
              </div>
            </div>

            {subBom && isExpanded && itemId && (
              <BomTree
                bomId={subBom.id}
                fgToBomMap={fgToBomMap}
                itemsMap={itemsMap}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ErpBomPage() {
  const [items, setItems] = useState<ErpBom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpBom | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<BomForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const BOM_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Đang áp dụng" },
    { value: "INACTIVE", label: "Ngừng áp dụng" },
    { value: "DRAFT", label: "Bản nháp" },
  ];

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: BOM_STATUS_OPTIONS,
        placeholder: "Tất cả trạng thái",
      },
    }),
    [],
  );
  const filter = useFilterPanel(filterConfig);

  const loadBoms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bomCoreApi.list({
        page,
        pageSize,
        search: filter.state.search.trim() || undefined,
      });
      const nextItems = filter.state.status
        ? res.items.filter(
            (item) => (item.status || "") === filter.state.status,
          )
        : res.items;
      setItems(nextItems);
      setTotal(nextItems.length);
      setTotalPages(Math.ceil(nextItems.length / pageSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải BOM");
    } finally {
      setLoading(false);
    }
  }, [filter.state.search, filter.state.status, page, pageSize]);

  const loadItemOptions = useCallback(async (keyword = "") => {
    try {
      const res = await inventoryCoreApi.list({
        page: 1,
        pageSize: ITEM_LOOKUP_LIMIT,
        search: keyword,
      });
      setItemOptions(
        res.items.map((item: ErpInventoryItem) => ({
          value: item.id,
          label: `${item.sku} — ${item.itemName}`,
        })),
      );
    } catch {
      setItemOptions([]);
    }
  }, []);

  const [expandedBomIds, setExpandedBomIds] = useState<Record<string, boolean>>(
    {},
  );
  const [allBoms, setAllBoms] = useState<ErpBom[]>([]);

  const loadAllBoms = useCallback(async () => {
    try {
      const res = await bomCoreApi.list({ page: 1, pageSize: 1000 });
      setAllBoms(res.items);
    } catch (e) {
      console.error("Không thể tải danh sách BOM cho cấu trúc cây", e);
    }
  }, []);

  useEffect(() => {
    void loadBoms();
  }, [loadBoms]);

  useEffect(() => {
    void loadAllBoms();
  }, [loadAllBoms]);

  useEffect(() => {
    void loadItemOptions();
  }, [loadItemOptions]);

  const fgToBomMap = useMemo(() => {
    const map: Record<string, ErpBom> = {};
    allBoms.forEach((bom) => {
      if (bom.finishedGoodItemId) {
        map[bom.finishedGoodItemId] = bom;
      }
    });
    return map;
  }, [allBoms]);

  const itemsMap = useMemo(() => {
    const map: Record<string, string> = {};
    itemOptions.forEach((opt) => {
      map[opt.value] = opt.label;
    });
    return map;
  }, [itemOptions]);

  function toggleExpand(id: string) {
    setExpandedBomIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  async function openEdit(item: ErpBom) {
    setSaveError(null);
    setViewOnly(false);
    try {
      const detail = await bomCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết BOM");
    }
  }

  async function openView(item: ErpBom) {
    setSaveError(null);
    setViewOnly(true);
    try {
      const detail = await bomCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết BOM");
    }
  }

  function updateLine(index: number, patch: Partial<BomLineForm>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, ...patch } : line,
      ),
    }));
  }

  function addLine() {
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  }

  function removeLine(index: number) {
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length === 1
          ? [emptyLine()]
          : prev.lines.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.bomCode.trim() || !form.bomName.trim()) {
      setSaveError("Mã BOM và tên BOM là bắt buộc");
      return;
    }

    if (
      !form.lines.length ||
      form.lines.some((line) => !line.qtyRequired.trim())
    ) {
      setSaveError("Mỗi dòng BOM phải có số lượng hợp lệ");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      if (editing) {
        await bomCoreApi.update(editing.id, payload);
      } else {
        await bomCoreApi.create(payload);
      }
      closeDrawer();
      void loadAllBoms();
      if (!editing && page !== 1) setPage(1);
      else await loadBoms();
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu BOM",
      );
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<ErpBom>[] = [
    {
      key: "bomCode",
      header: "Mã BOM",
      cell: (item) => {
        const isExpanded = !!expandedBomIds[item.id];
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(item.id);
            }}
            className="font-medium text-primary hover:underline focus:outline-none flex items-center gap-1.5 text-left"
          >
            <span className="font-semibold text-primary">{item.bomCode}</span>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform text-muted-foreground",
                isExpanded && "rotate-90 text-primary",
              )}
            />
          </button>
        );
      },
      skeletonClassName: "w-24",
    },
    {
      key: "bomName",
      header: "Tên BOM",
      cell: (item) => item.bomName,
      skeletonClassName: "w-40",
    },
    {
      key: "finishedGoodItemName",
      header: "Thành phẩm",
      cell: (item) => {
        const name =
          item.finishedGoodItemName ||
          (item.finishedGoodItemId ? itemsMap[item.finishedGoodItemId] : "—");
        return (
          <div className="flex flex-col min-w-0">
            <span className="truncate font-medium text-foreground" title={name}>
              {name}
            </span>
            {item.notes && (
              <span
                className="italic text-muted-foreground text-[11px] mt-0.5 truncate"
                title={item.notes}
              >
                ({item.notes})
              </span>
            )}
          </div>
        );
      },
      skeletonClassName: "w-36",
    },
    {
      key: "version",
      header: "Version",
      cell: (item) => item.version || "—",
      skeletonClassName: "w-16",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => {
        const statusMap = {
          ACTIVE: { label: "Đang áp dụng", cls: "bg-green-100 text-green-700" },
          INACTIVE: {
            label: "Ngừng áp dụng",
            cls: "bg-red-100 text-red-700",
          },
          DRAFT: { label: "Bản nháp", cls: "bg-gray-100 text-gray-700" },
        };
        const s =
          statusMap[item.status as keyof typeof statusMap] || statusMap.DRAFT;
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap inline-block ${s.cls}`}
          >
            {s.label}
          </span>
        );
      },
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveFrom",
      header: "Hiệu lực từ",
      cell: (item) => fmtDate(item.effectiveFrom),
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveTo",
      header: "Hiệu lực đến",
      cell: (item) => fmtDate(item.effectiveTo),
      skeletonClassName: "w-20",
    },
  ];

  const drawerActions: DrawerAction[] = [
    {
      label: "Hủy",
      onClick: closeDrawer,
      variant: "outline",
    },
    {
      label: viewOnly ? "Đóng" : editing ? "Cập nhật" : "Tạo mới",
      onClick: handleSave,
      primary: true,
      loading: saving,
    },
  ];

  return (
    <PageLayout
      title="ERP BOM"
      desc="Quản lý định mức nguyên vật liệu cho thành phẩm."
      icon={<Boxes className="h-5 w-5" />}
    >
      <div className="flex items-center justify-end mb-3">
        <TableActionGroup
          onRefresh={() => void loadBoms()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={openCreate}
        />
      </div>
      <div className="flex items-start">
        <div className="min-w-0 flex-1">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            error={error}
            emptyLabel="Chưa có BOM"
            minWidth={980}
            loadingRows={6}
            actionsColumn={{
              header: "",
              className: "w-[48px]",
              cell: (item) => (
                <ActionDropdown
                  items={[
                    {
                      label: "Sửa",
                      onClick: () => void openEdit(item),
                      icon: <Pencil className="h-3.5 w-3.5" />,
                    },
                  ]}
                />
              ),
            }}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(value) => {
              setPage(1);
              setPageSize(value);
            }}
            renderSubRow={(item) => (
              <BomTree
                bomId={item.id}
                fgToBomMap={fgToBomMap}
                itemsMap={itemsMap}
              />
            )}
            expandedRowKeys={Object.keys(expandedBomIds).filter(
              (key) => expandedBomIds[key],
            )}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={viewOnly ? "Xem BOM" : editing ? "Cập nhật BOM" : "Tạo BOM mới"}
        subtitle={editing ? editing.bomCode : "Định mức nguyên vật liệu"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[1100px] min-[1280px]:min-w-[1280px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Cột trái (4/5): Định mức nguyên vật liệu */}
          <div className="flex-1 min-w-0 order-2 xl:order-1">
            <DrawerSection title="Định mức nguyên vật liệu">
              {!viewOnly && !editing && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={addLine}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm dòng
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {form.lines.map((line, index) => (
                  <div
                    key={`${index}-${line.componentItemId}`}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-muted-foreground">
                        NVL {index + 1}
                      </div>
                      {!viewOnly && !editing && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Xóa dòng
                        </button>
                      )}
                    </div>

                    {/* Hàng 1: Các field thông tin (scroll ngang nếu màn hình nhỏ) */}
                    <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2 scrollbar-thin">
                      <div className="min-w-[240px] flex-[2]">
                        <DrawerField label="Linh kiện" required>
                          <Combobox
                            value={line.componentItemId}
                            readOnly={viewOnly || !!editing}
                            onChange={(value) =>
                              updateLine(index, { componentItemId: value })
                            }
                            options={itemOptions}
                            placeholder="Chọn linh kiện"
                            searchPlaceholder="Tìm SKU / tên linh kiện"
                          />
                        </DrawerField>
                      </div>
                      <div className="min-w-[90px] flex-1">
                        <DrawerField label="Số lượng" required>
                          <input
                            value={line.qtyRequired}
                            readOnly={viewOnly || !!editing}
                            onChange={(e) =>
                              updateLine(index, { qtyRequired: e.target.value })
                            }
                            className={inputCls}
                          />
                        </DrawerField>
                      </div>
                      <div className="min-w-[80px] flex-1">
                        <DrawerField label="ĐVT">
                          <input
                            value={line.uom}
                            readOnly={viewOnly || !!editing}
                            onChange={(e) =>
                              updateLine(index, { uom: e.target.value })
                            }
                            className={inputCls}
                          />
                        </DrawerField>
                      </div>
                      <div className="min-w-[95px] flex-1">
                        <DrawerField label="Tỷ lệ hao hụt">
                          <input
                            value={line.scrapRate}
                            readOnly={viewOnly || !!editing}
                            onChange={(e) =>
                              updateLine(index, { scrapRate: e.target.value })
                            }
                            className={inputCls}
                          />
                        </DrawerField>
                      </div>
                    </div>

                    {/* Hàng 2: Ghi chú dòng */}
                    <div className="mt-2">
                      <DrawerField label="Ghi chú dòng">
                        <textarea
                          value={line.notes}
                          readOnly={viewOnly}
                          onChange={(e) =>
                            updateLine(index, { notes: e.target.value })
                          }
                          className={`${inputCls} min-h-[44px] py-1.5 resize-y`}
                        />
                      </DrawerField>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>
          </div>

          {/* Cột phải (1/5): Thông tin chung */}
          <div className="xl:w-[280px] w-full shrink-0 order-1 xl:order-2">
            <DrawerSection title="Thông tin chung">
              <div className="flex flex-col gap-3">
                <DrawerField label="Mã BOM" required>
                  <input
                    value={form.bomCode}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bomCode: e.target.value }))
                    }
                    className={inputCls}
                  />
                </DrawerField>
                <DrawerField label="Version" required>
                  <input
                    value={form.version}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, version: e.target.value }))
                    }
                    className={inputCls}
                  />
                </DrawerField>
                <DrawerField label="Tên BOM" required>
                  <input
                    value={form.bomName}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bomName: e.target.value }))
                    }
                    className={inputCls}
                  />
                </DrawerField>
                <DrawerField label="Thành phẩm">
                  <Combobox
                    value={form.finishedGoodItemId}
                    readOnly={viewOnly || !!editing}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        finishedGoodItemId: value,
                      }))
                    }
                    options={itemOptions}
                    placeholder="Chọn thành phẩm"
                    searchPlaceholder="Tìm SKU / tên thành phẩm"
                  />
                </DrawerField>
                <DrawerField label="Hiệu lực từ">
                  <DatePicker
                    value={form.effectiveFrom}
                    disabled={viewOnly}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        effectiveFrom: value,
                      }))
                    }
                    className="w-full"
                  />
                </DrawerField>
                <DrawerField label="Hiệu lực đến">
                  <DatePicker
                    value={form.effectiveTo}
                    disabled={viewOnly}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        effectiveTo: value,
                      }))
                    }
                    className="w-full"
                  />
                </DrawerField>
                <DrawerField label="Trạng thái">
                  <Combobox
                    value={form.status}
                    readOnly={viewOnly}
                    allowClear={false}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value || "ACTIVE",
                      }))
                    }
                    options={[
                      { value: "ACTIVE", label: "Đang áp dụng" },
                      { value: "INACTIVE", label: "Ngừng áp dụng" },
                      { value: "DRAFT", label: "Bản nháp" },
                    ]}
                  />
                </DrawerField>
                <DrawerField label="Ghi chú">
                  <textarea
                    value={form.notes}
                    readOnly={viewOnly}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className={`${inputCls} min-h-[88px] resize-y`}
                  />
                </DrawerField>
              </div>
            </DrawerSection>
          </div>
        </div>
      </DrawerModal>
    </PageLayout>
  );
}
