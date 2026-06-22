import { useMemo, useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import { Eye, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
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
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { Skeleton } from "@/shared/components/Skeleton";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useUIStore } from "@/core/config/uiStore";
import { Combobox } from "@/shared/components/Combobox";
import {
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { createInventoryMastersKey } from "@/shared/lib/queryKeys";
import { useInventoryItemsQuery } from "@/modules/inventory-core/hooks/useInventoryItemsQuery";
import { useInventoryMastersOptionsQuery } from "@/modules/inventory-core/hooks/useInventoryMastersOptionsQuery";
import {
  useInventoryItemDeleteMutation,
  useInventoryItemSaveMutation,
} from "@/modules/inventory-core/hooks/useInventoryItemMutations";

// Removed global constants

interface ItemForm {
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status: string;
  note: string;
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uom: "PCS",
  itemType: "FG",
  status: "ACTIVE",
  note: "",
});

function buildForm(item: ErpInventoryItem): ItemForm {
  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uom: item.uom ?? "PCS",
    itemType: item.itemType ?? "FG",
    status: item.status ?? "ACTIVE",
    note: item.note ?? "",
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uom: form.uom || "PCS",
    itemType: form.itemType || "FG",
    status: form.status || "ACTIVE",
    note: form.note.trim() || undefined,
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

export function ErpInventoryItemsTab({
  setActions,
}: {
  setActions?: (node: React.ReactNode) => void;
}) {
  const t = useT();
  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "ACTIVE", label: t("inventoryMasters.status.active") },
      { value: "INACTIVE", label: t("inventoryMasters.status.inactive") },
    ],
    [t],
  );
  const ITEM_TYPE_FILTER_OPTIONS = useMemo(
    () => [
      { value: "FG", label: t("inventoryMasters.itemTypes.fg") },
      { value: "WIP", label: t("inventoryMasters.itemTypes.wip") },
      { value: "RAW", label: t("inventoryMasters.itemTypes.raw") },
      { value: "GOODS", label: t("inventoryMasters.itemTypes.goods") },
      { value: "SERVICE", label: t("inventoryMasters.itemTypes.service") },
      { value: "OTHER", label: t("inventoryMasters.itemTypes.other") },
    ],
    [t],
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortArray, setSortArray] = useState<string[]>(["-createdAt"]);
  const drawerStore = useDrawerStore();
  const isThisDrawerOpen =
    drawerStore.isOpen && drawerStore.type === "inventoryItem";
  const viewOnly = drawerStore.mode === "view";
  const isEditing = drawerStore.mode !== "create";

  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErpInventoryItem | null>(
    null,
  );
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [detailError, setDetailError] = useState<string | null>(null);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: STATUS_OPTIONS,
        placeholder: t("inventoryMasters.filter.statusPlaceholder"),
      },
      custom: [
        {
          key: "itemType",
          label: t("inventoryMasters.filter.itemTypeLabel"),
          placeholder: t("inventoryMasters.filter.itemTypePlaceholder"),
          options: ITEM_TYPE_FILTER_OPTIONS,
        },
      ],
    }),
    [STATUS_OPTIONS, ITEM_TYPE_FILTER_OPTIONS, t],
  );
  const filter = useFilterPanel(filterConfig);

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      sort: sortArray,
      search: filter.state.search.trim() || undefined,
      status: filter.state.status || undefined,
      itemType: filter.state.custom.itemType || undefined,
    }),
    [
      filter.state.custom.itemType,
      filter.state.search,
      filter.state.status,
      page,
      pageSize,
      sortArray,
    ],
  );

  const itemsQuery = useInventoryItemsQuery(listParams);
  const { uomsQuery, itemTypesQuery } = useInventoryMastersOptionsQuery();

  const items = itemsQuery.data?.items ?? [];
  const total = itemsQuery.data?.total ?? 0;
  const totalPages = itemsQuery.data?.totalPages ?? 0;
  const loading = itemsQuery.isLoading || itemsQuery.isFetching;
  const error =
    detailError ||
    (itemsQuery.error instanceof Error
      ? itemsQuery.error.message
      : uomsQuery.error instanceof Error
        ? uomsQuery.error.message
        : itemTypesQuery.error instanceof Error
          ? itemTypesQuery.error.message
          : null);

  const uomOptions = useMemo(
    () => buildMasterOptions(uomsQuery.data?.items ?? []),
    [uomsQuery.data?.items],
  );
  const itemTypeOptions = useMemo(
    () => buildMasterOptions(itemTypesQuery.data?.items ?? []),
    [itemTypesQuery.data?.items],
  );

  async function ensureMastersFresh() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: createInventoryMastersKey("uoms", {
          page: 1,
          pageSize: 200,
          isActive: true,
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: createInventoryMastersKey("item-types", {
          page: 1,
          pageSize: 200,
          isActive: true,
        }),
      }),
      uomsQuery.refetch(),
      itemTypesQuery.refetch(),
    ]);
  }

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setSaveError(null);
    setDetailError(null);
  }

  function closeDrawer() {
    drawerStore.closeDrawer();
    resetForm();
  }

  async function openCreate() {
    resetForm();
    setDrawerLoading(true);
    drawerStore.openDrawer("inventoryItem", "create");
    try {
      await ensureMastersFresh();
    } finally {
      setDrawerLoading(false);
    }
  }

  const saveMutation = useInventoryItemSaveMutation();

  const deleteMutation = useInventoryItemDeleteMutation();

  async function handleSave() {
    if (!form.sku.trim()) {
      setSaveError(t("inventoryMasters.error.skuRequired"));
      return;
    }
    if (!form.itemName.trim()) {
      setSaveError(t("inventoryMasters.error.itemNameRequired"));
      return;
    }
    setSaveError(null);
    try {
      await saveMutation.mutateAsync({
        id: editing?.id,
        payload: toPayload(form),
      });
      showToast({
        title: editing
          ? t("inventoryMasters.toast.updateSuccess")
          : t("inventoryMasters.toast.createSuccess"),
        variant: "success",
      });
      closeDrawer();
      if (!editing && page !== 1) {
        setPage(1);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message ||
          e?.message ||
          t("inventoryMasters.error.save"),
      );
    }
  }

  function handleDelete(item: ErpInventoryItem) {
    setDeleteTarget(item);
  }

  function handleSort(colId: string) {
    setSortArray((prev) => {
      if (prev?.[0] === colId) return [`-${colId}`];
      if (prev?.[0] === `-${colId}`) return [];
      return [colId];
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
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

  const columns: DataTableColumn<ErpInventoryItem>[] = useMemo(
    () => [
      {
        key: "sku",
        header: t("inventoryMasters.columns.sku"),
        sortable: true,
        sortKey: "sku",
        cell: (item) => (
          <span className="font-medium font-mono">{item.sku}</span>
        ),
        skeletonClassName: "w-24",
      },
      {
        key: "itemName",
        header: t("inventoryMasters.columns.itemName"),
        sortable: true,
        sortKey: "itemName",
        cell: (item) => item.itemName,
        skeletonClassName: "w-44",
      },
      {
        key: "uom",
        header: t("inventoryMasters.columns.uom"),
        sortable: true,
        sortKey: "uom",
        cell: (item) => item.uom || "—",
        skeletonClassName: "w-10",
      },
      {
        key: "itemType",
        header: t("inventoryMasters.columns.itemType"),
        sortable: true,
        sortKey: "itemType",
        cell: (item) => item.itemType || "—",
        skeletonClassName: "w-28",
      },
      {
        key: "note",
        header: t("inventoryMasters.columns.note"),
        cell: (item) => (
          <span
            className="text-muted-foreground truncate max-w-[150px] inline-block align-bottom"
            title={item.note || ""}
          >
            {item.note || "—"}
          </span>
        ),
        skeletonClassName: "w-32",
      },
      {
        key: "status",
        header: t("inventoryMasters.columns.status"),
        sortable: true,
        sortKey: "status",
        cell: (item) => (
          <span
            className={
              item.status === "ACTIVE"
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200"
            }
          >
            {item.status === "ACTIVE"
              ? t("inventoryMasters.status.active")
              : t("inventoryMasters.status.inactive")}
          </span>
        ),
        skeletonClassName: "w-16",
      },
    ],
    [],
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

  const masterFilterOptions =
    itemTypeOptions.length > 0 ? itemTypeOptions : ITEM_TYPE_FILTER_OPTIONS;

  const actionsNode = useMemo(
    () => (
      <TableActionGroup
        onRefresh={() => void itemsQuery.refetch()}
        loading={loading}
        onFilterToggle={filter.togglePanel}
        activeFilterCount={filter.activeFilterCount}
        onCreate={() => void openCreate()}
        createLabel={t("inventoryMasters.actions.createItem")}
      />
    ),

    [loading, filter.activeFilterCount, filter.togglePanel, t],
  );

  useEffect(() => {
    if (setActions) {
      setActions(actionsNode);
    }
    return () => {
      if (setActions) setActions(null);
    };
  }, [actionsNode, setActions]);

  return (
    <>
      {!setActions && (
        <div className="flex items-center justify-end mb-3">{actionsNode}</div>
      )}
      <div className="flex items-start h-full">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable<ErpInventoryItem>
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            error={error}
            emptyLabel={t("inventoryMasters.table.emptyItem")}
            minWidth={760}
            loadingRows={8}
            actions={(item) => [
              {
                label: t("inventoryMasters.table.actionDetail") || "Chi tiết",
                onClick: () => {
                  setEditing(item);
                  setForm(buildForm(item));
                  drawerStore.openDrawer("inventoryItem", "view");
                },
                icon: <Eye className="h-3.5 w-3.5" />,
              },
              {
                label: t("inventoryMasters.table.actionDelete"),
                onClick: () => handleDelete(item),
                icon: <Trash2 className="h-3.5 w-3.5" />,
                variant: "danger",
              },
            ]}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(value) => {
              setPage(1);
              setPageSize(value);
            }}
            sortArray={sortArray}
            onSort={handleSort}
            onRowClick={(item) => {
              setEditing(item);
              setForm(buildForm(item));
              drawerStore.openDrawer("inventoryItem", "view");
            }}
          />
        </div>
        <FilterPanel
          config={{
            ...filterConfig,
            custom: [
              {
                key: "itemType",
                label: t("inventoryMasters.filter.itemTypeLabel"),
                placeholder: t("inventoryMasters.filter.itemTypePlaceholder"),
                options: masterFilterOptions,
              },
            ],
          }}
          filter={filter}
        />
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("inventoryMasters.confirm.deleteTitle")}
        message={
          deleteTarget
            ? t("inventoryMasters.confirm.deleteItemMessage")
                .replace("{0}", deleteTarget.itemName)
                .replace("{1}", deleteTarget.sku)
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
        open={isThisDrawerOpen}
        mode={drawerStore.mode}
        onClose={closeDrawer}
        onToggleEdit={editing ? () => drawerStore.setMode("edit") : undefined}
        title={
          isEditing
            ? t("inventoryMasters.drawer.editItem")
            : t("inventoryMasters.drawer.createItem")
        }
        subtitle={
          editing ? editing.sku : t("inventoryMasters.drawer.subtitleItem")
        }
        actions={
          viewOnly
            ? [
                {
                  label: "Đóng",
                  variant: "outline",
                  onClick: closeDrawer,
                },
              ]
            : drawerActions
        }
        rightPanelTitle="Hệ thống"
        leftPanel={
          <>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {saveError}
              </div>
            )}
            {drawerLoading ? (
              <DrawerSection title={t("inventoryMasters.drawer.sectionItem")}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection title={t("inventoryMasters.drawer.sectionItem")}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DrawerField
                    label={t("inventoryMasters.fields.sku")}
                    required
                  >
                    <input
                      value={form.sku}
                      disabled={isEditing}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sku: e.target.value }))
                      }
                      className={inputCls}
                      placeholder={t("inventoryMasters.fields.skuPlaceholder")}
                    />
                  </DrawerField>

                  <DrawerField
                    label={t("inventoryMasters.fields.itemName")}
                    required
                  >
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
                      placeholder={t(
                        "inventoryMasters.fields.itemNamePlaceholder",
                      )}
                    />
                  </DrawerField>

                  <DrawerField
                    label={t("inventoryMasters.fields.uom")}
                    required
                  >
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
                      placeholder={t("inventoryMasters.fields.uomPlaceholder")}
                    />
                  </DrawerField>

                  <DrawerField label={t("inventoryMasters.fields.itemType")}>
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
                      placeholder={t(
                        "inventoryMasters.fields.itemTypePlaceholder",
                      )}
                    />
                  </DrawerField>
                </div>
              </DrawerSection>
            )}
          </>
        }
        rightPanel={
          drawerLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <DrawerField label={t("inventoryMasters.fields.status")}>
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

              <DrawerField label={t("inventoryMasters.fields.note")}>
                <textarea
                  value={form.note}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder={t("inventoryMasters.fields.notePlaceholder")}
                />
              </DrawerField>
            </>
          )
        }
      />
    </>
  );
}
