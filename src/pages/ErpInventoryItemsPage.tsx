import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Plus, ReceiptText } from "lucide-react";
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
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
];

const ITEM_TYPE_FILTER_OPTIONS = [
  { value: "FG", label: "FG — Thành phẩm" },
  { value: "WIP", label: "WIP — Bán thành phẩm" },
  { value: "RAW", label: "RAW — Linh kiện" },
  { value: "GOODS", label: "GOODS — Hàng hóa" },
  { value: "SERVICE", label: "SERVICE — Dịch vụ" },
  { value: "OTHER", label: "OTHER — Khác" },
];

interface ItemForm {
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status: string;
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uom: "PCS",
  itemType: "FG",
  status: "ACTIVE",
});

function buildForm(item: ErpInventoryItem): ItemForm {
  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uom: item.uom ?? "PCS",
    itemType: item.itemType ?? "FG",
    status: item.status ?? "ACTIVE",
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uom: form.uom || "PCS",
    itemType: form.itemType || "FG",
    status: form.status || "ACTIVE",
  };
}

function buildMasterOptions(items: InventoryMasterOption[]) {
  return items
    .filter((item) => item.isActive)
    .map((item) => ({
      value: item.code,
      label: `${item.code} — ${item.name}`,
    }));
}

export function ErpInventoryItemsPage() {
  const [items, setItems] = useState<ErpInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uomOptions, setUomOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [itemTypeOptions, setItemTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: STATUS_OPTIONS,
        placeholder: "Tất cả trạng thái",
      },
      custom: [
        {
          key: "itemType",
          label: "Loại item",
          placeholder: "Tất cả loại item",
          options: ITEM_TYPE_FILTER_OPTIONS,
        },
      ],
    }),
    [],
  );
  const filter = useFilterPanel(filterConfig);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryCoreApi.list({
        page,
        pageSize,
        search: filter.state.search.trim() || undefined,
      });
      let nextItems = res.items;
      if (filter.state.status) {
        nextItems = nextItems.filter(
          (item) => item.status === filter.state.status,
        );
      }
      if (filter.state.custom.itemType) {
        nextItems = nextItems.filter(
          (item) => item.itemType === filter.state.custom.itemType,
        );
      }
      setItems(nextItems);
      setTotal(nextItems.length);
      setTotalPages(Math.ceil(nextItems.length / pageSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh mục kho");
    } finally {
      setLoading(false);
    }
  }, [
    filter.state.custom,
    filter.state.search,
    filter.state.status,
    page,
    pageSize,
  ]);

  const loadMasters = useCallback(async () => {
    try {
      const [uoms, itemTypes] = await Promise.all([
        inventoryCoreApi.listUoms({ page: 1, pageSize: 200, isActive: true }),
        inventoryCoreApi.listItemTypes({
          page: 1,
          pageSize: 200,
          isActive: true,
        }),
      ]);
      setUomOptions(buildMasterOptions(uoms.items));
      setItemTypeOptions(buildMasterOptions(itemTypes.items));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể tải cấu hình loại item/đơn vị tính",
      );
    }
  }, []);

  async function ensureMastersFresh() {
    await loadMasters();
  }

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

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

  async function openCreate() {
    resetForm();
    await ensureMastersFresh();
    setDrawerOpen(true);
  }

  async function openEdit(item: ErpInventoryItem) {
    setViewOnly(false);
    setSaveError(null);
    try {
      await ensureMastersFresh();
      const detail = await inventoryCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết");
    }
  }

  async function openView(item: ErpInventoryItem) {
    setViewOnly(true);
    setSaveError(null);
    try {
      await ensureMastersFresh();
      const detail = await inventoryCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết");
    }
  }

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }
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
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadItems();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<ErpInventoryItem>[] = useMemo(
    () => [
      {
        key: "sku",
        header: "SKU",
        cell: (item) => (
          <span className="font-medium font-mono">{item.sku}</span>
        ),
        skeletonClassName: "w-24",
      },
      {
        key: "itemName",
        header: "Tên item kho",
        cell: (item) => item.itemName,
        skeletonClassName: "w-44",
      },
      {
        key: "uom",
        header: "ĐVT",
        cell: (item) => item.uom || "—",
        skeletonClassName: "w-10",
      },
      {
        key: "itemType",
        header: "Loại",
        cell: (item) => item.itemType || "—",
        skeletonClassName: "w-28",
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (item) => (
          <span
            className={
              item.status === "ACTIVE"
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            }
          >
            {item.status || "—"}
          </span>
        ),
        skeletonClassName: "w-16",
      },
    ],
    [],
  );

  const drawerActions: DrawerAction[] = [
    { label: "Hủy", onClick: closeDrawer, variant: "outline" },
    {
      label: viewOnly ? "Đóng" : editing ? "Cập nhật" : "Tạo mới",
      onClick: handleSave,
      primary: true,
      loading: saving,
    },
  ];

  return (
    <PageLayout
      title="Danh mục kho"
      desc="Quản lý item kho dùng chung: thành phẩm (FG), nguyên vật liệu (RAW), bán thành phẩm (WIP), hàng hóa (GOODS)."
      icon={<Layers className="h-5 w-5" />}
    >
      <div className="flex items-center justify-end mb-3">
        <TableActionGroup
          onRefresh={() => void loadItems()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={() => void openCreate()}
          createLabel="Tạo item kho"
        />
      </div>
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            error={error}
            emptyLabel="Chưa có item kho nào"
            minWidth={980}
            loadingRows={8}
            actionsColumn={{
              header: "",
              className: "w-[48px]",
              cell: (item) => (
                <ActionDropdown
                  items={[
                    {
                      label: "Xem",
                      onClick: () => void openView(item),
                      icon: <ReceiptText className="h-3.5 w-3.5" />,
                    },
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
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Layers className="h-4 w-4" />}
        title={
          viewOnly
            ? "Xem item kho"
            : editing
              ? "Cập nhật item kho"
              : "Tạo item kho mới"
        }
        subtitle={editing ? editing.sku : "Danh mục item kho dùng chung"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[620px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        <DrawerSection title="Thông tin item kho">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

            <DrawerField label="Đơn vị tính (ĐVT)" required>
              <Combobox
                value={form.uom}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    uom: value || form.uom || "PCS",
                  }))
                }
                options={uomOptions}
                placeholder="Chọn ĐVT"
              />
            </DrawerField>

            <DrawerField label="Tên item kho" required>
              <input
                value={form.itemName}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, itemName: e.target.value }))
                }
                className={inputCls}
                placeholder="Tên đầy đủ của item kho"
              />
            </DrawerField>

            <DrawerField label="Loại item">
              <Combobox
                value={form.itemType}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    itemType: value || form.itemType || "FG",
                  }))
                }
                options={itemTypeOptions}
                placeholder="Chọn loại"
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
                options={STATUS_OPTIONS}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {editing && (
          <DrawerSection title="Thông tin hệ thống">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
              <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono font-medium truncate ml-2">
                  {editing.id}
                </span>
              </div>
              {editing.createdAt && (
                <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium">
                    {editing.createdAt.slice(0, 10)}
                  </span>
                </div>
              )}
              {editing.updatedAt && (
                <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Cập nhật</span>
                  <span className="font-medium">
                    {editing.updatedAt.slice(0, 10)}
                  </span>
                </div>
              )}
            </div>
          </DrawerSection>
        )}
      </DrawerModal>
    </PageLayout>
  );
}
