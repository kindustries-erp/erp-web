import { useMemo, useState } from "react";
import { useT } from "@/core/i18n";
import { Boxes, Pencil, Trash2 } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
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
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { useUIStore } from "@/core/config/uiStore";
import { type InventoryMasterOption } from "@/modules/inventory-core/api/inventoryCoreApi";
import { ErpInventoryItemsTab } from "@/pages/ErpInventoryItemsPage";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import {
  useInventoryMasterListQuery,
  type InventoryMasterQueryKind,
} from "@/modules/inventory-core/hooks/useInventoryMasterListQuery";
import {
  useInventoryMasterDeleteMutation,
  useInventoryMasterSaveMutation,
} from "@/modules/inventory-core/hooks/useInventoryMasterMutation";

type MasterKind = "items" | "uom" | "item-type";

interface MasterForm {
  code: string;
  name: string;
  description: string;
  isActive: string;
}

// Removed global constants

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

function statusBadge(isActive: boolean, t: (k: string) => string) {
  return (
    <span
      className={
        isActive
          ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
          : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
      }
    >
      {isActive
        ? t("inventoryMasters.status.active")
        : t("inventoryMasters.status.inactive")}
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toMasterQueryKind(kind: MasterKind): InventoryMasterQueryKind {
  return kind === "uom" ? "uoms" : "item-types";
}

export function InventoryMasterPage() {
  const t = useT();
  const canRead = useHasPermission("inventory_items", "read");
  const showToast = useUIStore((s) => s.showToast);
  const [activeTab, setActiveTab] = useState<MasterKind>("items");

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "true", label: t("inventoryMasters.status.active") },
      { value: "false", label: t("inventoryMasters.status.inactive") },
    ],
    [t],
  );

  const TAB_OPTIONS = useMemo<
    { key: MasterKind; label: string; description: string }[]
  >(
    () => [
      {
        key: "items",
        label: t("inventoryMasters.tabs.itemsLabel"),
        description: t("inventoryMasters.tabs.itemsDesc"),
      },
      {
        key: "uom",
        label: t("inventoryMasters.tabs.uomLabel"),
        description: t("inventoryMasters.tabs.uomDesc"),
      },
      {
        key: "item-type",
        label: t("inventoryMasters.tabs.itemTypeLabel"),
        description: t("inventoryMasters.tabs.itemTypeDesc"),
      },
    ],
    [t],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingKind, setEditingKind] = useState<MasterKind>("uom");
  const [editing, setEditing] = useState<InventoryMasterOption | null>(null);
  const [form, setForm] = useState<MasterForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [itemsActions, setItemsActions] = useState<React.ReactNode>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: MasterKind;
    item: InventoryMasterOption;
  } | null>(null);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: STATUS_OPTIONS,
        placeholder: t("inventoryMasters.filter.statusPlaceholder"),
      },
    }),
    [STATUS_OPTIONS, t],
  );

  const filterUom = useFilterPanel(filterConfig);
  const filterItemType = useFilterPanel(filterConfig);
  const filter = activeTab === "uom" ? filterUom : filterItemType;

  const uomParams = useMemo(
    () => ({
      kind: "uoms" as const,
      search: filterUom.state.search.trim() || undefined,
      isActive:
        filterUom.state.status === "true"
          ? true
          : filterUom.state.status === "false"
            ? false
            : undefined,
    }),
    [filterUom.state.search, filterUom.state.status],
  );

  const itemTypeParams = useMemo(
    () => ({
      kind: "item-types" as const,
      search: filterItemType.state.search.trim() || undefined,
      isActive:
        filterItemType.state.status === "true"
          ? true
          : filterItemType.state.status === "false"
            ? false
            : undefined,
    }),
    [filterItemType.state.search, filterItemType.state.status],
  );

  const uomsQuery = useInventoryMasterListQuery(uomParams);
  const itemTypesQuery = useInventoryMasterListQuery(itemTypeParams);
  const saveMutation = useInventoryMasterSaveMutation();
  const deleteMutation = useInventoryMasterDeleteMutation();

  const currentQuery = activeTab === "uom" ? uomsQuery : itemTypesQuery;
  const currentItems = currentQuery.data?.items ?? [];
  const currentLoading = currentQuery.isLoading || currentQuery.isFetching;
  const currentError =
    currentQuery.error instanceof Error ? currentQuery.error.message : null;

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setEditingKind(activeTab === "items" ? "uom" : activeTab);
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

  async function handleSave() {
    if (!form.code.trim())
      return setSaveError(t("inventoryMasters.error.codeRequired"));
    if (!form.name.trim())
      return setSaveError(t("inventoryMasters.error.nameRequired"));
    setSaveError(null);
    try {
      await saveMutation.mutateAsync({
        kind: editingKind === "uom" ? "uom" : "item-type",
        id: editing?.id,
        payload: {
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.isActive === "true",
        },
      });
      showToast({
        title: editing
          ? t("inventoryMasters.toast.updateSuccess")
          : t("inventoryMasters.toast.createSuccess"),
        variant: "success",
      });
      closeDrawer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message ||
          e?.message ||
          t("inventoryMasters.error.save"),
      );
    }
  }

  function handleDelete(kind: MasterKind, item: InventoryMasterOption) {
    setDeleteTarget({ kind, item });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        kind: deleteTarget.kind === "uom" ? "uom" : "item-type",
        id: deleteTarget.item.id,
      });
      showToast({
        title: t("inventoryMasters.toast.deleteSuccess"),
        variant: "success",
      });
      setDeleteTarget(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast({
        title:
          e?.response?.data?.message ||
          e?.message ||
          t("inventoryMasters.error.delete"),
        variant: "destructive",
      });
    }
  }

  const columns: DataTableColumn<InventoryMasterOption>[] = useMemo(
    () => [
      {
        key: "code",
        header: t("inventoryMasters.columns.code"),
        cell: (item) => (
          <span className="font-medium font-mono">{item.code}</span>
        ),
      },
      {
        key: "name",
        header: t("inventoryMasters.columns.name"),
        cell: (item) => item.name,
      },
      {
        key: "description",
        header: t("inventoryMasters.columns.description"),
        cell: (item) => item.description || "—",
      },
      {
        key: "isActive",
        header: t("inventoryMasters.columns.status"),
        cell: (item) => statusBadge(item.isActive, t),
      },
    ],
    [t],
  );

  const drawerActions: DrawerAction[] = [
    {
      label: t("inventoryMasters.drawer.cancel"),
      onClick: closeDrawer,
      variant: "outline",
    },
    {
      label: editing
        ? t("inventoryMasters.drawer.update")
        : t("inventoryMasters.drawer.create"),
      onClick: handleSave,
      primary: true,
      loading: saveMutation.isPending,
    },
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("inventoryMasters.title")}
      desc={t("inventoryMasters.desc")}
      icon={<Boxes className="h-5 w-5" />}
      tabs={TAB_OPTIONS.map((tab) => ({ value: tab.key, label: tab.label }))}
      activeTab={activeTab}
      onTabChange={(value) => setActiveTab(value as MasterKind)}
      actions={
        activeTab === "items" ? (
          itemsActions
        ) : (
          <TableActionGroup
            onRefresh={() => void currentQuery.refetch()}
            loading={currentLoading}
            onFilterToggle={filter.togglePanel}
            activeFilterCount={filter.activeFilterCount}
            onCreate={() => openCreate(activeTab)}
            createLabel={
              activeTab === "uom"
                ? t("inventoryMasters.actions.createUom")
                : t("inventoryMasters.actions.createItemType")
            }
          />
        )
      }
    >
      {activeTab === "items" ? (
        <ErpInventoryItemsTab setActions={setItemsActions} />
      ) : (
        <>
          <div className="flex items-start">
            <div className="min-w-0 flex-1 space-y-4">
              <section>
                <StandardTable<InventoryMasterOption>
                  items={currentItems}
                  columns={columns}
                  getRowKey={(item) => item.id}
                  loading={currentLoading}
                  error={currentError}
                  emptyLabel={t("inventoryMasters.table.emptyUom")}
                  minWidth={760}
                  loadingRows={6}
                  actions={(row) => [
                    {
                      label: t("inventoryMasters.table.actionEdit"),
                      icon: <Pencil className="h-3.5 w-3.5" />,
                      onClick: () => openEdit(activeTab, row),
                    },
                    {
                      label: t("inventoryMasters.table.actionDelete"),
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      variant: "danger",
                      onClick: () => handleDelete(activeTab, row),
                    },
                  ]}
                />
              </section>
            </div>
            <FilterPanel config={filterConfig} filter={filter} />
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={t("inventoryMasters.confirm.deleteTitle")}
        message={
          deleteTarget
            ? t("inventoryMasters.confirm.deleteConfigMessage")
                .replace("{0}", deleteTarget.item.name)
                .replace("{1}", deleteTarget.item.code)
            : ""
        }
        confirmLabel={t("inventoryMasters.confirm.deleteConfirm")}
        cancelLabel={t("inventoryMasters.confirm.deleteCancel")}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        loading={deleteMutation.isPending}
        danger
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={
          editing
            ? editingKind === "uom"
              ? t("inventoryMasters.drawer.editUom")
              : t("inventoryMasters.drawer.editItemType")
            : editingKind === "uom"
              ? t("inventoryMasters.drawer.createUom")
              : t("inventoryMasters.drawer.createItemType")
        }
        subtitle={editing?.code || t("inventoryMasters.drawer.subtitleConfig")}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[620px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}
        <DrawerSection title={t("inventoryMasters.drawer.sectionConfig")}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label={t("inventoryMasters.fields.code")} required>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                className={inputCls}
                placeholder={t("inventoryMasters.fields.codePlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("inventoryMasters.fields.status")}>
              <Combobox
                value={form.isActive}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, isActive: value || "true" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>
            <DrawerField label={t("inventoryMasters.fields.name")} required>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputCls}
                placeholder={t("inventoryMasters.fields.namePlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("inventoryMasters.fields.description")}>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={inputCls}
                placeholder={t(
                  "inventoryMasters.fields.descriptionPlaceholder",
                )}
              />
            </DrawerField>
          </div>
        </DrawerSection>
      </DrawerModal>
    </PageLayout>
  );
}
