import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
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
import { useUIStore } from "@/core/config/uiStore";
import {
  inventoryCoreApi,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

type MasterKind = "uom" | "item-type";

interface MasterForm {
  code: string;
  name: string;
  description: string;
  isActive: string;
}

const STATUS_OPTIONS = [
  { value: "true", label: "ACTIVE" },
  { value: "false", label: "INACTIVE" },
];

const TAB_OPTIONS: Array<{
  key: MasterKind;
  label: string;
  description: string;
}> = [
  {
    key: "uom",
    label: "Thiết lập đơn vị tính",
    description: "Quản lý danh mục đơn vị tính dùng chung cho item kho.",
  },
  {
    key: "item-type",
    label: "Thiết lập loại item kho",
    description: "Quản lý danh mục loại item áp dụng cho danh mục kho.",
  },
];

const emptyForm = (): MasterForm => ({
  code: "",
  name: "",
  description: "",
  isActive: "true",
});

function buildForm(item: InventoryMasterOption): MasterForm {
  return {
    code: item.code ?? "",
    name: item.name ?? "",
    description: item.description ?? "",
    isActive: item.isActive ? "true" : "false",
  };
}

function statusBadge(isActive: boolean) {
  return (
    <span
      className={
        isActive
          ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
          : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
      }
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export function InventoryMasterPage() {
  const showToast = useUIStore((s) => s.showToast);
  const [activeTab, setActiveTab] = useState<MasterKind>("uom");
  const [uoms, setUoms] = useState<InventoryMasterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<InventoryMasterOption[]>([]);
  const [loadingUoms, setLoadingUoms] = useState(true);
  const [loadingItemTypes, setLoadingItemTypes] = useState(true);
  const [uomError, setUomError] = useState<string | null>(null);
  const [itemTypeError, setItemTypeError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingKind, setEditingKind] = useState<MasterKind>("uom");
  const [editing, setEditing] = useState<InventoryMasterOption | null>(null);
  const [form, setForm] = useState<MasterForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: [
          { value: "true", label: "ACTIVE" },
          { value: "false", label: "INACTIVE" },
        ],
        placeholder: "Tất cả trạng thái",
      },
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig);

  const currentSearch = filter.state.search.trim();
  const currentIsActive =
    filter.state.status === "true"
      ? true
      : filter.state.status === "false"
        ? false
        : undefined;

  const loadUoms = useCallback(async () => {
    setLoadingUoms(true);
    setUomError(null);
    try {
      const res = await inventoryCoreApi.listUoms({
        page: 1,
        pageSize: 200,
        search: currentSearch || undefined,
        isActive: currentIsActive,
      });
      setUoms(res.items);
    } catch (e) {
      setUomError(e instanceof Error ? e.message : "Không thể tải đơn vị tính");
    } finally {
      setLoadingUoms(false);
    }
  }, [currentIsActive, currentSearch]);

  const loadItemTypes = useCallback(async () => {
    setLoadingItemTypes(true);
    setItemTypeError(null);
    try {
      const res = await inventoryCoreApi.listItemTypes({
        page: 1,
        pageSize: 200,
        search: currentSearch || undefined,
        isActive: currentIsActive,
      });
      setItemTypes(res.items);
    } catch (e) {
      setItemTypeError(
        e instanceof Error ? e.message : "Không thể tải loại item kho",
      );
    } finally {
      setLoadingItemTypes(false);
    }
  }, [currentIsActive, currentSearch]);

  useEffect(() => {
    if (activeTab === "uom") {
      void loadUoms();
      return;
    }
    void loadItemTypes();
  }, [activeTab, loadItemTypes, loadUoms]);

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setEditingKind(activeTab);
    setForm(emptyForm());
    setSaveError(null);
  }

  function openCreate(kind: MasterKind) {
    setEditingKind(kind);
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(kind: MasterKind, item: InventoryMasterOption) {
    setEditingKind(kind);
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  async function reloadCurrentTab() {
    if (activeTab === "uom") await loadUoms();
    else await loadItemTypes();
  }

  async function handleSave() {
    if (!form.code.trim()) return setSaveError("Code là bắt buộc");
    if (!form.name.trim()) return setSaveError("Tên là bắt buộc");
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive === "true",
      };
      if (editingKind === "uom") {
        if (editing) await inventoryCoreApi.updateUom(editing.id, payload);
        else await inventoryCoreApi.createUom(payload);
      } else {
        if (editing) await inventoryCoreApi.updateItemType(editing.id, payload);
        else await inventoryCoreApi.createItemType(payload);
      }
      showToast({
        title: editing ? "Cập nhật thành công" : "Tạo mới thành công",
        variant: "success",
      });
      closeDrawer();
      await reloadCurrentTab();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<InventoryMasterOption>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        cell: (item) => (
          <span className="font-medium font-mono">{item.code}</span>
        ),
      },
      {
        key: "name",
        header: "Tên hiển thị",
        cell: (item) => item.name,
      },
      {
        key: "description",
        header: "Mô tả",
        cell: (item) => item.description || "—",
      },
      {
        key: "isActive",
        header: "Trạng thái",
        cell: (item) => statusBadge(item.isActive),
      },
    ],
    [],
  );

  const currentItems = activeTab === "uom" ? uoms : itemTypes;
  const currentLoading = activeTab === "uom" ? loadingUoms : loadingItemTypes;
  const currentError = activeTab === "uom" ? uomError : itemTypeError;
  const currentMeta = TAB_OPTIONS.find((tab) => tab.key === activeTab)!;
  const currentTitle = editingKind === "uom" ? "đơn vị tính" : "loại item kho";

  const drawerActions: DrawerAction[] = [
    { label: "Hủy", onClick: closeDrawer, variant: "outline" },
    {
      label: editing ? "Cập nhật" : "Tạo mới",
      onClick: handleSave,
      primary: true,
      loading: saving,
    },
  ];

  return (
    <PageLayout
      title="Thiết lập danh mục kho"
      desc="Quản lý tập trung đơn vị tính và loại item áp dụng cho danh mục kho."
      icon={<Boxes className="h-5 w-5" />}
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            onClick={filter.togglePanel}
            activeCount={filter.activeFilterCount}
          />
          <button
            type="button"
            onClick={() => openCreate(activeTab)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo mới
          </button>
        </div>
      }
      tabs={TAB_OPTIONS.map((tab) => ({ value: tab.key, label: tab.label }))}
      activeTab={activeTab}
      onTabChange={(value) => setActiveTab(value as MasterKind)}
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <section>
            <DataTable
              items={currentItems}
              columns={columns}
              getRowKey={(item) => item.id}
              loading={currentLoading}
              error={currentError}
              emptyLabel="Chưa có dữ liệu"
              minWidth={760}
              loadingRows={6}
              actionsColumn={{
                header: "",
                className: "w-[48px]",
                cell: (item) => (
                  <ActionDropdown
                    items={[
                      {
                        label: "Sửa",
                        onClick: () => openEdit(activeTab, item),
                        icon: <Pencil className="h-3.5 w-3.5" />,
                      },
                    ]}
                  />
                ),
              }}
            />
          </section>
        </div>

        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={editing ? `Cập nhật ${currentTitle}` : `Tạo ${currentTitle}`}
        subtitle={editing?.code || "Cấu hình danh mục dùng chung"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[620px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}
        <DrawerSection title="Thông tin cấu hình">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Code" required>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                className={inputCls}
                placeholder="VD: PCS / FG"
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <Combobox
                value={form.isActive}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, isActive: value || "true" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Tên hiển thị" required>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputCls}
                placeholder="Tên hiển thị"
              />
            </DrawerField>
            <DrawerField label="Mô tả">
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={inputCls}
                placeholder="Mô tả ngắn"
              />
            </DrawerField>
          </div>
        </DrawerSection>
      </DrawerModal>
    </PageLayout>
  );
}
