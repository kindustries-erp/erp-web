import { useState } from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  ActionDropdown,
  type ActionItem,
} from "@/shared/components/ActionDropdown";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Position } from "@/modules/hr/api/hrApi";

const IconPlus = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconBriefcase = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8l-2 4h12z" />
  </svg>
);

export function ChucVuView(p: any) {
  const {
    t,
    openNew,
    searchInput,
    handleSearchInput,
    items,
    loading,
    fetchError,
    deptName,
    openEdit,
    setDeleteTarget,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    handlePageSize,
    drawerOpen,
    closeDrawer,
    isDirty,
    editing,
    saving,
    handleSave,
    form,
    setField,
    depts,
    saveError,
    deleteTarget,
    deleting,
    handleDelete,
  } = p;

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const filterConfig: FilterPanelConfig = { search: true };
  const activeFilterCount = [!!searchInput].filter(Boolean).length;

  const columns: DataTableColumn<Position>[] = [
    {
      key: "code",
      header: t("chucvu.headers.code"),
      cell: (pos) => (
        <span className="text-xs font-mono text-[color:var(--muted-fg)]">
          {pos.position_code}
        </span>
      ),
      skeletonClassName: "w-16",
    },
    {
      key: "name",
      header: t("chucvu.headers.name"),
      cell: (pos) => (
        <span className="text-xs font-medium text-foreground">
          {pos.position_name}
        </span>
      ),
      skeletonClassName: "w-32",
    },
    {
      key: "department",
      header: t("chucvu.headers.department"),
      cell: (pos) => (
        <span className="text-xs text-[color:var(--muted-fg)]">
          {deptName(pos.department_id)}
        </span>
      ),
      skeletonClassName: "w-24",
    },
    {
      key: "approval_level",
      header: t("chucvu.headers.approvalLevel"),
      cell: (pos) =>
        pos.approval_level != null ? (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-[11px] font-semibold">
            {pos.approval_level}
          </span>
        ) : (
          <span className="text-[color:var(--faint)]">—</span>
        ),
      className: "text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-6 mx-auto",
    },
    {
      key: "status",
      header: t("chucvu.headers.status"),
      cell: (pos) => (
        <span
          className={cn(
            "inline-flex items-center px-[8px] py-[3px] rounded-[20px] text-[10px] font-medium",
            pos.is_active
              ? "bg-approve-bg text-approve-fg"
              : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
          )}
        >
          {pos.is_active ? t("status.active") : t("status.inactive")}
        </span>
      ),
      skeletonClassName: "w-16 rounded-full",
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <FilterButton
            onClick={() => setFilterPanelOpen((v) => !v)}
            activeCount={activeFilterCount}
          />
          <button
            onClick={openNew}
            className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
          >
            <IconPlus /> {t("chucvu.add")}
          </button>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <DataTable<Position>
            items={items}
            columns={columns}
            getRowKey={(pos) => pos.id}
            loading={loading}
            error={fetchError}
            emptyLabel={t("common.noData")}
            minWidth={560}
            actionsColumn={{
              cell: (pos) => {
                const actionItems: ActionItem[] = [
                  {
                    label: t("common.edit"),
                    onClick: () => openEdit(pos),
                    icon: <Pencil size={14} />,
                  },
                  {
                    label: t("common.delete"),
                    onClick: () => setDeleteTarget(pos),
                    icon: <Trash2 size={14} />,
                    variant: "danger",
                  },
                ];
                return <ActionDropdown items={actionItems} />;
              },
            }}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={handlePageSize}
          />
        </div>
        <FilterPanel
          config={filterConfig}
          filter={{
            state: {
              period: "",
              dateFrom: "",
              dateTo: "",
              channel: "",
              search: searchInput,
              amountMin: "",
              amountMax: "",
              status: "",
              counterpartySource: "",
              custom: {},
            },
            inputs: { search: searchInput, amountMin: "", amountMax: "" },
            panelOpen: filterPanelOpen,
            openPanel: () => setFilterPanelOpen(true),
            closePanel: () => setFilterPanelOpen(false),
            togglePanel: () => setFilterPanelOpen((v) => !v),
            setPeriod: () => {},
            setDateFrom: () => {},
            setDateTo: () => {},
            setChannel: () => {},
            setSearchInput: handleSearchInput,
            setAmountMinInput: () => {},
            setAmountMaxInput: () => {},
            setStatus: () => {},
            setCounterpartySource: () => {},
            setCustom: () => {},
            resetAll: () => {
              handleSearchInput("");
            },
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>
      <PositionDrawer
        {...{
          t,
          drawerOpen,
          closeDrawer,
          isDirty,
          editing,
          saving,
          handleSave,
          form,
          setField,
          depts,
          saveError,
        }}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title={t("chucvu.delete.title")}
        message={t("chucvu.delete.message").replace(
          "{0}",
          deleteTarget?.position_name ?? "",
        )}
        confirmLabel={t("common.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PositionDrawer({
  t,
  drawerOpen,
  closeDrawer,
  isDirty,
  editing,
  saving,
  handleSave,
  form,
  setField,
  depts,
  saveError,
}: any) {
  return (
    <DrawerModal
      open={drawerOpen}
      onClose={closeDrawer}
      confirmOnClose={isDirty && !editing}
      icon={<IconBriefcase />}
      title={
        editing ? t("chucvu.drawer.editTitle") : t("chucvu.drawer.createTitle")
      }
      subtitle={editing ? editing.position_name : t("chucvu.drawer.subtitle")}
      actions={[
        { label: t("common.cancel"), onClick: closeDrawer },
        {
          label: editing ? t("common.saveChanges") : t("common.addNew"),
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: handleSave,
        },
      ]}
    >
      <DrawerSection title={t("chucvu.drawer.section")}>
        <DrawerField label={t("chucvu.headers.code")}>
          <input
            type="text"
            className={inputCls}
            value={form.position_code}
            onChange={(e) => setField("position_code", e.target.value)}
            placeholder={t("chucvu.drawer.codePlaceholder")}
          />
        </DrawerField>
        <DrawerField label={t("chucvu.headers.name")} required>
          <input
            type="text"
            className={inputCls}
            value={form.position_name}
            onChange={(e) => setField("position_name", e.target.value)}
            placeholder={t("chucvu.drawer.namePlaceholder")}
          />
        </DrawerField>
        <DrawerField label={t("chucvu.headers.department")}>
          <Combobox
            options={depts.map((d: any) => ({
              value: d.id,
              label: d.department_name,
            }))}
            value={form.department_id}
            onChange={(v) => setField("department_id", v)}
            placeholder={t("chucvu.drawer.noDepartment")}
          />
        </DrawerField>
        <DrawerField label={t("chucvu.drawer.group")}>
          <input
            type="text"
            className={inputCls}
            value={form.department_group}
            onChange={(e) => setField("department_group", e.target.value)}
            placeholder={t("chucvu.drawer.groupPlaceholder")}
          />
        </DrawerField>
        <DrawerField label={t("chucvu.headers.approvalLevel")}>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.approval_level}
            onChange={(e) => setField("approval_level", e.target.value)}
            placeholder={t("chucvu.drawer.approvalLevelPlaceholder")}
          />
        </DrawerField>
        <DrawerField label={t("chucvu.headers.status")}>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(v) => setField("is_active", v === true)}
            />
            <span className="text-xs text-foreground">
              {t("status.active")}
            </span>
          </label>
        </DrawerField>
      </DrawerSection>
      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}
