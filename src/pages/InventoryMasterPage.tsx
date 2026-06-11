import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus } from "lucide-react";
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
import { useUIStore } from "@/core/config/uiStore";
import {
  inventoryCoreApi,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

interface MasterConfig {
  key: "uom" | "item-type";
  title: string;
  description: string;
  createLabel: string;
}

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

export function InventoryMasterPage({ config }: { config: MasterConfig }) {
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<InventoryMasterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryMasterOption | null>(null);
  const [form, setForm] = useState<MasterForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        config.key === "uom"
          ? await inventoryCoreApi.listUoms({ page, pageSize, search })
          : await inventoryCoreApi.listItemTypes({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [config.key, page, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: InventoryMasterOption) {
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
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
      if (config.key === "uom") {
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
      if (!editing && page !== 1) setPage(1);
      else await load();
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
        cell: (item) => (
          <span
            className={
              item.isActive
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            }
          >
            {item.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        ),
      },
    ],
    [],
  );

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
          placeholder="Tìm theo code hoặc tên"
          className={`${inputCls} min-w-[240px] bg-surface`}
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
      title={config.title}
      desc={config.description}
      icon={<Boxes className="h-5 w-5" />}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
        >
          <Plus className="h-3.5 w-3.5" />
          {config.createLabel}
        </button>
      }
    >
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyLabel="Chưa có dữ liệu"
        filters={filterBar}
        minWidth={860}
        loadingRows={8}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(value) => {
          setPage(1);
          setPageSize(value);
        }}
        actionsColumn={{
          header: "",
          className: "w-[48px]",
          cell: (item) => (
            <ActionDropdown
              items={[
                {
                  label: "Sửa",
                  onClick: () => openEdit(item),
                  icon: <Pencil className="h-3.5 w-3.5" />,
                },
              ]}
            />
          ),
        }}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={
          editing
            ? `Cập nhật ${config.title.toLowerCase()}`
            : config.createLabel
        }
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

export function InventoryUomsPage() {
  return (
    <InventoryMasterPage
      config={{
        key: "uom",
        title: "Đơn vị tính",
        description:
          "Cấu hình danh mục đơn vị tính dùng chung cho danh mục kho.",
        createLabel: "Tạo đơn vị tính",
      }}
    />
  );
}

export function InventoryItemTypesPage() {
  return (
    <InventoryMasterPage
      config={{
        key: "item-type",
        title: "Loại item kho",
        description: "Cấu hình các loại item áp dụng cho danh mục kho.",
        createLabel: "Tạo loại item",
      }}
    />
  );
}
