import { useMemo, useState } from "react";
import { useT } from "@/core/i18n";
import { Boxes, Trash2, Eye, PlusCircle } from "lucide-react";
import { type DataTableColumn } from "@/shared/components/DataTable";
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
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";
import { useInventoryMasterListQuery } from "@/modules/inventory-core/hooks/useInventoryMasterListQuery";
import {
  useInventoryMasterDeleteMutation,
  useInventoryMasterSaveMutation,
} from "@/modules/inventory-core/hooks/useInventoryMasterMutation";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";

interface MasterForm {
  code: string;
  name: string;
  description: string;
  isActive: string;
}

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

export function InventoryTrackingCategoriesPage() {
  const t = useT();
  const canRead = useHasPermission(ErpResource.INVENTORY_ITEMS, ErpAction.READ);
  const showToast = useUIStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortArray, setSortArray] = useState<string[]>(["-createdAt"]);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "true", label: t("inventoryMasters.status.active") },
      { value: "false", label: t("inventoryMasters.status.inactive") },
    ],
    [t],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editing, setEditing] = useState<InventoryMasterOption | null>(null);
  const [form, setForm] = useState<MasterForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<InventoryMasterOption | null>(null);

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

  const filterPanel = useFilterPanel(filterConfig);

  const trackingCategoryParams = useMemo(
    () => ({
      kind: "tracking-categories" as const,
      page,
      pageSize,
      sort: sortArray,
      search: filterPanel.state.search.trim() || undefined,
      isActive:
        filterPanel.state.status === "true"
          ? true
          : filterPanel.state.status === "false"
            ? false
            : undefined,
    }),
    [
      filterPanel.state.search,
      filterPanel.state.status,
      page,
      pageSize,
      sortArray,
    ],
  );

  const currentQuery = useInventoryMasterListQuery(trackingCategoryParams);
  const saveMutation = useInventoryMasterSaveMutation();
  const deleteMutation = useInventoryMasterDeleteMutation();

  const currentItems = currentQuery.data?.items ?? [];
  const currentLoading = currentQuery.isLoading || currentQuery.isFetching;
  const currentError =
    currentQuery.error instanceof Error ? currentQuery.error.message : null;

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function openDetail(item: InventoryMasterOption) {
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
        kind: "tracking-category",
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
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message ||
          e?.message ||
          t("inventoryMasters.error.save"),
      );
    }
  }

  function handleDelete(item: InventoryMasterOption) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        kind: "tracking-category",
        id: deleteTarget.id,
      });
      showToast({
        title: t("inventoryMasters.toast.deleteSuccess"),
        variant: "success",
      });
      setDeleteTarget(null);
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
    <>
      <SpreadsheetPageTemplate<InventoryMasterOption>
        title={
          t("nav.items.erpInventoryTrackingCategories") || "Tracking Category"
        }
        desc="Cấu hình key/value label hiển thị cho tracking."
        icon={<Boxes className="h-5 w-5" />}
        tableId="inventory-tracking-categories-table"
        items={currentItems}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={currentLoading}
        error={currentError}
        emptyLabel={t("inventoryMasters.table.emptyUom")}
        minWidth={760}
        page={page}
        pageSize={pageSize}
        total={currentQuery.data?.total ?? 0}
        totalPages={currentQuery.data?.totalPages ?? 0}
        onPage={setPage}
        onPageSize={(value) => {
          setPage(1);
          setPageSize(value);
        }}
        onRefresh={() => void currentQuery.refetch()}
        createActions={[
          {
            groupLabel: "Nhóm theo dõi",
            items: [
              {
                label: t("inventoryMasters.actions.createTracking"),
                icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
                onClick: openCreate,
              },
            ],
          },
        ]}
        filterConfig={filterConfig}
        filter={filterPanel}
        sortArray={sortArray}
        onSort={handleSort}
        rowActions={(row) => [
          {
            groupLabel: "Tra cứu / Cấu hình",
            items: [
              {
                label: t("inventoryMasters.table.actionDetail") || "Chi tiết",
                icon: <Eye className="h-3.5 w-3.5" />,
                onClick: () => openDetail(row),
              },
            ],
          },
          {
            groupLabel: "Thao tác",
            items: [
              {
                label: t("inventoryMasters.table.actionDelete"),
                icon: <Trash2 className="h-3.5 w-3.5" />,
                variant: "danger",
                onClick: () => handleDelete(row),
              },
            ],
          },
        ]}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title={t("inventoryMasters.confirm.deleteTitle")}
        message={
          deleteTarget
            ? t("inventoryMasters.confirm.deleteConfigMessage")
                .replace("{0}", deleteTarget.name)
                .replace("{1}", deleteTarget.code)
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
        title={editing ? "Cập nhật" : "Tạo mới"}
        subtitle={editing?.code || t("inventoryMasters.drawer.subtitleConfig")}
        actions={drawerActions}
        layout="1-column"
        leftPanel={
          <>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {saveError}
              </div>
            )}
            <DrawerSection title={t("inventoryMasters.drawer.sectionConfig")}>
              <div className="flex flex-col gap-3">
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
                <DrawerField label={t("inventoryMasters.fields.status")}>
                  <Combobox
                    value={form.isActive}
                    disabled={viewOnly}
                    allowClear={false}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: value || "true",
                      }))
                    }
                    options={STATUS_OPTIONS}
                  />
                </DrawerField>
              </div>
            </DrawerSection>
          </>
        }
      />
    </>
  );
}
