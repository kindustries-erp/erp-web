import { useMemo, useState } from "react";
import { useT } from "@/core/i18n";
import { Boxes, Trash2, Eye } from "lucide-react";
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
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { useUIStore } from "@/core/config/uiStore";
import { type InventoryMasterOption } from "@/modules/inventory-core/api/inventoryCoreApi";
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

type MasterKind = "uom" | "item-type" | "tracking-category";

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
  return kind === "uom"
    ? "uoms"
    : kind === "item-type"
      ? "item-types"
      : "tracking-categories";
}

export function InventoryMasterPage() {
  const t = useT();
  const canRead = useHasPermission("inventory_items", "read");
  const showToast = useUIStore((s) => s.showToast);
  const [activeTab, setActiveTab] = useState<MasterKind>("uom");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortArray, setSortArray] = useState<string[]>(["-createdAt"]);

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
        key: "uom",
        label: t("inventoryMasters.tabs.uomLabel"),
        description: t("inventoryMasters.tabs.uomDesc"),
      },
      {
        key: "item-type",
        label: t("inventoryMasters.tabs.itemTypeLabel"),
        description: t("inventoryMasters.tabs.itemTypeDesc"),
      },
      {
        key: "tracking-category",
        label: "Tracking Category",
        description: "Cấu hình key/value label hiển thị cho tracking.",
      },
    ],
    [t],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingKind, setEditingKind] = useState<MasterKind>("uom");
  const [editing, setEditing] = useState<InventoryMasterOption | null>(null);
  const [form, setForm] = useState<MasterForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
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
      page,
      pageSize,
      sort: sortArray,
      search: filterUom.state.search.trim() || undefined,
      isActive:
        filterUom.state.status === "true"
          ? true
          : filterUom.state.status === "false"
            ? false
            : undefined,
    }),
    [filterUom.state.search, filterUom.state.status, page, pageSize, sortArray],
  );

  const itemTypeParams = useMemo(
    () => ({
      kind: "item-types" as const,
      page,
      pageSize,
      sort: sortArray,
      search: filterItemType.state.search.trim() || undefined,
      isActive:
        filterItemType.state.status === "true"
          ? true
          : filterItemType.state.status === "false"
            ? false
            : undefined,
    }),
    [
      filterItemType.state.search,
      filterItemType.state.status,
      page,
      pageSize,
      sortArray,
    ],
  );

  const uomsQuery = useInventoryMasterListQuery(uomParams);
  const trackingCategoryParams = useMemo(
    () => ({
      kind: "tracking-categories" as const,
      page,
      pageSize,
      sort: sortArray,
      search: filterItemType.state.search.trim() || undefined,
      isActive:
        filterItemType.state.status === "true"
          ? true
          : filterItemType.state.status === "false"
            ? false
            : undefined,
    }),
    [
      filterItemType.state.search,
      filterItemType.state.status,
      page,
      pageSize,
      sortArray,
    ],
  );

  const itemTypesQuery = useInventoryMasterListQuery(itemTypeParams);
  const trackingCategoriesQuery = useInventoryMasterListQuery(
    trackingCategoryParams,
  );
  const saveMutation = useInventoryMasterSaveMutation();
  const deleteMutation = useInventoryMasterDeleteMutation();

  const currentQuery =
    activeTab === "uom"
      ? uomsQuery
      : activeTab === "item-type"
        ? itemTypesQuery
        : trackingCategoriesQuery;
  const currentItems = currentQuery.data?.items ?? [];
  const currentLoading = currentQuery.isLoading || currentQuery.isFetching;
  const currentError =
    currentQuery.error instanceof Error ? currentQuery.error.message : null;

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setEditingKind(activeTab);
    setForm(emptyForm());
    setSaveError(null);
    setViewOnly(false);
  }

  function handleSort(colId: string) {
    setSortArray((prev) => {
      if (prev?.[0] === colId) return [`-${colId}`];
      if (prev?.[0] === `-${colId}`) return [];
      return [colId];
    });
  }

  function openCreate(kind: MasterKind) {
    setEditingKind(kind);
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function openDetail(kind: MasterKind, item: InventoryMasterOption) {
    setEditingKind(kind);
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setViewOnly(true);
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
        kind:
          editingKind === "uom"
            ? "uom"
            : editingKind === "item-type"
              ? "item-type"
              : "tracking-category",
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
        kind:
          deleteTarget.kind === "uom"
            ? "uom"
            : deleteTarget.kind === "item-type"
              ? "item-type"
              : "tracking-category",
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
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "code",
        cell: (item) => (
          <div className="w-full text-center">
            <span className="font-medium font-mono">{item.code}</span>
          </div>
        ),
      },
      {
        key: "name",
        header: t("inventoryMasters.columns.name"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "name",
        cell: (item) => <div className="w-full text-center">{item.name}</div>,
      },
      {
        key: "description",
        header: t("inventoryMasters.columns.description"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "description",
        cell: (item) => (
          <div className="w-full text-center">{item.description || "—"}</div>
        ),
      },
      {
        key: "isActive",
        header: t("inventoryMasters.columns.status"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "isActive",
        cell: (item) => (
          <div className="w-full text-center">
            {statusBadge(item.isActive, t)}
          </div>
        ),
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
    ...(viewOnly
      ? []
      : [
          {
            label: editing
              ? t("inventoryMasters.drawer.update")
              : t("inventoryMasters.drawer.create"),
            onClick: handleSave,
            primary: true,
            loading: saveMutation.isPending,
          } as DrawerAction,
        ]),
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("inventoryMasters.title")}
      desc={t("inventoryMasters.desc")}
      icon={<Boxes className="h-5 w-5" />}
      tabs={TAB_OPTIONS.map((tab) => ({ value: tab.key, label: tab.label }))}
      activeTab={activeTab}
      onTabChange={(value) => {
        setActiveTab(value as MasterKind);
        setPage(1);
      }}
      actions={
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
      }
    >
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
              onRowClick={(row) => openDetail(activeTab, row)}
              actions={(row) => [
                {
                  label: t("inventoryMasters.table.actionDetail") || "Chi tiết",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => openDetail(activeTab, row),
                },
                {
                  label: t("inventoryMasters.table.actionDelete"),
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "danger",
                  onClick: () => handleDelete(activeTab, row),
                },
              ]}
              page={page}
              pageSize={pageSize}
              total={currentQuery.data?.total ?? 0}
              totalPages={currentQuery.data?.totalPages ?? 0}
              onPage={setPage}
              onPageSize={(value) => {
                setPage(1);
                setPageSize(value);
              }}
              sortArray={sortArray}
              onSort={handleSort}
            />
          </section>
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

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

      <StandardFormDrawer
        open={drawerOpen}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        onClose={closeDrawer}
        onToggleEdit={
          viewOnly && editing ? () => setViewOnly(false) : undefined
        }
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
        rightPanelTitle="Thông tin"
        leftPanel={
          <>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {saveError}
              </div>
            )}
            <DrawerSection title={t("inventoryMasters.drawer.sectionConfig")}>
              <div className="flex flex-col gap-3">
                <DrawerField label={t("inventoryMasters.fields.name")} required>
                  <input
                    value={form.name}
                    disabled={viewOnly}
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
                    disabled={viewOnly}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder={t(
                      "inventoryMasters.fields.descriptionPlaceholder",
                    )}
                  />
                </DrawerField>
              </div>
            </DrawerSection>
          </>
        }
        rightPanel={
          <div className="flex flex-col gap-3 pt-1">
            <DrawerField label={t("inventoryMasters.fields.code")} required>
              <input
                value={form.code}
                disabled={viewOnly}
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
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, isActive: value || "true" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>
          </div>
        }
      />
    </PageLayout>
  );
}
