import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TablePagination } from "@/shared/components/TablePagination";
import { SearchInput } from "@/shared/components/SearchInput";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";

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
const IconEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openNew}
          className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
        >
          <IconPlus /> {t("chucvu.add")}
        </button>
      </div>
      <div className="mb-4">
        <SearchInput
          placeholder={t("chucvu.searchPlaceholder")}
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[320px]"
        />
      </div>
      <PositionTable
        {...{
          t,
          items,
          loading,
          fetchError,
          deptName,
          openEdit,
          setDeleteTarget,
        }}
      />
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />
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

function PositionTable({
  t,
  items,
  loading,
  fetchError,
  deptName,
  openEdit,
  setDeleteTarget,
}: any) {
  const headers = [
    t("chucvu.headers.code"),
    t("chucvu.headers.name"),
    t("chucvu.headers.department"),
    t("chucvu.headers.approvalLevel"),
    t("chucvu.headers.status"),
    "",
  ];
  return (
    <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
      <table className="w-full border-collapse" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-3 py-[9px] border-b border-border uppercase tracking-[0.05em]",
                  i === 5 && "w-[80px]",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          {!loading && fetchError && <MessageRow text={fetchError} warn />}
          {!loading && !fetchError && items.length === 0 && (
            <MessageRow text={t("common.noData")} />
          )}
          {items.map((pos: any) => (
            <PositionRow
              key={pos.id}
              {...{ t, pos, deptName, openEdit, setDeleteTarget }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SkeletonRow() {
  return (
    <tr>
      {["w-16", "w-32", "w-24", "w-6 mx-auto", "w-16 rounded-full", ""].map(
        (w, i) => (
          <td
            key={i}
            className={cn(
              "px-3 py-[10px] border-b border-[color:var(--border-light)]",
              i === 3 && "text-center",
            )}
          >
            {w && <Skeleton className={`h-3 ${w}`} />}
          </td>
        ),
      )}
    </tr>
  );
}
function MessageRow({ text, warn }: any) {
  return (
    <tr>
      <td
        colSpan={6}
        className={cn(
          "text-center text-xs py-10",
          warn ? "text-[color:var(--warn-fg)]" : "text-[color:var(--faint)]",
        )}
      >
        {text}
      </td>
    </tr>
  );
}
function PositionRow({ t, pos, deptName, openEdit, setDeleteTarget }: any) {
  return (
    <tr className="hover:bg-surface-hover">
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-mono text-[color:var(--muted-fg)]">
        {pos.position_code}
      </td>
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-medium text-foreground">
        {pos.position_name}
      </td>
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs text-[color:var(--muted-fg)]">
        {deptName(pos.department_id)}
      </td>
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs text-center">
        {pos.approval_level != null ? (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-[11px] font-semibold">
            {pos.approval_level}
          </span>
        ) : (
          <span className="text-[color:var(--faint)]">—</span>
        )}
      </td>
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs">
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
      </td>
      <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("common.edit")}
            onClick={() => openEdit(pos)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("common.delete")}
            onClick={() => setDeleteTarget(pos)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      </td>
    </tr>
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
