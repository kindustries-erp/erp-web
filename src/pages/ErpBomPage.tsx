import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
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

export function ErpBomPage() {
  const [items, setItems] = useState<ErpBom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpBom | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<BomForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const loadBoms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bomCoreApi.list({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải BOM");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

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

  useEffect(() => {
    void loadBoms();
  }, [loadBoms]);

  useEffect(() => {
    void loadItemOptions();
  }, [loadItemOptions]);

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
      cell: (item) => <span className="font-medium">{item.bomCode}</span>,
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
      cell: (item) => item.finishedGoodItemName || "—",
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
      cell: (item) => item.status || "—",
      skeletonClassName: "w-16",
    },
    {
      key: "effectiveFrom",
      header: "Hiệu lực từ",
      cell: (item) => fmtDate(item.effectiveFrom),
      skeletonClassName: "w-20",
    },
  ];

  const filterBar = useMemo(
    () => (
      <>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setSearch(searchInput.trim());
            }
          }}
          placeholder="Tìm mã / tên BOM"
          className={`${inputCls} min-w-[260px] bg-surface`}
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
        >
          Search
        </button>
      </>
    ),
    [searchInput],
  );

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
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
        >
          <Plus className="h-3.5 w-3.5" />
          Tạo mới
        </button>
      }
    >
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyLabel="Chưa có BOM"
        filters={filterBar}
        minWidth={980}
        loadingRows={6}
        actionsColumn={{
          header: "",
          className: "w-[48px]",
          cell: (item) => (
            <ActionDropdown
              items={[
                {
                  label: "Xem",
                  onClick: () => void openView(item),
                  icon: <Boxes className="h-3.5 w-3.5" />,
                },
                {
                  label: "Sửa",
                  onClick: () => void openEdit(item),
                  icon: <Pencil className="h-3.5 w-3.5" />,
                },
                {
                  label: "Delete chưa hỗ trợ",
                  onClick: () => undefined,
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "danger",
                  hidden: true,
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
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={viewOnly ? "Xem BOM" : editing ? "Cập nhật BOM" : "Tạo BOM mới"}
        subtitle={editing ? editing.bomCode : "Định mức nguyên vật liệu"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[720px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        <DrawerSection title="Thông tin chung">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Mã BOM" required>
              <input
                value={form.bomCode}
                disabled={viewOnly || !!editing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bomCode: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Version" required>
              <input
                value={form.version}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, version: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Tên BOM" required>
              <input
                value={form.bomName}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bomName: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <Combobox
                value={form.status}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value || "ACTIVE" }))
                }
                options={[
                  { value: "ACTIVE", label: "ACTIVE" },
                  { value: "INACTIVE", label: "INACTIVE" },
                  { value: "DRAFT", label: "DRAFT" },
                ]}
              />
            </DrawerField>
            <DrawerField label="Thành phẩm">
              <Combobox
                value={form.finishedGoodItemId}
                disabled={viewOnly}
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
              <input
                type="date"
                value={form.effectiveFrom}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    effectiveFrom: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Hiệu lực đến">
              <input
                type="date"
                value={form.effectiveTo}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    effectiveTo: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </DrawerField>
          </div>

          <DrawerField label="Ghi chú">
            <textarea
              value={form.notes}
              disabled={viewOnly}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className={`${inputCls} min-h-[88px] resize-y`}
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Định mức nguyên vật liệu">
          {!viewOnly && (
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
                    Dòng {index + 1}
                  </div>
                  {!viewOnly && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Xóa dòng
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DrawerField label="Linh kiện" required>
                    <Combobox
                      value={line.componentItemId}
                      disabled={viewOnly}
                      onChange={(value) =>
                        updateLine(index, { componentItemId: value })
                      }
                      options={itemOptions}
                      placeholder="Chọn linh kiện"
                      searchPlaceholder="Tìm SKU / tên linh kiện"
                    />
                  </DrawerField>
                  <DrawerField label="Số lượng" required>
                    <input
                      value={line.qtyRequired}
                      disabled={viewOnly}
                      onChange={(e) =>
                        updateLine(index, { qtyRequired: e.target.value })
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                  <DrawerField label="ĐVT">
                    <input
                      value={line.uom}
                      disabled={viewOnly}
                      onChange={(e) =>
                        updateLine(index, { uom: e.target.value })
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                  <DrawerField label="Tỷ lệ hao hụt">
                    <input
                      value={line.scrapRate}
                      disabled={viewOnly}
                      onChange={(e) =>
                        updateLine(index, { scrapRate: e.target.value })
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                </div>

                <DrawerField label="Ghi chú dòng">
                  <textarea
                    value={line.notes}
                    disabled={viewOnly}
                    onChange={(e) =>
                      updateLine(index, { notes: e.target.value })
                    }
                    className={`${inputCls} min-h-[72px] resize-y`}
                  />
                </DrawerField>
              </div>
            ))}
          </div>
        </DrawerSection>
      </DrawerModal>
    </PageLayout>
  );
}
